import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Gift,
  House,
  Mail,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wrench,
} from "lucide-react";

import "../styles/Membership.css";

gsap.registerPlugin(ScrollTrigger);

// REAL, NON-AI STOCK PHOTOGRAPHY FROM PEXELS.
// The people pictured are stock-photo models, not FixHub employees.
const photos = {
  hero: "https://images.pexels.com/photos/37688152/pexels-photo-37688152.jpeg?auto=compress&cs=tinysrgb&w=1600",
  workbench:
    "https://images.pexels.com/photos/6754839/pexels-photo-6754839.jpeg?auto=compress&cs=tinysrgb&w=1200",
  precision:
    "https://images.pexels.com/photos/6755056/pexels-photo-6755056.jpeg?auto=compress&cs=tinysrgb&w=1200",
};

// These are the two membership prices you selected.
// Validity, covered labour, parts, exclusions, and any further
// benefits must be finalized before accepting payment.
const plans = [
  {
    id: "499",
    label: "OTHER MOBILE BRANDS",
    name: "Everyday Care",
    price: 499,
    description:
      "OPPO, vivo, OnePlus, realme, Redmi, POCO, Xiaomi, Motorola and other eligible brands.",
    featured: false,
    points: [
      "First eligible service FREE*",
      "Doorstep pickup and repair coordination",
      "Clear diagnosis and repair quotation",
      "Original-part options where available",
    ],
  },
  {
    id: "999",
    label: "IPHONE & SAMSUNG",
    name: "Premium Care",
    price: 999,
    description:
      "A dedicated membership option for Apple iPhone and Samsung devices.",
    featured: true,
    points: [
      "First eligible service FREE*",
      "Doorstep pickup and repair coordination",
      "Clear diagnosis and repair quotation",
      "Original-part options where available",
    ],
  },
];

const journey = [
  {
    no: "01",
    icon: Smartphone,
    title: "Choose your plan",
    text: "Select the membership that matches your phone brand.",
  },
  {
    no: "02",
    icon: CalendarCheck,
    title: "Request your service",
    text: "Tell us the problem and choose a convenient appointment.",
  },
  {
    no: "03",
    icon: House,
    title: "We come to you",
    text: "We assess your phone at home; if needed, we collect, repair and return it.",
  },
];

const faqs = [
  {
    q: "What do I get with FixHub Membership?",
    a: "Membership is a brand-based service plan. The main highlighted offer is your first eligible mobile service free, subject to the plan's final terms. Repair eligibility and other benefits will be confirmed before joining.",
  },
  {
    q: "Are replacement parts included in the free service?",
    a: "Not automatically. Any replacement-part cost, applicable labour charges, and exclusions must be disclosed in the final membership terms and confirmed before work begins.",
  },
  {
    q: "Do you use original phone parts?",
    a: "Original manufacturer parts may be requested where available. Exact part type, availability, cost, and any warranty are confirmed before repair. FixHub does not claim to be a manufacturer-authorized service centre.",
  },
  {
    q: "Will my phone be repaired at home?",
    a: "Repairs that can be completed safely at your location may be done there. More complex work can require pickup, workshop repair, and return after your approval.",
  },
  {
    q: "How long is the membership valid?",
    a: "Membership duration and renewal terms are not finalized yet. We will show them clearly before payments are enabled.",
  },
];

function Eyebrow({ children }) {
  return (
    <span className="fm-eyebrow">
      <Sparkles size={14} aria-hidden="true" /> {children}
    </span>
  );
}

function RealPhoto({ src, alt, className = "", loading = "lazy" }) {
  const [hasError, setHasError] = useState(false);
  return hasError ? (
    <div
      className={`fm-photo-fallback ${className}`}
      aria-label={alt}
      role="img"
    >
      <Wrench size={46} aria-hidden="true" />
      <span>Mobile repair</span>
    </div>
  ) : (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
}

export default function Membership() {
  const rootRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(0);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".fm-hero__copy > *", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
      gsap.from(".fm-hero__visual", {
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
      gsap.utils.toArray("[data-fm-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { y: 38, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 93%", once: true },
          },
        );
      });
    }, rootRef);

    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(refresh);
      ctx.revert();
    };
  }, []);

  return (
    <div className="fm-page" ref={rootRef}>
      {/* Navbar and Footer are already rendered by App.jsx. */}
      <section className="fm-hero" aria-labelledby="fm-hero-title">
        <div className="fm-shell fm-hero__layout">
          <div className="fm-hero__copy">
            <Eyebrow>FIXHUB MEMBERSHIP</Eyebrow>
            <h1 id="fm-hero-title">
              Better care for
              <br />
              <span>every phone.</span>
            </h1>
            <p>
              Your phone is part of your everyday life. Keep its repair journey
              simple with doorstep support, clear quotations and a plan designed
              for your device.
            </p>
            <div className="fm-hero__badges">
              <span>
                <Gift size={18} /> First eligible service FREE*
              </span>
              <span>
                <House size={18} /> Doorstep assistance
              </span>
            </div>
            <div className="fm-hero__actions">
              <a className="fm-btn fm-btn--primary" href="#membership-plans">
                Explore Membership <ArrowRight size={18} />
              </a>
              <a
                className="fm-btn fm-btn--outline"
                href="#how-membership-works"
              >
                How It Works <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
          <div className="fm-hero__visual">
            <RealPhoto
              src={photos.hero}
              alt="Real technician working on a smartphone at a repair workbench"
              className="fm-hero__image"
              loading="eager"
            />
            <div className="fm-hero__picture-shade" />
            <div className="fm-hero__floating fm-hero__floating--top">
              <ShieldCheck size={24} />
              <span>
                <strong>Clear quotations</strong>
                <small>Before repair begins</small>
              </span>
            </div>
            <div className="fm-hero__floating fm-hero__floating--bottom">
              <Gift size={24} />
              <span>
                <strong>FIRST SERVICE FREE*</strong>
                <small>With eligible membership</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="fm-benefit-ribbon">
        <div className="fm-shell fm-benefit-ribbon__inner">
          <span>
            <BadgeCheck size={20} /> Device-specific plans
          </span>
          <span>
            <House size={20} /> Doorstep service
          </span>
          <span>
            <ShieldCheck size={20} /> Original-part options
          </span>
          <span>
            <Clock3 size={20} /> Convenient booking
          </span>
        </div>
      </div>

      <section
        className="fm-plans fm-section"
        id="membership-plans"
        aria-labelledby="fm-plans-title"
      >
        <div className="fm-shell">
          <div className="fm-section-head" data-fm-reveal>
            <div>
              <Eyebrow>CHOOSE YOUR MEMBERSHIP</Eyebrow>
              <h2 id="fm-plans-title">
                The right plan. <span>The right care.</span>
              </h2>
              <p>
                Two simple options, based on your phone brand. No invented
                monthly or yearly fees.
              </p>
            </div>
            <div className="fm-plan-hint">
              <Gift size={22} /> FIRST ELIGIBLE SERVICE FREE*
            </div>
          </div>

          <div className="fm-plans__grid">
            {plans.map((plan) => (
              <article
                className={`fm-plan ${plan.featured ? "fm-plan--featured" : ""}`}
                key={plan.id}
                data-fm-reveal
              >
                {plan.featured && (
                  <div className="fm-plan__ribbon">IPHONE & SAMSUNG</div>
                )}
                <div className="fm-plan__top">
                  <span className="fm-plan__eyebrow">{plan.label}</span>
                  <div className="fm-plan__symbol">
                    <Smartphone size={25} />
                  </div>
                </div>
                <h3>{plan.name}</h3>
                <p className="fm-plan__description">{plan.description}</p>
                <div className="fm-plan__price">
                  <small>₹</small>
                  {plan.price}
                  <span> membership</span>
                </div>
                <div className="fm-plan__line" />
                <div className="fm-plan__features">
                  {plan.points.map((point) => (
                    <div key={point}>
                      <Check size={16} />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to={`/book-repair?membershipPlan=${plan.id}`}
                  className={`fm-btn fm-plan__action ${plan.featured ? "fm-btn--primary" : "fm-btn--outline"}`}
                >
                  Choose ₹{plan.price} Plan <ArrowRight size={18} />
                </Link>
              </article>
            ))}
          </div>
          <p className="fm-plan-disclaimer">
            *Free service eligibility, plan duration, covered labour,
            replacement-part costs, exclusions and renewal terms must be
            confirmed before joining. Selecting a plan currently opens the
            repair enquiry page, not a payment checkout.
          </p>
        </div>
      </section>

      <section className="fm-story fm-section" aria-labelledby="fm-story-title">
        <div className="fm-shell fm-story__layout">
          <div className="fm-story__gallery" data-fm-reveal>
            <RealPhoto
              src={photos.workbench}
              alt="Actual photograph of a technician repairing a smartphone under a microscope"
              className="fm-story__photo fm-story__photo--large"
            />
            <RealPhoto
              src={photos.precision}
              alt="Actual photograph of detailed electronics repair at a service bench"
              className="fm-story__photo fm-story__photo--small"
            />
          </div>
          <div className="fm-story__copy" data-fm-reveal>
            <Eyebrow>WHY FIXHUB MEMBERSHIP?</Eyebrow>
            <h2 id="fm-story-title">
              Less hassle. <span>More peace of mind.</span>
            </h2>
            <p>
              From the first enquiry to handing your phone back, we aim to make
              each step easy to understand.
            </p>
            <div className="fm-story__feature-list">
              <div>
                <CalendarCheck />
                <span>
                  <strong>Book around your schedule</strong>
                  <small>Arrange a convenient doorstep appointment.</small>
                </span>
              </div>
              <div>
                <Wrench />
                <span>
                  <strong>Support for everyday phone issues</strong>
                  <small>Display, battery, charging, camera and more.</small>
                </span>
              </div>
              <div>
                <ShieldCheck />
                <span>
                  <strong>Know the repair before approving it</strong>
                  <small>
                    We explain the work and quote before proceeding.
                  </small>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="fm-steps fm-section"
        id="how-membership-works"
        aria-labelledby="fm-steps-title"
      >
        <div className="fm-shell">
          <div className="fm-section-head" data-fm-reveal>
            <div>
              <Eyebrow>HOW MEMBERSHIP WORKS</Eyebrow>
              <h2 id="fm-steps-title">
                Simple from <span>start to finish.</span>
              </h2>
              <p>
                Three steps from choosing your plan to getting help with your
                phone.
              </p>
            </div>
          </div>
          <div className="fm-steps__grid">
            {journey.map(({ no, icon: Icon, title, text }) => (
              <article className="fm-step" key={no} data-fm-reveal>
                <span className="fm-step__number">{no}</span>
                <div className="fm-step__icon">
                  <Icon size={27} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fm-faq fm-section" aria-labelledby="fm-faq-title">
        <div className="fm-shell fm-faq__layout">
          <div className="fm-faq__intro" data-fm-reveal>
            <Eyebrow>GOOD TO KNOW</Eyebrow>
            <h2 id="fm-faq-title">
              Membership <span>FAQs.</span>
            </h2>
            <p>
              Useful answers before you choose a plan. Exact membership terms
              will be confirmed before payment goes live.
            </p>
            <Link to="/contact" className="fm-faq__contact">
              <Mail size={18} /> Have a question? Contact us{" "}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="fm-faq__list" data-fm-reveal>
            {faqs.map((item, index) => (
              <div
                className={`fm-faq__item ${openFaq === index ? "fm-faq__item--open" : ""}`}
                key={item.q}
              >
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  aria-controls={`fm-faq-answer-${index}`}
                  onClick={() =>
                    setOpenFaq((current) => (current === index ? -1 : index))
                  }
                >
                  <span>
                    <CircleHelp size={18} />
                    {item.q}
                  </span>
                  <ChevronDown size={19} />
                </button>
                {openFaq === index && (
                  <p id={`fm-faq-answer-${index}`}>{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="fm-cta" aria-labelledby="fm-cta-title">
        <div className="fm-shell fm-cta__inner" data-fm-reveal>
          <div className="fm-cta__icon">
            <Gift size={30} />
          </div>
          <div>
            <span>THE FIRST STEP TO BETTER MOBILE CARE</span>
            <h2 id="fm-cta-title">Your phone deserves dependable care.</h2>
            <p>
              Choose the right membership and request a doorstep repair
              assessment.
            </p>
          </div>
          <a className="fm-btn fm-btn--light" href="#membership-plans">
            View Plans <ArrowRight size={19} />
          </a>
        </div>
      </section>
    </div>
  );
}
