import Razorpay from "razorpay";
import QRCode from "qrcode";
import crypto from "node:crypto";

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createFixHubPaymentLink({
  payment,
  customer,
  description,
}) {
  if (
    !payment?._id ||
    !Number.isSafeInteger(payment.amount) ||
    payment.amount < 1
  ) {
    throw new Error("Invalid payment record or amount.");
  }

  if (!customer?.fullName || !customer?.phone) {
    throw new Error("Customer name and phone are required.");
  }

  const razorpay = getRazorpay();

  // Reuse a previously created link rather than creating another one.
  if (payment.razorpayLinkId && payment.paymentUrl) {
    return {
      paymentUrl: payment.paymentUrl,
      qrCodeDataUrl: payment.qrCodeDataUrl || "",
      razorpayLinkId: payment.razorpayLinkId,
    };
  }

  const link = await razorpay.paymentLink.create({
    amount: payment.amount * 100,
    currency: "INR",
    accept_partial: false,
    reference_id: String(payment.paymentId).slice(0, 40),
    description: String(description || "FIXHUB service payment").slice(0, 255),
    customer: {
      name: String(customer.fullName).slice(0, 100),
      email: customer.email ? String(customer.email).slice(0, 100) : undefined,
      contact: String(customer.phone)
        .replace(/[^\d+]/g, "")
        .slice(0, 15),
    },
    notify: {
      sms: false,
      email: false,
    },
    reminder_enable: false,
  });

  if (!link?.id || !link?.short_url) {
    throw new Error("Razorpay did not return a valid payment link.");
  }

  const qrCodeDataUrl = await QRCode.toDataURL(link.short_url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
  });

  payment.razorpayLinkId = link.id;
  payment.paymentUrl = link.short_url;
  payment.qrCodeDataUrl = qrCodeDataUrl;
  payment.razorpayStatus = link.status || "created";
  payment.linkCreatedAt = new Date();

  await payment.save();

  return {
    paymentUrl: payment.paymentUrl,
    qrCodeDataUrl: payment.qrCodeDataUrl,
    razorpayLinkId: payment.razorpayLinkId,
  };
}

export function verifyRazorpayWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret || !Buffer.isBuffer(rawBody) || typeof signature !== "string") {
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest();

  let supplied;

  try {
    supplied = Buffer.from(signature, "hex");
  } catch {
    return false;
  }

  return (
    supplied.length === expected.length &&
    crypto.timingSafeEqual(supplied, expected)
  );
}
