import { useState } from "react";
import { MessageCircle, Headset, X } from "lucide-react";
import "./FloatingContact.css";

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  // FIXHUB Support Details
  const WHATSAPP_NUMBER = "917039235169";
  const CUSTOMER_CARE_NUMBER = "+917039235169";

  const whatsappMessage = encodeURIComponent(
    "Hello FIXHUB, I need help with mobile repair."
  );

  return (
    <div className={`floating-contact ${isOpen ? "active" : ""}`}>
      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-action whatsapp-action"
        aria-label="Chat with FIXHUB on WhatsApp"
        tabIndex={isOpen ? 0 : -1}
      >
        <MessageCircle size={23} />
        <span className="contact-tooltip">WhatsApp</span>
      </a>

      {/* Customer Care Button */}
      <a
        href={`tel:${CUSTOMER_CARE_NUMBER}`}
        className="contact-action support-action"
        aria-label="Call FIXHUB customer care"
        tabIndex={isOpen ? 0 : -1}
      >
        <Headset size={24} />
        <span className="contact-tooltip">Customer Care</span>
      </a>

      {/* Main Toggle Button */}
      <button
        type="button"
        className="contact-main-button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={isOpen ? "Close contact options" : "Open contact options"}
        aria-expanded={isOpen}
      >
        <span className="main-icon">
          {isOpen ? <X size={26} /> : <Headset size={26} />}
        </span>
      </button>
    </div>
  );
}