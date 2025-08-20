/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Dashboard API Types
export interface DashboardStats {
  todayStats: {
    sales: { amount: number; transactions: number; change: number };
    customers: { new: number; returning: number; change: number };
    returnSales: { amount: number; count: number; change: number };
    target: { current: number; target: number; percentage: number };
  };
  overallStats: {
    sales: { amount: number; transactions: number; change: number };
    customers: { total: number; active: number; change: number };
    products: { total: number; lowStock: number; outOfStock: number };
    revenue: { thisMonth: number; lastMonth: number; growth: number };
  };
  chartData: {
    salesTrend: Array<{ month: string; sales: number; customers: number }>;
    categoryBreakdown: Array<{ category: string; sales: number; percentage: number }>;
  };
}

export interface NotificationResponse {
  id: string;
  type: "security" | "deletion" | "system" | "alert";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: "high" | "medium" | "low";
  actionRequired?: boolean;
}

export interface RecentTransaction {
  id: string;
  customer: string;
  amount: number;
  items: number;
  time: string;
  type: "GST" | "Non-GST";
  status: "completed" | "pending";
}

// Product API Types
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string;
  description?: string;
  brand?: string;
  gstRate: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// Customer API Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  gstNumber?: string;
  state: string;
  stateCode: string;
  totalPurchases: number;
  lastPurchase?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFilters {
  search?: string;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}

export interface CustomersResponse {
  customers: Customer[];
  total: number;
  page: number;
  totalPages: number;
}

// User Management API Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "cashier" | "accountant";
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

// Billing API Types
export interface BillItem {
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  unit: string;
  gstRate: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  billType: "GST" | "Non-GST" | "Demo";
  financialYear: string;
  billDate: string;
  dueDate?: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    gstNumber?: string;
    state: string;
    stateCode: string;
  };
  company: {
    name: string;
    address: string;
    gstNumber: string;
    state: string;
    stateCode: string;
    phone: string;
    email: string;
  };
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
  paymentStatus: "Paid" | "Pending" | "Partial" | "Overdue";
  paymentMethod?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: "Draft" | "Sent" | "Paid" | "Cancelled";
}

export interface BillFilters {
  search?: string;
  billType?: "GST" | "Non-GST" | "Demo";
  paymentStatus?: "Paid" | "Pending" | "Partial" | "Overdue";
  status?: "Draft" | "Sent" | "Paid" | "Cancelled";
  startDate?: string;
  endDate?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface BillsResponse {
  bills: Bill[];
  total: number;
  page: number;
  totalPages: number;
}

// Sales Return API Types
export interface SalesReturn {
  id: string;
  returnNumber: string;
  originalBillId: string;
  originalBillNumber: string;
  returnDate: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    originalQuantity: number;
    returnedQuantity: number;
    rate: number;
    reason: string;
    condition: "Good" | "Damaged" | "Defective";
    refundAmount: number;
  }>;
  totalRefundAmount: number;
  refundMethod: "Cash" | "Bank Transfer" | "Credit Note";
  status: "Pending" | "Approved" | "Processed" | "Rejected";
  createdBy: string;
  createdAt: string;
}

export interface SalesReturnFilters {
  search?: string;
  status?: "Pending" | "Approved" | "Processed" | "Rejected";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SalesReturnsResponse {
  returns: SalesReturn[];
  total: number;
  page: number;
  totalPages: number;
}

// Common API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
