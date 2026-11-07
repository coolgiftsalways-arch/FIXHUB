import { useState, useEffect, useCallback, useMemo } from "react";

import { AuthContext } from "./AuthContext.jsx";

// ==========================================
// FIXHUB AUTHENTICATION PROVIDER
// ==========================================

const API_BASE = "/api/auth";

// ==========================================
// API REQUEST HELPER
// ==========================================

async function authRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },

      cache: "no-store",
    });
  } catch {
    const error = new Error(
      "Unable to connect to the server. Please check your connection.",
    );

    error.status = 0;

    throw error;
  }

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.success === false) {
    const error = new Error(
      data.message || `Request failed with status ${response.status}`,
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

// ==========================================
// EXTRACT CUSTOMER FROM API RESPONSE
// ==========================================

function extractUser(data) {
  return data?.user || data?.customer || data?.profile || null;
}

// ==========================================
// AUTH PROVIDER
// ==========================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ========================================
  // REFRESH CURRENT CUSTOMER
  // ========================================

  const refresh = useCallback(async () => {
    try {
      const data = await authRequest("/me");

      const currentUser = extractUser(data);

      if (!currentUser) {
        throw new Error("Unable to retrieve customer information.");
      }

      setUser(currentUser);

      setError("");

      return currentUser;
    } catch (err) {
      // Clear the user only when the backend
      // confirms that the session is unauthorized.

      if (err.status === 401) {
        setUser(null);
      }

      // Network errors and server errors should
      // not automatically log the customer out.

      setError(err.message);

      throw err;
    }
  }, []);

  // ========================================
  // RESTORE SESSION ON PAGE LOAD
  // ========================================

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const data = await authRequest("/me");

        if (!active) return;

        const currentUser = extractUser(data);

        setUser(currentUser);

        setError("");
      } catch (err) {
        if (!active) return;

        if (err.status === 401) {
          setUser(null);
        }

        setError(err.message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  // ========================================
  // LOGIN
  // ========================================

  const login = useCallback(async (credentials) => {
    setLoading(true);

    setError("");

    try {
      const data = await authRequest("/login", {
        method: "POST",

        body: JSON.stringify(credentials),
      });

      let currentUser = extractUser(data);

      if (!currentUser) {
        const profileData = await authRequest("/me");

        currentUser = extractUser(profileData);
      }

      setUser(currentUser);

      return data;
    } catch (err) {
      setError(err.message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================
  // REGISTER
  // ========================================

  const register = useCallback(async (formData) => {
    setLoading(true);

    setError("");

    try {
      const data = await authRequest("/register", {
        method: "POST",

        body: JSON.stringify(formData),
      });

      const currentUser = extractUser(data);

      if (currentUser) {
        setUser(currentUser);
      }

      return data;
    } catch (err) {
      setError(err.message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================
  // UPDATE CUSTOMER PROFILE
  // ========================================

  const updateProfile = useCallback(
    async (profileData) => {
      setError("");

      try {
        // Correct backend endpoint:
        // PATCH /api/auth/me

        const data = await authRequest("/me", {
          method: "PATCH",

          body: JSON.stringify(profileData),
        });

        const updatedUser = extractUser(data);

        if (updatedUser) {
          setUser(updatedUser);
        } else {
          await refresh();
        }

        return data;
      } catch (err) {
        setError(err.message);

        throw err;
      }
    },
    [refresh],
  );

  // ========================================
  // LOGOUT
  // ========================================

  const logout = useCallback(async () => {
    setError("");

    try {
      await authRequest("/logout", {
        method: "POST",
      });

      setUser(null);

      return true;
    } catch (err) {
      setError(err.message);

      throw err;
    }
  }, []);

  // ========================================
  // MEMBERSHIP INFORMATION
  // ========================================

  const isGoldMember =
    user?.membershipTier === "gold" || user?.isGoldMember === true;

  const membershipTier = isGoldMember ? "gold" : user ? "free" : "none";

  const isAuthenticated = Boolean(user);

  // ========================================
  // CLEAR ERROR
  // ========================================

  const clearError = useCallback(() => {
    setError("");
  }, []);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value = useMemo(
    () => ({
      // Customer
      user,
      setUser,

      // Authentication
      loading,
      error,
      isAuthenticated,

      // Actions
      login,
      register,
      logout,
      updateProfile,

      // Refresh profile
      refresh,
      refreshUser: refresh,

      // Membership
      isGoldMember,
      membershipTier,

      // Helpers
      clearError,
    }),
    [
      user,
      loading,
      error,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
      refresh,
      isGoldMember,
      membershipTier,
      clearError,
    ],
  );

  // ========================================
  // PROVIDER
  // ========================================

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
