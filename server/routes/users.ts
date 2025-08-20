import { RequestHandler } from "express";
import { User, UserFilters, UsersResponse } from "@shared/api";

// Mock users data service
class UsersService {
  private users: User[] = [];

  constructor() {
    this.initializeMockUsers();
  }

  private initializeMockUsers() {
    const roles: User['role'][] = ["admin", "manager", "cashier", "accountant"];
    const names = [
      "John Smith", "Sarah Johnson", "Mike Davis", "Emily Wilson",
      "David Brown", "Lisa Garcia", "Robert Miller", "Jessica Taylor",
      "William Anderson", "Ashley Thomas", "James Martinez", "Jennifer Lee"
    ];
    
    for (let i = 1; i <= 20; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const isActive = Math.random() > 0.1; // 90% are active
      const hasRecentLogin = Math.random() > 0.3; // 70% have recent login
      
      this.users.push({
        id: `user_${i.toString().padStart(3, '0')}`,
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@electromart.com`,
        role,
        isActive,
        lastLogin: hasRecentLogin ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  async getUsers(filters: UserFilters): Promise<UsersResponse> {
    let filteredUsers = [...this.users];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
      );
    }

    if (filters.role) {
      filteredUsers = filteredUsers.filter(user =>
        user.role === filters.role
      );
    }

    if (filters.isActive !== undefined) {
      filteredUsers = filteredUsers.filter(user =>
        user.isActive === filters.isActive
      );
    }

    // Sort by creation date (newest first)
    filteredUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);

    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return {
      users: paginatedUsers,
      total,
      page,
      totalPages
    };
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    const updatedUser = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
    recentlyActive: number;
  }> {
    const total = this.users.length;
    const active = this.users.filter(u => u.isActive).length;
    const inactive = total - active;
    
    const byRole = this.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Users who logged in within the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentlyActive = this.users.filter(u => 
      u.lastLogin && new Date(u.lastLogin) > fiveMinutesAgo
    ).length;

    return {
      total,
      active,
      inactive,
      byRole,
      recentlyActive
    };
  }
}

const usersService = new UsersService();

// Get all users with filters and pagination
export const getUsers: RequestHandler = async (req, res) => {
  try {
    const filters: UserFilters = {
      search: req.query.search as string,
      role: req.query.role as string,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await usersService.getUsers(filters);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// Get single user by ID
export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usersService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
};

// Create new user
export const createUser: RequestHandler = async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await usersService.createUser(userData);
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
};

// Update user
export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedUser = await usersService.updateUser(id, updates);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
};

// Delete user
export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await usersService.deleteUser(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

// Get user statistics
export const getUserStats: RequestHandler = async (req, res) => {
  try {
    const stats = await usersService.getUserStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
};
