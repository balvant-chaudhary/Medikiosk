// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('mk_token');
      const cached = localStorage.getItem('mk_user');

      if (!token) { setLoading(false); return; }

      // Use cached user immediately for fast render
      if (cached) {
        try { setUser(JSON.parse(cached)); } catch {}
      }

      // Verify token is still valid against server
      try {
        const { data } = await authAPI.me();
        setUser(data.user);
        localStorage.setItem('mk_user', JSON.stringify(data.user));
      } catch {
        // Token expired or invalid — clear everything
        localStorage.removeItem('mk_token');
        localStorage.removeItem('mk_user');
        setUser(null);
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  /**
   * login — calls POST /api/auth/login, stores token and user.
   * Returns the user object on success, throws on failure.
   */
  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('mk_token', data.token);
    localStorage.setItem('mk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  /**
   * register — calls POST /api/auth/register.
   * Used for self-service patient registration (role defaults to PATIENT).
   */
  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    localStorage.setItem('mk_token', data.token);
    localStorage.setItem('mk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  /**
   * logout — calls POST /api/auth/logout, clears local storage.
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore errors — always clear local state
    }
    localStorage.removeItem('mk_token');
    localStorage.removeItem('mk_user');
    setUser(null);
  };

  const isRole = (role) => user?.role === role;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isRole,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default AuthContext;
