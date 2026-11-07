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

      // IMPORTANT: Send and receive HTTP-only cookies.
      credentials: "include",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },

      cache: "no-store",
    });
  } catch (error) {
    const networkError = new Error(
      "Unable to connect to FIXHUB server. Please check your internet connection.",
    );

    networkError.status = 0;
    networkError.originalError = error;

    throw networkError;
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
// EXTRACT CUSTOMER
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
  // REFRESH CUSTOMER SESSION
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
      if (err.status === 401) {
        setUser(null);
      }

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
        console.log("[FIXHUB AUTH] Restoring customer session...");

        const data = await authRequest("/me");

        if (!active) return;

        const currentUser = extractUser(data);

        if (!currentUser) {
          setUser(null);
          return;
        }

        setUser(currentUser);
        setError("");

        console.log("[FIXHUB AUTH] Customer session restored.");
      } catch (err) {
        if (!active) return;

        if (err.status === 401) {
          setUser(null);

          console.log("[FIXHUB AUTH] No active customer session.");
        } else {
          console.error(
            "[FIXHUB AUTH] Session restoration failed:",
            err.message,
          );

          setError(err.message);
        }
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
      console.log("[FIXHUB AUTH] Login started.");

      // Step 1: Authenticate customer.
      const loginData = await authRequest("/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      console.log("[FIXHUB AUTH] Login API successful.");

      // Step 2: Verify that the browser retained
      // the HTTP-only session cookie.
      let currentUser = null;

      try {
        const sessionData = await authRequest("/me");

        currentUser = extractUser(sessionData);

        if (!currentUser) {
          throw new Error("Customer session could not be verified.");
        }

        console.log("[FIXHUB AUTH] Customer session verified.");
      } catch (sessionError) {
        console.error(
          "[FIXHUB AUTH] Session verification failed:",
          sessionError.message,
        );

        if (sessionError.status === 401) {
          throw new Error(
            "Login was successful, but your browser did not retain the login session. Please check your browser cookie settings and try again.",
          );
        }

        throw sessionError;
      }

      // Step 3: Save verified customer.
      setUser(currentUser);
      setError("");

      return {
        ...loginData,
        user: currentUser,
      };
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

      setError("");

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
        if (err.status === 401) {
          setUser(null);
        }

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

      console.log("[FIXHUB AUTH] Customer logged out.");

      return true;
    } catch (err) {
      // If the backend confirms that the session
      // is already unauthorized, clear local state.
      if (err.status === 401) {
        setUser(null);
      }

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

      // Profile
      updateProfile,

      // Refresh
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

// ==========================================
// DEFAULT EXPORT
// ==========================================

export default AuthProvider;
