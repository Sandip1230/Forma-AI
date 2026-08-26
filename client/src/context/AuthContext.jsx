import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    api
      .fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  const signup = useCallback((email, password) => api.signup(email, password), []);

  // Step 1 of login — password only. Doesn't set `user`; a session only
  // exists once the emailed code is verified.
  const login = useCallback((email, password) => api.login(email, password), []);

  // Step 2 — the emailed code. Success issues the session cookie server-side.
  const verifyOtp = useCallback(async (email, code) => {
    const loggedInUser = await api.verifyOtp(email, code);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await api.logout().catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading, signup, login, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
