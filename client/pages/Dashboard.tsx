import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Clock,
  AlertCircle,
  Calendar,
  Eye,
  CheckCircle,
  X,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Star,
  ShieldAlert,
  Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";

// Enhanced mock data for comprehensive dashboard
const todayStats = {
  sales: { amount: 23450, transactions: 12, change: 18.5 },
  customers: { new: 8, returning: 15, change: 12.0 },
  returnSales: { amount: 1200, count: 2, change: -5.2 },
};

const overallStats = {
  sales: { amount: 1250420, transactions: 3247, change: 12.5 },
  customers: { total: 892, active: 654, change: 8.3 },
  products: { total: 1240, lowStock: 23, outOfStock: 5 },
  revenue: { thisMonth: 345670, lastMonth: 298450, growth: 15.8 },
};

const chartData = {
  salesTrend: [
    { month: "Jan", sales: 85000, customers: 120 },
    { month: "Feb", sales: 92000, customers: 135 },
    { month: "Mar", sales: 108000, customers: 158 },
    { month: "Apr", sales: 125000, customers: 180 },
    { month: "May", sales: 134000, customers: 195 },
    { month: "Jun", sales: 145000, customers: 210 },
  ],
  categoryBreakdown: [
    { category: "Mobile", sales: 450000, percentage: 36 },
    { category: "AC", sales: 320000, percentage: 26 },
    { category: "TV", sales: 280000, percentage: 22 },
    { category: "Laptop", sales: 200000, percentage: 16 },
  ],
};

const notifications = [
  {
    id: "1",
    type: "security",
    title: "Multiple Login Detected",
    message: "Admin account logged in from new device (Mobile - Mumbai)",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    severity: "high",
  },
  {
    id: "2",
    type: "deletion",
    title: "Bill Deletion Request",
    message: "Cashier requested deletion of invoice INV-2024-001234",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false,
    severity: "medium",
    actionRequired: true,
  },
  {
    id: "3",
    type: "system",
    title: "Low Stock Alert",
    message: "23 products are running low on stock",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: true,
    severity: "low",
  },
  {
    id: "4",
    type: "security",
    title: "Admin Login",
    message: "Main admin logged in from Desktop - Delhi",
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    read: true,
    severity: "low",
  },
];

const recentTransactions = [
  {
    id: "TXN001",
    customer: "John Doe",
    amount: 2450,
    items: 3,
    time: "2 min ago",
    type: "GST",
    status: "completed",
  },
  {
    id: "TXN002",
    customer: "Sarah Smith",
    amount: 1200,
    items: 1,
    time: "15 min ago",
    type: "Non-GST",
    status: "completed",
  },
  {
    id: "TXN003",
    customer: "Mike Johnson",
    amount: 850,
    items: 2,
    time: "1 hour ago",
    type: "GST",
    status: "pending",
  },
];

export default function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(
    notifications.filter(n => !n.read).length
  );

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "security":
        return <ShieldAlert className="h-4 w-4" />;
      case "deletion":
        return <AlertCircle className="h-4 w-4" />;
      case "system":
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="px-4 pb-4 pt-0 space-y-4">
      {/* Header with Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Business Dashboard</h2>
          <p className="text-muted-foreground">Monitor your business performance and key metrics</p>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
          
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <div className="space-y-0">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border-b hover:bg-muted/50 transition-colors",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        getSeverityColor(notification.severity)
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        {notification.actionRequired && (
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              <X className="h-3 w-3" />
                              Deny
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Today's Statistics */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Today's Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Today's Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(todayStats.sales.amount)}
              </div>
              <div className="flex items-center gap-1 text-sm mt-2">
                <TrendingUp className="h-3 w-3 text-blue-600" />
                <span className="text-blue-600">+{todayStats.sales.change}%</span>
                <span className="text-muted-foreground">vs yesterday</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {todayStats.sales.transactions} transactions
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Today's Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {todayStats.customers.new + todayStats.customers.returning}
              </div>
              <div className="flex items-center gap-1 text-sm mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+{todayStats.customers.change}%</span>
                <span className="text-muted-foreground">vs yesterday</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {todayStats.customers.new} new, {todayStats.customers.returning} returning
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Today Return Sale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(todayStats.returnSales.amount)}
              </div>
              <div className="flex items-center gap-1 text-sm mt-2">
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span className="text-red-500">{todayStats.returnSales.change}%</span>
                <span className="text-muted-foreground">vs yesterday</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {todayStats.returnSales.count} return transactions
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-600" />
                Daily Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">78%</div>
              <div className="flex items-center gap-1 text-sm mt-2">
                <span className="text-muted-foreground">₹30,000 target</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "78%" }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Overall Statistics */} 
      <div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Overall Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overallStats.sales.amount)}</div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-3 w-3 text-electric-green" />
                <span className="text-electric-green">+{overallStats.sales.change}%</span>
                <span className="text-muted-foreground">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.customers.total}</div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-3 w-3 text-electric-green" />
                <span className="text-electric-green">+{overallStats.customers.change}%</span>
                <span className="text-muted-foreground">growth</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Rs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overallStats.sales.amount + overallStats.revenue.thisMonth)}</div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-3 w-3 text-electric-green" />
                <span className="text-electric-green">+{overallStats.revenue.growth}%</span>
                <span className="text-muted-foreground">total value</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4" />
                Monthly Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-electric-purple">+{overallStats.revenue.growth}%</div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(overallStats.revenue.thisMonth)} this month
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Sales Trend (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.salesTrend.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-12">{data.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-3 relative">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                        style={{
                          width: `${(data.sales / Math.max(...chartData.salesTrend.map(d => d.sales))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-20 text-right">
                    {formatCurrency(data.sales)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Donut Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Sales Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <div className="w-32 h-32 rounded-full border-8 border-electric-blue border-t-electric-purple border-r-electric-orange border-b-electric-green animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold">₹12.5L</div>
                    <div className="text-xs text-muted-foreground">Total Sales</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-electric-blue rounded-full"></div>
                <span>GST Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-electric-purple rounded-full"></div>
                <span>Non-GST</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-electric-orange rounded-full"></div>
                <span>Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-electric-green rounded-full"></div>
                <span>Pending</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bills */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Recent Bills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-electric-blue/5 to-white rounded-lg border border-electric-blue/20 hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{transaction.customer}</span>
                  <Badge
                    variant={transaction.type === "GST" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {transaction.type}
                  </Badge>
                  <Badge
                    variant={transaction.status === "completed" ? "default" : "secondary"}
                    className={cn(
                      "text-xs",
                      transaction.status === "completed" ? "bg-electric-green/20 text-electric-green" : "bg-yellow-100 text-yellow-800"
                    )}
                  >
                    {transaction.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{transaction.id}</span>
                  <span>{transaction.items} items</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {transaction.time}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-electric-blue">
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
