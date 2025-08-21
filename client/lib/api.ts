import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://billing-system-i3py.onrender.com',
  timeout: 15000, // Increased timeout for slow connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add API health check
export const healthCheck = async () => {
  try {
    const response = await api.post('/api/auth/login');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('electromart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.message = 'Network Error: Please check your internet connection';
      return Promise.reject(error);
    }

    // Handle different HTTP status codes
    switch (error.response?.status) {
      case 401:
        // Only redirect to login if not already on login page
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('electromart_token');
          localStorage.removeItem('electromart_user');
          window.location.href = '/login';
        }
        break;
      case 403:
        error.message = 'Access forbidden. You do not have permission.';
        break;
      case 404:
        error.message = 'Resource not found.';
        break;
      case 500:
        error.message = 'Internal server error. Please try again later.';
        break;
      case 503:
        error.message = 'Service unavailable. Please try again later.';
        break;
      default:
        error.message = error.response?.data?.message || 'An error occurred';
    }

    return Promise.reject(error);
  }
);

// Mock user data for fallback
const mockUsers = [
  {
    id: '1',
    name: 'System Administrator',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    avatar: null,
    lastLogin: new Date()
  },
  {
    id: '2',
    name: 'Store Manager',
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager',
    avatar: null,
    lastLogin: new Date()
  },
  {
    id: '3',
    name: 'Cashier User',
    email: 'cashier@example.com',
    password: 'password123',
    role: 'cashier',
    avatar: null,
    lastLogin: new Date()
  }
];

// Mock authentication function
const mockAuth = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        message: 'Login successful (Mock Mode)',
        data: {
          user: userWithoutPassword,
          token: 'mock-jwt-token-' + Date.now()
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  },

  getProfile: async () => {
    const userData = localStorage.getItem('electromart_user');
    if (userData) {
      return {
        success: true,
        data: {
          user: JSON.parse(userData)
        }
      };
    }
    throw new Error('User not found');
  }
};

// Auth API functions with fallback
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      // If network error, use mock authentication
      if (!error.response || error.message.includes('Network Error')) {
        console.warn('API unavailable, using mock authentication');
        return await mockAuth.login(email, password);
      }
      throw error;
    }
  },

  logout: async () => {
    // Always handle logout locally since it's mainly about clearing storage
    return { success: true, message: 'Logged out successfully' };
  },

  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error: any) {
      if (!error.response || error.message.includes('Network Error')) {
        return await mockAuth.getProfile();
      }
      throw error;
    }
  },

  refreshToken: async () => {
    // Mock implementation for token refresh
    try {
      const response = await api.post('/api/auth/refresh');
      return response.data;
    } catch (error: any) {
      if (!error.response || error.message.includes('Network Error')) {
        return { success: true, token: 'mock-refreshed-token-' + Date.now() };
      }
      throw error;
    }
  }
};

// Dashboard API functions
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },
  
  getNotifications: async () => {
    const response = await api.get('/api/dashboard/notifications');
    return response.data;
  },
  
  getRecentTransactions: async () => {
    const response = await api.get('/api/dashboard/transactions');
    return response.data;
  }
};

// Products API functions
export const productsAPI = {
  getProducts: async (params?: any) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },
  
  getProduct: async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },
  
  createProduct: async (data: any) => {
    const response = await api.post('/api/products', data);
    return response.data;
  },
  
  updateProduct: async (id: string, data: any) => {
    const response = await api.put(`/api/products/${id}`, data);
    return response.data;
  },
  
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  }
};

// Customers API functions
export const customersAPI = {
  getCustomers: async (params?: any) => {
    const response = await api.get('/api/customers', { params });
    return response.data;
  },
  
  getCustomer: async (id: string) => {
    const response = await api.get(`/api/customers/${id}`);
    return response.data;
  },
  
  createCustomer: async (data: any) => {
    const response = await api.post('/api/customers', data);
    return response.data;
  },
  
  updateCustomer: async (id: string, data: any) => {
    const response = await api.put(`/api/customers/${id}`, data);
    return response.data;
  },
  
  deleteCustomer: async (id: string) => {
    const response = await api.delete(`/api/customers/${id}`);
    return response.data;
  }
};

// Bills API functions
export const billsAPI = {
  getBills: async (params?: any) => {
    const response = await api.get('/api/bills', { params });
    return response.data;
  },
  
  getBill: async (id: string) => {
    const response = await api.get(`/api/bills/${id}`);
    return response.data;
  },
  
  createBill: async (data: any) => {
    const response = await api.post('/api/bills', data);
    return response.data;
  },
  
  updateBill: async (id: string, data: any) => {
    const response = await api.put(`/api/bills/${id}`, data);
    return response.data;
  },
  
  deleteBill: async (id: string) => {
    const response = await api.delete(`/api/bills/${id}`);
    return response.data;
  }
};

export default api;
