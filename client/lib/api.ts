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
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Handle network errors
    if (!error.response) {
      error.message = 'Network Error: Please check your internet connection';
      return Promise.reject(error);
    }

    // Handle different HTTP status codes
    switch (error.response?.status) {
      case 400:
        error.message = error.response?.data?.message || 'Bad request. Please check your input.';
        break;
      case 401:
        error.message = error.response?.data?.message || 'Invalid credentials';
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
        error.message = 'Resource not found. Please check the URL.';
        break;
      case 422:
        error.message = error.response?.data?.message || 'Validation error. Please check your input.';
        break;
      case 500:
        error.message = 'Internal server error. Please try again later.';
        break;
      case 502:
        error.message = 'Bad gateway. Server is temporarily unavailable.';
        break;
      case 503:
        error.message = 'Service unavailable. Please try again later.';
        break;
      case 504:
        error.message = 'Gateway timeout. Server is taking too long to respond.';
        break;
      default:
        const detailedMessage = error.response?.data?.message ||
                              error.response?.data?.error ||
                              `HTTP ${error.response?.status}: ${error.response?.statusText}`;
        error.message = detailedMessage;
    }

    return Promise.reject(error);
  }
);


// Auth API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    console.log('API Login - Attempting login with:', { email, baseURL: api.defaults.baseURL });

    try {
      const response = await api.post('/api/auth/login', { email, password });
      console.log('API Login - Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Login - Failed:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  logout: async () => {
    return { success: true, message: 'Logged out successfully' };
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  register: async (name: string, email: string, password: string, role?: string) => {
    const response = await api.post('/api/auth/register', { name, email, password, role });
    return response.data;
  },

  updateProfile: async (name?: string, email?: string, avatar?: string) => {
    const response = await api.put('/api/auth/profile', { name, email, avatar });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/api/auth/password', { currentPassword, newPassword });
    return response.data;
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
