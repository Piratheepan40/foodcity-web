'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'CASHIER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, role?: 'ADMIN' | 'CASHIER') => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('pos_token');
    const storedUser = localStorage.getItem('pos_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user cache');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user: loggedUser } = response.data;

    localStorage.setItem('pos_token', access_token);
    localStorage.setItem('pos_user', JSON.stringify(loggedUser));
    setToken(access_token);
    setUser(loggedUser);

    return loggedUser;
  };

  const register = async (
    email: string,
    password: string,
    role: 'ADMIN' | 'CASHIER' = 'CASHIER'
  ): Promise<User> => {
    const response = await api.post('/auth/register', { email, password, role });
    const { access_token, user: registeredUser } = response.data;

    localStorage.setItem('pos_token', access_token);
    localStorage.setItem('pos_user', JSON.stringify(registeredUser));
    setToken(access_token);
    setUser(registeredUser);

    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
