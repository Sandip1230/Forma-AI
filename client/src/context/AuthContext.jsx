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

  // Step 1 of signup — creates the account and emails a verification code.
  // Doesn't set `user`; a session only exists once the code is verified.
  const signup = useCallback((username, email, password) => api.signup(username, email, password), []);

  // Step 2 of signup — verifying the code also logs the new account in.
  const verifySignupOtp = useCallback(async (email, code) => {
    const loggedInUser = await api.verifySignupOtp(email, code);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  // Plain username-or-email + password — no OTP step. Blocked server-side
  // until the account's email has been verified via signup.
  const login = useCallback(async (identifier, password) => {
    const loggedInUser = await api.login(identifier, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const devLogin = useCallback(async () => {
    const loggedInUser = await api.devLogin();
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const forgotPassword = useCallback((email) => api.forgotPassword(email), []);

  const resetPassword = useCallback(async (email, code, newPassword) => {
    const loggedInUser = await api.resetPassword(email, code, newPassword);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await api.logout().catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, authLoading, signup, verifySignupOtp, login, devLogin, forgotPassword, resetPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
