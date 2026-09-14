import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // Starts with loading state while checking session
  const [error, setError] = useState(null);

  // Restore saved session on initial app load if valid token exists in localStorage
  useEffect(() => {
    const session = authApi.getSession();
    if (session && session.user) {
      setUser(session.user);
      setStatus("authenticated");
    } else {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const loggedInUser = await authApi.login(email, password);
      setUser(loggedInUser);
      setStatus("authenticated");
      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const newUser = await authApi.register(name, email, password);
      setUser(newUser);
      setStatus("authenticated");
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}