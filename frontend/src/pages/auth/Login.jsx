import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  LockKeyhole,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/Auth.css";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const redirectTimer = useRef(null);

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    identifier: "",
    password: "",
    confirmPassword: "",
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isRegister = mode === "register";

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  }

  function switchMode(nextMode) {
    if (redirectTimer.current) {
      clearTimeout(redirectTimer.current);
      redirectTimer.current = null;
    }

    setMode(nextMode);
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);

    setForm({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      identifier: "",
      password: "",
      confirmPassword: "",
    });
  }

  function validateRegistration() {
    if (form.fullName.trim().length < 2) {
      return "Please enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    const phone = form.phone.replace(/\s+/g, "").trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }

    if (form.address.trim().length < 10) {
      return "Please enter your complete home address.";
    }

    if (form.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (new TextEncoder().encode(form.password).length > 72) {
      return "Password must not exceed 72 bytes.";
    }

    if (form.password !== form.confirmPassword) {
      return "Your passwords do not match.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (isRegister) {
      const validationError = validateRegistration();

      if (validationError) {
        setError(validationError);
        return;
      }
    } else {
      if (!form.identifier.trim() || !form.password) {
        setError("Enter your email/mobile number and password.");
        return;
      }
    }

    setBusy(true);

    try {
      if (isRegister) {
        const result = await register({
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.replace(/\s+/g, "").trim(),
          address: form.address.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
        });

        if (!result?.user) {
          throw new Error(result?.message || "Unable to create your account.");
        }

        setSuccess(
          "Account created successfully! Redirecting to FIXHUB Home...",
        );

        setForm({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          identifier: "",
          password: "",
          confirmPassword: "",
        });

        redirectTimer.current = setTimeout(() => {
          navigate("/", { replace: true });
        }, 3000);
      } else {
        const result = await login({
          identifier: form.identifier.trim(),
          password: form.password,
        });

        if (!result) {
          throw new Error("Login failed. Please try again.");
        }

        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="fxa-page">
      <section className="fxa-card">
        <div className="fxa-glow" />

        <span className="fxa-eyebrow">
          <ShieldCheck size={17} />
          FIXHUB CUSTOMER ACCOUNT
        </span>

        <div className="fxa-card-head">
          <h2>{isRegister ? "Create Your Account" : "Welcome Back"}</h2>

          <p>
            {isRegister
              ? "Your trusted doorstep mobile repair service starts here."
              : "Login to manage your FIXHUB customer account."}
          </p>
        </div>

        <div className="fxa-auth-switch">
          <button
            type="button"
            className={!isRegister ? "active" : ""}
            onClick={() => switchMode("login")}
            disabled={busy || Boolean(success)}
          >
            Login
          </button>

          <button
            type="button"
            className={isRegister ? "active" : ""}
            onClick={() => switchMode("register")}
            disabled={busy || Boolean(success)}
          >
            Create Account
          </button>
        </div>

        <form className="fxa-form" onSubmit={handleSubmit}>
          {isRegister ? (
            <>
              <label className="fxa-field">
                <span>
                  Full Name <b>*</b>
                </span>
                <div className="fxa-input">
                  <User size={18} />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    minLength={2}
                    maxLength={100}
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    disabled={busy || Boolean(success)}
                  />
                </div>
              </label>

              <label className="fxa-field">
                <span>
                  Email Address <b>*</b>
                </span>
                <div className="fxa-input">
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    maxLength={254}
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={busy || Boolean(success)}
                  />
                </div>
              </label>

              <label className="fxa-field">
                <span>
                  Mobile Number <b>*</b>
                </span>
                <div className="fxa-input">
                  <Phone size={18} />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    autoComplete="tel-national"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onChange={handleChange}
                    required
                    disabled={busy || Boolean(success)}
                  />
                </div>
              </label>

              <label className="fxa-field">
                <span>
                  Complete Home Address <b>*</b>
                </span>
                <div className="fxa-input fxa-textarea">
                  <MapPin size={18} />
                  <textarea
                    name="address"
                    placeholder="House number, street, area, city, state and PIN code"
                    autoComplete="street-address"
                    minLength={10}
                    maxLength={300}
                    rows={3}
                    value={form.address}
                    onChange={handleChange}
                    required
                    disabled={busy || Boolean(success)}
                  />
                </div>
              </label>

              <div className="fxa-form-divider">
                <span>SECURE YOUR ACCOUNT</span>
              </div>

              <label className="fxa-field">
                <span>
                  Create Password <b>*</b>
                </span>
                <div className="fxa-input">
                  <LockKeyhole size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength={8}
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={busy || Boolean(success)}
                  />
                  <button
                    type="button"
                    className="fxa-password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <small className="fxa-hint">Use at least 8 characters.</small>
              </label>

              <label className="fxa-field">
                <span>
                  Confirm Password <b>*</b>
                </span>
                <div className="fxa-input">
                  <LockKeyhole size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    minLength={8}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={busy || Boolean(success)}
                  />
                  <button
                    type="button"
                    className="fxa-password-toggle"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>

              <div className="fxa-security-note">
                <ShieldCheck size={19} />
                <p>
                  Your account will be created immediately. You can use your
                  email later if you need to reset your password.
                </p>
              </div>
            </>
          ) : (
            <>
              <label className="fxa-field">
                <span>
                  Email or Mobile Number <b>*</b>
                </span>
                <div className="fxa-input">
                  <User size={18} />
                  <input
                    type="text"
                    name="identifier"
                    placeholder="Enter email or mobile number"
                    autoComplete="username"
                    value={form.identifier}
                    onChange={handleChange}
                    required
                    disabled={busy}
                  />
                </div>
              </label>

              <label className="fxa-field">
                <span>
                  Password <b>*</b>
                </span>
                <div className="fxa-input">
                  <LockKeyhole size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="fxa-password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <div className="fxa-forgot">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </>
          )}

          {error && (
            <p className="fxa-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="fxa-success" role="status">
              <CheckCircle2 size={18} />
              {success}
            </p>
          )}

          <button
            type="submit"
            className="fxa-submit"
            disabled={busy || Boolean(success)}
          >
            {busy
              ? "Please wait..."
              : success
                ? "Account Created"
                : isRegister
                  ? "Create My Account"
                  : "Login to FIXHUB"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="fxa-bottom-note">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                disabled={busy || Boolean(success)}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                disabled={busy}
              >
                Create Account
              </button>
            </>
          )}
        </p>
      </section>
    </main>
  );
}
