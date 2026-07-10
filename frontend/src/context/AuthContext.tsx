import { createContext, useContext, useState, type ReactNode } from 'react';
import { api, clearTokens, getAccessToken, setTokens } from '../lib/api';
import { decodeJwt } from '../lib/jwt';

export interface AuthUser {
  id: string;
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function userFromToken(token: string | null, username: string | null): AuthUser | null {
  if (!token) return null;
  const payload = decodeJwt<{ sub: string }>(token);
  if (!payload) return null;
  return { id: payload.sub, username: username ?? '' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    userFromToken(getAccessToken(), localStorage.getItem('username')),
  );

  async function login(username: string, password: string) {
    const { accessToken, refreshToken } = await api.login(username, password);
    setTokens(accessToken, refreshToken);
    localStorage.setItem('username', username);
    setUser(userFromToken(accessToken, username));
  }

  async function register(username: string, email: string, password: string) {
    await api.register(username, email, password);
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      /* token may already be invalid/expired; clear local state regardless */
    }
    clearTokens();
    localStorage.removeItem('username');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
