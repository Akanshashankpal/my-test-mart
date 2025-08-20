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
import { useQuery } from "@tanstack/react-query";
import { DashboardStats, NotificationResponse, RecentTransaction, ApiResponse } from "@shared/api";

// API functions
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch('/api/dashboard/stats');
  const data: ApiResponse<DashboardStats> = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch dashboard stats');
  return data.data!;
};

const fetchNotifications = async (): Promise<NotificationResponse[]> => {
  const response = await fetch('/api/dashboard/notifications');
  const data: ApiResponse<NotificationResponse[]> = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch notifications');
  return data.data!;
};

const fetchRecentTransactions = async (): Promise<RecentTransaction[]> => {
  const response = await fetch('/api/dashboard/transactions');
  const data: ApiResponse<RecentTransaction[]> = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch transactions');
  return data.data!;
};

export default function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch dashboard data using React Query
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: recentTransactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: fetchRecentTransactions,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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
        return "text-gray-800 bg-gray-50 border-gray-200";
      case "medium":
        return "text-gray-700 bg-gray-50 border-gray-200";
      case "low":
        return "text-gray-700 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (statsError) {
    return (
      <div className="px-4 pb-4 pt-0 space-y-4">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">We couldn't load your dashboard data. Please try refreshing the page.</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

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
                {notificationsLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  notifications.map((notification) => (
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
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {statsLoading ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
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
                    {formatCurrency(dashboardStats?.todayStats.sales.amount || 0)}
                  </div>
                  <div className="flex items-center gap-1 text-sm mt-2">
                    <TrendingUp className="h-3 w-3 text-gray-700" />
                    <span className="text-gray-700">+{dashboardStats?.todayStats.sales.change.toFixed(1) || 0}%</span>
                    <span className="text-muted-foreground">vs yesterday</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {dashboardStats?.todayStats.sales.transactions || 0} transactions
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
                    {(dashboardStats?.todayStats.customers.new || 0) + (dashboardStats?.todayStats.customers.returning || 0)}
                  </div>
                  <div className="flex items-center gap-1 text-sm mt-2">
                    <TrendingUp className="h-3 w-3 text-gray-700" />
                    <span className="text-gray-700">+{dashboardStats?.todayStats.customers.change.toFixed(1) || 0}%</span>
                    <span className="text-muted-foreground">vs yesterday</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {dashboardStats?.todayStats.customers.new || 0} new, {dashboardStats?.todayStats.customers.returning || 0} returning
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
                    {formatCurrency(dashboardStats?.todayStats.returnSales.amount || 0)}
                  </div>
                  <div className="flex items-center gap-1 text-sm mt-2">
                    <TrendingDown className="h-3 w-3 text-gray-700" />
                    <span className="text-gray-700">{dashboardStats?.todayStats.returnSales.change.toFixed(1) || 0}%</span>
                    <span className="text-muted-foreground">vs yesterday</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {dashboardStats?.todayStats.returnSales.count || 0} return transactions
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
                  <div className="text-2xl font-bold text-emerald-600">
                    {dashboardStats?.todayStats.target.percentage || 0}%
                  </div>
                  <div className="flex items-center gap-1 text-sm mt-2">
                    <span className="text-muted-foreground">
                      ₹{dashboardStats?.todayStats.target.target?.toLocaleString() || '30,000'} target
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full" 
                      style={{ width: `${dashboardStats?.todayStats.target.percentage || 0}%` }}
                    ></div>
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
                  <div className="text-2xl font-bold">{formatCurrency(dashboardStats?.overallStats.sales.amount || 0)}</div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="h-3 w-3 text-gray-700" />
                    <span className="text-gray-700">+{dashboardStats?.overallStats.sales.change.toFixed(1) || 0}%</span>
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
                  <div className="text-2xl font-bold">{dashboardStats?.overallStats.customers.total || 0}</div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="h-3 w-3 text-gray-700" />
                    <span className="text-gray-700">+{dashboardStats?.overallStats.customers.change.toFixed(1) || 0}%</span>
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
                  <div className="text-2xl font-bold">
                    {formatCurrency((dashboardStats?.overallStats.sales.amount || 0) + (dashboardStats?.overallStats.revenue.thisMonth || 0))}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="h-3 w-3 text-gray-700" />
                    <span className="text-gray-700">+{dashboardStats?.overallStats.revenue.growth.toFixed(1) || 0}%</span>
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
                  <div className="text-2xl font-bold text-black">+{dashboardStats?.overallStats.revenue.growth.toFixed(1) || 0}%</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(dashboardStats?.overallStats.revenue.thisMonth || 0)} this month
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
                  {dashboardStats?.chartData.salesTrend.map((data, index) => (
                    <div key={data.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-12">{data.month}</span>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-3 relative">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                            style={{
                              width: `${(data.sales / Math.max(...(dashboardStats?.chartData.salesTrend.map(d => d.sales) || [1]))) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground w-20 text-right">
                        {formatCurrency(data.sales)}
                      </span>
                    </div>
                  )) || []}
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
                    <div className="w-32 h-32 rounded-full border-8 border-blue-500 border-t-purple-500 border-r-orange-500 border-b-gray-500 animate-pulse"></div>
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
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>GST Sales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Non-GST</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Returns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
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
              {transactionsLoading ? (
                <div className="text-center py-4 text-gray-500">Loading transactions...</div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No recent transactions</div>
              ) : (
                recentTransactions.map((transaction) => (
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
                            transaction.status === "completed" ? "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-700"
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
                      <div className="font-semibold text-black">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
