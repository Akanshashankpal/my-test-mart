import { RequestHandler } from "express";
import { Customer, CustomerFilters, CustomersResponse } from "@shared/api";

// Mock customers data service
class CustomersService {
  private customers: Customer[] = [];

  constructor() {
    this.initializeMockCustomers();
  }

  private initializeMockCustomers() {
    const firstNames = ["John", "Sarah", "Mike", "Emily", "David", "Lisa", "Robert", "Jessica", "William", "Ashley"];
    const lastNames = ["Smith", "Johnson", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas"];
    const states = [
      { name: "Delhi", code: "07" },
      { name: "Maharashtra", code: "27" },
      { name: "Karnataka", code: "29" },
      { name: "Tamil Nadu", code: "33" },
      { name: "Uttar Pradesh", code: "09" }
    ];
    
    for (let i = 1; i <= 100; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      const hasGST = Math.random() > 0.6; // 40% have GST
      const isActive = Math.random() > 0.1; // 90% are active
      
      this.customers.push({
        id: `cust_${i.toString().padStart(3, '0')}`,
        name: `${firstName} ${lastName}`,
        email: Math.random() > 0.3 ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com` : undefined,
        phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        address: `${Math.floor(Math.random() * 999) + 1}, ${lastName} Street, ${state.name}`,
        gstNumber: hasGST ? `${state.code}ABCDE${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}F1Z5` : undefined,
        state: state.name,
        stateCode: state.code,
        totalPurchases: Math.floor(Math.random() * 500000) + 10000, // 10k to 510k
        lastPurchase: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        status: isActive ? "active" : "inactive",
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  async getCustomers(filters: CustomerFilters): Promise<CustomersResponse> {
    let filteredCustomers = [...this.customers];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phone.includes(filters.search!) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.gstNumber?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.status === filters.status
      );
    }

    // Sort by total purchases (descending)
    filteredCustomers.sort((a, b) => b.totalPurchases - a.totalPurchases);

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    const total = filteredCustomers.length;
    const totalPages = Math.ceil(total / limit);

    const paginatedCustomers = filteredCustomers.slice(offset, offset + limit);

    return {
      customers: paginatedCustomers,
      total,
      page,
      totalPages
    };
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return this.customers.find(customer => customer.id === id) || null;
  }

  async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.customers.push(newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const customerIndex = this.customers.findIndex(c => c.id === id);
    if (customerIndex === -1) return null;

    const updatedCustomer = {
      ...this.customers[customerIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.customers[customerIndex] = updatedCustomer;
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const customerIndex = this.customers.findIndex(c => c.id === id);
    if (customerIndex === -1) return false;

    this.customers.splice(customerIndex, 1);
    return true;
  }

  async getTopCustomers(limit: number = 10): Promise<Customer[]> {
    return this.customers
      .filter(c => c.status === 'active')
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, limit);
  }

  async getCustomerStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withGST: number;
    withoutGST: number;
    totalRevenue: number;
  }> {
    const total = this.customers.length;
    const active = this.customers.filter(c => c.status === 'active').length;
    const inactive = total - active;
    const withGST = this.customers.filter(c => c.gstNumber).length;
    const withoutGST = total - withGST;
    const totalRevenue = this.customers.reduce((sum, c) => sum + c.totalPurchases, 0);

    return {
      total,
      active,
      inactive,
      withGST,
      withoutGST,
      totalRevenue
    };
  }
}

const customersService = new CustomersService();

// Get all customers with filters and pagination
export const getCustomers: RequestHandler = async (req, res) => {
  try {
    const filters: CustomerFilters = {
      search: req.query.search as string,
      status: req.query.status as "active" | "inactive",
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await customersService.getCustomers(filters);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
};

// Get single customer by ID
export const getCustomerById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customersService.getCustomerById(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer'
    });
  }
};

// Create new customer
export const createCustomer: RequestHandler = async (req, res) => {
  try {
    const customerData = req.body;
    const newCustomer = await customersService.createCustomer(customerData);
    
    res.status(201).json({
      success: true,
      data: newCustomer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer'
    });
  }
};

// Update customer
export const updateCustomer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedCustomer = await customersService.updateCustomer(id, updates);
    
    if (!updatedCustomer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedCustomer,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer'
    });
  }
};

// Delete customer
export const deleteCustomer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await customersService.deleteCustomer(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer'
    });
  }
};

// Get top customers by purchases
export const getTopCustomers: RequestHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const topCustomers = await customersService.getTopCustomers(limit);
    
    res.json({
      success: true,
      data: topCustomers
    });
  } catch (error) {
    console.error('Get top customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top customers'
    });
  }
};

// Get customer statistics
export const getCustomerStats: RequestHandler = async (req, res) => {
  try {
    const stats = await customersService.getCustomerStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer statistics'
    });
  }
};
