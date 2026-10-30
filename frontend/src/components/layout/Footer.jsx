import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import {
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaFacebookF,
  FaXTwitter,
} from "react-icons/fa6";

import "../../styles/Footer.css";

/* ==========================================================
   FIXHUB BUSINESS DETAILS
========================================================== */

const business = {
  location:
    "ITPL Main Rd, Pattandur Agrahara, Whitefield, Bengaluru, Karnataka 560066",

  serviceArea: "Professional mobile repair at your doorstep.",

  phone: "+91 70392 35169",
  phoneHref: "tel:+917039235169",

  email: "support@fixhubsolutions.in",
  emailHref:
    "https://mail.google.com/mail/?view=cm&fs=1&to=support%40fixhubsolutions.in",

  hours: "Mon – Sun, 9:00 AM – 9:00 PM",
};

const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=ITPL+Main+Rd%2C+Pattandur+Agrahara%2C+Whitefield%2C+Bengaluru%2C+Karnataka+560066";

/* ==========================================================
   QUICK LINKS
========================================================== */

const quickLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Brands", path: "/brands" },
  { name: "Membership", path: "/membership" },
  { name: "About Us", path: "/about" },
  { name: "Contact Us", path: "/contact" },
];

/* ==========================================================
   REPAIR SERVICES
========================================================== */

const services = [
  { name: "Display Replacement", path: "/services" },
  { name: "Battery Replacement", path: "/services" },
  { name: "Camera Repair", path: "/services" },
  { name: "Charging Port Repair", path: "/services" },
  { name: "Software Issues", path: "/services" },
  { name: "Water Damage Repair", path: "/services" },
];

/* ==========================================================
   SOCIAL MEDIA
========================================================== */

const socialLinks = [
  {
    name: "Instagram",
    icon: FaInstagram,
    url: "",
    className: "instagram",
  },
  {
    name: "WhatsApp",
    icon: FaWhatsapp,
    url: "https://wa.me/917039235169",
    className: "whatsapp",
  },
  {
    name: "YouTube",
    icon: FaYoutube,
    url: "",
    className: "youtube",
  },
  {
    name: "Facebook",
    icon: FaFacebookF,
    url: "",
    className: "facebook",
  },
  {
    name: "X",
    icon: FaXTwitter,
    url: "",
    className: "twitter",
  },
];

/* ==========================================================
   FOOTER LOGO
========================================================== */

function FooterLogo() {
  return (
    <Link to="/" className="fh-footer__logo" aria-label="FixHub Home">
      <div className="fh-footer__logo-symbol">
        <span className="fh-footer__logo-line line-one" />
        <span className="fh-footer__logo-line line-two" />
        <span className="fh-footer__logo-line line-three" />
      </div>

      <div className="fh-footer__logo-text">
        <span className="fh-footer__logo-title">
          Fix<span>Hub</span>
        </span>

        <span className="fh-footer__logo-subtitle">
          MOBILE CARE EXPERTS
        </span>
      </div>
    </Link>
  );
}

/* ==========================================================
   FOOTER HEADING
========================================================== */

function FooterHeading({ children }) {
  return (
    <div className="fh-footer__heading">
      <h3>{children}</h3>
      <span className="fh-footer__heading-line" />
    </div>
  );
}

/* ==========================================================
   FOOTER NAVIGATION
========================================================== */

function FooterLinks({ items }) {
  return (
    <ul className="fh-footer__links">
      {items.map((item) => (
        <li key={item.name}>
          <Link to={item.path}>
            <span>{item.name}</span>
            <ChevronRight size={17} strokeWidth={1.7} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ==========================================================
   CONTACT INFORMATION
========================================================== */

function ContactInfo() {
  return (
    <div className="fh-footer__contact-list">

      {/* LOCATION */}

      <div className="fh-footer__contact-item">
        <div className="fh-footer__contact-icon">
          <MapPin size={23} />
        </div>

        <div className="fh-footer__contact-text">
          <h4>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open FIXHUB location in Google Maps"
            >
              {business.location}
            </a>
          </h4>

          <p>{business.serviceArea}</p>
        </div>
      </div>

      {/* PHONE */}

      <div className="fh-footer__contact-item">
        <div className="fh-footer__contact-icon">
          <Phone size={22} />
        </div>

        <div className="fh-footer__contact-text">
          <h4>
            <a href={business.phoneHref}>
              {business.phone}
            </a>
          </h4>

          <p>{business.hours}</p>
        </div>
      </div>

      {/* EMAIL */}

      <div className="fh-footer__contact-item">
        <div className="fh-footer__contact-icon">
          <Mail size={23} />
        </div>

        <div className="fh-footer__contact-text">
          <h4>
            <a
              href={business.emailHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {business.email}
            </a>
          </h4>

          <p>Contact our support team</p>
        </div>
      </div>

    </div>
  );
}

/* ==========================================================
   NEWSLETTER
========================================================== */

function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async (event) => {
    event.preventDefault();

    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) return;

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Subscription could not be completed.");
      }

      setSuccess(true);
      setMessage("Thank you for subscribing!");
      setEmail("");
    } catch (error) {
      console.error("Newsletter error:", error);

      setSuccess(false);
      setMessage(
        "Subscription is unavailable right now. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fh-footer__newsletter">
      <FooterHeading>
        Get Latest
        <br />
        <span>Updates</span>
      </FooterHeading>

      <p className="fh-footer__newsletter-description">
        Subscribe to get updates, offers and mobile care tips.
      </p>

      <form
        onSubmit={handleSubscribe}
        className="fh-footer__newsletter-form"
      >
        {/* EMAIL INPUT */}

        <div className="fh-footer__input-box">
          <Mail size={20} />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            autoComplete="email"
            aria-label="Email address"
            value={email}
            required
            disabled={loading}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {/* SUBSCRIBE BUTTON */}

        <button
          type="submit"
          className="fh-footer__subscribe-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle
                size={19}
                className="fh-footer__spinner"
              />
              Subscribing...
            </>
          ) : (
            <>
              Subscribe
              <ArrowRight size={20} />
            </>
          )}
        </button>

        {/* RESULT MESSAGE */}

        {message && (
          <p
            className={`fh-footer__form-message ${
              success ? "success" : "error"
            }`}
            role="status"
          >
            {success && <CheckCircle2 size={16} />}
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

/* ==========================================================
   SOCIAL ICONS
========================================================== */

function FooterSocials() {
  return (
    <div className="fh-footer__socials">
      <span className="fh-footer__follow-title">Follow Us</span>

      <div className="fh-footer__social-divider" />

      <div className="fh-footer__social-list">
        {socialLinks.map((social) => {
          const Icon = social.icon;

          return social.url ? (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`fh-footer__social ${social.className}`}
              aria-label={social.name}
              title={social.name}
            >
              <Icon size={19} />
            </a>
          ) : (
            <span
              key={social.name}
              className={`fh-footer__social ${social.className}`}
              aria-label={`${social.name} link not configured`}
              title={`${social.name} link not configured`}
            >
              <Icon size={19} />
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================
   MAIN FOOTER COMPONENT
========================================================== */

export default function Footer() {
  return (
    <footer className="fh-footer">

      {/* MAIN FOOTER CONTENT */}

      <div className="fh-footer__container">
        <div className="fh-footer__grid">

          {/* COLUMN 1 — BRAND */}

          <div className="fh-footer__brand-column">
            <FooterLogo />

            <p className="fh-footer__about">
              Professional mobile repair at your doorstep. Fast, reliable
              and hassle-free service for all your devices.
            </p>
          </div>

          {/* COLUMN 2 — QUICK LINKS */}

          <div className="fh-footer__column">
            <FooterHeading>Quick Links</FooterHeading>
            <FooterLinks items={quickLinks} />
          </div>

          {/* COLUMN 3 — SERVICES */}

          <div className="fh-footer__column">
            <FooterHeading>Our Services</FooterHeading>
            <FooterLinks items={services} />
          </div>

          {/* COLUMN 4 — CONTACT */}

          <div className="fh-footer__column">
            <FooterHeading>Contact Information</FooterHeading>
            <ContactInfo />
          </div>

          {/* COLUMN 5 — NEWSLETTER */}

          <Newsletter />

        </div>
      </div>

      {/* BOTTOM FOOTER */}

      <div className="fh-footer__bottom">
        <div className="fh-footer__bottom-container">

          <p className="fh-footer__copyright">
            © {new Date().getFullYear()} FixHub. All rights reserved.
          </p>

          <FooterSocials />

        </div>
      </div>

    </footer>
  );
}
