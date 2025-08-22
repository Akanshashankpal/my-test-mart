import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'cashier' | 'accountant';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('electromart_token');
      const savedUser = localStorage.getItem('electromart_user');

      if (token && savedUser) {
        try {
          // Verify token is still valid by fetching user profile
          const userData = JSON.parse(savedUser);
          setUser(userData);

          // Optionally verify with backend
          try {
            const profileData = await authAPI.getProfile();
            if (profileData.success && profileData.data?.user) {
              setUser(profileData.data.user);
              localStorage.setItem('electromart_user', JSON.stringify(profileData.data.user));
            }
          } catch (error) {
            // Token might be expired, clear storage
            localStorage.removeItem('electromart_token');
            localStorage.removeItem('electromart_user');
            setUser(null);
          }
        } catch (error) {
          localStorage.removeItem('electromart_token');
          localStorage.removeItem('electromart_user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(email, password);

      if (response.success && response.data?.token && response.data?.user) {
        // Store auth token and user data
        localStorage.setItem('electromart_token', response.data.token);
        localStorage.setItem('electromart_user', JSON.stringify(response.data.user));

        setUser(response.data.user);
        setIsLoading(false);
        return true;
      } else {
        setError(response.message || 'Login failed');
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });

      // Handle different error scenarios
      if (!error.response) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else if (error.response?.status === 404) {
        setError('Authentication endpoint not found. Please contact support.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (error.response?.status === 400) {
        setError(error.response?.data?.message || 'Invalid request. Please check your input.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }

      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      // Call logout API to invalidate token on server
      await authAPI.logout();
    } catch (error) {
      // Even if API call fails, we still want to clear local storage
      console.error('Logout error:', error);
    }

    // Clear local storage and state
    setUser(null);
    localStorage.removeItem('electromart_token');
    localStorage.removeItem('electromart_user');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth, AuthProvider };
