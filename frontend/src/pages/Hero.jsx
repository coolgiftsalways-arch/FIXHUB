import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";

// GSAP
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ICONS
import {
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  House,
  ShieldCheck,
  Smartphone,
  Gift,
  MonitorSmartphone,
  BatteryCharging,
  Camera,
  PlugZap,
} from "lucide-react";

// HERO IMAGES
import technician from "../assets/Hero/technician.png";
import blueGlow from "../assets/Hero/blue-glow.png";
import heroDecoration from "../assets/Hero/hero-decoration.png";

// NEW BRAND SLIDER
import BrandSlider from "./BrandSlider.jsx";
// CSS
import "../styles/Hero.css";

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// REPAIR SERVICES
// ==========================================

const repairServices = [
  {
    title: "Display",
    subtitle: "Replacement",
    icon: MonitorSmartphone,
  },
  {
    title: "Battery",
    subtitle: "Replacement",
    icon: BatteryCharging,
  },
  {
    title: "Camera",
    subtitle: "Repair",
    icon: Camera,
  },
  {
    title: "Charging Port",
    subtitle: "Repair",
    icon: PlugZap,
  },
];

// ==========================================
// HERO
// ==========================================

export default function Hero() {
  const heroRef = useRef(null);

  // ========================================
  // GSAP ANIMATIONS
  // ========================================

  useLayoutEffect(() => {
    const hero = heroRef.current;

    if (!hero) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      // ====================================
      // HERO INTRO
      // ====================================

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .from(".fh-hero__badge", {
          y: 25,
          opacity: 0,
          duration: 0.7,
        })

        .from(
          ".fh-hero__heading-line",
          {
            y: 70,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
          },
          "-=0.35",
        )

        .from(
          ".fh-hero__description",
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.5",
        )

        .from(
          ".fh-hero__buttons > *",
          {
            y: 25,
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
          },
          "-=0.4",
        )

        .from(
          ".fh-hero__benefit",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.12,
          },
          "-=0.3",
        )

        .from(
          ".fh-hero__membership",
          {
            y: 35,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.3",
        )

        .from(
          ".fh-hero__offer",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.3",
        );

      // ====================================
      // TECHNICIAN IMAGE
      // ====================================

      gsap.from(".fh-hero__technician-image", {
        x: 80,
        opacity: 0,
        scale: 1.08,
        duration: 1.6,
        ease: "power3.out",
      });

      // ====================================
      // FLOATING SERVICE CARDS
      // ====================================

      gsap.from(".fh-hero__service-card", {
        x: 50,
        opacity: 0,
        duration: 0.8,
        delay: 1,
        stagger: 0.15,
        ease: "power3.out",
      });

      // ====================================
      // BLUE GLOW
      // ====================================

      gsap.to(".fh-hero__blue-glow", {
        scale: 1.08,
        opacity: 0.85,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // ====================================
      // SCROLL PARALLAX
      // ====================================

      gsap.to(".fh-hero__scene", {
        yPercent: 8,
        ease: "none",

        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      // ====================================
      // DECORATION PARALLAX
      // ====================================

      gsap.to(".fh-hero__decoration", {
        yPercent: -12,
        ease: "none",

        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      // ====================================
      // NEW BRAND SLIDER ENTRANCE
      // ====================================

      gsap.from(".fh-brands", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 1.2,
        ease: "power3.out",
      });
    }, hero);

    return () => {
      ctx.revert();
    };
  }, []);

  // ========================================
  // HERO JSX
  // ========================================

  return (
    <section className="fh-hero" id="hero" ref={heroRef}>
      {/* ====================================
          BACKGROUND TECHNICIAN
      ==================================== */}

      <div className="fh-hero__scene">
        <div className="fh-hero__technician">
          <img
            src={technician}
            alt="FixHub technician repairing a mobile phone at customer's home"
            className="fh-hero__technician-image"
            fetchPriority="high"
          />
        </div>

        {/* BLUE GLOW */}

        <div className="fh-hero__blue-glow">
          <img src={blueGlow} alt="" aria-hidden="true" />
        </div>
      </div>

      {/* ====================================
          DARK OVERLAY
      ==================================== */}

      <div className="fh-hero__shade" />

      {/* ====================================
          NEON DECORATION
      ==================================== */}

      <div className="fh-hero__decoration">
        <img src={heroDecoration} alt="" aria-hidden="true" />
      </div>

      {/* ====================================
          RIGHT SIDE SERVICE CARDS
      ==================================== */}

      <div className="fh-hero__services">
        {repairServices.map((service) => {
          const Icon = service.icon;

          return (
            <Link
              to="/book-repair"
              key={service.title}
              className="fh-hero__service-card"
            >
              <span className="fh-hero__service-icon">
                <Icon size={21} strokeWidth={1.7} />
              </span>

              <span className="fh-hero__service-name">
                {service.title}

                <small>{service.subtitle}</small>
              </span>
            </Link>
          );
        })}
      </div>

      {/* ====================================
          MAIN HERO CONTENT
      ==================================== */}

      <div className="fh-hero__container">
        <div className="fh-hero__content">
          {/* BADGE */}

          <div className="fh-hero__badge">
            <span className="fh-hero__badge-dot" />
            DOORSTEP MOBILE REPAIR SERVICE
          </div>

          {/* =================================
              HEADING
          ================================= */}

          <h1 className="fh-hero__heading">
            <span className="fh-hero__heading-line">Your Phone Breaks.</span>

            <span className="fh-hero__heading-line fh-hero__heading-gradient">
              We Come To You.
            </span>
          </h1>

          {/* =================================
              DESCRIPTION
          ================================= */}

          <p className="fh-hero__description">
            Broken display? Battery problems? Charging issues? Our expert
            technician visits your home, repairs your phone whenever possible,
            and hands it back to you.
          </p>

          {/* =================================
              BUTTONS
          ================================= */}

          <div className="fh-hero__buttons">
            <Link
              to="/book-repair"
              className="fh-hero__button fh-hero__button-primary"
            >
              <CalendarDays size={19} />
              Book a Repair
              <ArrowUpRight size={20} />
            </Link>

            <Link
              to="/services"
              className="fh-hero__button fh-hero__button-outline"
            >
              Explore Services
              <ArrowRight size={19} />
            </Link>
          </div>

          {/* =================================
              SERVICE BENEFITS
          ================================= */}

          <div className="fh-hero__benefits">
            <div className="fh-hero__benefit">
              <House size={28} />

              <span>
                Doorstep
                <br />
                Repair
              </span>
            </div>

            <span className="fh-hero__benefit-divider" />

            <div className="fh-hero__benefit">
              <ShieldCheck size={28} />

              <span>
                Expert
                <br />
                Technicians
              </span>
            </div>

            <span className="fh-hero__benefit-divider" />

            <div className="fh-hero__benefit">
              <Smartphone size={27} />

              <span>
                All Major
                <br />
                Brands
              </span>
            </div>
          </div>

          {/* =================================
              MEMBERSHIP PLANS
          ================================= */}

          <div className="fh-hero__membership">
            {/* ₹499 PLAN */}

            <Link to="/membership?plan=499" className="fh-hero__plan">
              <span className="fh-hero__price">₹499</span>

              <h3>Other Brands</h3>

              <p>
                Oppo, Vivo, OnePlus, Realme, Xiaomi, Redmi, POCO, Motorola and
                more.
              </p>
            </Link>

            <span className="fh-hero__membership-divider" />

            {/* ₹999 PLAN */}

            <Link to="/membership?plan=999" className="fh-hero__plan">
              <span className="fh-hero__price">₹999</span>

              <h3>iPhone & Samsung</h3>

              <p>Exclusively for Apple iPhone and Samsung mobile users.</p>
            </Link>
          </div>

          {/* =================================
              FREE FIRST SERVICE
          ================================= */}

          <Link to="/membership" className="fh-hero__offer">
            <Gift size={20} />

            <span>
              Get your first eligible mobile service <strong>FREE</strong> with
              membership!*
            </span>

            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>

      {/* ====================================
          NEW COLOURED SVG BRAND SLIDER
      ==================================== */}

      <BrandSlider />
    </section>
  );
}
