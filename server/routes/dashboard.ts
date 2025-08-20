import { RequestHandler } from "express";
import { DashboardStats, NotificationResponse, RecentTransaction } from "@shared/api";

// Mock data service - In a real app, this would connect to a database
class DashboardService {
  // Get comprehensive dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    // In a real app, these would be database queries
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    // Simulate database queries with realistic data
    const todayStats = {
      sales: { 
        amount: Math.floor(Math.random() * 50000) + 20000, // 20k-70k
        transactions: Math.floor(Math.random() * 20) + 5, // 5-25
        change: (Math.random() * 30) - 5 // -5% to +25%
      },
      customers: { 
        new: Math.floor(Math.random() * 15) + 3, // 3-18
        returning: Math.floor(Math.random() * 25) + 10, // 10-35
        change: (Math.random() * 20) + 5 // 5% to 25%
      },
      returnSales: { 
        amount: Math.floor(Math.random() * 3000) + 500, // 500-3500
        count: Math.floor(Math.random() * 5) + 1, // 1-6
        change: (Math.random() * 10) - 8 // -8% to +2%
      },
      target: {
        current: 23450,
        target: 30000,
        percentage: Math.round((23450 / 30000) * 100)
      }
    };

    const overallStats = {
      sales: { 
        amount: Math.floor(Math.random() * 500000) + 1000000, // 1M-1.5M
        transactions: Math.floor(Math.random() * 1000) + 2500, // 2500-3500
        change: (Math.random() * 20) + 5 // 5% to 25%
      },
      customers: { 
        total: Math.floor(Math.random() * 200) + 800, // 800-1000
        active: Math.floor(Math.random() * 150) + 600, // 600-750
        change: (Math.random() * 15) + 3 // 3% to 18%
      },
      products: { 
        total: Math.floor(Math.random() * 300) + 1100, // 1100-1400
        lowStock: Math.floor(Math.random() * 30) + 15, // 15-45
        outOfStock: Math.floor(Math.random() * 10) + 2 // 2-12
      },
      revenue: { 
        thisMonth: Math.floor(Math.random() * 100000) + 300000, // 300k-400k
        lastMonth: Math.floor(Math.random() * 80000) + 250000, // 250k-330k
        growth: 0
      }
    };
    
    // Calculate growth
    overallStats.revenue.growth = ((overallStats.revenue.thisMonth - overallStats.revenue.lastMonth) / overallStats.revenue.lastMonth) * 100;

    const chartData = {
      salesTrend: [
        { month: "Jan", sales: 85000 + Math.floor(Math.random() * 20000), customers: 120 + Math.floor(Math.random() * 30) },
        { month: "Feb", sales: 92000 + Math.floor(Math.random() * 20000), customers: 135 + Math.floor(Math.random() * 30) },
        { month: "Mar", sales: 108000 + Math.floor(Math.random() * 20000), customers: 158 + Math.floor(Math.random() * 30) },
        { month: "Apr", sales: 125000 + Math.floor(Math.random() * 20000), customers: 180 + Math.floor(Math.random() * 30) },
        { month: "May", sales: 134000 + Math.floor(Math.random() * 20000), customers: 195 + Math.floor(Math.random() * 30) },
        { month: "Jun", sales: 145000 + Math.floor(Math.random() * 20000), customers: 210 + Math.floor(Math.random() * 30) }
      ],
      categoryBreakdown: [
        { category: "Mobile", sales: 450000 + Math.floor(Math.random() * 100000), percentage: 36 },
        { category: "AC", sales: 320000 + Math.floor(Math.random() * 80000), percentage: 26 },
        { category: "TV", sales: 280000 + Math.floor(Math.random() * 70000), percentage: 22 },
        { category: "Laptop", sales: 200000 + Math.floor(Math.random() * 60000), percentage: 16 }
      ]
    };

    // Recalculate percentages
    const totalSales = chartData.categoryBreakdown.reduce((sum, cat) => sum + cat.sales, 0);
    chartData.categoryBreakdown.forEach(cat => {
      cat.percentage = Math.round((cat.sales / totalSales) * 100);
    });

    return {
      todayStats,
      overallStats,
      chartData
    };
  }

  // Get notifications
  async getNotifications(): Promise<NotificationResponse[]> {
    const notifications: NotificationResponse[] = [
      {
        id: "1",
        type: "security",
        title: "Multiple Login Detected",
        message: "Admin account logged in from new device (Mobile - Mumbai)",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        read: false,
        severity: "high"
      },
      {
        id: "2",
        type: "deletion",
        title: "Bill Deletion Request",
        message: "Cashier requested deletion of invoice INV-2024-001234",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        read: false,
        severity: "medium",
        actionRequired: true
      },
      {
        id: "3",
        type: "system",
        title: "Low Stock Alert",
        message: `${Math.floor(Math.random() * 30) + 15} products are running low on stock`,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        read: true,
        severity: "low"
      },
      {
        id: "4",
        type: "security",
        title: "Admin Login",
        message: "Main admin logged in from Desktop - Delhi",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        read: true,
        severity: "low"
      }
    ];

    return notifications;
  }

  // Get recent transactions
  async getRecentTransactions(): Promise<RecentTransaction[]> {
    const customers = ["John Doe", "Sarah Smith", "Mike Johnson", "Emily Davis", "David Wilson"];
    const transactions: RecentTransaction[] = [];

    for (let i = 0; i < 5; i++) {
      transactions.push({
        id: `TXN${String(i + 1).padStart(3, '0')}`,
        customer: customers[Math.floor(Math.random() * customers.length)],
        amount: Math.floor(Math.random() * 3000) + 500, // 500-3500
        items: Math.floor(Math.random() * 5) + 1, // 1-6 items
        time: this.getRelativeTime(Math.floor(Math.random() * 120) + 1), // 1-120 minutes ago
        type: Math.random() > 0.3 ? "GST" : "Non-GST",
        status: Math.random() > 0.1 ? "completed" : "pending"
      });
    }

    return transactions;
  }

  private getRelativeTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
  }
}

const dashboardService = new DashboardService();

// Get dashboard statistics
export const getDashboardStats: RequestHandler = async (req, res) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get notifications
export const getNotifications: RequestHandler = async (req, res) => {
  try {
    const notifications = await dashboardService.getNotifications();
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
};

// Get recent transactions
export const getRecentTransactions: RequestHandler = async (req, res) => {
  try {
    const transactions = await dashboardService.getRecentTransactions();
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Recent transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent transactions'
    });
  }
};

// Mark notification as read
export const markNotificationRead: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    // In a real app, update the notification in database
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
};
