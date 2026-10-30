import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import "../../styles/Auth.css";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function VerifyEmail() {
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // ==========================================
  // READ TOKEN FROM EMAIL LINK
  // ==========================================

  useEffect(() => {
    const hash = window.location.hash;

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const emailToken = params.get("token");

    if (emailToken) {
      setToken(emailToken);

      // Remove token from the visible browser address.
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setError(
        "Verification link is missing or invalid. Please request a new verification email.",
      );
    }
  }, []);

  // ==========================================
  // SUBMIT PASSWORD
  // ==========================================

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Your verification link is invalid or expired.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Email verification failed. Please try again.",
        );
      }

      setDone(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  // ==========================================
  // SUCCESS SCREEN
  // ==========================================

  if (done) {
    return (
      <div className="fxa-page">
        <section className="fxa-card fxa-verify-card">
          <div className="fxa-success-icon">
            <CheckCircle2 size={48} />
          </div>

          <h2>Email Verified Successfully!</h2>

          <p>
            Your FIXHUB account is now active. You can log in using your email
            or mobile number and your new password.
          </p>

          <button
            type="button"
            className="fxa-submit"
            onClick={() => navigate("/login")}
          >
            Continue to Login
            <ArrowRight size={18} />
          </button>
        </section>
      </div>
    );
  }

  // ==========================================
  // VERIFICATION FORM
  // ==========================================

  return (
    <div className="fxa-page">
      <section className="fxa-card fxa-verify-card">
        <span className="fxa-eyebrow">
          <ShieldCheck size={17} />
          FIXHUB ACCOUNT SECURITY
        </span>

        <div className="fxa-card-head">
          <h2>Create Your Password</h2>

          <p>
            Your email verification is the final step. Create a secure password
            to activate your FIXHUB account.
          </p>
        </div>

        <form className="fxa-form" onSubmit={handleSubmit}>
          <label className="fxa-field">
            <span>New Password *</span>

            <div className="fxa-input">
              <LockKeyhole size={18} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                type="button"
                className="fxa-password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <label className="fxa-field">
            <span>Confirm Password *</span>

            <div className="fxa-input">
              <LockKeyhole size={18} />

              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
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
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <p className="fxa-security-note">
            Your password must contain at least 8 characters.
          </p>

          {error && (
            <p className="fxa-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="fxa-submit"
            disabled={busy || !token}
          >
            {busy ? "Activating Account..." : "Verify Email & Activate"}

            <ArrowRight size={18} />
          </button>
        </form>

        <p className="fxa-bottom-note">
          <Link to="/resend-verification">
            Request a new verification email
          </Link>
        </p>
      </section>
    </div>
  );
}
