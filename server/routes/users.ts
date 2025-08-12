import { RequestHandler } from "express";
import { UserService } from "../services/user-service";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "cashier" | "accountant";
  permissions: {
    canCreateBills: boolean;
    canEditBills: boolean;
    canDeleteBills: boolean;
    canViewReports: boolean;
    canManageUsers: boolean;
    canManageSettings: boolean;
    canProcessReturns: boolean;
    canGiveDiscounts: boolean;
    maxDiscountPercent: number;
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  state: string;
  stateCode: string;
  logo?: string;
  invoiceTemplate: "standard" | "modern" | "minimal";
  invoiceFields: {
    showLogo: boolean;
    showGSTNumber: boolean;
    showEmail: boolean;
    showPhone: boolean;
    showTerms: boolean;
    showSignature: boolean;
  };
  financialYear: {
    startMonth: number; // 1-12
    current: string; // e.g., "2024-25"
  };
  invoiceNumbering: {
    gstPrefix: string;
    nonGstPrefix: string;
    demoPrefix: string;
    resetYearly: boolean;
  };
  taxSettings: {
    defaultGSTRate: number;
    enableRoundOff: boolean;
    decimalPlaces: number;
  };
  updatedBy: string;
  updatedAt: Date;
}

const userService = new UserService();

// Authentication
export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await userService.authenticate(email, password);
    
    if (!result.success) {
      return res.status(401).json({ error: result.message });
    }
    
    res.json({
      token: result.token,
      user: result.user,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    const result = await userService.refreshToken(refreshToken);
    
    if (!result.success) {
      return res.status(401).json({ error: result.message });
    }
    
    res.json({
      token: result.token,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

// User Management
export const getUsers: RequestHandler = async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser: RequestHandler = async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const userData = req.body;
    const newUser = await userService.createUser(userData);
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userRole = req.user?.role;
    const currentUserId = req.user?.id;
    
    // Users can update their own profile, admins can update anyone
    if (userRole !== 'admin' && currentUserId !== id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const updatedUser = await userService.updateUser(id, updates);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    await userService.deleteUser(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Company Settings
export const getSettings: RequestHandler = async (req, res) => {
  try {
    const settings = await userService.getCompanySettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings: RequestHandler = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const updates = req.body;
    const updatedSettings = await userService.updateCompanySettings(updates, userId);
    
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Permission checking
export const checkPermission: RequestHandler = async (req, res) => {
  try {
    const { permission } = req.params;
    const userId = req.user?.id;
    
    const hasPermission = await userService.checkUserPermission(userId, permission);
    
    res.json({ hasPermission });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check permission' });
  }
};

// Role-based route protection middleware
export const requirePermission = (permission: keyof User['permissions']) => {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const hasPermission = await userService.checkUserPermission(userId, permission);
      
      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

export const requireRole = (roles: User['role'][]) => {
  return (req: any, res: any, next: any) => {
    const userRole = req.user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient role permissions' });
    }
    
    next();
  };
};
