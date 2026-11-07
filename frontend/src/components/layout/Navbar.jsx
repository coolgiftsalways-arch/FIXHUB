import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { LogIn, LogOut, Menu, UserRound, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";

import "../../styles/Navbar.css";
import "../../styles/NavbarAuth.css";
import "../../styles/NavbarMembership.css";

// ==========================================
// NAVIGATION LINKS
// ==========================================

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Membership", path: "/membership" },
  { name: "How It Works", path: "/how-it-works" },
  { name: "Contact", path: "/contact" },
];

// ==========================================
// CHECK ACTIVE MEMBERSHIP
// ==========================================

function hasActiveMembership(user) {
  if (!user) return false;

  // New FIXHUB Gold membership system.
  const membershipTier = String(user.membershipTier || "").toLowerCase();

  if (membershipTier === "gold" || user.isGoldMember === true) {
    return true;
  }

  // Backward compatibility with older membership data.
  const membership = user.membership;

  if (!membership) return false;

  const status = String(membership.status || "").toLowerCase();

  const validStatuses = ["active", "paid"];

  const endDate = membership.endDate
    ? new Date(membership.endDate).getTime()
    : null;

  return (
    validStatuses.includes(status) &&
    endDate !== null &&
    !Number.isNaN(endDate) &&
    endDate > Date.now()
  );
}

// ==========================================
// NAVBAR
// ==========================================

export default function Navbar() {
  const location = useLocation();

  return <NavbarContent key={location.key} />;
}

// ==========================================
// NAVBAR CONTENT
// ==========================================

function NavbarContent() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 25,
  );

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const { user, loading, logout } = useAuth();

  const navigate = useNavigate();

  // Check Gold membership.
  const isMember = hasActiveMembership(user);

  // ==========================================
  // SCROLL EFFECT
  // ==========================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ==========================================
  // ESCAPE KEY
  // ==========================================

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  // ==========================================
  // CLOSE MOBILE MENU
  // ==========================================

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // ==========================================
  // TOGGLE MOBILE MENU
  // ==========================================

  const toggleMenu = () => {
    setMenuOpen((previous) => !previous);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      await logout();

      closeMenu();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      setLogoutError(error.message || "Unable to logout.");
    } finally {
      setLoggingOut(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <header className={`fh-navbar ${scrolled ? "fh-navbar--scrolled" : ""}`}>
      <div className="fh-navbar__container">
        {/* LOGO */}

        <Link
          to="/"
          className="fh-navbar__logo"
          aria-label="FixHub Home"
          onClick={closeMenu}
        >
          <div className="fh-navbar__logo-symbol">
            <span className="fh-navbar__logo-line fh-navbar__logo-line--one" />
            <span className="fh-navbar__logo-line fh-navbar__logo-line--two" />
            <span className="fh-navbar__logo-line fh-navbar__logo-line--three" />
          </div>

          <div className="fh-navbar__logo-name">
            <span className="fh-navbar__logo-title">
              Fix<span>Hub</span>
            </span>

            <span className="fh-navbar__logo-subtitle">
              MOBILE CARE EXPERTS
            </span>
          </div>
        </Link>

        {/* NAVIGATION */}

        <nav
          id="fixhub-navigation"
          aria-label="Main navigation"
          className={`fh-navbar__nav ${menuOpen ? "fh-navbar__nav--open" : ""}`}
        >
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={closeMenu}
              className={({ isActive }) =>
                `fh-navbar__link ${isActive ? "fh-navbar__link--active" : ""}`
              }
            >
              <span>{item.name}</span>
            </NavLink>
          ))}

          {/* MOBILE PROFILE AND LOGOUT */}

          {user && (
            <>
              <NavLink
                to="/profile"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `fh-navbar__link fh-navbar__mobile-profile ${
                    isActive ? "fh-navbar__link--active" : ""
                  }`
                }
              >
                My Profile
                {isMember && (
                  <span className="fh-navbar__member-badge">PRO</span>
                )}
              </NavLink>

              <button
                type="button"
                className="fh-navbar__mobile-logout"
                disabled={loggingOut}
                onClick={handleLogout}
              >
                <LogOut size={18} />

                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          )}
        </nav>

        {/* RIGHT ACTIONS */}

        <div className="fh-navbar__actions">
          {loading ? (
            <span className="fh-navbar__auth-wait">Loading...</span>
          ) : user ? (
            <div className="fh-navbar__user-actions">
              {/* PROFILE BUTTON */}

              <Link
                to="/profile"
                className={`fh-navbar__book-btn fh-navbar__account-btn ${
                  isMember
                    ? "fh-navbar__account-btn--member"
                    : "fh-navbar__account-btn--nonmember"
                }`}
                onClick={closeMenu}
                title={isMember ? "Active Gold Membership" : "My Profile"}
                aria-label={
                  isMember
                    ? "Profile - Active Gold Membership"
                    : "Profile - No Active Membership"
                }
              >
                <UserRound size={19} />

                <span>{user.fullName?.split(" ")[0] || "Profile"}</span>

                {isMember && (
                  <span className="fh-navbar__member-badge">PRO</span>
                )}
              </Link>

              {/* LOGOUT BUTTON */}

              <button
                type="button"
                className="fh-navbar__logout-btn"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut size={18} />

                <span>{loggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="fh-navbar__book-btn"
              onClick={closeMenu}
            >
              <LogIn size={19} />

              <span>Login</span>
            </Link>
          )}

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            className={`fh-navbar__menu-btn ${
              menuOpen ? "fh-navbar__menu-btn--active" : ""
            }`}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-controls="fixhub-navigation"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            {menuOpen ? (
              <X size={25} strokeWidth={1.8} />
            ) : (
              <Menu size={25} strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>

      {/* LOGOUT ERROR */}

      {logoutError && (
        <div className="fh-navbar__auth-error" role="alert">
          {logoutError}
        </div>
      )}
    </header>
  );
}
