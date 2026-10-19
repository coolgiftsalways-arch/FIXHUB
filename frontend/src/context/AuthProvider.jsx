import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "./authStore.js";

// =====================================================
// FIXHUB AUTHENTICATION API HELPER
// =====================================================

async function authRequest(path, { method = "GET", body, signal } = {}) {
  let response;

  // ===================================================
  // API REQUEST
  // ===================================================

  try {
    response = await fetch(`/api/auth${path}`, {
      method,

      credentials: "include",

      signal,

      headers: body
        ? {
            "Content-Type": "application/json",
          }
        : undefined,

      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    // Preserve aborted request errors

    if (error?.name === "AbortError") {
      throw error;
    }

    // FIX: preserve-caught-error

    throw new Error("Cannot reach the FixHub authentication server.", {
      cause: error,
    });
  }

  // ===================================================
  // PARSE SERVER RESPONSE
  // ===================================================

  let result;

  try {
    result = await response.json();
  } catch (error) {
    // FIX: preserve-caught-error

    throw new Error("The authentication server returned an invalid response.", {
      cause: error,
    });
  }

  // ===================================================
  // HANDLE SERVER ERRORS
  // ===================================================

  if (!response.ok) {
    const error = new Error(
      result?.message || "Something went wrong. Please try again.",
    );

    error.status = response.status;

    throw error;
  }

  return result;
}

// =====================================================
// FIXHUB AUTHENTICATION PROVIDER
// =====================================================

export function AuthProvider({ children }) {
  // ===================================================
  // AUTHENTICATION STATES
  // ===================================================

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // ===================================================
  // RESTORE CUSTOMER LOGIN SESSION
  //
  // Runs when the website opens.
  // The server validates the session cookie.
  // ===================================================

  useEffect(() => {
    const controller = new AbortController();

    // Avoid synchronous setState in useEffect

    authRequest("/me", {
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) {
          setUser(result.user || null);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    // Cancel request if component unmounts

    return () => {
      controller.abort();
    };
  }, []);

  // ===================================================
  // REFRESH CUSTOMER SESSION
  // ===================================================

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const result = await authRequest("/me");

      setUser(result.user || null);

      return result.user || null;
    } catch {
      setUser(null);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===================================================
  // CUSTOMER REGISTRATION
  // ===================================================

  const register = useCallback(async (details) => {
    const result = await authRequest("/register", {
      method: "POST",

      body: details,
    });

    setUser(result.user);

    return result.user;
  }, []);

  // ===================================================
  // CUSTOMER LOGIN
  // ===================================================

  const login = useCallback(async (credentials) => {
    const result = await authRequest("/login", {
      method: "POST",

      body: credentials,
    });

    setUser(result.user);

    return result.user;
  }, []);

  // ===================================================
  // UPDATE CUSTOMER PROFILE
  // ===================================================

  const updateProfile = useCallback(async (details) => {
    const result = await authRequest("/me", {
      method: "PATCH",

      body: details,
    });

    setUser(result.user);

    return result.user;
  }, []);

  // ===================================================
  // CUSTOMER LOGOUT
  // ===================================================

  const logout = useCallback(async () => {
    try {
      await authRequest("/logout", {
        method: "POST",
      });

      setUser(null);
    } catch (error) {
      // Session already expired

      if (error.status === 401) {
        setUser(null);

        return;
      }

      throw error;
    }
  }, []);

  // ===================================================
  // AUTHENTICATION STATUS
  // ===================================================

  const isAuthenticated = Boolean(user);

  // ===================================================
  // AUTH CONTEXT VALUES
  // ===================================================

  const value = useMemo(
    () => ({
      // Customer information

      user,

      // Loading state

      loading,

      // Authentication status

      isAuthenticated,

      // Authentication methods

      register,

      login,

      logout,

      // Profile methods

      updateProfile,

      // Session methods

      refresh,
    }),
    [
      user,
      loading,
      isAuthenticated,
      register,
      login,
      logout,
      updateProfile,
      refresh,
    ],
  );

  // ===================================================
  // AUTH PROVIDER
  // ===================================================

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
