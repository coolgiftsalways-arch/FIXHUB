import { useState } from "react";
import { CheckCircle2, ShieldCheck, QrCode } from "lucide-react";
import "../styles/Payment.css";

const QR_CODES = {
  499: "/qr-codes/qr-499.jpeg",
  999: "/qr-codes/qr-999.jpeg",
};

const PLANS = [
  { amount: 499, name: "Basic Membership" },
  { amount: 699, name: "Standard Membership" },
  { amount: 999, name: "Premium Membership" },
];

export default function Payment() {
  const [selectedAmount, setSelectedAmount] = useState(499);
  const [paymentNotice, setPaymentNotice] = useState("");

  const qrImage = QR_CODES[selectedAmount];

  return (
    <main className="payment-page">
      <section className="membership-qr-page">
        <div className="membership-qr-card">
          <div className="membership-qr-icon">
            <QrCode size={28} />
          </div>

          <p className="membership-qr-eyebrow">FIXHUB MEMBERSHIP</p>

          <h1>Complete Your Payment</h1>

          <p className="membership-qr-description">
            Select your membership plan and scan the QR code to pay.
          </p>

          <div className="membership-qr-plans">
            {PLANS.map((plan) => (
              <button
                key={plan.amount}
                type="button"
                className={`membership-qr-plan ${
                  selectedAmount === plan.amount
                    ? "membership-qr-plan-active"
                    : ""
                }`}
                onClick={() => {
                  setSelectedAmount(plan.amount);
                  setPaymentNotice("");
                }}
              >
                <span>{plan.name}</span>
                <strong>₹{plan.amount}</strong>

                {selectedAmount === plan.amount && <CheckCircle2 size={18} />}
              </button>
            ))}
          </div>

          <div className="membership-qr-payment">
            <p className="membership-qr-pay-label">AMOUNT TO PAY</p>

            <div className="membership-qr-amount">₹{selectedAmount}</div>

            {qrImage ? (
              <>
                <div className="membership-qr-image-wrap">
                  <img
                    src={qrImage}
                    alt={`FixHub payment QR code for ₹${selectedAmount}`}
                    className="membership-qr-image"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      setPaymentNotice(
                        "The QR image could not be loaded. Please check the QR file path.",
                      );
                    }}
                  />
                </div>

                <p className="membership-qr-scan-text">
                  Open your UPI app and scan this QR code.
                </p>

                <div className="membership-qr-secure">
                  <ShieldCheck size={17} />
                  <span>Verify the recipient and amount before paying.</span>
                </div>
              </>
            ) : (
              <div className="membership-qr-unavailable">
                <QrCode size={28} />
                <p>QR code unavailable for ₹{selectedAmount}</p>
                <span>Please contact FixHub for payment instructions.</span>
              </div>
            )}

            {paymentNotice && (
              <p className="membership-qr-confirmation" role="status">
                {paymentNotice}
              </p>
            )}

            {qrImage && (
              <button
                type="button"
                className="membership-qr-paid-button"
                onClick={() =>
                  setPaymentNotice(
                    "Please wait for FixHub to verify your payment. This screen does not confirm or activate your membership.",
                  )
                }
              >
                I Have Completed Payment
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
