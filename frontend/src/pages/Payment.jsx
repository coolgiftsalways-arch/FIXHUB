import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";
import "../styles/Payment.css";

const API_URL = "/api/membership-requests";

export default function Payment() {
  const location = useLocation();

  const requestId = location.state?.requestId;

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function createPayment() {
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

        const data = await response.json();

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
          paymentData.status !== "paid"
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
  }, [requestId]);

  const amount = payment?.amount ?? payment?.planPrice;
  const isPaid = payment?.status === "paid";
  const paymentUrl = payment?.paymentUrl;
  const qrCode = payment?.qrCodeDataUrl;

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

        {!loading && error && !isPaid && (
          <div className="checkout-message checkout-error">
            <XCircle size={30} />
            <p>{error}</p>

            <button
              type="button"
              className="checkout-secondary-button"
              onClick={() => window.location.reload()}
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
            <p>Your payment has been marked as paid.</p>
          </div>
        )}

        {!loading && payment && !isPaid && !error && (
          <>
            <div className="checkout-amount">
              <span>Amount to pay</span>
              <strong>
                {amount != null
                  ? new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: payment.currency || "INR",
                      maximumFractionDigits: 2,
                    }).format(amount)
                  : "Amount unavailable"}
              </strong>
            </div>

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
                Pay Now
                <ExternalLink size={17} />
              </a>
            )}

            <div className="checkout-payment-status">
              <span className="checkout-status-dot" />
              Payment status: {payment.status || "pending"}
            </div>

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
