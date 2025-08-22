import axios from "axios";

// Enhanced API configuration with comprehensive error handling and retry logic
const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL || "https://billing-system-i3py.onrender.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor with auth and logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("electromart_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request logging for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor with comprehensive error handling
api.interceptors.response.use(
  (response) => {
    console.log(
      `API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
      {
        status: response.status,
        data: response.data,
      },
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Network error handling
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject({
        ...error,
        message: "Network error. Please check your connection.",
      });
    }

    // Handle different status codes
    const { status } = error.response;

    switch (status) {
      case 401:
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          localStorage.removeItem("electromart_token");
          localStorage.removeItem("electromart_user");
          window.location.href = "/login";
        }
        break;
      case 429:
        // Rate limiting - implement exponential backoff
        const retryAfter = error.response.headers["retry-after"] || 1;
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        return api.request(originalRequest);
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors - retry with exponential backoff
        if (!originalRequest._retry && originalRequest._retryCount < 3) {
          originalRequest._retry = true;
          originalRequest._retryCount = originalRequest._retryCount || 0;
          originalRequest._retryCount++;

          const delay = Math.pow(2, originalRequest._retryCount) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));

          return api.request(originalRequest);
        }
        break;
    }

    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  },
);

// Types for API responses
interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

interface CompanyProfile {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  country: string;
  gstNumber: string;
  panNumber: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
  description: string;
  establishedYear: string;
  registrationNumber: string;
  bankAccount: {
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
    bankName: string;
    branch: string;
    accountType: string;
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstNumber?: string;
  panNumber?: string;
  status: "active" | "inactive";
  totalSpent: number;
  billsCount: number;
  lastBillDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  gstRate: number;
  hsnCode?: string;
  category: string;
  brand?: string;
  stock: number;
  minStockLevel?: number;
  isActive: boolean;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Bill {
  id: string;
  billNumber: string;
  billType: "GST" | "Non-GST" | "Quotation";
  financialYear: string;
  billDate: string;
  dueDate?: string;
  customer: Customer;
  company: CompanyProfile;
  items: BillItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalTax: number;
  roundOffAmount: number;
  finalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  payments: Payment[];
  paymentStatus: "Paid" | "Pending" | "Partial" | "Overdue";
  notes?: string;
  terms?: string;
  status: "Draft" | "Sent" | "Paid" | "Cancelled";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface BillItem {
  id: string;
  productId: string;
  productName: string;
  hsnCode?: string;
  quantity: number;
  rate: number;
  unit: string;
  gstRate: number;
  discount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

interface Payment {
  id: string;
  billId: string;
  method: "Cash" | "UPI" | "Card" | "Bank Transfer" | "Cheque";
  amount: number;
  date: string;
  reference?: string;
  notes?: string;
  status: "Success" | "Failed" | "Pending";
  createdAt: string;
}

// Enhanced Auth API
export const authAPI = {
  login: async (
    email: string,
    password: string,
  ): Promise<APIResponse<{ user: any; token: string }>> => {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }): Promise<APIResponse<{ user: any; token: string }>> => {
    const response = await api.post("/api/auth/register", data);
    return response.data;
  },

  logout: async (): Promise<APIResponse> => {
    const response = await api.post("/api/auth/logout");
    return response.data;
  },

  getProfile: async (): Promise<APIResponse<any>> => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  updateProfile: async (data: any): Promise<APIResponse<any>> => {
    const response = await api.put("/api/auth/profile", data);
    return response.data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<APIResponse> => {
    const response = await api.put("/api/auth/password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  resetPassword: async (email: string): Promise<APIResponse> => {
    const response = await api.post("/api/auth/reset-password", { email });
    return response.data;
  },

  verifyResetToken: async (
    token: string,
    newPassword: string,
  ): Promise<APIResponse> => {
    const response = await api.post("/api/auth/verify-reset-token", {
      token,
      newPassword,
    });
    return response.data;
  },
};

// Company Profile API
export const companyAPI = {
  getProfile: async (): Promise<APIResponse<CompanyProfile>> => {
    const response = await api.get("/api/company/profile");
    return response.data;
  },

  updateProfile: async (
    data: Partial<CompanyProfile>,
  ): Promise<APIResponse<CompanyProfile>> => {
    const response = await api.put("/api/company/profile", data);
    return response.data;
  },

  uploadLogo: async (file: File): Promise<APIResponse<{ logoUrl: string }>> => {
    const formData = new FormData();
    formData.append("logo", file);
    const response = await api.post("/api/company/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteLogo: async (): Promise<APIResponse> => {
    const response = await api.delete("/api/company/logo");
    return response.data;
  },
};

// Enhanced Customer API
export const customersAPI = {
  getCustomers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    state?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<APIResponse<{ customers: Customer[] }>> => {
    const response = await api.get("/api/customers", { params });
    return response.data;
  },

  getCustomer: async (id: string): Promise<APIResponse<Customer>> => {
    const response = await api.get(`/api/customers/${id}`);
    return response.data;
  },

  createCustomer: async (
    data: Omit<
      Customer,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "totalSpent"
      | "billsCount"
      | "lastBillDate"
    >,
  ): Promise<APIResponse<Customer>> => {
    const response = await api.post("/api/customers", data);
    return response.data;
  },

  updateCustomer: async (
    id: string,
    data: Partial<Customer>,
  ): Promise<APIResponse<Customer>> => {
    const response = await api.put(`/api/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id: string): Promise<APIResponse> => {
    const response = await api.delete(`/api/customers/${id}`);
    return response.data;
  },

  getCustomerBills: async (
    id: string,
    params?: { page?: number; limit?: number },
  ): Promise<APIResponse<{ bills: Bill[] }>> => {
    const response = await api.get(`/api/customers/${id}/bills`, { params });
    return response.data;
  },

  getCustomerStats: async (
    id: string,
  ): Promise<
    APIResponse<{
      totalSpent: number;
      billsCount: number;
      lastBillDate: string;
      averageOrderValue: number;
      paymentHistory: any[];
    }>
  > => {
    const response = await api.get(`/api/customers/${id}/stats`);
    return response.data;
  },

  importCustomers: async (
    file: File,
  ): Promise<APIResponse<{ imported: number; errors: any[] }>> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/api/customers/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  exportCustomers: async (params?: {
    format?: "csv" | "xlsx";
    filters?: any;
  }): Promise<Blob> => {
    const response = await api.get("/api/customers/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};

// Enhanced Products API
export const productsAPI = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<APIResponse<{ products: Product[] }>> => {
    const response = await api.get("/api/products", { params });
    return response.data;
  },

  getProduct: async (id: string): Promise<APIResponse<Product>> => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  createProduct: async (
    data: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): Promise<APIResponse<Product>> => {
    const response = await api.post("/api/products", data);
    return response.data;
  },

  updateProduct: async (
    id: string,
    data: Partial<Product>,
  ): Promise<APIResponse<Product>> => {
    const response = await api.put(`/api/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<APIResponse> => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<APIResponse<string[]>> => {
    const response = await api.get("/api/products/categories");
    return response.data;
  },

  getBrands: async (): Promise<APIResponse<string[]>> => {
    const response = await api.get("/api/products/brands");
    return response.data;
  },

  updateStock: async (
    id: string,
    quantity: number,
    type: "add" | "subtract" | "set",
  ): Promise<APIResponse<Product>> => {
    const response = await api.put(`/api/products/${id}/stock`, {
      quantity,
      type,
    });
    return response.data;
  },

  getLowStockProducts: async (
    threshold?: number,
  ): Promise<APIResponse<Product[]>> => {
    const response = await api.get("/api/products/low-stock", {
      params: { threshold },
    });
    return response.data;
  },

  uploadProductImages: async (
    id: string,
    files: File[],
  ): Promise<APIResponse<{ imageUrls: string[] }>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const response = await api.post(`/api/products/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  importProducts: async (
    file: File,
  ): Promise<APIResponse<{ imported: number; errors: any[] }>> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/api/products/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  exportProducts: async (params?: {
    format?: "csv" | "xlsx";
    filters?: any;
  }): Promise<Blob> => {
    const response = await api.get("/api/products/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};

// Comprehensive Bills API
export const billsAPI = {
  getBills: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    billType?: string;
    paymentStatus?: string;
    status?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<APIResponse<{ bills: Bill[] }>> => {
    const response = await api.get("/api/bills", { params });
    return response.data;
  },

  getBill: async (id: string): Promise<APIResponse<Bill>> => {
    const response = await api.get(`/api/bills/${id}`);
    return response.data;
  },

  createBill: async (
    data: Omit<
      Bill,
      | "id"
      | "billNumber"
      | "createdAt"
      | "updatedAt"
      | "paidAmount"
      | "pendingAmount"
    >,
  ): Promise<APIResponse<Bill>> => {
    const response = await api.post("/api/bills", data);
    return response.data;
  },

  updateBill: async (
    id: string,
    data: Partial<Bill>,
  ): Promise<APIResponse<Bill>> => {
    const response = await api.put(`/api/bills/${id}`, data);
    return response.data;
  },

  deleteBill: async (id: string): Promise<APIResponse> => {
    const response = await api.delete(`/api/bills/${id}`);
    return response.data;
  },

  duplicateBill: async (id: string): Promise<APIResponse<Bill>> => {
    const response = await api.post(`/api/bills/${id}/duplicate`);
    return response.data;
  },

  generateBillNumber: async (
    billType: string,
    financialYear: string,
  ): Promise<APIResponse<{ billNumber: string }>> => {
    const response = await api.post("/api/bills/generate-number", {
      billType,
      financialYear,
    });
    return response.data;
  },

  sendBillEmail: async (
    id: string,
    to: string,
    subject?: string,
    message?: string,
  ): Promise<APIResponse> => {
    const response = await api.post(`/api/bills/${id}/send-email`, {
      to,
      subject,
      message,
    });
    return response.data;
  },

  generatePDF: async (id: string): Promise<Blob> => {
    const response = await api.get(`/api/bills/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  previewBill: async (
    data: any,
  ): Promise<APIResponse<{ previewUrl: string }>> => {
    const response = await api.post("/api/bills/preview", data);
    return response.data;
  },

  calculateAmounts: (billData: any) => {
    let subtotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const isInterState = billData.customer?.state !== billData.company?.state;

    const calculatedItems =
      billData.items?.map((item: any) => {
        const discountAmount =
          (item.rate * item.quantity * (item.discount || 0)) / 100;
        const taxableAmount = item.rate * item.quantity - discountAmount;
        const gstAmount =
          billData.billType === "GST"
            ? (taxableAmount * (item.gstRate || 0)) / 100
            : 0;

        let cgstAmount = 0;
        let sgstAmount = 0;
        let igstAmount = 0;

        if (billData.billType === "GST") {
          if (isInterState) {
            igstAmount = gstAmount;
          } else {
            cgstAmount = gstAmount / 2;
            sgstAmount = gstAmount / 2;
          }
        }

        subtotal += item.rate * item.quantity;
        cgstTotal += cgstAmount;
        sgstTotal += sgstAmount;
        igstTotal += igstAmount;

        return {
          ...item,
          taxableAmount,
          cgstAmount,
          sgstAmount,
          igstAmount,
          totalAmount: taxableAmount + gstAmount,
        };
      }) || [];

    const discountAmount = (subtotal * (billData.discountPercent || 0)) / 100;
    const taxableAmountAfterDiscount = subtotal - discountAmount;
    const totalTax = cgstTotal + sgstTotal + igstTotal;
    const beforeRounding = taxableAmountAfterDiscount + totalTax;
    const finalAmount = Math.round(beforeRounding);
    const roundOffAmount = finalAmount - beforeRounding;

    return {
      ...billData,
      items: calculatedItems,
      subtotal,
      discountAmount,
      taxableAmount: taxableAmountAfterDiscount,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalTax,
      roundOffAmount,
      finalAmount,
    };
  },
};

// Payments API
export const paymentsAPI = {
  getPayments: async (params?: {
    billId?: string;
    customerId?: string;
    method?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<APIResponse<{ payments: Payment[] }>> => {
    const response = await api.get("/api/payments", { params });
    return response.data;
  },

  addPayment: async (
    data: Omit<Payment, "id" | "createdAt" | "status">,
  ): Promise<APIResponse<Payment>> => {
    const response = await api.post("/api/payments", data);
    return response.data;
  },

  updatePayment: async (
    id: string,
    data: Partial<Payment>,
  ): Promise<APIResponse<Payment>> => {
    const response = await api.put(`/api/payments/${id}`, data);
    return response.data;
  },

  deletePayment: async (id: string): Promise<APIResponse> => {
    const response = await api.delete(`/api/payments/${id}`);
    return response.data;
  },

  recordBulkPayments: async (
    payments: Array<Omit<Payment, "id" | "createdAt" | "status">>,
  ): Promise<APIResponse<Payment[]>> => {
    const response = await api.post("/api/payments/bulk", { payments });
    return response.data;
  },
};

// Dashboard API with comprehensive analytics
export const dashboardAPI = {
  getOverview: async (
    period?: "7d" | "30d" | "90d" | "1y",
  ): Promise<
    APIResponse<{
      totalSales: number;
      totalCustomers: number;
      totalProducts: number;
      pendingPayments: number;
      totalRevenue: number;
      paidRevenue: number;
      pendingRevenue: number;
      monthlyGrowth: number;
      billsThisMonth: number;
      newCustomersThisMonth: number;
      averageOrderValue: number;
      topSellingProduct: string;
      totalBills: number;
      gstBills: number;
      nonGstBills: number;
      quotations: number;
      overduePayments: number;
      partialPayments: number;
    }>
  > => {
    const response = await api.get("/api/dashboard/overview", {
      params: { period },
    });
    return response.data;
  },

  getRecentActivity: async (
    limit?: number,
  ): Promise<
    APIResponse<
      Array<{
        id: string;
        type: string;
        description: string;
        amount?: number;
        time: string;
        status: string;
      }>
    >
  > => {
    const response = await api.get("/api/dashboard/recent-activity", {
      params: { limit },
    });
    return response.data;
  },

  getTopCustomers: async (
    limit?: number,
  ): Promise<
    APIResponse<
      Array<{
        id: string;
        name: string;
        phone: string;
        totalSpent: number;
        billsCount: number;
        lastBillDate: string;
      }>
    >
  > => {
    const response = await api.get("/api/dashboard/top-customers", {
      params: { limit },
    });
    return response.data;
  },

  getTopProducts: async (
    limit?: number,
  ): Promise<
    APIResponse<
      Array<{
        id: string;
        name: string;
        category: string;
        quantitySold: number;
        revenue: number;
        profitMargin: number;
      }>
    >
  > => {
    const response = await api.get("/api/dashboard/top-products", {
      params: { limit },
    });
    return response.data;
  },

  getSalesAnalytics: async (
    period?: string,
  ): Promise<
    APIResponse<{
      monthly: Array<{
        month: string;
        revenue: number;
        bills: number;
        customers: number;
      }>;
      daily: Array<{ date: string; revenue: number; bills: number }>;
      hourly: Array<{ hour: number; revenue: number; bills: number }>;
    }>
  > => {
    const response = await api.get("/api/dashboard/sales-analytics", {
      params: { period },
    });
    return response.data;
  },

  getPaymentAnalytics: async (): Promise<
    APIResponse<{
      methods: Array<{
        method: string;
        amount: number;
        percentage: number;
        count: number;
      }>;
      status: Array<{
        status: string;
        amount: number;
        percentage: number;
        count: number;
      }>;
      trends: Array<{ date: string; collected: number; pending: number }>;
    }>
  > => {
    const response = await api.get("/api/dashboard/payment-analytics");
    return response.data;
  },

  getInventoryAlerts: async (): Promise<
    APIResponse<{
      lowStock: Product[];
      outOfStock: Product[];
      expiringSoon: Product[];
    }>
  > => {
    const response = await api.get("/api/dashboard/inventory-alerts");
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  getSettings: async (): Promise<
    APIResponse<{
      billing: any;
      notifications: any;
      security: any;
      preferences: any;
    }>
  > => {
    const response = await api.get("/api/settings");
    return response.data;
  },

  updateSettings: async (category: string, data: any): Promise<APIResponse> => {
    const response = await api.put(`/api/settings/${category}`, data);
    return response.data;
  },

  exportSettings: async (): Promise<Blob> => {
    const response = await api.get("/api/settings/export", {
      responseType: "blob",
    });
    return response.data;
  },

  importSettings: async (file: File): Promise<APIResponse> => {
    const formData = new FormData();
    formData.append("settings", file);
    const response = await api.post("/api/settings/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  resetSettings: async (category?: string): Promise<APIResponse> => {
    const response = await api.post("/api/settings/reset", { category });
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getSalesReport: async (params: {
    dateFrom: string;
    dateTo: string;
    groupBy?: "day" | "week" | "month";
    customerId?: string;
    billType?: string;
  }): Promise<APIResponse<any>> => {
    const response = await api.get("/api/reports/sales", { params });
    return response.data;
  },

  getTaxReport: async (params: {
    dateFrom: string;
    dateTo: string;
    financialYear?: string;
  }): Promise<APIResponse<any>> => {
    const response = await api.get("/api/reports/tax", { params });
    return response.data;
  },

  getCustomerReport: async (params: {
    dateFrom?: string;
    dateTo?: string;
    minSpent?: number;
    state?: string;
  }): Promise<APIResponse<any>> => {
    const response = await api.get("/api/reports/customers", { params });
    return response.data;
  },

  getProductReport: async (params: {
    dateFrom?: string;
    dateTo?: string;
    category?: string;
    brand?: string;
  }): Promise<APIResponse<any>> => {
    const response = await api.get("/api/reports/products", { params });
    return response.data;
  },

  getInventoryReport: async (params: {
    lowStockThreshold?: number;
    category?: string;
    brand?: string;
  }): Promise<APIResponse<any>> => {
    const response = await api.get("/api/reports/inventory", { params });
    return response.data;
  },

  exportReport: async (
    type: string,
    params: any,
    format: "pdf" | "excel" | "csv",
  ): Promise<Blob> => {
    const response = await api.get(`/api/reports/${type}/export`, {
      params: { ...params, format },
      responseType: "blob",
    });
    return response.data;
  },
};

// File Upload API
export const fileAPI = {
  uploadImage: async (
    file: File,
    folder?: string,
  ): Promise<APIResponse<{ url: string; filename: string }>> => {
    const formData = new FormData();
    formData.append("image", file);
    if (folder) formData.append("folder", folder);

    const response = await api.post("/api/files/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  uploadDocument: async (
    file: File,
    folder?: string,
  ): Promise<APIResponse<{ url: string; filename: string }>> => {
    const formData = new FormData();
    formData.append("document", file);
    if (folder) formData.append("folder", folder);

    const response = await api.post("/api/files/upload-document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteFile: async (filename: string): Promise<APIResponse> => {
    const response = await api.delete(`/api/files/${filename}`);
    return response.data;
  },
};

// Backup API
export const backupAPI = {
  createBackup: async (): Promise<
    APIResponse<{ backupId: string; downloadUrl: string }>
  > => {
    const response = await api.post("/api/backup/create");
    return response.data;
  },

  getBackups: async (): Promise<
    APIResponse<
      Array<{
        id: string;
        createdAt: string;
        size: number;
        status: string;
      }>
    >
  > => {
    const response = await api.get("/api/backup/list");
    return response.data;
  },

  downloadBackup: async (backupId: string): Promise<Blob> => {
    const response = await api.get(`/api/backup/${backupId}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  restoreBackup: async (backupId: string): Promise<APIResponse> => {
    const response = await api.post(`/api/backup/${backupId}/restore`);
    return response.data;
  },

  deleteBackup: async (backupId: string): Promise<APIResponse> => {
    const response = await api.delete(`/api/backup/${backupId}`);
    return response.data;
  },
};

// Utility functions
export const utilityAPI = {
  healthCheck: async (): Promise<
    APIResponse<{ status: string; timestamp: string; version: string }>
  > => {
    const response = await api.get("/api/health");
    return response.data;
  },

  getStates: async (): Promise<
    APIResponse<Array<{ name: string; code: string }>>
  > => {
    const response = await api.get("/api/utility/states");
    return response.data;
  },

  validateGST: async (
    gstNumber: string,
  ): Promise<APIResponse<{ valid: boolean; details?: any }>> => {
    const response = await api.post("/api/utility/validate-gst", { gstNumber });
    return response.data;
  },

  validatePAN: async (
    panNumber: string,
  ): Promise<APIResponse<{ valid: boolean; details?: any }>> => {
    const response = await api.post("/api/utility/validate-pan", { panNumber });
    return response.data;
  },

  getExchangeRates: async (): Promise<APIResponse<Record<string, number>>> => {
    const response = await api.get("/api/utility/exchange-rates");
    return response.data;
  },

  generateQRCode: async (
    data: string,
    size?: number,
  ): Promise<APIResponse<{ qrCodeUrl: string }>> => {
    const response = await api.post("/api/utility/generate-qr", { data, size });
    return response.data;
  },
};

// Error handling utilities
export const handleAPIError = (error: any): string => {
  if (!error.response) {
    return "Network error. Please check your connection.";
  }

  const { status, data } = error.response;

  if (data?.message) {
    return data.message;
  }

  if (data?.errors) {
    const errorMessages = Object.values(data.errors).flat();
    return errorMessages.join(", ");
  }

  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Authentication required. Please log in.";
    case 403:
      return "Access denied. You do not have permission.";
    case 404:
      return "Resource not found.";
    case 422:
      return "Validation error. Please check your input.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Server error. Please try again later.";
    case 503:
      return "Service unavailable. Please try again later.";
    default:
      return "An unexpected error occurred.";
  }
};

// Connection test
export const testConnection = async (): Promise<{
  success: boolean;
  message: string;
  latency?: number;
}> => {
  const startTime = Date.now();

  try {
    await utilityAPI.healthCheck();
    const latency = Date.now() - startTime;
    return {
      success: true,
      message: "API connection successful",
      latency,
    };
  } catch (error) {
    return {
      success: false,
      message: handleAPIError(error),
    };
  }
};

// Export the axios instance for custom requests
export { api };

// Export all APIs
export default {
  auth: authAPI,
  company: companyAPI,
  customers: customersAPI,
  products: productsAPI,
  bills: billsAPI,
  payments: paymentsAPI,
  dashboard: dashboardAPI,
  settings: settingsAPI,
  reports: reportsAPI,
  files: fileAPI,
  backup: backupAPI,
  utility: utilityAPI,
  testConnection,
  handleAPIError,
};
