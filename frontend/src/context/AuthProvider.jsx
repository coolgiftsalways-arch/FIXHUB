import { useCallback, useEffect, useMemo, useState } from "react";
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

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("FIXHUB server returned an invalid response.");
  }

  if (!response.ok) {
    const error = new Error(
      result?.message || "Something went wrong. Please try again.",
    );

    error.status = response.status;
    error.requiresVerification = Boolean(result?.requiresVerification);

    throw error;
  }

  return result;
}

// ==========================================
// FIXHUB AUTH PROVIDER
// ==========================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========================================
  // RESTORE SAVED LOGIN SESSION
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    async function restoreSession() {
      try {
        const result = await authRequest("/me", {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setUser(result.user || null);
      } catch (error) {
        if (controller.signal.aborted) return;

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

  // Customer creates password during registration.
  // No email verification is required.

  const register = useCallback(async (details) => {
    const result = await authRequest("/register", {
      method: "POST",
      body: {
        fullName: details.fullName?.trim(),
        email: details.email?.trim().toLowerCase(),
        phone: details.phone?.replace(/\s+/g, "").trim(),
        address: details.address?.trim(),
        password: details.password,
        confirmPassword: details.confirmPassword,
      },
    });

    if (!result.user) {
      throw new Error(
        "Registration succeeded but customer details are missing.",
      );
    }

    setUser(result.user);

    return result;
  }, []);

  // ========================================
  // CUSTOMER LOGIN
  // ========================================

  const login = useCallback(async (credentials) => {
    const result = await authRequest("/login", {
      method: "POST",
      body: {
        identifier: credentials.identifier,
        password: credentials.password,
      },
    });

    if (!result.user) {
      throw new Error("Login succeeded but customer details are missing.");
    }

    setUser(result.user);

    return result.user;
  }, []);

  // ========================================
  // UPDATE CUSTOMER PROFILE
  // ========================================

  const updateProfile = useCallback(async (details) => {
    const result = await authRequest("/me", {
      method: "PATCH",
      body: {
        fullName: details.fullName,
        phone: details.phone,
        address: details.address,
      },
    });

    if (result.user) {
      setUser(result.user);
    }

    return result.user;
  }, []);

  // ========================================
  // CUSTOMER LOGOUT
  // ========================================

  const logout = useCallback(async () => {
    try {
      await authRequest("/logout", {
        method: "POST",
      });

      setUser(null);

      return true;
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
        return true;
      }

      throw error;
    }
  }, []);

  // ========================================
  // AUTHENTICATION STATUS
  // ========================================

  const isAuthenticated = Boolean(user);

  // ========================================
  // AUTH CONTEXT VALUE
  // ========================================

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      register,
      login,
      logout,
      updateProfile,
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ==========================================
// END OF FIXHUB AUTH PROVIDER
// ==========================================
