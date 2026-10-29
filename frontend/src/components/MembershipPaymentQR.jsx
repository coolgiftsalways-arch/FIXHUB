import { useState } from "react";
import { CheckCircle2, ShieldCheck, QrCode } from "lucide-react";

const QR_CODES = {
  499: "/qr-codes/qr-499.jpeg",
  999: "/qr-codes/qr-999.jpeg",
};

const PLANS = [
  {
    amount: 499,
    name: "Basic Membership",
    description: "Basic membership payment",
  },
  {
    amount: 699,
    name: "Standard Membership",
    description: "Standard membership payment",
  },
  {
    amount: 999,
    name: "Premium Membership",
    description: "Premium membership payment",
  },
];

export default function MembershipPaymentQR() {
  const [selectedAmount, setSelectedAmount] = useState(499);
  const [paid, setPaid] = useState(false);

  const selectedPlan = PLANS.find((plan) => plan.amount === selectedAmount);

  const qrImage = QR_CODES[selectedAmount];

  return (
    <section className="membership-qr-page">
      <div className="membership-qr-card">
        <div className="membership-qr-icon">
          <QrCode size={28} />
        </div>

        <p className="membership-qr-eyebrow">FIXHUB MEMBERSHIP</p>

        <h1>Complete Your Payment</h1>

        <p className="membership-qr-description">
          Select your membership amount and scan the QR code to pay.
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
                setPaid(false);
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
                />
              </div>

              <p className="membership-qr-scan-text">
                Open your UPI app and scan this QR code.
              </p>

              <div className="membership-qr-secure">
                <ShieldCheck size={17} />
                <span>Check the recipient and amount before paying.</span>
              </div>
            </>
          ) : (
            <div className="membership-qr-unavailable">
              <QrCode size={28} />
              <p>QR code is not available for ₹{selectedAmount} yet.</p>
              <span>Please contact FixHub for payment instructions.</span>
            </div>
          )}

          <button
            type="button"
            className="membership-qr-paid-button"
            onClick={() => setPaid(true)}
            disabled={!qrImage}
          >
            I Have Completed Payment
          </button>

          {paid && qrImage && (
            <p className="membership-qr-confirmation" role="status">
              Payment marked as completed on this screen. This does not verify
              the transaction; please wait for FixHub to confirm it.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
