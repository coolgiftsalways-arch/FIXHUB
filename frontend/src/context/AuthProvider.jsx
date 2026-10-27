import { useCallback, useEffect, useMemo, useState } from "react";

// ==========================================
// FIXHUB AUTHENTICATION CONTEXT
// ==========================================

import { AuthContext } from "./authStore.js";

// ==========================================
// FIXHUB API REQUEST HELPER
// ==========================================

async function authRequest(path, { method = "GET", body, signal } = {}) {
  let response;

  try {
    response = await fetch(`/api/auth${path}`, {
      method,

      credentials: "include",

      signal,

      headers:
        body === undefined
          ? undefined
          : {
              "Content-Type": "application/json",
            },

      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    throw new Error("Unable to connect to FIXHUB server. Please try again.");
  }

  // ========================================
  // READ SERVER RESPONSE
  // ========================================

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("FIXHUB server returned an invalid response.");
  }

  // ========================================
  // HANDLE API ERRORS
  // ========================================

  if (!response.ok) {
    const error = new Error(
      result?.message || "Something went wrong. Please try again.",
    );

    error.status = response.status;

    throw error;
  }

  return result;
}

// ==========================================
// FIXHUB AUTH PROVIDER
// ==========================================

export function AuthProvider({ children }) {
  // ========================================
  // CUSTOMER STATE
  // ========================================

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // ========================================
  // RESTORE SAVED LOGIN SESSION
  // ========================================

  // Customer remains logged in after
  // closing and reopening the website,
  // while their session is valid.

  useEffect(() => {
    const controller = new AbortController();

    async function restoreSession() {
      try {
        const result = await authRequest("/me", {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setUser(result.user || null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setUser(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      controller.abort();
    };
  }, []);

  // ========================================
  // REFRESH CUSTOMER SESSION
  // ========================================

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const result = await authRequest("/me");

      const customer = result.user || null;

      setUser(customer);

      return customer;
    } catch (error) {
      setUser(null);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================
  // CUSTOMER REGISTRATION
  // ========================================

  // POST /api/auth/register
  //
  // New accounts receive an email
  // verification link before login.

  const register = useCallback(async (details) => {
    const result = await authRequest("/register", {
      method: "POST",

      body: {
        fullName: details.fullName,
        email: details.email,
        phone: details.phone,
        address: details.address,
        password: details.password,
      },
    });

    // ======================================
    // EMAIL VERIFICATION REQUIRED
    // ======================================

    if (result.requiresVerification) {
      // Do not log in unverified accounts.

      setUser(null);

      return result;
    }

    // ======================================
    // LEGACY CUSTOMER REGISTRATION
    // ======================================

    // Preserve compatibility with any
    // existing backend registration flow.

    if (result.user) {
      setUser(result.user);
    }

    return result;
  }, []);

  // ========================================
  // CUSTOMER LOGIN
  // ========================================

  // POST /api/auth/login

  const login = useCallback(async (credentials) => {
    const result = await authRequest("/login", {
      method: "POST",

      body: {
        identifier: credentials.identifier,
        password: credentials.password,
      },
    });

    // ======================================
    // SAVE LOGGED-IN CUSTOMER
    // ======================================

    if (!result.user) {
      throw new Error("Login succeeded but customer details are missing.");
    }

    setUser(result.user);

    return result.user;
  }, []);

  // ========================================
  // UPDATE CUSTOMER PROFILE
  // ========================================

  // PATCH /api/auth/me

  const updateProfile = useCallback(async (details) => {
    const result = await authRequest("/me", {
      method: "PATCH",

      body: {
        fullName: details.fullName,
        phone: details.phone,
        address: details.address,
      },
    });

    // ====================================
    // UPDATE CUSTOMER DATA
    // ====================================

    if (result.user) {
      setUser(result.user);
    }

    return result.user;
  }, []);

  // ========================================
  // CUSTOMER LOGOUT
  // ========================================

  // POST /api/auth/logout

  const logout = useCallback(async () => {
    try {
      await authRequest("/logout", {
        method: "POST",
      });

      // ====================================
      // CLEAR CUSTOMER SESSION
      // ====================================

      setUser(null);

      return true;
    } catch (error) {
      // ====================================
      // SESSION ALREADY EXPIRED
      // ====================================

      if (error.status === 401) {
        setUser(null);

        return true;
      }

      throw error;
    }
  }, []);

  // ========================================
  // CUSTOMER AUTHENTICATION STATUS
  // ========================================

  const isAuthenticated = Boolean(user);

  // ========================================
  // AUTH CONTEXT DATA
  // ========================================

  const value = useMemo(
    () => ({
      // CURRENT CUSTOMER
      user,

      // LOADING STATUS
      loading,

      // LOGIN STATUS
      isAuthenticated,

      // ACCOUNT OPERATIONS
      register,
      login,
      logout,

      // PROFILE OPERATIONS
      updateProfile,

      // SESSION OPERATIONS
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

  // ========================================
  // PROVIDE AUTHENTICATION TO FIXHUB
  // ========================================

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ==========================================
// END OF FIXHUB AUTH PROVIDER
// ==========================================
