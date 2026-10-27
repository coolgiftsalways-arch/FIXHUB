import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

import "../../styles/Auth.css";

// ==========================================
// READ TOKEN FROM EMAIL LINK
// ==========================================

function readToken() {
  const hash = window.location.hash.slice(1);

  return new URLSearchParams(hash).get("token") || "";
}

// ==========================================
// RESET PASSWORD
// ==========================================

export default function ResetPassword() {
  const [token] = useState(readToken);

  const [password, setPassword] = useState("");

  const [confirm, setConfirm] = useState("");

  const [show, setShow] = useState(false);

  const [busy, setBusy] = useState(false);

  const [done, setDone] = useState(false);

  const [error, setError] = useState("");

  // ========================================
  // REMOVE TOKEN FROM ADDRESS BAR
  // ========================================

  useEffect(() => {
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname,
    );
  }, []);

  // ========================================
  // SUBMIT NEW PASSWORD
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Reset link missing.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
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
        throw new Error(result.message || "Unable to reset password.");
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
          FIXHUB CUSTOMER SECURITY
        </span>

        <div className="fxa-card-head">
          <h2>Reset Password</h2>

          <p>Choose a new password for your FIXHUB account.</p>
        </div>

        {done ? (
          <>
            <p className="fxa-success" role="status">
              Password changed successfully. Previous login sessions have been
              invalidated.
            </p>

            <Link to="/login" className="fxa-submit">
              Login with New Password
              <ArrowRight size={18} />
            </Link>
          </>
        ) : (
          <form className="fxa-form" onSubmit={handleSubmit}>
            {!token && (
              <p className="fxa-error">Reset link is missing or invalid.</p>
            )}

            <label className="fxa-field">
              <span>New Password *</span>

              <div className="fxa-input">
                <LockKeyhole size={18} />

                <input
                  type={show ? "text" : "password"}
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <button
                  type="button"
                  className="fxa-eye"
                  onClick={() => setShow((value) => !value)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="fxa-field">
              <span>Confirm New Password *</span>

              <div className="fxa-input">
                <LockKeyhole size={18} />

                <input
                  type={show ? "text" : "password"}
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
              {busy ? "Saving..." : "Set New Password"}

              <ArrowRight size={18} />
            </button>
          </form>
        )}

        <p className="fxa-bottom-note">
          <Link to="/forgot-password">Request New Reset Link</Link>
        </p>
      </section>
    </div>
  );
}
