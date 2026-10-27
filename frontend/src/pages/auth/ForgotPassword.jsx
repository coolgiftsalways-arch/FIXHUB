import { useState } from "react";

import { Link } from "react-router-dom";

import { ArrowRight, Mail, ShieldCheck } from "lucide-react";

import "../../styles/Auth.css";

// ==========================================
// FORGOT PASSWORD PAGE
// ==========================================

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  // ========================================
  // REQUEST PASSWORD RESET
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to send password reset email.",
        );
      }

      setMessage(result.message);
    } catch (err) {
      setError(err.message || "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="fxa-page fxa-recovery-page">
      <section className="fxa-card fxa-recovery-card">
        <span className="fxa-eyebrow">
          <ShieldCheck size={17} />
          FIXHUB CUSTOMER SECURITY
        </span>

        <div className="fxa-card-head">
          <h2>Forgot Password?</h2>

          <p>
            Enter your registered email address. We'll send you a secure
            password reset link valid for 15 minutes.
          </p>
        </div>

        <form className="fxa-form" onSubmit={handleSubmit}>
          <label className="fxa-field">
            <span>Email Address *</span>

            <div className="fxa-input">
              <Mail size={18} />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                maxLength={254}
                required
              />
            </div>
          </label>

          {error && (
            <p className="fxa-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="fxa-success" role="status">
              {message}
            </p>
          )}

          <button type="submit" className="fxa-submit" disabled={busy}>
            {busy ? "Please Wait..." : "Send Reset Link"}

            <ArrowRight size={18} />
          </button>
        </form>

        <p className="fxa-bottom-note">
          <Link to="/login">Back to Login</Link>
        </p>
      </section>
    </div>
  );
}
