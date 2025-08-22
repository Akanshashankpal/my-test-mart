import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBilling } from "@/contexts/BillingContext";
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

// Mock notifications (can be replaced with real notification system later)
const notifications = [
  {
    id: "1",
    type: "system",
    title: "System Status",
    message: "All systems are running normally",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    severity: "low",
  },
];

export default function Dashboard() {
  const { bills, isLoading } = useBilling();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  // Calculate real statistics from bill data
  const calculateStats = () => {
    if (!bills || bills.length === 0) {
      return {
        todayStats: {
          sales: { amount: 0, transactions: 0, change: 0 },
          customers: { total: 0, unique: 0, change: 0 },
          returnSales: { amount: 0, count: 0, change: 0 },
        },
        overallStats: {
          totalRevenue: 0,
          totalCustomers: 0,
          totalTransactions: 0,
          paidRevenue: 0,
          pendingRevenue: 0,
        },
        recentBills: [],
        chartData: {
          gstSales: 0,
          nonGstSales: 0,
          quotationSales: 0,
          totalSales: 0,
        }
      };
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Filter today's bills
    const todayBills = bills.filter(bill => {
      const billDate = new Date(bill.billDate || bill.createdAt);
      return billDate >= todayStart;
    });

    // Calculate today's stats
    const todayRevenue = todayBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const todayCustomers = new Set(todayBills.map(bill => bill.customerPhone)).size;
    const todayTransactions = todayBills.length;

    // Calculate overall stats
    const totalRevenue = bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const paidRevenue = bills.filter(bill => bill.paymentType === "Full")
                            .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const pendingRevenue = bills.reduce((sum, bill) => sum + (bill.remainingAmount || 0), 0);
    const uniqueCustomers = new Set(bills.map(bill => bill.customerPhone)).size;

    // Calculate sales by type
    const gstSales = bills.filter(bill => bill.billType === "GST")
                          .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const nonGstSales = bills.filter(bill => bill.billType === "Non-GST")
                             .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const quotationSales = bills.filter(bill => bill.billType === "Quotation")
                                .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

    // Get recent bills (last 5)
    const recentBills = bills
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      todayStats: {
        sales: { amount: todayRevenue, transactions: todayTransactions, change: 0 },
        customers: { total: todayCustomers, unique: todayCustomers, change: 0 },
        returnSales: { amount: 0, count: 0, change: 0 }, // Will need to track return sales separately
      },
      overallStats: {
        totalRevenue,
        totalCustomers: uniqueCustomers,
        totalTransactions: bills.length,
        paidRevenue,
        pendingRevenue,
      },
      recentBills,
      chartData: {
        gstSales,
        nonGstSales,
        quotationSales,
        totalSales: totalRevenue,
      }
    };
  };

  const stats = calculateStats();

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
          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Today's Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.todayStats.sales.amount)}
              </div>
              <div className="flex items-center gap-1 text-sm mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">Real-time data</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.todayStats.sales.transactions} transactions today
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Today's Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.todayStats.customers.total}
              </div>
              <div className="flex items-center gap-1 text-sm mt-2">
                <Users className="h-3 w-3 text-blue-500" />
                <span className="text-blue-500">Unique customers</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.todayStats.customers.total} served today
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4 text-orange-600" />
                Pending Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.overallStats.pendingRevenue)}
              </div>
              <div className="flex items-center gap-1 text-sm mt-2">
                <TrendingDown className="h-3 w-3 text-orange-500" />
                <span className="text-orange-500">Outstanding</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                From partial payments
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                Collection Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.overallStats.totalRevenue > 0
                  ? ((stats.overallStats.paidRevenue / stats.overallStats.totalRevenue) * 100).toFixed(1)
                  : 0}%
              </div>
              <div className="flex items-center gap-1 text-sm mt-2">
                <span className="text-muted-foreground">Payment success rate</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${stats.overallStats.totalRevenue > 0
                      ? (stats.overallStats.paidRevenue / stats.overallStats.totalRevenue) * 100
                      : 0}%`
                  }}
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
              <div className="text-2xl font-bold">{formatCurrency(stats.overallStats.totalRevenue)}</div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">All time revenue</span>
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
              <div className="text-2xl font-bold">{stats.overallStats.totalCustomers}</div>
              <div className="flex items-center gap-1 text-sm">
                <Users className="h-3 w-3 text-blue-500" />
                <span className="text-blue-500">Unique customers</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Total Bills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overallStats.totalTransactions}</div>
              <div className="flex items-center gap-1 text-sm">
                <Receipt className="h-3 w-3 text-purple-500" />
                <span className="text-purple-500">All transactions</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4" />
                Paid Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.overallStats.paidRevenue)}</div>
              <div className="text-sm text-muted-foreground">
                Collected payments
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
                <div className="w-32 h-32 rounded-full border-8 border-green-500 border-t-blue-500 border-r-purple-500 border-b-orange-500 animate-pulse"></div>
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
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>GST Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Non-GST</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
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
              className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100 hover:shadow-md transition-shadow"
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
                      transaction.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
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
                <div className="font-semibold text-green-600">
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
