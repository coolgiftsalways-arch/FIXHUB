import { useState } from "react";

import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  House,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  UserRound,
  LoaderCircle,
} from "lucide-react";

// ==========================================
// AUTH CONTEXT
// ==========================================

import { useAuth } from "../../context/AuthContext.jsx";

// ==========================================
// CSS
// ==========================================

import "../../styles/Auth.css";

// ==========================================
// DEFAULT REGISTRATION FORM
// ==========================================

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
};

// ==========================================
// LOGIN COMPONENT
// ==========================================

export default function Login() {
  // ========================================
  // AUTHENTICATION
  // ========================================

  const { user, loading, login, register } = useAuth();

  // ========================================
  // STATES
  // ========================================

  const [mode, setMode] = useState("login");

  const [form, setForm] = useState(initialForm);

  const [identifier, setIdentifier] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const location = useLocation();

  // ========================================
  // REDIRECT AFTER LOGIN
  // ========================================

  const requestedPath = location.state?.from;

  const destination =
    typeof requestedPath === "string" &&
    requestedPath.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    requestedPath !== "/login"
      ? requestedPath
      : "/profile";

  // ========================================
  // UPDATE FORM
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ========================================
  // CHANGE LOGIN / REGISTER MODE
  // ========================================

  const changeMode = (newMode) => {
    setMode(newMode);

    setError("");

    setShowPassword(false);

    setForm((previous) => ({
      ...previous,
      password: "",
    }));
  };

  // ========================================
  // LOGIN / REGISTRATION SUBMISSION
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      if (mode === "register") {
        // ==================================
        // VALIDATE REGISTRATION
        // ==================================

        const fullName = form.fullName.trim();

        const email = form.email.trim().toLowerCase();

        const phone = form.phone.trim();

        const address = form.address.trim();

        const password = form.password;

        if (fullName.length < 2) {
          throw new Error("Please enter your full name.");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error("Please enter a valid email address.");
        }

        if (!/^[6-9]\d{9}$/.test(phone)) {
          throw new Error("Enter a valid 10-digit mobile number.");
        }

        if (address.length < 10) {
          throw new Error("Please enter your complete address.");
        }

        if (password.length < 8) {
          throw new Error("Password must contain at least 8 characters.");
        }

        // ==================================
        // CREATE CUSTOMER ACCOUNT
        // ==================================

        await register({
          fullName,
          email,
          phone,
          address,
          password,
        });
      } else {
        // ==================================
        // CUSTOMER LOGIN
        // ==================================

        if (!identifier.trim()) {
          throw new Error("Please enter your email or mobile number.");
        }

        if (!form.password) {
          throw new Error("Please enter your password.");
        }

        await login({
          identifier: identifier.trim(),
          password: form.password,
        });
      }

      // ==================================
      // REDIRECT AFTER SUCCESS
      // ==================================

      navigate(destination, {
        replace: true,
      });
    } catch (err) {
      console.error("Authentication error:", err);

      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <div className="fxa-page fxa-loading">
        <LoaderCircle size={25} className="fxa-loader" />

        <span>Checking your account...</span>
      </div>
    );
  }

  // ========================================
  // ALREADY LOGGED IN
  // ========================================

  if (user) {
    return <Navigate to={destination} replace />;
  }

  // ========================================
  // LOGIN / REGISTER PAGE
  // ========================================

  return (
    <div className="fxa-page">
      <div className="fxa-shell">
        {/* ==================================
            LEFT BRAND PANEL
        ================================== */}

        <aside className="fxa-side">
          {/* BADGE */}

          <span className="fxa-eyebrow">
            <ShieldCheck size={16} />
            FIXHUB CUSTOMER ACCESS
          </span>

          {/* HEADING */}

          <h1>
            Your Phone.
            <br />
            <span>Your Care.</span>
            <br />
            One Account.
          </h1>

          {/* DESCRIPTION */}

          <p>
            Welcome to FixHub. Book professional mobile repairs, manage your
            account, save your home address and enjoy convenient doorstep mobile
            care.
          </p>

          {/* BENEFITS */}

          <div className="fxa-benefits">
            <div>
              <Smartphone size={23} />

              <span>Easy Mobile Repair Booking</span>
            </div>

            <div>
              <House size={23} />

              <span>Save Your Home Address</span>
            </div>

            <div>
              <ShieldCheck size={23} />

              <span>Secure Customer Account</span>
            </div>
          </div>

          {/* SESSION INFO */}

          <span className="fxa-side-note">
            Your login stays active when you close and reopen the website, while
            your session remains valid.
          </span>
        </aside>

        {/* ==================================
            RIGHT LOGIN CARD
        ================================== */}

        <section className="fxa-card">
          {/* ==================================
              LOGIN / REGISTER TABS
          ================================== */}

          <div className="fxa-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => changeMode("login")}
              disabled={submitting}
            >
              Login
            </button>

            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => changeMode("register")}
              disabled={submitting}
            >
              Create Account
            </button>
          </div>

          {/* ==================================
              CARD HEADING
          ================================== */}

          <div className="fxa-card-head">
            <span className="fxa-eyebrow">
              {mode === "login" ? "WELCOME BACK" : "JOIN FIXHUB"}
            </span>

            <h2>
              {mode === "login" ? "Login to FixHub" : "Create Your Account"}
            </h2>

            <p>
              {mode === "login"
                ? "Enter your email or mobile number and password to continue."
                : "Create your FixHub account for faster mobile repair bookings."}
            </p>
          </div>

          {/* ==================================
              FORM
          ================================== */}

          <form className="fxa-form" onSubmit={handleSubmit}>
            {/* ==================================
                REGISTRATION FIELDS
            ================================== */}

            {mode === "register" && (
              <>
                {/* FULL NAME */}

                <label className="fxa-field">
                  <span>Full Name *</span>

                  <div className="fxa-input">
                    <UserRound size={18} />

                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={handleChange}
                      autoComplete="name"
                      minLength={2}
                      maxLength={100}
                      required
                    />
                  </div>
                </label>

                {/* EMAIL AND MOBILE */}

                <div className="fxa-two-col">
                  {/* EMAIL */}

                  <label className="fxa-field">
                    <span>Email Address *</span>

                    <div className="fxa-input">
                      <Mail size={18} />

                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        maxLength={254}
                        required
                      />
                    </div>
                  </label>

                  {/* MOBILE NUMBER */}

                  <label className="fxa-field">
                    <span>Mobile Number *</span>

                    <div className="fxa-input">
                      <Phone size={18} />

                      <input
                        type="tel"
                        name="phone"
                        placeholder="10-digit mobile number"
                        value={form.phone}
                        onChange={(event) => {
                          const value = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                          setForm((previous) => ({
                            ...previous,
                            phone: value,
                          }));
                        }}
                        autoComplete="tel-national"
                        inputMode="numeric"
                        pattern="[6-9][0-9]{9}"
                        maxLength={10}
                        required
                      />
                    </div>
                  </label>
                </div>

                {/* ==================================
                    HOME ADDRESS
                ================================== */}

                <label className="fxa-field">
                  <span>Full Home Address *</span>

                  <div className="fxa-input fxa-textarea">
                    <MapPin size={18} />

                    <textarea
                      name="address"
                      placeholder="Flat number, building, street, area, city and pincode"
                      value={form.address}
                      onChange={handleChange}
                      autoComplete="street-address"
                      rows={3}
                      minLength={10}
                      maxLength={300}
                      required
                    />
                  </div>
                </label>
              </>
            )}

            {/* ==================================
                LOGIN EMAIL / MOBILE
            ================================== */}

            {mode === "login" && (
              <label className="fxa-field">
                <span>Email or Mobile Number *</span>

                <div className="fxa-input">
                  <Mail size={18} />

                  <input
                    type="text"
                    placeholder="Enter email or mobile number"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </label>
            )}

            {/* ==================================
                PASSWORD
            ================================== */}

            <label className="fxa-field">
              <span>Password *</span>

              <div className="fxa-input">
                <LockKeyhole size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={
                    mode === "register"
                      ? "Create a strong password"
                      : "Enter your password"
                  }
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                  minLength={mode === "register" ? 8 : undefined}
                  maxLength={72}
                  required
                />

                {/* SHOW / HIDE PASSWORD */}

                <button
                  type="button"
                  className="fxa-eye"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {/* ==================================
                ERROR MESSAGE
            ================================== */}

            {error && (
              <p className="fxa-error" role="alert">
                {error}
              </p>
            )}

            {/* ==================================
                SUBMIT BUTTON
            ================================== */}

            <button type="submit" className="fxa-submit" disabled={submitting}>
              {submitting ? (
                <>
                  <LoaderCircle size={18} className="fxa-loader" />
                  Please Wait...
                </>
              ) : (
                <>
                  {mode === "login" ? "Login to FixHub" : "Create Account"}

                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* ==================================
                SECURITY MESSAGE
            ================================== */}

            <p className="fxa-footnote">
              <CheckCircle2 size={15} />
              Secure account access with persistent login.
            </p>
          </form>

          {/* ==================================
              BOTTOM LINKS
          ================================== */}

          <p className="fxa-bottom-note">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => changeMode("register")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#00cfff",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#00cfff",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Login
                </button>
              </>
            )}
          </p>

          {/* ==================================
              EXPLORE SERVICES
          ================================== */}

          <p className="fxa-bottom-note">
            Need mobile repair? <Link to="/services">Explore Our Services</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
