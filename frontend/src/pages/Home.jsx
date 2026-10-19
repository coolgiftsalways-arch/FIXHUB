import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";

// ==========================================
// GSAP ANIMATIONS
// ==========================================

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  House,
  ShieldCheck,
  Smartphone,
  BatteryCharging,
  Camera,
  PlugZap,
  Settings2,
  Droplets,
  Gift,
  BadgeCheck,
  Check,
  Clock3,
  UserRound,
  MessageCircle,
  Wrench,
} from "lucide-react";

// =====================================================
// EXISTING HERO
// =====================================================

import Hero from "./Hero.jsx";

// =====================================================
// REAL PHOTOGRAPHS FOR THE SIX HOME SERVICE CARDS
// Stock photography from Unsplash, Pexels and PAKUTASO.
// No AI-rendered Services/*.png files are used here.
// Images load online; see photo source notes included with this file.
// =====================================================

const servicePhotos = {
  display:
    "https://images.unsplash.com/photo-1746006084501-74e54c006c56?auto=format&fit=crop&w=950&q=85",
  battery:
    "https://images.pexels.com/photos/31862950/pexels-photo-31862950.jpeg?auto=compress&cs=tinysrgb&w=950",
  camera:
    "https://images.unsplash.com/photo-1747409864642-c7150b97bef9?auto=format&fit=crop&w=950&q=85",
  charging:
    "https://images.unsplash.com/photo-1695482482959-937db8e81cef?auto=format&fit=crop&w=950&q=85",
  software:
    "https://images.pexels.com/photos/34353879/pexels-photo-34353879.jpeg?auto=compress&cs=tinysrgb&w=950",
  water:
    "https://cdn.pakutaso.com/shared/img/thumb/iPhone7warer9V9A2032_23_TP_V.jpg",
};

// =====================================================
// WHY CHOOSE IMAGES
// =====================================================

import technicianImg from "../assets/Services/technician-trust.png";

import floatingMobileImg from "../assets/Services/floating-mobile.png";

// =====================================================
// MEMBERSHIP IMAGE
// =====================================================

import membershipImg from "../assets/Services/membership-phone.png";

// =====================================================
// CSS
// =====================================================

import "../styles/Home.css";

gsap.registerPlugin(ScrollTrigger);

// =====================================================
// SERVICE DATA
// =====================================================

const repairServices = [
  {
    id: "01",
    name: "Display",
    subtitle: "Replacement",
    image: servicePhotos.display,
    icon: Smartphone,
  },

  {
    id: "02",
    name: "Battery",
    subtitle: "Replacement",
    image: servicePhotos.battery,
    icon: BatteryCharging,
  },

  {
    id: "03",
    name: "Camera",
    subtitle: "Repair",
    image: servicePhotos.camera,
    icon: Camera,
  },

  {
    id: "04",
    name: "Charging Port",
    subtitle: "Repair",
    image: servicePhotos.charging,
    icon: PlugZap,
  },

  {
    id: "05",
    name: "Software",
    subtitle: "Issues",
    image: servicePhotos.software,
    icon: Settings2,
  },

  {
    id: "06",
    name: "Water Damage",
    subtitle: "Repair",
    image: servicePhotos.water,
    icon: Droplets,
  },
];

// =====================================================
// WHY CHOOSE FIXHUB FEATURES
// =====================================================

const trustFeatures = [
  {
    icon: House,
    title: "Doorstep",
    subtitle: "Service",
  },

  {
    icon: ShieldCheck,
    title: "Professional",
    subtitle: "Technicians",
  },

  {
    icon: BadgeCheck,
    title: "Clear",
    subtitle: "Pricing",
  },

  {
    icon: Clock3,
    title: "Convenient",
    subtitle: "Booking",
  },
];

// =====================================================
// MEMBERSHIP PLANS
// =====================================================

const membershipPlans = [
  {
    id: "499",
    price: "499",
    title: "Other Brands Plan",

    description:
      "Oppo, Vivo, OnePlus, Realme, Xiaomi, Redmi, POCO, Motorola and more.",

    features: [
      "First eligible service FREE*",
      "Doorstep repair booking",
      "Repair status updates",
      "Membership benefits",
    ],

    premium: false,
  },

  {
    id: "999",
    price: "999",
    title: "iPhone & Samsung Plan",

    description: "Exclusively for Apple iPhone and Samsung mobile users.",

    features: [
      "First eligible service FREE*",
      "Doorstep repair booking",
      "Repair status updates",
      "Membership benefits",
    ],

    premium: true,
  },
];

// =====================================================
// HOW IT WORKS DATA
// =====================================================

const repairSteps = [
  {
    number: "01",

    title: "Book a Repair",

    description:
      "Select your phone, describe the issue and choose an appointment.",

    icon: CalendarDays,
  },

  {
    number: "02",

    title: "Technician Visits",

    description: "Our technician visits your home and checks your device.",

    icon: UserRound,
  },

  {
    number: "03",

    title: "Device Repaired",

    description:
      "Your phone is repaired on-site whenever possible, or collected and returned after repair.",

    icon: Smartphone,
  },
];

// =====================================================
// TESTIMONIAL PLACEHOLDERS
// NO CUSTOMER IMAGES
// =====================================================

const testimonials = [
  {
    title: "Doorstep Convenience",

    text: "Customer experiences about booking mobile repair from home will appear here.",

    category: "Home Repair Service",
  },

  {
    title: "Mobile Repair Quality",

    text: "Verified feedback about display, battery and other mobile repairs will appear here.",

    category: "Repair Experience",
  },

  {
    title: "Customer Support",

    text: "Real reviews about our communication and customer support will appear here.",

    category: "Support Experience",
  },
];

// =====================================================
// REUSABLE SECTION TAG
// =====================================================

function SectionTag({ children }) {
  return (
    <div className="fxh-section-tag">
      <span className="fxh-section-tag-icon">
        <Wrench size={11} strokeWidth={2} />
      </span>

      <span>{children}</span>
    </div>
  );
}

// =====================================================
// 01 — OUR SERVICES SECTION
// =====================================================

function ServicesSection() {
  return (
    <section className="fxh-services" id="home-services">
      <div className="fxh-container">
        {/* SECTION HEADER */}

        <div className="fxh-section-header" data-fxh-reveal>
          <div className="fxh-header-content">
            <SectionTag>OUR SERVICES</SectionTag>

            <h2 className="fxh-heading">
              Complete Mobile <span>Repair Services</span>
            </h2>

            <p className="fxh-section-desc">
              Everything your phone needs, repaired at your doorstep.
            </p>
          </div>

          <Link to="/services" className="fxh-outline-button">
            View All Services
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* SERVICES GRID */}

        <div className="fxh-services-grid">
          {repairServices.map((service) => {
            const Icon = service.icon;

            return (
              <Link
                to="/book-repair"
                key={service.id}
                className="fxh-service-card"
                data-fxh-reveal
              >
                {/* IMAGE */}

                <div className="fxh-service-image">
                  <img
                    src={service.image}
                    alt={`${service.name} ${service.subtitle}`}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      // Use a different real stock repair photo if a provider blocks an image.
                      // Avoid an infinite retry loop if the fallback also fails.
                      const fallback =
                        "https://images.pexels.com/photos/6755075/pexels-photo-6755075.jpeg?auto=compress&cs=tinysrgb&w=900";
                      if (event.currentTarget.src !== fallback) {
                        event.currentTarget.src = fallback;
                      } else {
                        event.currentTarget.style.visibility = "hidden";
                      }
                    }}
                  />
                </div>

                {/* IMAGE OVERLAY */}

                <div className="fxh-service-overlay" />

                {/* SERVICE NUMBER */}

                <span className="fxh-service-number">{service.id}</span>

                {/* SERVICE ICON */}

                <span className="fxh-service-top-icon">
                  <Icon size={18} />
                </span>

                {/* SERVICE DETAILS */}

                <div className="fxh-service-content">
                  <div className="fxh-service-title">
                    <h3>{service.name}</h3>

                    <p>{service.subtitle}</p>
                  </div>

                  <div className="fxh-service-arrow">
                    <ArrowUpRight size={19} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// =====================================================
// 02 — WHY CHOOSE FIXHUB
// =====================================================

function WhyChooseSection() {
  return (
    <section className="fxh-why" id="why-fixhub">
      {/* BACKGROUND GLOW */}

      <div className="fxh-why-glow" />

      <div className="fxh-container fxh-why-layout">
        {/* LEFT SIDE */}

        <div className="fxh-why-content" data-fxh-reveal>
          <SectionTag>WHY CHOOSE FIXHUB</SectionTag>

          <h2 className="fxh-heading">
            Reliable Repairs.
            <br />
            <span>Happier Customers.</span>
          </h2>

          <p className="fxh-section-desc">
            Professional mobile repair made simple. We provide convenient
            doorstep service, clear repair information and support throughout
            your booking.
          </p>

          {/* FEATURES */}

          <div className="fxh-why-features">
            {trustFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <div className="fxh-why-feature" key={feature.title}>
                  <div className="fxh-why-feature-icon">
                    <Icon size={22} strokeWidth={1.7} />
                  </div>

                  <span>
                    {feature.title}

                    <small>{feature.subtitle}</small>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="fxh-why-visual" data-fxh-reveal>
          {/* FLOATING MOBILE IMAGE */}

          <img
            src={floatingMobileImg}
            alt="Mobile phones showing repair conditions"
            className="fxh-why-floating-phone"
            loading="lazy"
          />

          {/* TECHNICIAN IMAGE */}

          <div className="fxh-why-technician">
            <img
              src={technicianImg}
              alt="FixHub mobile repair technician"
              loading="lazy"
            />
          </div>

          {/* FLOATING BADGE */}

          <div className="fxh-why-stat">
            <div className="fxh-why-stat-icon">
              <ShieldCheck size={28} />
            </div>

            <strong>Doorstep</strong>

            <span>Mobile Repair</span>
          </div>

          {/* CHECKLIST */}

          <div className="fxh-why-checklist">
            {[
              "Professional Technicians",
              "Quality Repair",
              "Clear Pricing",
              "Convenient Service",
            ].map((item) => (
              <div className="fxh-why-check-item" key={item}>
                <span>
                  <Check size={13} />
                </span>

                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =====================================================
// 03 — MEMBERSHIP PLANS
// =====================================================

function MembershipSection() {
  return (
    <section className="fxh-membership" id="home-membership">
      <div className="fxh-container fxh-membership-layout">
        {/* LEFT SIDE */}

        <div className="fxh-membership-intro" data-fxh-reveal>
          <SectionTag>MEMBERSHIP PLANS</SectionTag>

          <h2 className="fxh-heading">
            Save More with
            <br />
            <span>FixHub Membership</span>
          </h2>

          <p className="fxh-section-desc">
            Choose the right plan for your device and enjoy membership benefits,
            including your first eligible service FREE.
          </p>

          <Link to="/membership" className="fxh-membership-explore">
            Explore Membership
            <ArrowUpRight size={17} />
          </Link>
        </div>

        {/* MEMBERSHIP CARDS */}

        <div className="fxh-membership-cards">
          {membershipPlans.map((plan) => (
            <div
              key={plan.id}
              className={`fxh-plan-card ${
                plan.premium ? "fxh-plan-card-premium" : ""
              }`}
              data-fxh-reveal
            >
              {/* PRICE */}

              <div className="fxh-plan-price">
                <span>₹</span>

                {plan.price}
              </div>

              {/* PLAN NAME */}

              <h3>{plan.title}</h3>

              {/* DESCRIPTION */}

              <p className="fxh-plan-description">{plan.description}</p>

              {/* FEATURES */}

              <div className="fxh-plan-features">
                {plan.features.map((feature) => (
                  <div className="fxh-plan-feature" key={feature}>
                    <span className="fxh-plan-check">
                      <Check size={12} />
                    </span>

                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* BUTTON */}

              <Link
                to={`/membership?plan=${plan.id}`}
                className={`fxh-plan-button ${
                  plan.premium ? "fxh-plan-button-light" : ""
                }`}
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        {/* MEMBERSHIP IMAGE */}

        <div className="fxh-membership-visual" data-fxh-reveal>
          <img
            src={membershipImg}
            alt="FixHub premium mobile repair membership"
            loading="lazy"
          />

          {/* FREE SERVICE BADGE */}

          <div className="fxh-free-badge">
            <span>FIRST</span>

            <span>SERVICE</span>

            <strong>FREE*</strong>

            <Gift size={24} />
          </div>
        </div>
      </div>

      {/* MEMBERSHIP TERMS */}

      <p className="fxh-membership-note">
        *Free-service eligibility and replacement-part charges depend on
        membership terms.
      </p>
    </section>
  );
}

// =====================================================
// 04 — HOW IT WORKS
// =====================================================

function HowItWorksSection() {
  return (
    <section className="fxh-how" id="home-how-it-works">
      <div className="fxh-container fxh-how-layout">
        {/* LEFT SIDE */}

        <div className="fxh-how-intro" data-fxh-reveal>
          <SectionTag>HOW IT WORKS</SectionTag>

          <h2 className="fxh-heading">
            Get Your Phone Repaired
            <br />
            <span>in 3 Simple Steps</span>
          </h2>

          <p className="fxh-section-desc">
            Book your repair and let our team handle the rest.
          </p>
        </div>

        {/* THREE STEPS */}

        <div className="fxh-steps">
          {repairSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div className="fxh-step" key={step.number} data-fxh-reveal>
                {/* TOP */}

                <div className="fxh-step-top">
                  <span className="fxh-step-number">{step.number}</span>

                  <div className="fxh-step-icon">
                    <Icon size={30} strokeWidth={1.6} />
                  </div>
                </div>

                {/* TITLE */}

                <h3>{step.title}</h3>

                {/* DESCRIPTION */}

                <p>{step.description}</p>

                {/* ARROW */}

                {index !== repairSteps.length - 1 && (
                  <ArrowRight
                    className="fxh-step-arrow"
                    size={24}
                    strokeWidth={1.4}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// =====================================================
// 05 — CUSTOMER TESTIMONIALS
// NO CUSTOMER PROFILE IMAGES
// =====================================================

function TestimonialsSection() {
  const sliderRef = useRef(null);

  // ===================================================
  // TESTIMONIAL SLIDER
  // ===================================================

  const slideReviews = (direction) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const card = slider.querySelector(".fxh-review-card");

    const amount = card ? card.getBoundingClientRect().width + 14 : 300;

    slider.scrollBy({
      left: direction * amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="fxh-testimonials" id="home-testimonials">
      <div className="fxh-container fxh-testimonials-layout">
        {/* LEFT SIDE */}

        <div className="fxh-testimonials-intro" data-fxh-reveal>
          <SectionTag>WHAT OUR CUSTOMERS SAY</SectionTag>

          <h2 className="fxh-heading">
            Customer
            <br />
            <span>Experiences</span>
          </h2>

          <p className="fxh-section-desc">
            Verified customer experiences and reviews will be displayed here.
          </p>
        </div>

        {/* RIGHT SIDE */}

        <div className="fxh-testimonial-content">
          {/* SLIDER BUTTONS */}

          <div className="fxh-review-controls">
            <button
              type="button"
              onClick={() => slideReviews(-1)}
              aria-label="Previous reviews"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => slideReviews(1)}
              aria-label="Next reviews"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* REVIEW CARDS */}

          <div className="fxh-reviews" ref={sliderRef}>
            {testimonials.map((review) => (
              <div
                className="fxh-review-card"
                key={review.title}
                data-fxh-reveal
              >
                {/* TOP */}

                <div className="fxh-review-top">
                  <div className="fxh-review-quote">
                    <MessageCircle size={19} />
                  </div>

                  <span className="fxh-review-status">COMING SOON</span>
                </div>

                {/* REVIEW TITLE */}

                <h3>{review.title}</h3>

                {/* REVIEW TEXT */}

                <p className="fxh-review-text">{review.text}</p>

                {/* REVIEW BOTTOM */}

                <div className="fxh-review-bottom">
                  {/* SVG ICON ONLY */}

                  <div className="fxh-review-avatar">
                    <UserRound size={18} />
                  </div>

                  <div>
                    <strong>Customer Reviews</strong>

                    <small>{review.category}</small>
                  </div>

                  <BadgeCheck className="fxh-review-check" size={19} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =====================================================
// MAIN HOME COMPONENT
// =====================================================

export default function Home() {
  const homeRef = useRef(null);

  // ===================================================
  // GSAP SCROLL ANIMATIONS
  // ===================================================

  useLayoutEffect(() => {
    const home = homeRef.current;

    if (!home) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray("[data-fxh-reveal]");

      elements.forEach((element) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 35,
          },
          {
            opacity: 1,
            y: 0,

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
    }, home);

    // REFRESH SCROLLTRIGGER

    const refreshFrame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(refreshFrame);
      ctx.revert();
    };
  }, []);

  // ===================================================
  // HOME JSX
  // ===================================================

  return (
    <>
      {/* ===============================================
          HERO + BRAND SLIDER
      =============================================== */}

      <Hero />

      {/* ===============================================
          HOMEPAGE SECTIONS
      =============================================== */}

      <div className="fxh-home" ref={homeRef}>
        {/* 01 — OUR SERVICES */}

        <ServicesSection />

        {/* 02 — WHY CHOOSE FIXHUB */}

        <WhyChooseSection />

        {/* 03 — MEMBERSHIP PLANS */}

        <MembershipSection />

        {/* 04 — HOW IT WORKS */}

        <HowItWorksSection />

        {/* 05 — CUSTOMER TESTIMONIALS */}

        <TestimonialsSection />
      </div>
    </>
  );
}
