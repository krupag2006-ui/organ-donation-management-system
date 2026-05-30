import React, { createContext, useContext, useMemo, useState } from 'react';
import { authAPI } from '../services/api';
import { normalizeRole } from '../utils/roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('token', data.token);
      let nextUser = {
        email: credentials.email,
        role: normalizeRole(credentials.role),
        name: credentials.email.split('@')[0],
      };
      localStorage.setItem('user', JSON.stringify(nextUser));
      setToken(data.token);
      try {
        const profile = await authAPI.profile();
        nextUser = profile.data.user;
        localStorage.setItem('user', JSON.stringify(nextUser));
      } catch {
        // Keep the login-selected role if the profile endpoint is unavailable.
      }
      setUser(nextUser);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      return await authAPI.register(payload);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (updates) => {
    const { data } = await authAPI.updateProfile(updates);
    const nextUser = data.user;
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      register,
      updateUserProfile,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
