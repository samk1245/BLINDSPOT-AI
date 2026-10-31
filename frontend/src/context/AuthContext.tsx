import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  quickDemoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('blindspot_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      const savedToken = localStorage.getItem('blindspot_token');
      if (savedToken) {
        try {
          const res = await apiClient.get<User>('/auth/me');
          setUser(res.data);
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('blindspot_token', res.data.access_token);
    setToken(res.data.access_token);
    const meRes = await apiClient.get<User>('/auth/me', {
      headers: { Authorization: `Bearer ${res.data.access_token}` },
    });
    setUser(meRes.data);
  };

  const register = async (email: string, password: string, fullName?: string) => {
    const res = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    localStorage.setItem('blindspot_token', res.data.access_token);
    setToken(res.data.access_token);
    const meRes = await apiClient.get<User>('/auth/me', {
      headers: { Authorization: `Bearer ${res.data.access_token}` },
    });
    setUser(meRes.data);
  };

  const quickDemoLogin = async () => {
    // Tries to login with demo credentials; if user doesn't exist, registers them
    const demoEmail = 'director@blindspot.ai';
    const demoPassword = 'SecurePassword123!';
    try {
      await login(demoEmail, demoPassword);
    } catch {
      await register(demoEmail, demoPassword, 'Lead Intelligence Director');
    }
  };

  const logout = () => {
    localStorage.removeItem('blindspot_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, quickDemoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
