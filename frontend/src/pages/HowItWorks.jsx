import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Crown,
  Headset,
  House,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";

import heroTechnician from "../assets/HowItWorks/hero-technician.png";
import pickupTechnician from "../assets/HowItWorks/pickup-technician.png";
import deliveryTechnician from "../assets/HowItWorks/delivery-technician.png";
import bookingPhone from "../assets/HowItWorks/booking-phone.png";
import "../styles/HowItWorks.css";

gsap.registerPlugin(ScrollTrigger);

// Additional real stock photos from Unsplash, with local fallbacks.
// Booking photo and technician scenes are loaded from local project assets.
const stockPhotos = {
  repair:
    "https://images.unsplash.com/photo-1746005514014-2637647a26ee?auto=format&fit=crop&w=1000&q=85",
  repairDetail:
    "https://images.unsplash.com/photo-1746005514011-ea00280f3b6e?auto=format&fit=crop&w=1200&q=85",
};

const highlights = [
  { icon: ShieldCheck, name: "Original Parts", detail: "Where available" },
  { icon: Truck, name: "Doorstep Pickup", detail: "In serviceable areas" },
  { icon: Clock3, name: "Clear Updates", detail: "Throughout the repair" },
  { icon: Headset, name: "Repair Support", detail: "Help when you need it" },
];

const steps = [
  {
    number: "01",
    title: "Book Your Repair",
    text: "Choose your phone, select the issue and request a convenient appointment.",
    photo: bookingPhone,
    alt: "Customer selecting a mobile repair service on the FixHub booking screen",
    backup: heroTechnician,
    icon: CalendarDays,
  },
  {
    number: "02",
    title: "Doorstep Pickup",
    text: "Our team visits your address and collects your phone when pickup is needed.",
    photo: pickupTechnician,
    alt: "FixHub technician collecting a phone at the customer's home",
    backup: heroTechnician,
    icon: Truck,
  },
  {
    number: "03",
    title: "Expert Repair",
    text: "We diagnose the issue, confirm the quote and repair your device carefully.",
    photo: stockPhotos.repair,
    alt: "Mobile phone repair workbench",
    backup: heroTechnician,
    icon: Wrench,
  },
  {
    number: "04",
    title: "Safe Return",
    text: "After testing, your repaired phone is returned to you with a service update.",
    photo: deliveryTechnician,
    alt: "FixHub technician returning a repaired phone to the customer",
    backup: heroTechnician,
    icon: PackageCheck,
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Part Options",
    text: "Original manufacturer parts can be requested where available.",
  },
  {
    icon: Wrench,
    title: "Careful Diagnosis",
    text: "We assess the problem before beginning paid repair work.",
  },
  {
    icon: House,
    title: "Convenient Service",
    text: "Pickup, repair and return based on your location and device issue.",
  },
  {
    icon: CheckCircle2,
    title: "Clear Quotation",
    text: "You'll know the proposed work and price before approval.",
  },
];

const faqItems = [
  {
    question: "How does FixHub doorstep repair work?",
    answer:
      "Submit a booking with your device details. Our team contacts you to confirm availability. Depending on the repair, the technician may work on-site or collect your phone, repair it and return it.",
  },
  {
    question: "Is pickup and delivery free?",
    answer:
      "Pickup and return availability and any applicable charges depend on your service area and repair. Our team will confirm these before the booking is finalized.",
  },
  {
    question: "How long will my phone repair take?",
    answer:
      "Timing depends on the issue, model and parts availability. Our team provides an estimate after assessing the device.",
  },
  {
    question: "Do you provide original parts?",
    answer:
      "Original manufacturer parts may be available for some models. We will confirm the part type, availability and cost before fitting it. FixHub is not presented as a manufacturer-authorized service centre.",
  },
  {
    question: "Will I receive a repair warranty?",
    answer:
      "Warranty terms, if offered, depend on the service and replacement part. You'll receive the applicable details before confirming the repair.",
  },
  {
    question: "What if my issue is not listed on the website?",
    answer:
      "You can still submit a repair request. Describe the problem and our team will let you know whether we can help.",
  },
];

// If an image cannot load, show a locally saved FixHub image
// instead of a blank box or broken-image alt text.
function RepairPhoto({ src, fallbackSrc, alt = "", ...props }) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}

function Eyebrow({ children, icon: Icon = Sparkles }) {
  return (
    <span className="hiw-eyebrow">
      <Icon size={14} aria-hidden="true" />
      {children}
    </span>
  );
}

export default function HowItWorks() {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".hiw-hero__copy > *", {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
      });

      gsap.from(".hiw-hero__photo", {
        x: 55,
        opacity: 0,
        scale: 1.04,
        duration: 1.15,
        ease: "power3.out",
      });

      gsap.utils.toArray(".hiw-reveal").forEach((element) => {
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start: "top 92%",
            once: true,
          },
          y: 30,
          opacity: 0,
          duration: 0.75,
          ease: "power2.out",
        });
      });
    }, pageRef);

    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(frame);
      ctx.revert();
    };
  }, []);

  return (
    <div className="hiw-page" ref={pageRef}>
      {/* Navbar and Footer are already rendered by App.jsx. */}
      <section className="hiw-hero" aria-labelledby="hiw-title">
        <div className="hiw-hero__photo" aria-hidden="true">
          <img src={heroTechnician} alt="" fetchPriority="high" />
        </div>
        <div className="hiw-hero__shade" aria-hidden="true" />

        <div className="hiw-container hiw-hero__layout">
          <div className="hiw-hero__copy">
            <Eyebrow icon={Wrench}>HOW IT WORKS</Eyebrow>
            <h1 id="hiw-title">
              Simple Process.
              <br />
              <span>Complete Care.</span>
            </h1>
            <p>
              Book your phone repair, arrange a doorstep visit and let our team
              handle the diagnosis, repair and safe return.
            </p>
            <div className="hiw-hero__actions">
              <Link to="/book-repair" className="hiw-btn hiw-btn--primary">
                Book a Repair <ArrowUpRight size={18} />
              </Link>
              <a href="#hiw-steps" className="hiw-btn hiw-btn--outline">
                See How It Works <ArrowRight size={18} />
              </a>
            </div>
            <div className="hiw-hero__highlights">
              {highlights.map(({ icon: Icon, name, detail }) => (
                <div className="hiw-highlight" key={name}>
                  <Icon size={24} aria-hidden="true" />
                  <span>
                    <strong>{name}</strong>
                    <small>{detail}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hiw-steps-section" id="hiw-steps">
        <div className="hiw-container">
          <header className="hiw-section-heading hiw-section-heading--center hiw-reveal">
            <Eyebrow>STEP BY STEP</Eyebrow>
            <h2>
              How FixHub <span>Works</span>
            </h2>
            <p>Get your phone repaired in four simple steps.</p>
          </header>
          <div className="hiw-steps-grid">
            {steps.map(
              ({ number, title, text, photo, alt, backup, icon: Icon }) => (
                <article className="hiw-step hiw-reveal" key={number}>
                  <div className="hiw-step__media">
                    <RepairPhoto
                      src={photo}
                      fallbackSrc={backup}
                      alt={alt}
                      loading="lazy"
                    />
                    <span className="hiw-step__number">{number}</span>
                    <span className="hiw-step__icon">
                      <Icon size={20} />
                    </span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="hiw-why-section">
        <div className="hiw-container hiw-why hiw-reveal">
          <div className="hiw-why__photo">
            <RepairPhoto
              src={stockPhotos.repairDetail}
              fallbackSrc={heroTechnician}
              alt="Smartphone repair at a technician's workbench"
              loading="lazy"
            />
          </div>
          <div className="hiw-why__body">
            <Eyebrow icon={BadgeCheck}>WHY CHOOSE FIXHUB</Eyebrow>
            <h2>
              Repair Support You <span>Can Count On.</span>
            </h2>
            <div className="hiw-benefits-grid">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div className="hiw-benefit" key={title}>
                  <span className="hiw-benefit__icon">
                    <Icon size={24} />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hiw-membership-section">
        <div className="hiw-container hiw-membership hiw-reveal">
          <div className="hiw-membership__copy">
            <Eyebrow icon={Crown}>FIXHUB MEMBERSHIP</Eyebrow>
            <h2>
              Get More Benefits
              <br />
              <span>With Membership.</span>
            </h2>
            <p>
              Join the right membership for your phone brand and unlock your
              first eligible service free, subject to plan terms.
            </p>
            <div className="hiw-membership__pricing">
              <span>
                Other brands <strong>₹499</strong>
              </span>
              <span>
                iPhone &amp; Samsung <strong>₹999</strong>
              </span>
            </div>
            <Link to="/membership" className="hiw-btn hiw-btn--outline">
              View Membership Plans <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="hiw-membership__visual" aria-hidden="true">
            <div className="hiw-membership__shine" />
            <div className="hiw-membership__card">
              <div className="hiw-membership__card-top">
                <Crown size={23} /> FIXHUB
              </div>
              <strong>MEMBERSHIP</strong>
              <div className="hiw-membership__card-bottom">
                <span>DEVICE CARE</span>
                <ShieldCheck size={26} />
              </div>
            </div>
            <span className="hiw-membership__orb">
              <Check size={29} />
            </span>
          </div>
        </div>
      </section>

      <section className="hiw-faq-section">
        <div className="hiw-container">
          <header className="hiw-section-heading hiw-section-heading--center hiw-reveal">
            <Eyebrow icon={MessageCircle}>QUESTIONS</Eyebrow>
            <h2>
              Frequently Asked <span>Questions</span>
            </h2>
            <p>Everything you need to know before booking a repair.</p>
          </header>
          <div className="hiw-faq-grid">
            {faqItems.map(({ question, answer }) => (
              <details className="hiw-faq hiw-reveal" key={question}>
                <summary>
                  <span>{question}</span>
                  <ChevronDown size={19} aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="hiw-cta-section">
        <div className="hiw-container">
          <div className="hiw-cta hiw-reveal">
            <span className="hiw-cta__icon">
              <MessageCircle size={29} />
            </span>
            <div>
              <span className="hiw-cta__kicker">
                NEED HELP WITH YOUR PHONE?
              </span>
              <h2>Let's Get Your Phone Working Again.</h2>
              <p>
                Describe the issue and our team will help with the next steps.
              </p>
            </div>
            <Link to="/contact" className="hiw-btn hiw-btn--white">
              Contact Us <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
