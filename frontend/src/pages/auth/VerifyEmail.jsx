import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { ArrowRight, ShieldCheck, LockKeyhole } from "lucide-react";

import "../../styles/Auth.css";

// ==========================================
// READ EMAIL VERIFICATION TOKEN
// ==========================================

function readToken() {
  return new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
}

// ==========================================
// VERIFY EMAIL
// ==========================================

export default function VerifyEmail() {
  const [token] = useState(readToken);

  const [password, setPassword] = useState("");

  const [confirm, setConfirm] = useState("");

  const [busy, setBusy] = useState(false);

  const [done, setDone] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname,
    );
  }, []);

  // ========================================
  // VERIFY ACCOUNT
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Verification link missing.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Use a password of at least 8 characters.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Email verification failed.");
      }

      setDone(true);

      setPassword("");
      setConfirm("");
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
          FIXHUB EMAIL VERIFICATION
        </span>

        <div className="fxa-card-head">
          <h2>{done ? "Email Verified!" : "Verify Your Email"}</h2>

          <p>Activate your FIXHUB account by choosing your final password.</p>
        </div>

        {done ? (
          <>
            <p className="fxa-success" role="status">
              Email verified successfully. You can now login to your account.
            </p>

            <Link to="/login" className="fxa-submit">
              Continue to Login
              <ArrowRight size={18} />
            </Link>
          </>
        ) : (
          <form className="fxa-form" onSubmit={handleSubmit}>
            {!token && (
              <p className="fxa-error">Verification link missing or invalid.</p>
            )}

            <label className="fxa-field">
              <span>Choose Account Password *</span>

              <div className="fxa-input">
                <LockKeyhole size={18} />

                <input
                  type="password"
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="fxa-field">
              <span>Confirm Password *</span>

              <div className="fxa-input">
                <LockKeyhole size={18} />

                <input
                  type="password"
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  required
                />
              </div>
            </label>

            {error && (
              <p className="fxa-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="fxa-submit"
              disabled={!token || busy}
            >
              {busy ? "Activating..." : "Verify & Activate Account"}

              <ArrowRight size={18} />
            </button>
          </form>
        )}

        <p className="fxa-bottom-note">
          <Link to="/resend-verification">Get a New Verification Link</Link>
        </p>
      </section>
    </div>
  );
}
