import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'cashier';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('electromart_user');
    const savedToken = localStorage.getItem('electromart_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        // TODO: Optionally verify token with /api/auth/me endpoint
      } catch (error) {
        localStorage.removeItem('electromart_user');
        localStorage.removeItem('electromart_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email, passwordLength: password.length });

      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data);
      const data = response.data;

      if (data.token && data.user) {
        const userData: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar,
          role: data.user.role
        };

        setUser(userData);
        localStorage.setItem('electromart_user', JSON.stringify(userData));
        localStorage.setItem('electromart_token', data.token);
        setIsLoading(false);
        console.log('Login successful');
        return true;
      } else {
        console.log('Login failed: No token or user in response');
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error('Login error in AuthContext:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('electromart_user');
    localStorage.removeItem('electromart_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
