import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'stockpulse_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  /**
   * Set the current user by username.
   * The username is sanitised to alphanumeric + underscore/hyphen/space only.
   * @param {string} username
   */
  const login = useCallback((username) => {
    if (!username || typeof username !== 'string') return;
    const safe = username.trim().replace(/[^a-zA-Z0-9_\- ]/g, '').substring(0, 30);
    if (!safe) return;
    const userData = { username: safe, displayName: safe, joinedAt: new Date().toISOString() };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
