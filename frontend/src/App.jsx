
import { useCallback, useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";

// ==========================================
// WEBSITE COMPONENTS
// ==========================================

import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";

import AppRoutes from "./routes/AppRoutes.jsx";

import { AuthProvider } from "./context/AuthProvider.jsx";

import useSmoothScroll from "./hooks/useSmoothScroll.js";

import AdminSidebar from "./pages/admin/AdminSidebar.jsx";
import AdminCustomersPage from "./pages/admin/AdminCustomers.jsx";
import AdminMembershipRequests from "./pages/admin/AdminMembershipRequests.jsx";
import AdminRepairBookings from "./pages/admin/AdminRepairBookings.jsx";

import "./styles/global.css";

// ==========================================
// ADMIN PAGE INFORMATION
// ==========================================

const adminPages = {
  dashboard: {
    title: "Dashboard",
    description: "Welcome to the FixHub repair management dashboard.",
  },

  bookings: {
    title: "Repair Bookings",
    description: "Manage mobile repair bookings and appointments.",
  },

  customers: {
    title: "Customers",
    description: "Manage registered FixHub customers.",
  },

  services: {
    title: "Repair Services",
    description: "Manage mobile repair services.",
  },

  memberships: {
    title: "Memberships",
    description:
      "Review FIXHUB customer requests and phone-based fixing charges.",
  },

  technicians: {
    title: "Technicians",
    description: "Manage technicians and repair assignments.",
  },

  analytics: {
    title: "Analytics",
    description: "View booking trends and repair revenue.",
  },

  offers: {
    title: "Offers & Coupons",
    description: "Manage customer offers and discount coupons.",
  },

  reviews: {
    title: "Reviews",
    description: "Manage customer ratings and feedback.",
  },

  notifications: {
    title: "Notifications",
    description: "View booking and repair notifications.",
  },

  settings: {
    title: "Settings",
    description: "Manage FixHub admin settings.",
  },

  payments: {
    title: "Payments",
    description: "Manage repair payments and transactions.",
  },

  "service-areas": {
    title: "Service Areas",
    description: "Manage doorstep repair service locations.",
  },
};

// ==========================================
// ADMIN THEME
// ==========================================

const colors = {
  text: "var(--fh-admin-text, #12213b)",
  muted: "var(--fh-admin-muted, #74829b)",
  surface: "var(--fh-admin-sidebar-bg, #ffffff)",
  border: "var(--fh-admin-border, #e3eaf5)",
  blue: "#008cff",
};

// ==========================================
// ADMIN API HELPER
// ==========================================

async function adminRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
  });

  const result = await response.json().catch(() => ({
    message: "Invalid server response.",
  }));

  if (!response.ok) {
    const error = new Error(result.message || "Request failed.");

    error.status = response.status;

    throw error;
  }

  return result;
}

// ==========================================
// DATE FORMATTER
// ==========================================

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

// ==========================================
// ADMIN LOGIN
// ==========================================

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const result = await adminRequest("/api/admin-auth/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      onLogin(result.admin);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f6fd",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          padding: "42px 32px",
          borderRadius: 24,
          background: "#ffffff",
          boxShadow: "0 15px 60px rgba(0,30,80,.08)",
          border: "1px solid #e3eaf5",
        }}
      >
        <div
          style={{
            color: "#008cff",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          FIXHUB ADMIN
        </div>

        <h1
          style={{
            color: "#11213a",
            fontSize: 32,
            margin: "15px 0 10px",
          }}
        >
          Admin Login
        </h1>

        <p
          style={{
            color: "#71809a",
            marginBottom: 30,
          }}
        >
          Sign in to manage your FixHub dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontWeight: 700,
              marginBottom: 10,
              color: "#17243c",
            }}
          >
            Admin Email
          </label>

          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter admin email"
            style={{
              width: "100%",
              padding: 15,
              border: "1px solid #d7e2f0",
              borderRadius: 10,
              marginBottom: 20,
              background: "#f8fbff",
              color: "#17243c",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              fontWeight: 700,
              marginBottom: 10,
              color: "#17243c",
            }}
          >
            Password
          </label>

          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter admin password"
            style={{
              width: "100%",
              padding: 15,
              border: "1px solid #d7e2f0",
              borderRadius: 10,
              marginBottom: 20,
              background: "#f8fbff",
              color: "#17243c",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p
              role="alert"
              style={{
                color: "#dc3545",
                marginBottom: 15,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              width: "100%",
              border: 0,
              padding: 16,
              borderRadius: 12,
              background: "#008cff",
              color: "#ffffff",
              fontWeight: 800,
              cursor: busy ? "wait" : "pointer",
            }}
          >
            {busy ? "Signing in..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// ADMIN PAGE HEADER
// ==========================================

function AdminPageHeader({ title, description }) {
  return (
    <header style={{ marginBottom: 30 }}>
      <span
        style={{
          color: colors.blue,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 2,
        }}
      >
        FIXHUB ADMIN PANEL
      </span>

      <h1
        style={{
          color: colors.text,
          fontSize: "clamp(28px,5vw,38px)",
          fontWeight: 800,
          margin: "14px 0 10px",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          color: colors.muted,
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>
    </header>
  );
}

// ==========================================
// ADMIN CARD
// ==========================================

function AdminCard({ children, style = {} }) {
  return (
    <section
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 18,
        padding: 26,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

function AdminDashboard({ onSessionExpired }) {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const result = await adminRequest("/api/admin/summary");

        if (!active) return;

        setData(result);
        setError("");
      } catch (err) {
        if (!active) return;

        if (err.status === 401) {
          onSessionExpired();
          return;
        }

        setError(err.message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    const interval = setInterval(loadDashboard, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [refreshKey, onSessionExpired]);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Live overview of registered FixHub customers."
      />

      {error && (
        <p role="alert" style={{ color: "#ff5c70" }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
          marginBottom: 25,
        }}
      >
        <AdminCard>
          <p style={{ color: colors.muted }}>Total Customers</p>

          <h2
            style={{
              color: colors.blue,
              fontSize: 42,
              marginTop: 15,
            }}
          >
            {loading ? "..." : (data?.summary?.totalCustomers ?? 0)}
          </h2>
        </AdminCard>

        <AdminCard>
          <p style={{ color: colors.muted }}>New Customers Today</p>

          <h2
            style={{
              color: colors.blue,
              fontSize: 42,
              marginTop: 15,
            }}
          >
            {loading ? "..." : (data?.summary?.newCustomersToday ?? 0)}
          </h2>
        </AdminCard>
      </div>

      <AdminCard>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 15,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              color: colors.text,
              fontSize: 23,
            }}
          >
            Recent Registrations
          </h2>

          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            style={{
              background: colors.blue,
              color: "#fff",
              padding: "10px 16px",
              border: 0,
              borderRadius: 9,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p style={{ color: colors.muted }}>Loading customers...</p>
        ) : !data?.recentCustomers?.length ? (
          <p style={{ color: colors.muted }}>
            No customer registrations found.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr>
                  {["Customer", "Email", "Phone", "Registered"].map(
                    (heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: 13,
                          color: colors.muted,
                          borderBottom: `1px solid ${colors.border}`,
                        }}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {data.recentCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={cellStyle}>{customer.fullName}</td>

                    <td style={cellStyle}>{customer.email}</td>

                    <td style={cellStyle}>{customer.phone}</td>

                    <td style={cellStyle}>{formatDate(customer.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}

// ==========================================
// TABLE CELL STYLE
// ==========================================

const cellStyle = {
  padding: "16px 13px",
  borderBottom: `1px solid ${colors.border}`,
  color: colors.text,
  fontSize: 13,
  verticalAlign: "top",
};

// ==========================================
// EXISTING ADMIN PLACEHOLDER PAGES
// ==========================================

function AdminPage({ onSessionExpired }) {
  const { section } = useParams();

  const page = adminPages[section];

  if (!page) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (section === "dashboard") {
    return <AdminDashboard onSessionExpired={onSessionExpired} />;
  }

  if (section === "customers") {
    return <AdminCustomersPage onSessionExpired={onSessionExpired} />;
  }

  if (section === "bookings") {
    return <AdminRepairBookings onSessionExpired={onSessionExpired} />;
  }

  if (section === "memberships") {
    return <AdminMembershipRequests onSessionExpired={onSessionExpired} />;
  }

  return (
    <div>
      <AdminPageHeader title={page.title} description={page.description} />

      <AdminCard>
        <div
          style={{
            width: 45,
            height: 4,
            borderRadius: 10,
            background: colors.blue,
            marginBottom: 25,
          }}
        />

        <h2
          style={{
            color: colors.text,
            fontSize: 23,
            marginBottom: 12,
          }}
        >
          {page.title}
        </h2>

        <p
          style={{
            color: colors.muted,
            lineHeight: 1.8,
            fontSize: 14,
          }}
        >
          This section is ready. We will build the complete{" "}
          {page.title.toLowerCase()} page next.
        </p>
      </AdminCard>
    </div>
  );
}

// ==========================================
// ADMIN ROUTES
// ==========================================

function AdminRoutes({ onSessionExpired }) {
  return (
    <Routes>
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      <Route
        path="/admin/:section"
        element={<AdminPage onSessionExpired={onSessionExpired} />}
      />

      <Route
        path="/admin/*"
        element={<Navigate to="/admin/dashboard" replace />}
      />
    </Routes>
  );
}

// ==========================================
// ADMIN LAYOUT
// ==========================================

function AdminLayout({ admin, onLogout, onSessionExpired }) {
  return (
    <div className="fh-admin-shell">
      <AdminSidebar
        adminName="Admin"
        adminEmail={admin.email}
        notificationCount={0}
        onLogout={onLogout}
      />

      <main className="fh-admin-main">
        <AdminRoutes onSessionExpired={onSessionExpired} />
      </main>
    </div>
  );
}

// ==========================================
// SECURE ADMIN PORTAL
// ==========================================

function AdminPortal() {
  const [admin, setAdmin] = useState(null);

  const [checking, setChecking] = useState(true);

  // CHECK EXISTING ADMIN SESSION

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      try {
        const result = await adminRequest("/api/admin-auth/me");

        if (active) {
          setAdmin(result.admin);
        }
      } catch {
        if (active) {
          setAdmin(null);
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    checkAdmin();

    return () => {
      active = false;
    };
  }, []);

  // ADMIN SESSION EXPIRED

  const handleSessionExpired = useCallback(() => {
    setAdmin(null);
  }, []);

  // ADMIN LOGOUT

  const handleLogout = async () => {
    await adminRequest("/api/admin-auth/logout", {
      method: "POST",
    });

    setAdmin(null);
  };

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f1f6fd",
          color: "#17243c",
        }}
      >
        Checking admin session...
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin onLogin={setAdmin} />;
  }

  return (
    <AdminLayout
      admin={admin}
      onLogout={handleLogout}
      onSessionExpired={handleSessionExpired}
    />
  );
}

// ==========================================
// PUBLIC WEBSITE LAYOUT
// ==========================================

function PublicLayout() {
  const location = useLocation();

  useSmoothScroll();

  return (
    <>
      <Navbar />

      <main id="main-content" key={location.pathname}>
        <AppRoutes />
      </main>

      <Footer />
    </>
  );
}

// ==========================================
// APPLICATION LAYOUT
// ==========================================

function AppLayout() {
  const location = useLocation();

  const pathname = location.pathname.toLowerCase();

  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminPage) {
    return <AdminPortal />;
  }

  return <PublicLayout />;
}

// ==========================================
// MAIN APPLICATION
// ==========================================

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
