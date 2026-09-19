import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken } from '../api/axiosInstance';

const AuthContext = createContext(null);
const STORAGE_KEY = 'ems_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  // Keep the axios default header in sync with whatever session we have,
  // including on first load (e.g. after a page refresh).
  useEffect(() => {
    setAuthToken(user?.token ?? null);
  }, [user]);

  const login = (authResponse) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authResponse));
    setUser(authResponse);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ROLE_ADMIN',
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return ctx;
}
