import express from "express";
import crypto from "node:crypto";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { PaymentOrder, PaymentAlert } from "./models.js";
import { suggestMatches, normalizeReference } from "./matching.js";
import { quoteBundle, PUBLIC_CATALOG } from "./catalog.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Keep these in sync with your published bundleupott plans.
const PLANS = Object.freeze({
  starter: { name: "Starter", amount: 199 },
  plus: { name: "Plus", amount: 399 },
  premium: { name: "Premium", amount: 799 },
});

const publicLimit = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const loginLimit = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const webhookLimit = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

function tokenHash(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}
function safeEqual(a, b) {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function csvList(value) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function normalizeSender(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}
function publicOrder(order) {
  return {
    orderId: order.orderId,
    planId: order.planId,
    planName: order.planName,
    items: order.items || [],
    subtotal: order.subtotal ?? null,
    discount: order.discount || 0,
    preCouponAmount: order.preCouponAmount ?? order.amount,
    couponCode: order.couponCode || "",
    couponDiscount: order.couponDiscount || 0,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    createdAt: order.createdAt,
    paymentReview:
      order.status === "pending"
        ? order.customerClaimedReference
          ? "reference_submitted_unverified"
          : "awaiting_payment_or_review"
        : order.status,
  };
}
function authenticateWebhook(req, res, next) {
  if (
    !safeEqual(req.get("authorization"), `Bearer ${process.env.WEBHOOK_TOKEN}`)
  ) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized webhook" });
  }
  next();
}
function authenticateAdmin(req, res, next) {
  const auth = req.get("authorization") || "";
  if (!auth.startsWith("Bearer "))
    return res.status(401).json({ message: "Admin authentication required" });
  try {
    const admin = jwt.verify(auth.slice(7), process.env.ADMIN_JWT_SECRET, {
      algorithms: ["HS256"],
    });
    if (admin.role !== "admin")
      return res.status(403).json({ message: "Access denied" });
    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired admin token" });
  }
}
async function findCustomerOrder(req) {
  const accessToken = req.get("x-order-token");
  if (!accessToken || !/^[0-9a-f]{64}$/.test(accessToken)) return null;
  const order = await PaymentOrder.findOne({
    orderId: req.params.orderId,
  }).select("+accessTokenHash");
  if (!order || !safeEqual(tokenHash(accessToken), order.accessTokenHash))
    return null;
  return order;
}

function getEmailTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP configuration is incomplete");
  }

  if (![465, 587].includes(port)) {
    throw new Error("SMTP_PORT must be 465 or 587");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}
async function sendFailureEmail(order, transporter) {
  const from = process.env.SMTP_FROM;
  if (!from) throw new Error("SMTP_FROM is not configured");

  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(order.amount));

  return transporter.sendMail({
    from,
    to: order.customerEmail,
    subject: "Update about your BundleOTT payment",
    text: [
      `Hi ${order.customerName},`,
      "",
      `Your BundleOTT order ${order.orderId} could not be verified.`,
      `Order amount: ${amount}`,
      "",
      "If your payment was deducted, please contact our support team with your order ID. Please do not pay again until the transaction has been checked.",
      "",
      "If no amount was deducted, you may return to BundleOTT to place your order again.",
      "",
      "Regards,",
      "BundleOTT Support",
    ].join("\n"),
  });
}

function extractPaymentHints(text) {
  const body = String(text || "").replace(/\u00a0/g, " ");

  // Match the Saraswat Bank format:
  // "credited with INR 1.49 on ..."
  const amountMatch =
    body.match(
      /\bcredited\s+with\s+(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    ) ||
    body.match(
      /(?:₹|INR|Rs\.?|Rupees)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:has\s+been\s+)?(?:credited|received|deposited)\b/i,
    );

  // Match: "towards UPI/629682719302/NIKITA PRA/SV"
  const upiMatch = body.match(/\btowards\s+UPI\/([A-Z0-9-]{10,30})\//i);

  // Also support other common bank reference formats.
  const referenceMatch = body.match(
    /\b(?:UTR|RRN|UPI\s*(?:REF(?:ERENCE)?|TXN(?:\s*ID)?|TRANSACTION(?:\s*ID)?)|TRANSACTION\s*(?:ID|REF(?:ERENCE)?))\s*(?:NO\.?\s*)?[:#=-]?\s*([A-Z0-9-]{10,30})\b/i,
  );

  const amount = amountMatch ? Number(amountMatch[1].replaceAll(",", "")) : NaN;

  const reference = upiMatch?.[1] || referenceMatch?.[1] || "";

  return {
    amountHint: Number.isFinite(amount) && amount > 0 ? amount : undefined,
    referenceHint: reference ? normalizeReference(reference) : "",
  };
}

function isCreditAlert(text) {
  if (
    /\b(otp|one[ -]?time password|verification code|passcode|cvv|debited|withdrawn|withdrawal)\b/i.test(
      text,
    )
  )
    return false;
  return /\b(credited|received|deposited)\b/i.test(text);
}

// =============================
// PUBLIC CHECKOUT ROUTES
// =============================
router.get("/plans", (req, res) => {
  res.json({
    success: true,
    plans: Object.entries(PLANS).map(([id, p]) => ({
      id,
      ...p,
      currency: "INR",
    })),
  });
});

router.get("/catalog", (req, res) =>
  res.json({
    success: true,
    plans: PUBLIC_CATALOG,
    promotion: { netflixPrimeDiscount: 100 },
  }),
);

function buildPricingQuote(input = {}) {
  const { planId, planIds } = input;
  const isBundle = Array.isArray(planIds);
  const bundle = isBundle ? quoteBundle(planIds) : null;

  if (
    (isBundle && !bundle) ||
    (!isBundle && (typeof planId !== "string" || !Object.hasOwn(PLANS, planId)))
  ) {
    return {
      ok: false,
      status: 400,
      message: "Invalid plan or bundle items",
    };
  }

  const plan = isBundle
    ? { name: bundle.name, amount: bundle.amount }
    : PLANS[planId];

  // Subtotal is the catalogue price before the existing bundle discount.
  const listSubtotal = isBundle
    ? bundle.items.reduce((sum, item) => sum + Number(item.price), 0)
    : Number(plan.amount);

  // Preserve the existing bundle discount independently of TEST99.
  const bundleDiscount = isBundle ? Number(bundle.discount || 0) : 0;

  // The coupon applies to the server-calculated price after the bundle discount.
  // All calculations use integer paise to avoid floating-point money errors.
  const preCouponPaise = Math.round(Number(plan.amount) * 100);
  const subtotalPaise = Math.round(listSubtotal * 100);
  const bundleDiscountPaise = Math.round(bundleDiscount * 100);

  if (
    !Number.isSafeInteger(preCouponPaise) ||
    preCouponPaise < 1 ||
    !Number.isSafeInteger(subtotalPaise) ||
    subtotalPaise < 1 ||
    !Number.isSafeInteger(bundleDiscountPaise) ||
    bundleDiscountPaise < 0
  ) {
    return {
      ok: false,
      status: 400,
      message: "Invalid server-side pricing",
    };
  }

  const couponCode = String(input.couponCode || "")
    .trim()
    .toUpperCase();

  if (couponCode && couponCode !== "TEST99") {
    return {
      ok: false,
      status: 400,
      message: "Invalid coupon code",
    };
  }

  if (couponCode === "TEST99" && process.env.NODE_ENV === "production") {
    return {
      ok: false,
      status: 403,
      message: "TEST99 is disabled in production",
    };
  }

  const couponDiscountPaise =
    couponCode === "TEST99" ? Math.round((preCouponPaise * 99) / 100) : 0;

  const finalPaise = preCouponPaise - couponDiscountPaise;

  if (!Number.isSafeInteger(finalPaise) || finalPaise < 1) {
    return {
      ok: false,
      status: 400,
      message: "Calculated payment amount is invalid",
    };
  }

  return {
    ok: true,
    isBundle,
    bundle,
    plan,
    subtotal: subtotalPaise / 100,
    discount: bundleDiscountPaise / 100,
    preCouponAmount: preCouponPaise / 100,
    couponCode,
    couponDiscount: couponDiscountPaise / 100,
    amount: finalPaise / 100,
  };
}

router.post("/coupons/validate", publicLimit, async (req, res) => {
  try {
    const input = req.body || {};

    if (!String(input.couponCode || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Enter a coupon code",
      });
    }

    const pricing = buildPricingQuote(input);

    if (!pricing.ok) {
      return res.status(pricing.status).json({
        success: false,
        message: pricing.message,
      });
    }

    return res.json({
      success: true,
      quote: {
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        preCouponAmount: pricing.preCouponAmount,
        couponCode: pricing.couponCode,
        couponDiscount: pricing.couponDiscount,
        amount: pricing.amount,
        currency: "INR",
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to validate coupon",
    });
  }
});

router.post("/orders", publicLimit, async (req, res) => {
  try {
    const { customerName, customerEmail, customerMobile, planId } =
      req.body || {};
    const pricing = buildPricingQuote(req.body || {});

    if (!pricing.ok) {
      return res.status(pricing.status).json({
        success: false,
        message: pricing.message,
      });
    }

    const {
      isBundle,
      bundle,
      plan,
      subtotal,
      discount,
      preCouponAmount,
      couponCode,
      couponDiscount,
      amount,
    } = pricing;
    const name = String(customerName || "").trim();
    const email = String(customerEmail || "")
      .trim()
      .toLowerCase();
    const mobile = String(customerMobile || "")
      .replace(/[\s()-]/g, "")
      .trim();
    // Mobile remains optional until your existing React form is updated.
    // A provided mobile must be valid; it is not bank-verified proof of payer identity.
    if (
      name.length < 2 ||
      name.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      (mobile && !/^(?:\+91)?[6-9]\d{9}$/.test(mobile))
    ) {
      return res
        .status(400)
        .json({
          message: "Valid name, email and mobile (if provided) required",
        });
    }

    const accessToken = crypto.randomBytes(32).toString("hex");
    const order = await PaymentOrder.create({
      orderId: crypto.randomUUID(),
      accessTokenHash: tokenHash(accessToken),
      customerName: name,
      customerEmail: email,
      customerMobile: mobile || undefined,
      planId: isBundle ? "custom_bundle" : planId,
      planName: plan.name,
      items: isBundle ? bundle.items : [],
      subtotal,
      discount,
      preCouponAmount,
      couponCode: couponCode || undefined,
      couponDiscount,
      amount, // Server-calculated final amount; never trust frontend amount.
      currency: "INR",
      status: "pending",
    });

    const params = new URLSearchParams({
      pa: process.env.UPI_ID,
      pn: process.env.UPI_NAME,
      am: Number(order.amount).toFixed(2),
      cu: "INR",
      tr: order.orderId,
      tn: `bundleupott ${order.orderId.slice(0, 8)}`,
    });
    const upiUrl = `upi://pay?${params.toString()}`;
    const qrCode = await QRCode.toDataURL(upiUrl, { width: 320, margin: 2 });

    return res
      .status(201)
      .json({
        success: true,
        order: publicOrder(order),
        accessToken,
        upiUrl,
        qrCode,
      });
  } catch (error) {
    console.error("Create order error:", error.message);
    return res.status(500).json({ message: "Unable to create payment order" });
  }
});

router.get("/orders/:orderId/status", publicLimit, async (req, res) => {
  try {
    const order = await findCustomerOrder(req);
    if (!order)
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized" });
    return res.json({
      success: true,
      order: publicOrder(order),
      paymentSuccessful: order.status === "paid",
    });
  } catch {
    return res.status(500).json({ message: "Unable to check payment status" });
  }
});

// Optional reference collected *after* user completes UPI payment.
// Self-reported reference is a matching hint, NEVER proof of payment.
router.post("/orders/:orderId/claim", publicLimit, async (req, res) => {
  try {
    const order = await findCustomerOrder(req);
    if (!order)
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized" });
    if (order.status !== "pending")
      return res.status(409).json({ message: "Order is not pending" });
    const reference = normalizeReference(req.body?.upiReference);
    if (!/^[A-Z0-9-]{10,30}$/.test(reference)) {
      return res
        .status(400)
        .json({
          message: "Enter a valid UPI reference (10–30 letters/digits)",
        });
    }
    if (
      order.customerClaimedReference &&
      order.customerClaimedReference !== reference
    ) {
      return res
        .status(409)
        .json({
          message:
            "Reference already submitted. Contact support to correct it.",
        });
    }
    await PaymentOrder.updateOne(
      { _id: order._id, status: "pending" },
      {
        $set: {
          customerClaimedReference: reference,
          customerClaimedAt: new Date(),
        },
      },
    );
    return res.json({
      success: true,
      message: "Reference received for review; payment not yet verified",
    });
  } catch {
    return res.status(500).json({ message: "Unable to save reference" });
  }
});

// =============================
// SMS / NOTIFICATION RECEIVER
// =============================
// MacroDroid must send POST text/plain with:
// Authorization: Bearer <WEBHOOK_TOKEN>
// X-Source-Package: sms:<exact sender ID> (e.g. sms:VM-EXAMPLE)
// Body: SMS Message Magic Text (ONLY after checking exact sender in MacroDroid).
router.post(
  "/macrodroid",
  webhookLimit,
  authenticateWebhook,
  express.text({ type: "text/plain", limit: "8kb" }),
  async (req, res) => {
    try {
      const text = typeof req.body === "string" ? req.body.trim() : "";
      const source = String(req.get("x-source-package") || "").trim();
      const isTest =
        process.env.NODE_ENV !== "production" &&
        source === "macro-test" &&
        text === "CONNECTION_TEST";

      if (isTest) {
        const eventId = crypto.randomUUID();
        await PaymentAlert.create({
          eventId,
          deviceCode: "saraswat-phone",
          messageType: "test",
          source,
          occurredAt: new Date(),
          isTest: true,
          status: "test",
        });
        console.log("MacroDroid connection test saved:", eventId);
        return res.json({
          success: true,
          message: "MacroDroid connected",
          eventId,
        });
      }

      const allowedApps = csvList(process.env.BANK_NOTIFICATION_PACKAGES);
      const senderId = source.startsWith("sms:")
        ? normalizeSender(source.slice(4))
        : "";
      const approvedSenders = csvList(process.env.BANK_SMS_SENDERS).map(
        normalizeSender,
      );
      const approvedSms =
        Boolean(senderId) && approvedSenders.includes(senderId);
      const approvedApp = allowedApps.includes(source);

      // The SMS sender can be spoofed; this is a filtering check, NOT bank authentication.
      if (
        (!approvedSms && !approvedApp) ||
        !text ||
        text.length > 8000 ||
        !isCreditAlert(text)
      ) {
        return res.json({ success: true, status: "ignored" });
      }

      const hints = extractPaymentHints(text);
      // Do not store messages containing no amount; don't interpret arbitrary credits as payments.
      if (!hints.amountHint)
        return res.json({ success: true, status: "ignored_no_amount" });

      // Reference dedupe only. Two legitimate identical-amount transactions may coexist.
      const eventId = hints.referenceHint
        ? tokenHash(`bank-alert:${source}:${hints.referenceHint}`)
        : crypto.randomUUID();

      const occurredAt = new Date();
      let savedAlert;

      try {
        savedAlert = await PaymentAlert.create({
          eventId,
          deviceCode: "saraswat-phone",
          messageType: approvedSms ? "sms" : "notification",
          source: source.slice(0, 200),
          occurredAt,
          ...hints,
          isTest: false,
          status: "awaiting_verification",
        });
      } catch (error) {
        if (error.code === 11000) {
          return res.json({
            success: true,
            status: "duplicate_ignored",
          });
        }
        throw error;
      }

      try {
        const windowStart = new Date(occurredAt.getTime() - 15 * 60 * 1000);

        const recentOrders = await PaymentOrder.find({
          status: "pending",
          createdAt: {
            $gte: windowStart,
            $lte: occurredAt,
          },
        })
          .select("orderId amount createdAt")
          .lean();

        const alertPaise = Math.round(Number(hints.amountHint) * 100);

        // Exact amount matching only.
        const candidates = recentOrders.filter(
          (order) => Math.round(Number(order.amount) * 100) === alertPaise,
        );

        const reference = normalizeReference(hints.referenceHint || "");

        // Automatic approval requires every condition below:
        // 1. Explicit opt-in in backend .env
        // 2. An approved SMS sender (not a generic notification)
        // 3. A transaction reference
        // 4. Exactly one recent pending order for the exact amount
        if (
          process.env.AUTO_VERIFY_BANK_SMS === "true" &&
          approvedSms &&
          /^[A-Z0-9-]{10,30}$/.test(reference) &&
          candidates.length === 1
        ) {
          const candidate = candidates[0];

          // Do not reuse a bank reference already recorded as paid.
          const referenceAlreadyUsed = await PaymentOrder.exists({
            status: "paid",
            $or: [
              { bankReference: reference },
              { verifiedReferenceKey: reference },
            ],
          });

          if (!referenceAlreadyUsed) {
            // Atomic status check prevents two requests from paying
            // the same pending order at the same time.
            const updatedOrder = await PaymentOrder.findOneAndUpdate(
              {
                orderId: candidate.orderId,
                status: "pending",
                amount: candidate.amount,
              },
              {
                $set: {
                  status: "paid",
                  bankReference: reference,
                  verifiedReferenceKey: reference,
                  verificationNote:
                    "Automatically matched to an allowlisted bank SMS; not independently authenticated.",
                  verifiedBy: "auto:saraswat-sms",
                  verifiedAt: new Date(),
                  matchedAlertEventId: savedAlert.eventId,
                },
              },
              {
                new: true,
                runValidators: true,
              },
            );

            if (updatedOrder) {
              await PaymentAlert.updateOne(
                {
                  eventId: savedAlert.eventId,
                  status: "awaiting_verification",
                },
                {
                  $set: {
                    status: "verified",
                    matchedOrderId: updatedOrder.orderId,
                    verifiedAt: new Date(),
                  },
                },
              );

              console.log(
                "AUTO-APPROVED from bank SMS:",
                updatedOrder.orderId,
                reference,
              );

              // Return immediately so the frontend can see the paid status.
              return res.json({
                success: true,
                status: "verified",
                paymentSuccessful: true,
                eventId: savedAlert.eventId,
                orderId: updatedOrder.orderId,
              });
            }
          } else {
            console.warn(
              "Auto-verification skipped: bank reference already used",
              reference,
            );
          }
        }

        // Otherwise, save only a suggested match for review.
        if (candidates.length === 1) {
          await PaymentAlert.updateOne(
            {
              eventId: savedAlert.eventId,
              status: "awaiting_verification",
            },
            {
              $set: {
                matchedOrderId: candidates[0].orderId,
              },
            },
          );

          console.log(
            "Alert linked for review:",
            savedAlert.eventId,
            candidates[0].orderId,
          );
        } else {
          console.log(
            "Manual reconciliation required:",
            savedAlert.eventId,
            "Exact-amount candidates:",
            candidates.length,
          );
        }
      } catch (matchError) {
        console.error("Alert matching error:", matchError.message);
      }

      console.log("Unverified bank credit hint stored:", eventId);

      return res.json({
        success: true,
        status: "awaiting_verification",
        eventId,
      });

      return res.json({
        success: true,
        status: "awaiting_verification",
        eventId,
      });
    } catch (error) {
      console.error("MacroDroid error:", error.message);
      return res
        .status(503)
        .json({ success: false, message: "Unable to save alert" });
    }
  },
);

// Optional legacy Message487 endpoint, kept for compatibility.
router.post(
  "/notification",
  webhookLimit,
  authenticateWebhook,
  async (req, res) => {
    try {
      const e = req.body || {};
      if (
        e.schema_version !== 1 ||
        !["test", "sms", "notification"].includes(e.message_type) ||
        typeof e.event_id !== "string" ||
        !/^.{1,128}$/.test(e.event_id) ||
        typeof e.source !== "string" ||
        typeof e.text !== "string" ||
        e.text.length > 20_000 ||
        !Number.isFinite(Date.parse(e.occurred_at))
      ) {
        return res.status(400).json({ message: "Invalid notification event" });
      }
      const isTest =
        e.message_type === "test" && process.env.NODE_ENV !== "production";
      const approvedSms =
        e.message_type === "sms" &&
        e.source === "android" &&
        csvList(process.env.BANK_SMS_SENDERS)
          .map(normalizeSender)
          .includes(normalizeSender(e.sender));
      const approvedApp =
        e.message_type === "notification" &&
        csvList(process.env.BANK_NOTIFICATION_PACKAGES).includes(e.source);
      if (
        !isTest &&
        ((!approvedSms && !approvedApp) || !isCreditAlert(e.text))
      ) {
        return res.json({ status: "ignored", event_id: e.event_id });
      }
      const hints = extractPaymentHints(e.text);
      if (!isTest && !hints.amountHint)
        return res.json({ status: "ignored_no_amount", event_id: e.event_id });
      try {
        await PaymentAlert.create({
          eventId: e.event_id,
          deviceCode: String(e.device_code || "").slice(0, 100),
          messageType: e.message_type,
          source: String(e.source).slice(0, 200),
          occurredAt: new Date(e.occurred_at),
          ...hints,
          isTest,
          status: isTest ? "test" : "awaiting_verification",
        });
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
      return res.json({ status: "accepted", event_id: e.event_id });
    } catch (error) {
      console.error("Notification error:", error.message);
      return res.status(503).json({ message: "Unable to record notification" });
    }
  },
);

// =============================
// ADMIN ENDPOINTS
// =============================
router.post("/admin/login", loginLimit, async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body?.password || "");

    const configuredEmail = String(process.env.ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();

    const passwordHash = String(process.env.ADMIN_PASSWORD_HASH || "");

    const emailMatches = safeEqual(email, configuredEmail);

    let passwordMatches = false;

    const validBcryptHash = /^\$2[aby]\$\d{2}\$/.test(passwordHash);

    if (validBcryptHash && password.length <= 1024) {
      passwordMatches = await bcrypt.compare(password, passwordHash);
    }

    // Temporary diagnostics: never print passwords or secrets.
    console.log("[ADMIN LOGIN DEBUG]", {
      emailMatches,
      validBcryptHash,
      hashLength: passwordHash.length,
      passwordMatches,
    });

    if (!emailMatches || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const token = jwt.sign(
      {
        role: "admin",
        email: configuredEmail,
      },
      process.env.ADMIN_JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "2h",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      expiresIn: 7200,
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in",
    });
  }
});
router.get("/admin/orders", authenticateAdmin, async (req, res) => {
  try {
    const orders = await PaymentOrder.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.json({ success: true, orders });
  } catch {
    return res.status(500).json({ message: "Unable to load orders" });
  }
});

router.get("/admin/alerts", authenticateAdmin, async (req, res) => {
  try {
    const alerts = await PaymentAlert.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.json({ success: true, alerts });
  } catch {
    return res.status(500).json({ message: "Unable to load alerts" });
  }
});

// Rank orders for admin review: amount, timing, claimed reference.
// Multiple same-amount pending orders stay AMBIGUOUS. No approval occurs here.
router.get("/admin/reconciliation", authenticateAdmin, async (req, res) => {
  try {
    const alerts = await PaymentAlert.find({
      status: "awaiting_verification",
      isTest: false,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    const orders = await PaymentOrder.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    const items = alerts.map((alert) => ({
      alert: {
        eventId: alert.eventId,
        source: alert.source,
        messageType: alert.messageType,
        amountHint: alert.amountHint,
        referenceHint: alert.referenceHint || "",
        occurredAt: alert.occurredAt,
        status: alert.status,
      },
      ...suggestMatches(alert, orders),
    }));
    return res.json({
      success: true,
      items,
      note: "Suggestions only. Verify in the bank before approval.",
    });
  } catch (error) {
    console.error("Reconciliation error:", error.message);
    return res
      .status(500)
      .json({ message: "Unable to calculate suggested matches" });
  }
});

router.get("/admin/summary", authenticateAdmin, async (req, res) => {
  try {
    const [totalOrders, pendingOrders, paidOrders, pendingAlerts, revenue] =
      await Promise.all([
        PaymentOrder.countDocuments(),
        PaymentOrder.countDocuments({ status: "pending" }),
        PaymentOrder.countDocuments({ status: "paid" }),
        PaymentAlert.countDocuments({ status: "awaiting_verification" }),
        PaymentOrder.aggregate([
          { $match: { status: "paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);
    return res.json({
      success: true,
      summary: {
        totalOrders,
        pendingOrders,
        paidOrders,
        pendingAlerts,
        verifiedRevenue: revenue[0]?.total || 0,
        currency: "INR",
      },
    });
  } catch {
    return res.status(500).json({ message: "Unable to load summary" });
  }
});

// Approval is ADMIN ONLY and must follow independent bank statement verification.
// alertEventId is optional but, if provided, must match bank-verified amount/reference.
router.post(
  "/admin/orders/:orderId/verify",
  authenticateAdmin,
  async (req, res) => {
    try {
      const {
        confirmedFromBank,
        verifiedAmount,
        bankReference,
        verificationNote,
        alertEventId,
      } = req.body || {};
      const reference = normalizeReference(bankReference);
      const note = String(verificationNote || "").trim();
      if (
        confirmedFromBank !== true ||
        !/^[A-Z0-9-]{10,30}$/.test(reference) ||
        note.length < 5 ||
        note.length > 500
      ) {
        return res
          .status(400)
          .json({
            message: "Bank confirmation, reference and note are required",
          });
      }

      const order = await PaymentOrder.findOne({ orderId: req.params.orderId });
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.status !== "pending")
        return res.status(409).json({ message: "Order is not pending" });
      if (
        !Number.isFinite(Number(verifiedAmount)) ||
        Number(verifiedAmount) !== Number(order.amount)
      ) {
        return res
          .status(400)
          .json({ message: "Verified amount must equal the order amount" });
      }

      let alert;
      if (alertEventId) {
        alert = await PaymentAlert.findOne({
          eventId: String(alertEventId),
          status: "awaiting_verification",
          isTest: false,
        });
        if (!alert)
          return res
            .status(404)
            .json({ message: "Unverified alert not found" });
        if (Number(alert.amountHint) !== Number(order.amount))
          return res
            .status(409)
            .json({ message: "Alert amount differs from order" });
        if (
          alert.referenceHint &&
          normalizeReference(alert.referenceHint) !== reference
        ) {
          return res
            .status(409)
            .json({
              message: "Bank reference does not match the selected alert",
            });
        }
        if (alert.matchedOrderId && alert.matchedOrderId !== order.orderId) {
          return res.status(409).json({
            message: "Alert is assigned to a different order",
          });
        }
      }

      // This is a database duplicate check, NOT actual bank verification.
      const used = await PaymentOrder.exists({
        bankReference: reference,
        status: "paid",
      });
      if (used)
        return res.status(409).json({ message: "Bank reference already used" });

      const updated = await PaymentOrder.findOneAndUpdate(
        { orderId: order.orderId, status: "pending" },
        {
          $set: {
            status: "paid",
            bankReference: reference,
            verifiedReferenceKey: reference,
            verificationNote: note,
            verifiedBy: req.admin.email,
            verifiedAt: new Date(),
            ...(alert ? { matchedAlertEventId: alert.eventId } : {}),
          },
        },
        { new: true, runValidators: true },
      );
      if (!updated)
        return res.status(409).json({ message: "Order already processed" });

      if (alert) {
        await PaymentAlert.updateOne(
          { eventId: alert.eventId, status: "awaiting_verification" },
          {
            $set: {
              status: "verified",
              matchedOrderId: order.orderId,
              verifiedAt: new Date(),
            },
          },
        );
      }
      console.log("Bank-verified order:", updated.orderId);
      return res.json({
        success: true,
        message: "Bank-verified payment approved",
        order: publicOrder(updated),
      });
    } catch (error) {
      if (error.code === 11000)
        return res.status(409).json({ message: "Bank reference already used" });
      console.error("Verify order error:", error.message);
      return res.status(500).json({ message: "Unable to approve payment" });
    }
  },
);

// Send a payment-failure email for one rejected order.
router.post(
  "/admin/orders/:orderId/failure-email",
  authenticateAdmin,
  async (req, res) => {
    try {
      const order = await PaymentOrder.findOne({
        orderId: req.params.orderId,
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.status !== "rejected") {
        return res.status(409).json({
          message: "Only rejected orders can receive failure emails",
        });
      }

      if (order.failureEmailSentAt) {
        return res.status(409).json({
          message: "A failure email has already been recorded for this order",
          sentAt: order.failureEmailSentAt,
        });
      }

      if (!order.customerEmail) {
        return res.status(400).json({
          message: "Customer email is missing",
        });
      }

      const transporter = getEmailTransporter();
      const result = await sendFailureEmail(order, transporter);

      const updated = await PaymentOrder.findOneAndUpdate(
        {
          _id: order._id,
          status: "rejected",
          failureEmailSentAt: { $exists: false },
        },
        {
          $set: {
            failureEmailSentAt: new Date(),
            failureEmailMessageId: result.messageId || "",
            failureEmailSentBy: req.admin.email,
          },
        },
        { new: true },
      );

      if (!updated) {
        return res.status(409).json({
          message:
            "Email sent, but tracking needs review. Check SMTP logs before retrying.",
        });
      }

      return res.json({
        success: true,
        message: `Email submitted to ${order.customerEmail}`,
        sentAt: updated.failureEmailSentAt,
      });
    } catch (error) {
      console.error("Failure email error:", error.message);
      return res.status(500).json({
        message: "Could not send the email. Check SMTP configuration and logs.",
      });
    }
  },
);

// Send failure emails to selected rejected orders (maximum 50 per request).
router.post(
  "/admin/failure-emails/bulk",
  authenticateAdmin,
  async (req, res) => {
    try {
      const ids = req.body?.orderIds;

      if (
        !Array.isArray(ids) ||
        ids.length < 1 ||
        ids.length > 50 ||
        ids.some((id) => typeof id !== "string" || !id.trim())
      ) {
        return res.status(400).json({
          message: "Provide between 1 and 50 order IDs",
        });
      }

      const uniqueIds = [...new Set(ids)];
      const orders = await PaymentOrder.find({
        orderId: { $in: uniqueIds },
        status: "rejected",
        failureEmailSentAt: { $exists: false },
      });

      const byId = new Map(orders.map((order) => [order.orderId, order]));
      const results = [];
      let transporter;

      for (const orderId of uniqueIds) {
        const order = byId.get(orderId);

        if (!order) {
          results.push({
            orderId,
            success: false,
            message: "Not eligible, already emailed, or not found",
          });
          continue;
        }

        if (!order.customerEmail) {
          results.push({
            orderId,
            success: false,
            message: "Customer email is missing",
          });
          continue;
        }

        try {
          transporter ||= getEmailTransporter();
          const sent = await sendFailureEmail(order, transporter);

          const updated = await PaymentOrder.findOneAndUpdate(
            {
              _id: order._id,
              status: "rejected",
              failureEmailSentAt: { $exists: false },
            },
            {
              $set: {
                failureEmailSentAt: new Date(),
                failureEmailMessageId: sent.messageId || "",
                failureEmailSentBy: req.admin.email,
              },
            },
            { new: true },
          );

          results.push({
            orderId,
            success: Boolean(updated),
            message: updated
              ? "Email submitted"
              : "Email submitted; tracking needs review",
          });
        } catch (error) {
          console.error("Bulk failure email error:", orderId, error.message);
          results.push({
            orderId,
            success: false,
            message: "SMTP sending failed; check server logs before retrying",
          });
        }
      }

      return res.json({
        success: true,
        results,
        sent: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      });
    } catch (error) {
      console.error("Bulk email error:", error.message);
      return res.status(500).json({
        message: "Unable to process bulk emails",
      });
    }
  },
);

router.post(
  "/admin/orders/:orderId/reject",
  authenticateAdmin,
  async (req, res) => {
    try {
      const reason = String(req.body?.reason || "")
        .trim()
        .slice(0, 500);
      if (reason.length < 5)
        return res.status(400).json({ message: "Reason required" });
      const order = await PaymentOrder.findOneAndUpdate(
        { orderId: req.params.orderId, status: "pending" },
        {
          $set: {
            status: "rejected",
            verificationNote: reason,
            verifiedBy: req.admin.email,
            verifiedAt: new Date(),
          },
        },
        { new: true },
      );
      if (!order)
        return res.status(409).json({ message: "Pending order not found" });
      return res.json({ success: true, order: publicOrder(order) });
    } catch {
      return res.status(500).json({ message: "Unable to reject payment" });
    }
  },
);

export default router;
