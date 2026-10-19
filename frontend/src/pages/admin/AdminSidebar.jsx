import { useEffect, useState } from "react";

import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  CalendarDays,
  UsersRound,
  Wrench,
  Crown,
  UserRound,
  BarChart3,
  Tag,
  Star,
  Bell,
  Settings,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import "../Admincss/AdminSidebar.css";

// =====================================================
// FIXHUB ADMIN NAVIGATION
// =====================================================

const menuItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Bookings",
    path: "/admin/bookings",
    icon: CalendarDays,
  },
  {
    name: "Customers",
    path: "/admin/customers",
    icon: UsersRound,
  },
  {
    name: "Services",
    path: "/admin/services",
    icon: Wrench,
  },
  {
    name: "Memberships",
    path: "/admin/memberships",
    icon: Crown,
  },
  {
    name: "Technicians",
    path: "/admin/technicians",
    icon: UserRound,
  },
  {
    name: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Offers & Coupons",
    path: "/admin/offers",
    icon: Tag,
  },
  {
    name: "Reviews",
    path: "/admin/reviews",
    icon: Star,
  },
  {
    name: "Notifications",
    path: "/admin/notifications",
    icon: Bell,
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

// =====================================================
// GET SAVED THEME
// =====================================================

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem("fixhub-admin-theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }
  } catch {
    // Browser storage may be unavailable.
  }

  return "dark";
}

// =====================================================
// FIXHUB LOGO
// =====================================================

function FixHubLogo() {
  return (
    <div className="fh-admin-brand">
      <div className="fh-admin-brand-icon">
        <span />
        <span />
        <span />
      </div>

      <div className="fh-admin-brand-text">
        <h2>
          Fix<span>Hub</span>
        </h2>

        <p>MOBILE REPAIR SERVICE</p>
      </div>
    </div>
  );
}

// =====================================================
// ADMIN SIDEBAR
// =====================================================

export default function AdminSidebar({
  adminName = "Admin",
  adminEmail = "",
  notificationCount = 0,
  onLogout,
}) {
  // ===================================================
  // STATES
  // ===================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [theme, setTheme] = useState(getInitialTheme);

  const [loggingOut, setLoggingOut] = useState(false);

  const isDark = theme === "dark";

  const initials = adminName?.trim()?.charAt(0)?.toUpperCase() || "A";

  // ===================================================
  // APPLY THEME
  // ===================================================

  useEffect(() => {
    document.documentElement.setAttribute("data-fixhub-admin-theme", theme);

    try {
      localStorage.setItem("fixhub-admin-theme", theme);
    } catch {
      // Continue without storage.
    }
  }, [theme]);

  // ===================================================
  // PREVENT BACKGROUND SCROLL
  // ===================================================

  useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  // ===================================================
  // CLOSE SIDEBAR WITH ESCAPE KEY
  // ===================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ===================================================
  // MOBILE SIDEBAR
  // ===================================================

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // ===================================================
  // CHANGE THEME
  // ===================================================

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = async () => {
    if (loggingOut || !onLogout) return;

    setLoggingOut(true);

    try {
      await onLogout();

      closeSidebar();
    } catch (error) {
      console.error("FixHub admin logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  // ===================================================
  // JSX
  // ===================================================

  return (
    <>
      {/* =============================================
          MOBILE TOP HEADER
      ============================================= */}

      <header className="fh-admin-mobile-header">
        <button
          type="button"
          className="fh-admin-mobile-menu-btn"
          onClick={openSidebar}
          aria-label="Open admin menu"
          aria-controls="fixhub-admin-sidebar"
          aria-expanded={sidebarOpen}
        >
          <Menu size={24} />
        </button>

        <FixHubLogo />

        <div className="fh-admin-mobile-header-right">
          <button
            type="button"
            className="fh-admin-theme-icon-btn"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="fh-admin-mobile-avatar">{initials}</div>
        </div>
      </header>

      {/* =============================================
          MOBILE OVERLAY
      ============================================= */}

      {sidebarOpen && (
        <button
          type="button"
          className="fh-admin-sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}

      {/* =============================================
          MAIN SIDEBAR
      ============================================= */}

      <aside
        id="fixhub-admin-sidebar"
        className={`fh-admin-sidebar ${
          sidebarOpen ? "fh-admin-sidebar-open" : ""
        }`}
        aria-label="FixHub admin navigation"
      >
        {/* ===========================================
            SIDEBAR HEADER
        =========================================== */}

        <div className="fh-admin-sidebar-header">
          <FixHubLogo />

          <button
            type="button"
            className="fh-admin-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close admin menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* ===========================================
            ADMIN PROFILE
        =========================================== */}

        <div className="fh-admin-profile">
          <div className="fh-admin-profile-avatar">{initials}</div>

          <div className="fh-admin-profile-info">
            <h3>{adminName}</h3>

            <p>{adminEmail || "Administrator"}</p>
          </div>

          <ShieldCheck size={17} className="fh-admin-profile-verified" />
        </div>

        {/* ===========================================
            MENU LABEL
        =========================================== */}

        <div className="fh-admin-menu-heading">MAIN MENU</div>

        {/* ===========================================
            NAVIGATION
        =========================================== */}

        <nav className="fh-admin-nav" aria-label="Admin pages">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `fh-admin-nav-item ${
                    isActive ? "fh-admin-nav-item-active" : ""
                  }`
                }
              >
                <span className="fh-admin-nav-item-icon">
                  <Icon size={19} strokeWidth={1.9} />
                </span>

                <span className="fh-admin-nav-item-label">{item.name}</span>

                {item.name === "Notifications" && notificationCount > 0 && (
                  <span className="fh-admin-notification-badge">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}

                <ChevronRight size={16} className="fh-admin-nav-arrow" />
              </NavLink>
            );
          })}
        </nav>

        {/* ===========================================
            SIDEBAR FOOTER
        =========================================== */}

        <div className="fh-admin-sidebar-footer">
          {/* THEME SWITCH */}

          <div className="fh-admin-theme-card">
            <div className="fh-admin-theme-info">
              <div className="fh-admin-theme-icon">
                {isDark ? <Moon size={19} /> : <Sun size={19} />}
              </div>

              <div className="fh-admin-theme-text">
                <h4>{isDark ? "Dark Mode" : "Light Mode"}</h4>

                <p>{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              aria-label="Dark mode"
              className={`fh-admin-theme-switch ${
                isDark ? "fh-admin-theme-switch-active" : ""
              }`}
              onClick={toggleTheme}
            >
              <span className="fh-admin-theme-switch-circle" />
            </button>
          </div>

          {/* LOGOUT */}

          <button
            type="button"
            className="fh-admin-logout-btn"
            onClick={handleLogout}
            disabled={loggingOut || !onLogout}
            title={!onLogout ? "Connect your admin logout handler" : "Logout"}
          >
            <LogOut size={19} />

            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>

          {/* COPYRIGHT */}

          <div className="fh-admin-sidebar-bottom">
            <p>© 2026 FixHub</p>

            <span>Admin Panel</span>
          </div>
        </div>
      </aside>
    </>
  );
}
