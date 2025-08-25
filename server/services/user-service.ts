import { User } from "../routes/users";

export interface AuthResult {
  success: boolean;
  message?: string;
  token?: string;
  user?: Omit<User, 'permissions'>;
  expiresIn?: string;
}

export interface RefreshResult {
  success: boolean;
  message?: string;
  token?: string;
  expiresIn?: string;
}

export class UserService {
  // Mock users for development - in production this would be a database
  private readonly mockUsers: User[] = [
    {
      id: "1",
      email: "admin@electromart.com",
      name: "Admin User",
      role: "admin",
      permissions: {
        canCreateBills: true,
        canEditBills: true,
        canDeleteBills: true,
        canViewReports: true,
        canManageUsers: true,
        canManageSettings: true,
        canProcessReturns: true,
        canGiveDiscounts: true,
        maxDiscountPercent: 100,
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      email: "manager@electromart.com",
      name: "Manager User",
      role: "manager",
      permissions: {
        canCreateBills: true,
        canEditBills: true,
        canDeleteBills: false,
        canViewReports: true,
        canManageUsers: false,
        canManageSettings: true,
        canProcessReturns: true,
        canGiveDiscounts: true,
        maxDiscountPercent: 20,
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      email: "cashier@electromart.com",
      name: "Cashier User",
      role: "cashier",
      permissions: {
        canCreateBills: true,
        canEditBills: false,
        canDeleteBills: false,
        canViewReports: false,
        canManageUsers: false,
        canManageSettings: false,
        canProcessReturns: false,
        canGiveDiscounts: true,
        maxDiscountPercent: 5,
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Mock password for all users (in production, use proper hashing)
  private readonly mockPassword = "password123";

  async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      // Find user by email
      const user = this.mockUsers.find(u => u.email === email && u.isActive);
      
      if (!user) {
        return {
          success: false,
          message: "Invalid email or password"
        };
      }

      // Check password (in production, use proper password verification)
      if (password !== this.mockPassword) {
        return {
          success: false,
          message: "Invalid email or password"
        };
      }

      // Generate mock token (in production, use proper JWT)
      const token = `mock-token-${user.id}-${Date.now()}`;

      // Update last login
      user.lastLogin = new Date();

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        expiresIn: "24h"
      };
    } catch (error) {
      return {
        success: false,
        message: "Authentication failed"
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshResult> {
    // Mock refresh token logic
    return {
      success: true,
      token: `refreshed-${refreshToken}-${Date.now()}`,
      expiresIn: "24h"
    };
  }

  async getAllUsers(): Promise<User[]> {
    return this.mockUsers.filter(u => u.isActive);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.mockUsers.find(u => u.id === id && u.isActive) || null;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const newUser: User = {
      id: (this.mockUsers.length + 1).toString(),
      email: userData.email || '',
      name: userData.name || '',
      role: userData.role || 'cashier',
      permissions: userData.permissions || {
        canCreateBills: true,
        canEditBills: false,
        canDeleteBills: false,
        canViewReports: false,
        canManageUsers: false,
        canManageSettings: false,
        canProcessReturns: false,
        canGiveDiscounts: false,
        maxDiscountPercent: 0,
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockUsers.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    this.mockUsers[userIndex] = {
      ...this.mockUsers[userIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return this.mockUsers[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) return false;

    this.mockUsers[userIndex].isActive = false;
    this.mockUsers[userIndex].updatedAt = new Date();
    return true;
  }

  async checkUserPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    return (user.permissions as any)[permission] || false;
  }

  async getCompanySettings(): Promise<any> {
    // Mock company settings
    return {
      id: "1",
      companyName: "ElectroMart",
      address: "123 Electronics Street, Tech City",
      phone: "+1-234-567-8900",
      email: "info@electromart.com",
      gstNumber: "GST123456789",
      state: "California",
      stateCode: "CA",
      invoiceTemplate: "modern",
      invoiceFields: {
        showLogo: true,
        showGSTNumber: true,
        showEmail: true,
        showPhone: true,
        showTerms: true,
        showSignature: false,
      },
      financialYear: {
        startMonth: 4,
        current: "2024-25"
      },
      invoiceNumbering: {
        gstPrefix: "EM-GST-",
        nonGstPrefix: "EM-",
        demoPrefix: "DEMO-",
        resetYearly: true,
      },
      taxSettings: {
        defaultGSTRate: 18,
        enableRoundOff: true,
        decimalPlaces: 2,
      },
      updatedBy: "admin",
      updatedAt: new Date(),
    };
  }

  async updateCompanySettings(updates: any, userId: string): Promise<any> {
    // Mock update - in production, this would update the database
    const settings = await this.getCompanySettings();
    return {
      ...settings,
      ...updates,
      updatedBy: userId,
      updatedAt: new Date(),
    };
  }
}
