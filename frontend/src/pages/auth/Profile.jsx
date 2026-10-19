import { useEffect, useState } from "react";

import { Link, Navigate, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";

import "../../styles/Auth.css";

// =====================================================
// CUSTOMER PROFILE
// =====================================================

export default function Profile() {
  const { user, loading, updateProfile, logout } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const [busy, setBusy] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ===================================================
  // LOAD CUSTOMER DETAILS
  // ===================================================

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
      });
    }
  }, [user]);

  // ===================================================
  // AUTH CHECK
  // ===================================================

  if (loading) {
    return <div className="fxa-page fxa-loading">Loading your account...</div>;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: "/profile",
        }}
        replace
      />
    );
  }

  // ===================================================
  // SAVE PROFILE
  // ===================================================

  const save = async (event) => {
    event.preventDefault();

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await updateProfile(form);

      setMessage("Your profile has been updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const signOut = async () => {
    setBusy(true);
    setError("");

    try {
      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="fxa-page fxa-profile-page">
      <div className="fxa-profile-container">
        {/* PROFILE HEADER */}

        <header className="fxa-profile-header">
          <div>
            <span className="fxa-eyebrow">
              <ShieldCheck size={16} />
              FIXHUB CUSTOMER
            </span>

            <h1>
              Hello, <span>{user.fullName.split(" ")[0]}</span> 👋
            </h1>

            <p>Your customer profile and doorstep repair address.</p>
          </div>

          <button
            type="button"
            className="fxa-logout"
            disabled={busy}
            onClick={signOut}
          >
            <LogOut size={18} />
            Logout
          </button>
        </header>

        {/* PROFILE CONTENT */}

        <div className="fxa-profile-layout">
          {/* CUSTOMER DETAILS */}

          <section className="fxa-profile-card">
            <h2>
              <UserRound size={21} />
              Your Details
            </h2>

            <form className="fxa-form" onSubmit={save}>
              {/* FULL NAME */}

              <label className="fxa-field">
                <span>Full Name</span>

                <div className="fxa-input">
                  <UserRound size={18} />

                  <input
                    minLength={2}
                    maxLength={100}
                    required
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fullName: e.target.value,
                      })
                    }
                  />
                </div>
              </label>

              {/* EMAIL */}

              <label className="fxa-field">
                <span>Email (cannot be changed here)</span>

                <div className="fxa-input">
                  <Mail size={18} />

                  <input value={user.email} disabled />
                </div>
              </label>

              {/* PHONE */}

              <label className="fxa-field">
                <span>Mobile Number</span>

                <div className="fxa-input">
                  <Phone size={18} />

                  <input
                    required
                    pattern="[6-9][0-9]{9}"
                    title="Enter a valid 10-digit Indian mobile number"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
              </label>

              {/* ADDRESS */}

              <label className="fxa-field">
                <span>Home / Pickup Address</span>

                <div className="fxa-input fxa-textarea">
                  <MapPin size={18} />

                  <textarea
                    minLength={10}
                    maxLength={300}
                    rows={4}
                    required
                    value={form.address}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </label>

              {/* MESSAGES */}

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

              {/* SAVE BUTTON */}

              <button className="fxa-submit" disabled={busy} type="submit">
                <Save size={18} />

                {busy ? "Please wait..." : "Save Details"}
              </button>
            </form>
          </section>

          {/* REPAIR CARD */}

          <aside className="fxa-profile-card fxa-profile-side">
            <span className="fxa-eyebrow">READY FOR A REPAIR?</span>

            <h2>Doorstep mobile care, made simple.</h2>

            <p>
              Choose your phone and issue, then use your saved contact details
              when booking.
            </p>

            <Link className="fxa-submit fxa-link-submit" to="/book-repair">
              Book a Repair
              <ArrowRight size={18} />
            </Link>

            <p className="fxa-side-note">
              Your account stays signed in after closing the browser. You can
              log out from this page or the navbar.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
