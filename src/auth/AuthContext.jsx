import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('topTierToken'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('topTierUser');
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [authReady, setAuthReady] = useState(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem('topTierToken');
    localStorage.removeItem('topTierUser');
    setToken(null);
    setUser(null);
  }, []);

  const persist = useCallback((newToken, newUser) => {
    localStorage.setItem('topTierToken', newToken);
    localStorage.setItem('topTierUser', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const storedToken = localStorage.getItem('topTierToken');
      if (!storedToken) {
        if (active) setAuthReady(true);
        return;
      }

      try {
        const freshUser = await api.getMyProfile();
        if (active) {
          localStorage.setItem('topTierUser', JSON.stringify(freshUser));
          setUser(freshUser);
          setToken(storedToken);
        }
      } catch (error) {
        if (active && (error.status === 401 || error.status === 403 || error.status === 404)) {
          clearSession();
        }
      } finally {
        if (active) setAuthReady(true);
      }
    }

    restoreSession();
    return () => { active = false; };
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    persist(data.token, data.user);
    return data.user;
  }, [persist]);

  const signup = useCallback(async (payload) => {
    const data = await api.signup(payload);
    persist(data.token, data.user);
    return data.user;
  }, [persist]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout, authReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
