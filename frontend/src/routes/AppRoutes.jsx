import { Routes, Route } from "react-router-dom";

// ==========================================
// PUBLIC PAGES
// ==========================================

import Home from "../pages/Home.jsx";

import Services from "../pages/Services.jsx";

import Brands from "../pages/Brands.jsx";

import Membership from "../pages/Membership.jsx";

import BookRepair from "../pages/BookRepair.jsx";

import TrackRepair from "../pages/TrackRepair.jsx";

import HowItWorks from "../pages/HowItWorks.jsx";

import Contact from "../pages/Contact.jsx";

import NotFound from "../pages/NotFound.jsx";

// ==========================================
// CUSTOMER AUTHENTICATION
// ==========================================

import Login from "../pages/auth/Login.jsx";

import Profile from "../pages/auth/Profile.jsx";

// ==========================================
// APPLICATION ROUTES
// ==========================================

export default function AppRoutes() {
  return (
    <Routes>
      {/* ==================================
          HOME
      ================================== */}

      <Route path="/" element={<Home />} />

      {/* ==================================
          SERVICES
      ================================== */}

      <Route path="/services" element={<Services />} />

      {/* ==================================
          BRANDS
      ================================== */}

      <Route path="/brands" element={<Brands />} />

      {/* ==================================
          MEMBERSHIP
      ================================== */}

      <Route path="/membership" element={<Membership />} />

      {/* ==================================
          BOOK REPAIR
      ================================== */}

      <Route path="/book-repair" element={<BookRepair />} />

      {/* ==================================
          TRACK REPAIR
      ================================== */}

      <Route path="/track-repair" element={<TrackRepair />} />

      {/* ==================================
          HOW IT WORKS
      ================================== */}

      <Route path="/how-it-works" element={<HowItWorks />} />

      {/* ==================================
          CONTACT
      ================================== */}

      <Route path="/contact" element={<Contact />} />

      {/* ==================================
          CUSTOMER LOGIN
      ================================== */}

      <Route path="/login" element={<Login />} />

      {/* ==================================
          CUSTOMER PROFILE
      ================================== */}

      <Route path="/profile" element={<Profile />} />

      {/* ==================================
          404 NOT FOUND
      ================================== */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
