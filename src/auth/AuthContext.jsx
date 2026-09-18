import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('topTierToken'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('topTierUser');
    return raw ? JSON.parse(raw) : null;
  });

  const persist = useCallback((newToken, newUser) => {
    localStorage.setItem('topTierToken', newToken);
    localStorage.setItem('topTierUser', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await api.login({ email, password });
      persist(data.token, data.user);
      return data.user;
    },
    [persist]
  );

  const signup = useCallback(
    async (payload) => {
      const data = await api.signup(payload);
      persist(data.token, data.user);
      return data.user;
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('topTierToken');
    localStorage.removeItem('topTierUser');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
