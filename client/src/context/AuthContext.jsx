import { createContext, useEffect, useMemo, useState } from 'react';
import { clearSession, getSession, normalizeRole, saveSession } from '../auth';
import { loginUser, logoutUser } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(getSession());
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    const result = await loginUser(credentials);
    const normalizedRole = normalizeRole(result?.user?.role || credentials.role);
    const nextSession = saveSession(normalizedRole, result.user, result.token);
    setSession(nextSession);
    return nextSession;
  };

  const logout = async () => {
    await logoutUser();
    clearSession();
    setSession(null);
  };

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    role: session?.role ?? null,
    isAuthenticated: Boolean(session?.user),
    isLoading,
    login,
    logout,
  }), [session, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
