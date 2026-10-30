import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck, Wrench, X } from "lucide-react";
import "../styles/FirstServicePopup.css";

const STORAGE_KEY = "fixhub_first_service_popup_seen_v1";

export default function FirstServicePopup() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      // Do not show the popup again if the customer has already dismissed it.
      if (localStorage.getItem(STORAGE_KEY) === "true") {
        return;
      }
    } catch {
      // Continue without persistence if browser storage is unavailable.
    }

    // Give the homepage a moment to load before showing the popup.
    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  function rememberChoice() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // The popup can still be closed if storage is unavailable.
    }
  }

  function handleClose() {
    rememberChoice();
    setIsVisible(false);
  }

  function handleGetStarted() {
    rememberChoice();
    setIsVisible(false);
    navigate("/membership");
  }

  // Close the popup when the customer presses Escape.
  useEffect(() => {
    if (!isVisible) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible]);

  // Prevent the popup from rendering until it is ready to appear.
  if (!isVisible) return null;

  return (
    <div
      className="first-service-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        className="first-service-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-service-title"
        aria-describedby="first-service-description"
      >
        <button
          type="button"
          className="first-service-close"
          onClick={handleClose}
          aria-label="Close offer"
        >
          <X size={22} />
        </button>

        <div className="first-service-content">
          <div className="first-service-brand">
            <span className="first-service-brand-icon">
              <Wrench size={21} />
            </span>
            <span>FIXHUB</span>
          </div>

          <div className="first-service-badge">A SPECIAL WELCOME OFFER</div>

          <div className="first-service-illustration">
            <div className="first-service-icon-circle">
              <Wrench size={43} strokeWidth={1.8} />
            </div>
            <span className="first-service-check">
              <CheckCircle2 size={27} />
            </span>
          </div>

          <h2 id="first-service-title">
            Get Your First
            <br />
            <span>Service FREE!</span>
            <span>With Exclusive Membership</span>
          </h2>

         

          <div className="first-service-benefits">
            <div className="first-service-benefit">
              <CheckCircle2 size={19} />
              <span>First eligible repair service free</span>
            </div>

            <div className="first-service-benefit">
              <ShieldCheck size={19} />
              <span>Expert mobile repair support</span>
            </div>

            <div className="first-service-benefit">
              <Wrench size={19} />
              <span>Choose a plan for your phone</span>
            </div>
          </div>

          <button
            type="button"
            className="first-service-cta"
            onClick={handleGetStarted}
          >
            Get Started Now
            <ArrowRight size={20} />
          </button>

          <button
            type="button"
            className="first-service-later"
            onClick={handleClose}
          >
            Maybe Later
          </button>

          <p className="first-service-terms">
            Membership purchase and applicable offer terms required.
          </p>
        </div>
      </section>
    </div>
  );
}
