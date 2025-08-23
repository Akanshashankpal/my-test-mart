import axios from 'axios';

// API Base URL Configuration
const API_BASE_URL = 'https://billing-system-i3py.onrender.com';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
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

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          `HTTP ${error.response.status}: ${error.response.statusText}`;
      
      console.error(`API Error for ${error.config.url}:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        fullResponse: error.response,
      });

      // Also log the actual error message for debugging
      console.error('Actual error message:', errorMessage);

      // Additional debug info for "[object Object]" issues
      if (typeof error.response.data === 'object') {
        console.error('Response data object:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Handle specific status codes
      if (error.response.status === 401) {
        // Unauthorized - clear auth data
        localStorage.removeItem('electromart_user');
        localStorage.removeItem('electromart_token');
        // Optionally redirect to login
        window.location.href = '/login';
      }
      
      // Create a detailed error object
      const detailedError = new Error(errorMessage);
      (detailedError as any).response = error.response;
      (detailedError as any).status = error.response.status;
      (detailedError as any).data = error.response.data;
      throw detailedError;
    } else if (error.request) {
      // Network error
      throw new Error('Network error: Unable to connect to server');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export default apiClient;
export { API_BASE_URL };
