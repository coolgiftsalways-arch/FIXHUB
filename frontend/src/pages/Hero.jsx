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

      const heroButtons = gsap.utils.toArray(
        ".fh-hero__buttons .fh-hero__button",
      );
      const heroBenefits = gsap.utils.toArray(".fh-hero__benefit");
      const benefitDividers = gsap.utils.toArray(".fh-hero__benefit-divider");

      // Keep the button and benefit rows hidden until their entrance animation.
      gsap.set([...heroButtons, ...heroBenefits, ...benefitDividers], {
        willChange: "transform, opacity",
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

        // BUTTON 1 + BUTTON 2: smooth, slightly staggered entrance.
        .from(
          heroButtons,
          {
            y: 34,
            opacity: 0,
            scale: 0.96,
            duration: 0.8,
            stagger: 0.16,
            ease: "back.out(1.25)",
            clearProps: "willChange",
          },
          "-=0.25",
        )

        // BENEFITS: reveal each item one after another below the buttons.
        .from(
          heroBenefits,
          {
            y: 22,
            opacity: 0,
            duration: 0.65,
            stagger: 0.18,
            ease: "power3.out",
            clearProps: "willChange",
          },
          "-=0.2",
        )

        .from(
          benefitDividers,
          {
            scaleY: 0,
            opacity: 0,
            transformOrigin: "center",
            duration: 0.4,
            stagger: 0.12,
            ease: "power2.out",
            clearProps: "willChange",
          },
          "<",
        )

        .from(
          ".fh-hero__pricing",
          {
            y: 35,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.15",
        )

        .from(
          ".fh-hero__deals",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.3",
        );

      // PREMIUM GSAP HOVER: lift + soft blue glow.
      const hoverCleanups = [];

      heroButtons.forEach((button) => {
        const isPrimary = button.classList.contains("fh-hero__button-primary");

        const onEnter = () => {
          gsap.to(button, {
            y: -5,
            scale: 1.025,
            duration: 0.28,
            ease: "power2.out",
            overwrite: "auto",
            boxShadow: isPrimary
              ? "0 14px 36px rgba(0, 140, 255, 0.42)"
              : "0 12px 30px rgba(0, 180, 255, 0.2)",
          });
        };

        const onLeave = () => {
          gsap.to(button, {
            y: 0,
            scale: 1,
            duration: 0.35,
            ease: "power3.out",
            overwrite: "auto",
            clearProps: "boxShadow",
          });
        };

        button.addEventListener("pointerenter", onEnter);
        button.addEventListener("pointerleave", onLeave);
        button.addEventListener("focus", onEnter);
        button.addEventListener("blur", onLeave);

        hoverCleanups.push(() => {
          button.removeEventListener("pointerenter", onEnter);
          button.removeEventListener("pointerleave", onLeave);
          button.removeEventListener("focus", onEnter);
          button.removeEventListener("blur", onLeave);
        });
      });

      // Store cleanup callbacks on this scoped effect for React unmount.
      hero._heroButtonHoverCleanups = hoverCleanups;

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
      hero._heroButtonHoverCleanups?.forEach((cleanup) => cleanup());
      delete hero._heroButtonHoverCleanups;
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

          {/* REPAIR PRICES */}
          <div className="fh-hero__pricing">
            <div className="fh-hero__pricing-head">
              <span>FIXHUB REPAIR PRICING</span>
              <strong>One Service. One Clear Charge.</strong>
            </div>
            <div className="fh-hero__pricing-grid">
              {[
                ["Up to ₹20,000", "₹499"],
                ["₹20,001 – ₹50,000", "₹699"],
                ["₹50,001 – ₹90,000", "₹999"],
                ["₹90,001 – ₹1,30,000", "₹1,299"],
                ["Above ₹1,30,000", "₹1,699"],
              ].map(([value, price]) => (
                <Link
                  to="/book-repair"
                  className="fh-hero__pricing-item"
                  key={price}
                >
                  <small>PHONE VALUE</small>
                  <span>{value}</span>
                  <strong>{price}</strong>
                </Link>
              ))}
            </div>
            <p className="fh-hero__pricing-note">
              Charges apply per repair service. Replacement parts are charged
              separately.
            </p>
          </div>
          <div className="fh-hero__deals">
            <Link to="/book-repair" className="fh-hero__deal">
              <Gift size={23} />
              <span>
                <strong>FIRST SERVICE FREE*</strong>
                <small>Original parts and proper repair documents</small>
              </span>
              <ArrowUpRight size={20} />
            </Link>
            <Link
              to="/book-repair"
              className="fh-hero__deal fh-hero__deal-second"
            >
              <Gift size={23} />
              <span>
                <strong>2 SERVICES — 30% OFF</strong>
                <small>Discount on combined service charges</small>
              </span>
              <ArrowUpRight size={20} />
            </Link>
          </div>
          <p className="fh-hero__deals-note">
            *First eligible service charge waived; replacement parts extra.
            Offers cannot be combined.
          </p>
        </div>
      </div>

      {/* ====================================
          NEW COLOURED SVG BRAND SLIDER
      ==================================== */}

      <BrandSlider />
    </section>
  );
}
