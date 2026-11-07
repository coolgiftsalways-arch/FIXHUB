import { createContext, useContext } from "react";

// ==========================================
// FIXHUB AUTH CONTEXT
// ==========================================

export const AuthContext = createContext(null);

// ==========================================
// CUSTOM AUTH HOOK
// ==========================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
