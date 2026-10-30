
import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  ArrowRight,
  ArrowUpRight,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Headphones,
  ShieldCheck,
  Zap,
  Send,
  CheckCircle2,
  LoaderCircle,
  ChevronDown,
  CalendarDays,
  Clock3,
  Smartphone,
} from "lucide-react";

// CONTACT HERO IMAGE
import contactSupport from "../assets/Contact/contact-support.png";

// CSS
import "../styles/Contact.css";

gsap.registerPlugin(ScrollTrigger);

/* ==========================================================
   FIXHUB CONTACT INFORMATION
========================================================== */

const CONTACT = {
  whatsapp: "917039235169",
  phone: "+917039235169",
  email: "support@fixhubsolutions.in",
  location: "Mumbai, Maharashtra",
  serviceArea: "Doorstep service in supported locations",
  hours: "Contact us to confirm support hours",
};

/* ==========================================================
   CONTACT METHODS
========================================================== */

const contactMethods = [
  {
    id: "whatsapp",
    title: "Chat on WhatsApp",
    subtitle: "Message our support team",
    icon: MessageCircle,
    className: "whatsapp",
    href: `https://wa.me/${CONTACT.whatsapp}`,
  },
  {
    id: "phone",
    title: "Call Us",
    subtitle: "Speak to our team",
    icon: Phone,
    className: "phone",
    href: `tel:${CONTACT.phone}`,
  },
  {
    id: "email",
    title: "Email Us",
    subtitle: "Send us your questions",
    icon: Mail,
    className: "email",
    href: `mailto:${CONTACT.email}`,
  },
];

/* ==========================================================
   SUPPORT BENEFITS
========================================================== */

const supportBenefits = [
  {
    icon: ShieldCheck,
    title: "Trusted Support",
    subtitle: "Friendly & professional",
  },
  {
    icon: Zap,
    title: "Quick Assistance",
    subtitle: "Helpful communication",
  },
  {
    icon: Headphones,
    title: "Dedicated Team",
    subtitle: "Here to help you",
  },
];

/* ==========================================================
   FAQ DATA
========================================================== */

const faqs = [
  {
    question: "How can I book a mobile repair?",
    answer:
      "Visit our Book Repair page, choose your mobile brand and describe the problem. Our team will review your request and help arrange the next steps.",
  },
  {
    question: "Does FixHub provide doorstep repair?",
    answer:
      "FixHub provides doorstep mobile repair assistance in supported locations. Depending on the problem, the technician may repair the phone on-site or arrange pickup and return.",
  },
  {
    question: "Do you use original replacement parts?",
    answer:
      "Original manufacturer parts can be requested where available. The exact part type, price and availability will be confirmed before the repair begins.",
  },
  {
    question: "How much does mobile repair cost?",
    answer:
      "Repair costs depend on the mobile model, problem and replacement parts required. Our team will provide a quotation before carrying out paid repairs.",
  },
  {
    question: "How can I contact FixHub support?",
    answer:
      "You can reach FIXHUB through WhatsApp at +91 70392 35169 or email support@fixhubsolutions.in. You can also use the contact form on this page.",
  },
];

/* ==========================================================
   REUSABLE CONTACT METHOD CARD
========================================================== */

function ContactMethodCard({ method }) {
  const Icon = method.icon;

  const content = (
    <>
      <div className={`fxc-method-icon ${method.className}`}>
        <Icon size={25} strokeWidth={1.8} />
      </div>

      <div className="fxc-method-text">
        <h3>{method.title}</h3>
        <p>{method.subtitle}</p>
      </div>

      <ArrowUpRight className="fxc-method-arrow" size={20} />
    </>
  );

  return (
    <a
      href={method.href}
      className="fxc-method-card"
      target={method.id === "whatsapp" ? "_blank" : undefined}
      rel={method.id === "whatsapp" ? "noopener noreferrer" : undefined}
      aria-label={`${method.title}: ${method.subtitle}`}
    >
      {content}
    </a>
  );
}

/* ==========================================================
   CONTACT HERO
========================================================== */

function ContactHero() {
  return (
    <section className="fxc-hero" id="contact-hero">
      <div className="fxc-container">
        <div className="fxc-hero-box">
          {/* BACKGROUND IMAGE */}

          <div className="fxc-hero-visual">
            <img
              src={contactSupport}
              alt="FIXHUB customer support representative assisting a customer"
              className="fxc-hero-image"
              fetchPriority="high"
            />
          </div>

          {/* IMAGE OVERLAY */}

          <div className="fxc-hero-overlay" />

          {/* HERO CONTENT */}

          <div className="fxc-hero-content">
            <div className="fxc-badge">
              <span className="fxc-badge-dot" />
              CONTACT US
            </div>

            <h1 className="fxc-hero-title">
              Need Help?
              <br />
              <span>We're Here</span> for You.
            </h1>

            <p className="fxc-hero-description">
              Have a question, need a repair update or want to know more about
              our services? Our team is ready to help you.
            </p>

            {/* CONTACT METHODS */}

            <div className="fxc-methods">
              {contactMethods.map((method) => (
                <ContactMethodCard key={method.id} method={method} />
              ))}
            </div>

            {/* SUPPORT BENEFITS */}

            <div className="fxc-benefits">
              {supportBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div className="fxc-benefit" key={benefit.title}>
                    <div className="fxc-benefit-icon">
                      <Icon size={23} />
                    </div>

                    <div>
                      <h4>{benefit.title}</h4>
                      <p>{benefit.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DECORATION */}

          <div className="fxc-hero-decoration">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   CONTACT FORM
========================================================== */

function ContactForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ========================================================
     SUBMIT ENQUIRY
  ======================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    setStatus({
      type: "",
      message: "",
    });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const contentType = response.headers.get("content-type") || "";

      const result = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok || result?.success !== true) {
        throw new Error(
          result?.message ||
            "Unable to send your message through the form. Please contact us directly using WhatsApp or email.",
        );
      }

      setStatus({
        type: "success",
        message:
          "Your message has been received. Our team will review your enquiry.",
      });

      setForm({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message ||
          "Unable to send your message. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fxc-form-card" data-fxc-reveal>
      <div className="fxc-form-header">
        <span className="fxc-section-tag">
          <MessageCircle size={15} />
          SEND A MESSAGE
        </span>

        <h2>
          Let's Start a
          <br />
          <span>Conversation.</span>
        </h2>

        <p>
          Tell us what you need help with and we'll review your enquiry.
        </p>
      </div>

      <form className="fxc-form" onSubmit={handleSubmit}>
        {/* NAME */}

        <div className="fxc-form-row">
          <div className="fxc-field">
            <label htmlFor="fxc-name">Full Name *</label>

            <input
              id="fxc-name"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
              autoComplete="name"
              maxLength={100}
              required
            />
          </div>

          {/* EMAIL */}

          <div className="fxc-field">
            <label htmlFor="fxc-email">Email Address *</label>

            <input
              id="fxc-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              maxLength={254}
              required
            />
          </div>
        </div>

        {/* PHONE + SUBJECT */}

        <div className="fxc-form-row">
          <div className="fxc-field">
            <label htmlFor="fxc-phone">Mobile Number *</label>

            <input
              id="fxc-phone"
              name="phone"
              type="tel"
              placeholder="Enter your mobile number"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
              pattern="[+0-9() -]{10,20}"
              title="Enter a valid phone number"
              required
            />
          </div>

          <div className="fxc-field">
            <label htmlFor="fxc-subject">What Can We Help With? *</label>

            <div className="fxc-select-box">
              <select
                id="fxc-subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select a topic</option>
                <option value="Mobile Repair">Mobile Repair</option>
                <option value="Booking Assistance">Booking Assistance</option>
                <option value="Membership">Membership</option>
                <option value="Repair Status">Repair Status</option>
                <option value="Payment Question">Payment Question</option>
                <option value="Other Enquiry">Other Enquiry</option>
              </select>

              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        {/* MESSAGE */}

        <div className="fxc-field">
          <label htmlFor="fxc-message">Your Message *</label>

          <textarea
            id="fxc-message"
            name="message"
            rows={6}
            placeholder="Tell us how we can help you..."
            value={form.message}
            onChange={handleChange}
            maxLength={3000}
            required
          />
        </div>

        {/* SUBMIT BUTTON */}

        <button
          type="submit"
          className="fxc-submit-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle size={19} className="fxc-spinner" />
              Sending...
            </>
          ) : (
            <>
              Send Message
              <Send size={18} />
            </>
          )}
        </button>

        {/* RESPONSE MESSAGE */}

        {status.message && (
          <div
            className={`fxc-form-status fxc-form-status--${status.type}`}
            role={status.type === "error" ? "alert" : "status"}
          >
            {status.type === "success" && <CheckCircle2 size={18} />}
            {status.message}
          </div>
        )}

        <p className="fxc-form-note">
          We'll use your information to respond to your enquiry.
        </p>
      </form>
    </div>
  );
}

/* ==========================================================
   CONTACT INFORMATION PANEL
========================================================== */

function ContactInformation() {
  return (
    <div className="fxc-info-panel" data-fxc-reveal>
      <span className="fxc-section-tag">
        <Headphones size={15} />
        GET IN TOUCH
      </span>

      <h2>
        We're Just
        <br />
        <span>One Message Away.</span>
      </h2>

      <p className="fxc-info-description">
        Need assistance with a mobile repair, membership or booking? Reach our
        support team using the contact options below.
      </p>

      {/* CONTACT DETAILS */}

      <div className="fxc-info-list">
        <div className="fxc-info-item">
          <div className="fxc-info-icon">
            <MapPin size={22} />
          </div>

          <div>
            <h3>Our Location</h3>
            <p>{CONTACT.location}</p>
            <small>{CONTACT.serviceArea}</small>
          </div>
        </div>

        <div className="fxc-info-item">
          <div className="fxc-info-icon">
            <Phone size={22} />
          </div>

          <div>
            <h3>Phone Support</h3>

            <a href={`tel:${CONTACT.phone}`}>
              {CONTACT.phone}
            </a>
          </div>
        </div>

        <div className="fxc-info-item">
          <div className="fxc-info-icon">
            <Mail size={22} />
          </div>

          <div>
            <h3>Email Support</h3>

            <a href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
          </div>
        </div>

        <div className="fxc-info-item">
          <div className="fxc-info-icon">
            <Clock3 size={22} />
          </div>

          <div>
            <h3>Support Hours</h3>
            <p>{CONTACT.hours}</p>
          </div>
        </div>
      </div>

      {/* WHATSAPP SUPPORT */}

      <a
        href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
          "Hello FIXHUB Support, I need assistance with your mobile repair services.",
        )}`}
        className="fxc-info-promo"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message FIXHUB support on WhatsApp"
      >
        <div className="fxc-info-promo-icon">
          <MessageCircle size={27} />
        </div>

        <div>
          <h3>Need Help Right Now?</h3>
          <p>Message FIXHUB on WhatsApp.</p>
        </div>

        <ArrowUpRight size={20} />
      </a>
    </div>
  );
}

/* ==========================================================
   CONTACT CONTENT SECTION
========================================================== */

function ContactContent() {
  return (
    <section className="fxc-content-section">
      <div className="fxc-container">
        <div className="fxc-content-grid">
          <ContactInformation />
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   FAQ SECTION
========================================================== */

function ContactFAQ() {
  return (
    <section className="fxc-faq-section">
      <div className="fxc-container">
        <div className="fxc-faq-header" data-fxc-reveal>
          <span className="fxc-section-tag">
            <MessageCircle size={15} />
            FREQUENTLY ASKED QUESTIONS
          </span>

          <h2>
            Got Questions?
            <br />
            <span>We've Got Answers.</span>
          </h2>

          <p>
            Find answers to common questions about FIXHUB repair services and
            support.
          </p>
        </div>

        <div className="fxc-faq-list">
          {faqs.map((faq, index) => (
            <details
              className="fxc-faq-item"
              key={faq.question}
              data-fxc-reveal
            >
              <summary>
                <span className="fxc-faq-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="fxc-faq-question">
                  {faq.question}
                </span>

                <span className="fxc-faq-toggle">
                  <ChevronDown size={19} />
                </span>
              </summary>

              <div className="fxc-faq-answer">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   FINAL BOOKING CTA
========================================================== */

function ContactCTA() {
  return (
    <section className="fxc-bottom-cta">
      <div className="fxc-container">
        <div className="fxc-cta-box" data-fxc-reveal>
          <div className="fxc-cta-icon">
            <CalendarDays size={33} />
          </div>

          <div className="fxc-cta-content">
            <span>READY TO GET STARTED?</span>

            <h2>Your Phone Deserves Expert Care.</h2>

            <p>
              Book your mobile repair and let our technicians take care of the
              rest.
            </p>
          </div>

          <Link to="/book-repair" className="fxc-cta-button">
            Book a Repair
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   MAIN CONTACT PAGE
========================================================== */

export default function Contact() {
  const rootRef = useRef(null);

  /* ========================================================
     GSAP ANIMATIONS
  ======================================================== */

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      // HERO INTRO

      timeline
        .from(".fxc-badge", {
          y: 25,
          opacity: 0,
          duration: 0.7,
        })
        .from(
          ".fxc-hero-title",
          {
            y: 50,
            opacity: 0,
            duration: 0.9,
          },
          "-=0.4",
        )
        .from(
          ".fxc-hero-description",
          {
            y: 25,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.4",
        )
        .from(
          ".fxc-method-card",
          {
            y: 25,
            opacity: 0,
            duration: 0.65,
            stagger: 0.12,
          },
          "-=0.3",
        )
        .from(
          ".fxc-benefit",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
          },
          "-=0.3",
        );

      // HERO IMAGE

      gsap.from(".fxc-hero-image", {
        x: 55,
        opacity: 0,
        scale: 1.08,
        duration: 1.4,
        ease: "power3.out",
      });

      // SCROLL REVEALS

      gsap.utils.toArray("[data-fxc-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          {
            y: 35,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 92%",
              once: true,
            },
          },
        );
      });
    }, root);

    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(frame);
      ctx.revert();
    };
  }, []);

  return (
    <div className="fxc-page" ref={rootRef}>
      <ContactHero />
      <ContactContent />
      <ContactFAQ />
      <ContactCTA />
    </div>
  );
}
