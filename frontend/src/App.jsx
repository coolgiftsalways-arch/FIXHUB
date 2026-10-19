import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";

// =====================================================
// PUBLIC WEBSITE COMPONENTS
// =====================================================

import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";

// =====================================================
// WEBSITE ROUTES
// =====================================================

import AppRoutes from "./routes/AppRoutes.jsx";

// =====================================================
// AUTHENTICATION
// =====================================================

import { AuthProvider } from "./context/AuthProvider.jsx";

// =====================================================
// SMOOTH SCROLL
// =====================================================

import useSmoothScroll from "./hooks/useSmoothScroll.js";

// =====================================================
// FIXHUB ADMIN SIDEBAR
// =====================================================

import AdminSidebar from "./pages/admin/AdminSidebar.jsx";

// =====================================================
// GLOBAL CSS
// =====================================================

import "./styles/global.css";

// =====================================================
// ADMIN PAGE INFORMATION
// =====================================================

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
    description: "Manage customer memberships and subscription plans.",
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

// =====================================================
// PUBLIC WEBSITE LAYOUT
// =====================================================

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

// =====================================================
// ADMIN PAGE
// TEMPORARY UNTIL WE BUILD EACH COMPONENT
// =====================================================

function AdminPage() {
  const { section } = useParams();

  const page = adminPages[section];

  if (!page) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div
      style={{
        maxWidth: "1400px",
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* PAGE HEADER */}

      <div
        style={{
          marginBottom: "28px",
        }}
      >
        <span
          style={{
            color: "var(--fh-admin-blue, #008cff)",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "2px",
          }}
        >
          FIXHUB ADMIN PANEL
        </span>

        <h1
          style={{
            color: "var(--fh-admin-text)",
            fontSize: "clamp(28px, 5vw, 38px)",
            margin: "14px 0 10px",
            fontWeight: "800",
          }}
        >
          {page.title}
        </h1>

        <p
          style={{
            color: "var(--fh-admin-muted)",
            fontSize: "14px",
            lineHeight: "1.7",
          }}
        >
          {page.description}
        </p>
      </div>

      {/* PAGE CONTENT */}

      <section
        style={{
          padding: "30px",
          background: "var(--fh-admin-sidebar-bg)",
          border: "1px solid var(--fh-admin-border)",
          borderRadius: "18px",
        }}
      >
        <div
          style={{
            width: "45px",
            height: "4px",
            background: "#008cff",
            borderRadius: "10px",
            marginBottom: "25px",
          }}
        />

        <h2
          style={{
            color: "var(--fh-admin-text)",
            fontSize: "23px",
            marginBottom: "12px",
          }}
        >
          {page.title}
        </h2>

        <p
          style={{
            color: "var(--fh-admin-muted)",
            lineHeight: "1.8",
            fontSize: "14px",
          }}
        >
          This section is ready. We will build the complete{" "}
          {page.title.toLowerCase()} page next.
        </p>
      </section>
    </div>
  );
}

// =====================================================
// ADMIN ROUTES
// =====================================================

function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      <Route path="/admin/:section" element={<AdminPage />} />

      <Route
        path="/admin/*"
        element={<Navigate to="/admin/dashboard" replace />}
      />
    </Routes>
  );
}

// =====================================================
// FIXHUB ADMIN LAYOUT
// =====================================================

function AdminLayout() {
  return (
    <div className="fh-admin-shell">
      {/* ADMIN SIDEBAR */}

      <AdminSidebar adminName="Admin" notificationCount={0} />

      {/* ADMIN CONTENT */}

      <main className="fh-admin-main">
        <AdminRoutes />
      </main>
    </div>
  );
}

// =====================================================
// APPLICATION LAYOUT
// =====================================================

function AppLayout() {
  const location = useLocation();

  const pathname = location.pathname.toLowerCase();

  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminPage) {
    return <AdminLayout />;
  }

  return <PublicLayout />;
}

// =====================================================
// MAIN APPLICATION
// =====================================================

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
