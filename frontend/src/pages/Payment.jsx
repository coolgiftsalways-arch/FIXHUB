import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Tag,
  XCircle,
} from "lucide-react";
import "../styles/Payment.css";

const API_URL = "/api/membership-requests";
const POLL_INTERVAL_MS = 4000;
const MAX_POLL_MS = 20 * 60 * 1000; // stop auto-checking after 20 minutes
const FINAL_STATUSES = ["paid", "rejected", "refunded", "expired", "cancelled"];
const STORAGE_KEY = "fixhub_payment_request_id";

function readStoredRequestId() {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeRequestId(id) {
  try {
    if (id) sessionStorage.setItem(STORAGE_KEY, id);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode etc.) – ignore.
  }
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function formatAmount(amount, currency) {
  if (amount == null) return "Amount unavailable";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function Payment() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Set when Razorpay redirects back here after the customer paid.
  const returnedPaymentId = searchParams.get(
    "razorpay_payment_link_reference_id",
  );

  // Keep the request ID across a page refresh (router state is lost on reload).
  const requestId = location.state?.requestId || readStoredRequestId();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [pollKey, setPollKey] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const inFlightRef = useRef(false);

  useEffect(() => {
    if (requestId) storeRequestId(requestId);
  }, [requestId]);

  // ==========================================
  // 1. CREATE / LOAD THE PAYMENT
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function createPayment() {
      // Back from Razorpay: just confirm this payment, don't create a new one.
      if (returnedPaymentId) {
        setPayment({ paymentId: returnedPaymentId, status: "pending" });
        setError("");
        setLoading(false);
        return;
      }

      if (!requestId) {
        setError(
          "Payment request not found. Please return to Membership and submit your request first.",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/payment`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId }),
        });

        const data = await readJson(response);

        // Already paid: the server answers 409 with the paid payment.
        if (response.status === 409 && data.payment?.status === "paid") {
          if (!cancelled) setPayment(data.payment);
          return;
        }

        if (!response.ok || data.success === false) {
          throw new Error(data.message || "Unable to create your payment.");
        }

        // Supports either { payment: {...} } or a direct payment object.
        const paymentData = data.payment || data;

        if (cancelled) return;

        setPayment(paymentData);

        if (
          !paymentData.paymentUrl &&
          !paymentData.qrCodeDataUrl &&
          !FINAL_STATUSES.includes(paymentData.status)
        ) {
          setError(
            "Your payment link and QR code are not available yet. Please try again later or contact FIXHUB support.",
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Something went wrong while loading payment.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    createPayment();

    return () => {
      cancelled = true;
    };
  }, [requestId, returnedPaymentId, reloadKey]);

  // ==========================================
  // 2. AUTO-DETECT PAYMENT
  // Polls the server, which checks Razorpay, until the status is final.
  // ==========================================

  const paymentId = payment?.paymentId;
  const status = payment?.status || "pending";
  const isFinal = FINAL_STATUSES.includes(status);

  useEffect(() => {
    if (!paymentId || isFinal) return undefined;

    let cancelled = false;
    let timer = null;
    const startedAt = Date.now();

    function scheduleNext() {
      if (cancelled) return;

      if (Date.now() - startedAt > MAX_POLL_MS) {
        setPollTimedOut(true);
        return;
      }

      timer = setTimeout(checkStatus, POLL_INTERVAL_MS);
    }

    async function checkStatus() {
      if (cancelled || inFlightRef.current) return;

      inFlightRef.current = true;
      setChecking(true);

      let reachedFinal = false;

      try {
        const response = await fetch(
          `${API_URL}/payment/${encodeURIComponent(paymentId)}`,
          { credentials: "include", cache: "no-store" },
        );

        const data = await readJson(response);

        if (!cancelled && response.ok && data.success !== false) {
          const next = data.payment || data;

          reachedFinal = FINAL_STATUSES.includes(next.status);

          setPayment((prev) => ({
            ...prev,
            ...next,
            // The status endpoint does not resend the QR image.
            qrCodeDataUrl: next.qrCodeDataUrl || prev?.qrCodeDataUrl,
            paymentUrl: next.paymentUrl || prev?.paymentUrl,
          }));
        }
      } catch {
        // Temporary network problem – keep polling.
      } finally {
        inFlightRef.current = false;
        if (!cancelled) setChecking(false);
      }

      if (!reachedFinal) scheduleNext();
    }

    // Check right away when the customer comes back from Razorpay / UPI app.
    function handleReturn() {
      if (document.visibilityState === "visible" && !inFlightRef.current) {
        clearTimeout(timer);
        checkStatus();
      }
    }

    document.addEventListener("visibilitychange", handleReturn);
    window.addEventListener("focus", handleReturn);

    checkStatus();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleReturn);
      window.removeEventListener("focus", handleReturn);
    };
  }, [paymentId, isFinal, pollKey]);

  // ==========================================
  // 3. APPLY TEST COUPON
  // Creates a new (discounted) payment link; the old QR keeps working
  // until the new one is shown.
  // ==========================================

  async function applyCoupon(event) {
    event.preventDefault();

    // Phone keyboards can add spaces or odd characters: keep letters/digits only.
    const couponCode = couponInput
      .normalize("NFKC")
      .replace(/[^a-z0-9]/gi, "")
      .toUpperCase();

    if (!couponCode || !requestId) return;

    try {
      setApplyingCoupon(true);
      setCouponError("");

      const response = await fetch(`${API_URL}/payment`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId, couponCode }),
      });

      const data = await readJson(response);

      if (response.status === 409 && data.payment?.status === "paid") {
        setPayment(data.payment);
        return;
      }

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to apply coupon.");
      }

      setPayment(data.payment || data);
      setCouponInput("");
    } catch (err) {
      setCouponError(err.message || "Unable to apply coupon.");
    } finally {
      setApplyingCoupon(false);
    }
  }

  // Forget the stored request once the payment is finished.
  useEffect(() => {
    if (isFinal) storeRequestId(null);
  }, [isFinal]);

  const amount = payment?.amount ?? payment?.planPrice;
  const isPaid = status === "paid";
  const isClosed = ["rejected", "expired", "cancelled", "refunded"].includes(
    status,
  );
  const paymentUrl = payment?.paymentUrl;
  const qrCode = payment?.qrCodeDataUrl;

  const closedMessage = {
    expired: "This payment link has expired. Tap below to get a new one.",
    cancelled: "This payment link was cancelled. Tap below to get a new one.",
    refunded: "This payment was refunded.",
    rejected: "This payment was rejected. Please contact FIXHUB support.",
  }[status];

  return (
    <main className="fixhub-checkout">
      <section className="checkout-card">
        <Link to="/membership" className="checkout-brand">
          <span className="checkout-brand-icon">
            <Smartphone size={23} />
          </span>

          <span>
            <strong>FIXHUB</strong>
            <small>MOBILE CARE EXPERTS</small>
          </span>
        </Link>

        <div className="checkout-heading">
          <span className="checkout-secure-label">
            <ShieldCheck size={15} />
            FIXHUB SECURE CHECKOUT
          </span>

          <h1>Complete Your Payment</h1>

          <p>
            Scan the QR code with your UPI app or use the secure payment link.
          </p>
        </div>

        {loading && (
          <div className="checkout-message">
            <LoaderCircle className="checkout-spinner" size={30} />
            <p>Preparing your payment...</p>
          </div>
        )}

        {!loading && error && !isFinal && (
          <div className="checkout-message checkout-error">
            <XCircle size={30} />
            <p>{error}</p>

            <button
              type="button"
              className="checkout-secondary-button"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try Again
            </button>

            <Link to="/membership" className="checkout-back-link">
              Back to Membership
            </Link>
          </div>
        )}

        {!loading && isPaid && (
          <div className="checkout-message checkout-success">
            <CheckCircle2 size={42} />
            <h2>Payment Confirmed</h2>
            <p>
              We received {formatAmount(amount, payment?.currency)}. Thank you!
            </p>

            <Link to="/membership" className="checkout-back-link">
              Back to Membership
            </Link>
          </div>
        )}

        {!loading && isClosed && (
          <div className="checkout-message checkout-error">
            <XCircle size={30} />
            <p>{closedMessage}</p>

            {["expired", "cancelled"].includes(status) && (
              <button
                type="button"
                className="checkout-secondary-button"
                onClick={() => {
                  setPayment(null);
                  setReloadKey((key) => key + 1);
                }}
              >
                Get New Payment Link
              </button>
            )}

            <Link to="/membership" className="checkout-back-link">
              Back to Membership
            </Link>
          </div>
        )}

        {!loading && returnedPaymentId && payment && !isFinal && !error && (
          <div className="checkout-message" aria-live="polite">
            <LoaderCircle className="checkout-spinner" size={30} />
            <h2>Confirming your payment...</h2>
            <p>
              This usually takes a few seconds. Please don't close this page.
            </p>

            {pollTimedOut && (
              <button
                type="button"
                className="checkout-secondary-button"
                onClick={() => {
                  setPollTimedOut(false);
                  setPollKey((key) => key + 1);
                }}
              >
                <RefreshCw size={15} />
                Check again
              </button>
            )}
          </div>
        )}

        {!loading && !returnedPaymentId && payment && !isFinal && !error && (
          <>
            <div className="checkout-amount">
              <span>Amount to pay</span>
              <strong>
                {payment.couponApplied &&
                  payment.originalAmount != null &&
                  payment.originalAmount !== amount && (
                    <s className="checkout-original-amount">
                      {formatAmount(payment.originalAmount, payment.currency)}
                    </s>
                  )}
                {formatAmount(amount, payment.currency)}
              </strong>
            </div>

            {payment.couponApplied ? (
              <div className="checkout-coupon-applied">
                <Tag size={14} />
                Coupon {payment.couponCode} applied
              </div>
            ) : (
              <form className="checkout-coupon" onSubmit={applyCoupon}>
                <input
                  type="text"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="Coupon code"
                  aria-label="Coupon code"
                  maxLength={50}
                  autoComplete="off"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="go"
                />

                <button
                  type="submit"
                  className="checkout-secondary-button"
                  disabled={applyingCoupon || !couponInput.trim()}
                >
                  {applyingCoupon ? "Applying..." : "Apply"}
                </button>
              </form>
            )}

            {couponError && (
              <p className="checkout-coupon-error" role="alert">
                {couponError}
              </p>
            )}

            {qrCode ? (
              <div className="checkout-qr-container">
                <div className="checkout-qr-frame">
                  <img
                    src={qrCode}
                    alt="QR code for FIXHUB payment"
                    className="checkout-qr-image"
                  />
                </div>

                <h2>Scan to Pay</h2>
                <p>Open your UPI app and scan this QR code.</p>
              </div>
            ) : (
              <div className="checkout-message">
                <Clock size={28} />
                <p>Waiting for the payment QR code.</p>
              </div>
            )}

            {paymentUrl && (
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="checkout-pay-button"
              >
                Pay With Razorpay
                <ExternalLink size={17} />
              </a>
            )}

            <div className="checkout-payment-status" aria-live="polite">
              {checking ? (
                <LoaderCircle className="checkout-spinner" size={14} />
              ) : (
                <span className="checkout-status-dot" />
              )}

              {status === "under_review" || status === "submitted"
                ? "Payment received – verifying..."
                : "Waiting for payment – this page updates automatically"}
            </div>

            {pollTimedOut && (
              <button
                type="button"
                className="checkout-secondary-button"
                onClick={() => {
                  setPollTimedOut(false);
                  setPollKey((key) => key + 1);
                }}
              >
                <RefreshCw size={15} />
                I've paid – check again
              </button>
            )}

            <p className="checkout-disclaimer">
              Your payment is confirmed only after the payment provider verifies
              the transaction.
            </p>
          </>
        )}

        <div className="checkout-footer">
          <ShieldCheck size={15} />
          <span>Secure payment processing</span>
        </div>
      </section>
    </main>
  );
}
