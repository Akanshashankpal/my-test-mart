import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Target,
  Activity,
  Zap,
  Eye,
  Download,
  RefreshCcw,
  PieChart,
  LineChart,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  Phone,
  Mail,
  MapPin,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface DashboardMetrics {
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
}

interface RecentActivity {
  id: string;
  type:
    | "bill_created"
    | "payment_received"
    | "customer_added"
    | "product_added";
  description: string;
  amount?: number;
  time: Date;
  status: "success" | "warning" | "info";
}

interface TopCustomer {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  billsCount: number;
  lastBillDate: Date;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  quantitySold: number;
  revenue: number;
  profitMargin: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  bills: number;
  customers: number;
}

interface PaymentMethod {
  method: string;
  amount: number;
  percentage: number;
}

// Mock data
const mockMetrics: DashboardMetrics = {
  totalSales: 1250000,
  totalCustomers: 245,
  totalProducts: 156,
  pendingPayments: 185000,
  totalRevenue: 1435000,
  paidRevenue: 1250000,
  pendingRevenue: 185000,
  monthlyGrowth: 12.5,
  billsThisMonth: 89,
  newCustomersThisMonth: 23,
  averageOrderValue: 14500,
  topSellingProduct: "iPhone 15 Pro",
  totalBills: 342,
  gstBills: 287,
  nonGstBills: 45,
  quotations: 10,
  overduePayments: 45000,
  partialPayments: 65000,
};

const mockRecentActivity: RecentActivity[] = [
  {
    id: "1",
    type: "bill_created",
    description: "New bill created for John Doe - GST/24/0156",
    amount: 129999,
    time: new Date(Date.now() - 1000 * 60 * 15),
    status: "success",
  },
  {
    id: "2",
    type: "payment_received",
    description: "Payment received from Sarah Smith via UPI",
    amount: 85000,
    time: new Date(Date.now() - 1000 * 60 * 45),
    status: "success",
  },
  {
    id: "3",
    type: "customer_added",
    description: "New customer registered - Rajesh Kumar",
    time: new Date(Date.now() - 1000 * 60 * 120),
    status: "info",
  },
  {
    id: "4",
    type: "bill_created",
    description: "Quotation created for bulk order - QUO/24/0023",
    amount: 456000,
    time: new Date(Date.now() - 1000 * 60 * 180),
    status: "info",
  },
  {
    id: "5",
    type: "payment_received",
    description: "Partial payment received from Mike Johnson",
    amount: 50000,
    time: new Date(Date.now() - 1000 * 60 * 240),
    status: "warning",
  },
];

const mockTopCustomers: TopCustomer[] = [
  {
    id: "1",
    name: "John Doe",
    phone: "+91 9876543210",
    totalSpent: 485000,
    billsCount: 8,
    lastBillDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: "2",
    name: "Sarah Smith",
    phone: "+91 9876543211",
    totalSpent: 320000,
    billsCount: 12,
    lastBillDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  {
    id: "3",
    name: "Rajesh Kumar",
    phone: "+91 9876543212",
    totalSpent: 275000,
    billsCount: 6,
    lastBillDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: "4",
    name: "Priya Sharma",
    phone: "+91 9876543213",
    totalSpent: 195000,
    billsCount: 4,
    lastBillDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: "5",
    name: "Mike Johnson",
    phone: "+91 9876543214",
    totalSpent: 145000,
    billsCount: 3,
    lastBillDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
];

const mockTopProducts: TopProduct[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    category: "Mobile",
    quantitySold: 45,
    revenue: 5849955,
    profitMargin: 18.5,
  },
  {
    id: "2",
    name: "Samsung Galaxy S24",
    category: "Mobile",
    quantitySold: 38,
    revenue: 3799962,
    profitMargin: 16.2,
  },
  {
    id: "3",
    name: "Dell Laptop i5",
    category: "Computer",
    quantitySold: 25,
    revenue: 1649975,
    profitMargin: 22.8,
  },
  {
    id: "4",
    name: "LG 1.5 Ton Split AC",
    category: "Appliances",
    quantitySold: 18,
    revenue: 827982,
    profitMargin: 28.5,
  },
  {
    id: "5",
    name: "AirPods Pro",
    category: "Accessories",
    quantitySold: 67,
    revenue: 1674933,
    profitMargin: 35.2,
  },
];

const mockMonthlyData: MonthlyData[] = [
  { month: "Jul 2024", revenue: 980000, bills: 65, customers: 18 },
  { month: "Aug 2024", revenue: 1120000, bills: 72, customers: 22 },
  { month: "Sep 2024", revenue: 1290000, bills: 78, customers: 19 },
  { month: "Oct 2024", revenue: 1350000, bills: 82, customers: 25 },
  { month: "Nov 2024", revenue: 1420000, bills: 86, customers: 21 },
  { month: "Dec 2024", revenue: 1250000, bills: 89, customers: 23 },
];

const mockPaymentMethods: PaymentMethod[] = [
  { method: "UPI", amount: 520000, percentage: 41.6 },
  { method: "Cash", amount: 385000, percentage: 30.8 },
  { method: "Card", amount: 245000, percentage: 19.6 },
  { method: "Bank Transfer", amount: 75000, percentage: 6.0 },
  { method: "Cheque", amount: 25000, percentage: 2.0 },
];

export default function EnhancedDashboard() {
  const [metrics] = useState<DashboardMetrics>(mockMetrics);
  const [recentActivity] = useState<RecentActivity[]>(mockRecentActivity);
  const [topCustomers] = useState<TopCustomer[]>(mockTopCustomers);
  const [topProducts] = useState<TopProduct[]>(mockTopProducts);
  const [monthlyData] = useState<MonthlyData[]>(mockMonthlyData);
  const [paymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [selectedTab, setSelectedTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(1)}Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`;
    } else if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "bill_created":
        return <FileText className="h-4 w-4" />;
      case "payment_received":
        return <DollarSign className="h-4 w-4" />;
      case "customer_added":
        return <Users className="h-4 w-4" />;
      case "product_added":
        return <Package className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: RecentActivity["status"]) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-orange-600 bg-orange-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => (window.location.href = "/bill-creator")}>
            <FileText className="h-4 w-4 mr-2" />
            New Bill
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics.totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+{metrics.monthlyGrowth}%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                +{metrics.newCustomersThisMonth}
              </span>{" "}
              new this month
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Top seller: {metrics.topSellingProduct}
            </p>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatNumber(metrics.pendingPayments)}
            </div>
            <p className="text-xs text-muted-foreground">Requires follow-up</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(metrics.paidRevenue)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Paid Revenue
                </div>
                <div className="text-xs text-muted-foreground">
                  {((metrics.paidRevenue / metrics.totalRevenue) * 100).toFixed(
                    1,
                  )}
                  % of total
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(metrics.pendingRevenue)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Pending Revenue
                </div>
                <div className="text-xs text-muted-foreground">
                  {(
                    (metrics.pendingRevenue / metrics.totalRevenue) *
                    100
                  ).toFixed(1)}
                  % of total
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatNumber(metrics.totalRevenue)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Revenue
                </div>
                <div className="text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 inline mr-1" />+
                  {metrics.monthlyGrowth}% growth
                </div>
              </div>
            </div>

            {/* Monthly Revenue Chart Simulation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Monthly Revenue Trend</span>
                <span className="text-muted-foreground">Last 6 months</span>
              </div>
              <div className="grid grid-cols-6 gap-2 h-32">
                {monthlyData.map((data, index) => {
                  const height =
                    (data.revenue /
                      Math.max(...monthlyData.map((d) => d.revenue))) *
                    100;
                  return (
                    <div
                      key={data.month}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="flex-1 w-8 bg-gray-100 rounded-t relative flex items-end">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground transform -rotate-45 origin-top-left">
                        {data.month.split(" ")[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bills Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bills Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Bills</span>
                <Badge variant="outline">{metrics.totalBills}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">GST Bills</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {metrics.gstBills}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Non-GST Bills</span>
                <Badge className="bg-purple-100 text-purple-800">
                  {metrics.nonGstBills}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Quotations</span>
                <Badge className="bg-indigo-100 text-indigo-800">
                  {metrics.quotations}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">This Month</span>
                <span className="font-medium">{metrics.billsThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Order Value</span>
                <span className="font-medium">
                  {formatCurrency(metrics.averageOrderValue)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-600">Overdue Payments</span>
                <span className="font-medium text-orange-600">
                  {formatNumber(metrics.overduePayments)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-600">Partial Payments</span>
                <span className="font-medium text-yellow-600">
                  {formatNumber(metrics.partialPayments)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed sections */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        getActivityColor(activity.status),
                      )}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(activity.time)}
                        </span>
                        {activity.amount && (
                          <span className="text-xs font-medium text-green-600">
                            {formatCurrency(activity.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Methods Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.method}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {method.method === "UPI" && (
                          <Smartphone className="h-4 w-4" />
                        )}
                        {method.method === "Cash" && (
                          <Banknote className="h-4 w-4" />
                        )}
                        {method.method === "Card" && (
                          <CreditCard className="h-4 w-4" />
                        )}
                        {method.method === "Bank Transfer" && (
                          <Building className="h-4 w-4" />
                        )}
                        {method.method === "Cheque" && (
                          <FileText className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {method.method}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatNumber(method.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {method.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Top Customers</CardTitle>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Manage Customers
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.billsCount} bills • Last:{" "}
                        {customer.lastBillDate.toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Top Selling Products</CardTitle>
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Manage Products
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-medium text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.category} • {product.quantitySold} units sold
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatNumber(product.revenue)}
                      </div>
                      <div className="text-sm text-green-600">
                        {product.profitMargin}% margin
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Payment Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Paid</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatNumber(metrics.paidRevenue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(
                          (metrics.paidRevenue / metrics.totalRevenue) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Partial</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-600">
                        {formatNumber(metrics.partialPayments)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(
                          (metrics.partialPayments / metrics.totalRevenue) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Pending</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-600">
                        {formatNumber(
                          metrics.pendingRevenue -
                            metrics.partialPayments -
                            metrics.overduePayments,
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(
                          ((metrics.pendingRevenue -
                            metrics.partialPayments -
                            metrics.overduePayments) /
                            metrics.totalRevenue) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Overdue</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">
                        {formatNumber(metrics.overduePayments)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(
                          (metrics.overduePayments / metrics.totalRevenue) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collection Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Collection Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {(
                        (metrics.paidRevenue / metrics.totalRevenue) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Collection Rate
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Average Collection Time</span>
                      <span className="font-medium">12 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fastest Collection</span>
                      <span className="font-medium">Same day</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Slowest Collection</span>
                      <span className="font-medium">45 days</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">
                      Monthly Collection Trend
                    </h4>
                    <div className="grid grid-cols-6 gap-1 h-16">
                      {monthlyData.map((data, index) => {
                        const collectionRate = 85 + Math.random() * 10; // Simulated data
                        return (
                          <div
                            key={data.month}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className="flex-1 w-6 bg-gray-100 rounded-t relative flex items-end">
                              <div
                                className="w-full bg-gradient-to-t from-green-400 to-green-500 rounded-t"
                                style={{ height: `${collectionRate}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {data.month.split(" ")[0]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <Button
              variant="outline"
              className="h-16 flex-col gap-2"
              onClick={() => (window.location.href = "/bill-creator")}
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs">New Bill</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-2"
              onClick={() => (window.location.href = "/customers")}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Add Customer</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-2"
              onClick={() => (window.location.href = "/products")}
            >
              <Package className="h-5 w-5" />
              <span className="text-xs">Add Product</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-2"
              onClick={() => (window.location.href = "/billing-history")}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">View Reports</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-2"
              onClick={() => (window.location.href = "/settings")}
            >
              <Target className="h-5 w-5" />
              <span className="text-xs">Settings</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Download className="h-5 w-5" />
              <span className="text-xs">Export Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
