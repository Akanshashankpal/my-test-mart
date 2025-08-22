import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Download,
  Eye,
  Edit,
  Trash2,
  Receipt,
  FileText,
  DollarSign,
  Clock,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { billsAPI } from '@/lib/api';

interface Bill {
  id: string;
  billNumber: string;
  billType: "GST" | "Non-GST" | "Demo";
  billDate: string;
  dueDate?: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
  items: {
    productId: string;
    productName: string;
    quantity: number;
    rate: number;
    totalAmount: number;
  }[];
  subtotal: number;
  totalTax: number;
  finalAmount: number;
  paymentStatus: "Paid" | "Pending" | "Partial" | "Overdue";
  status: "Draft" | "Sent" | "Paid" | "Cancelled";
  paymentMethod?: string;
  notes?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function EnhancedBillingHistory() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [billTypeFilter, setBillTypeFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [deleteBillId, setDeleteBillId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch bills from API
  const fetchBills = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        billType: billTypeFilter !== 'all' ? billTypeFilter : undefined,
        paymentStatus: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined
      };

      const response = await billsAPI.getBills(params);
      
      if (response.bills) {
        setBills(response.bills);
        setPagination({
          page: response.page || 1,
          limit: response.limit || 10,
          total: response.total || 0,
          totalPages: response.totalPages || 0
        });
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills(1);
  }, [searchTerm, statusFilter, billTypeFilter, paymentStatusFilter, dateRange]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        fetchBills(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Partial":
        return "bg-blue-100 text-blue-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      case "Cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return <Check className="h-3 w-3" />;
      case "Pending":
      case "Partial":
        return <Clock className="h-3 w-3" />;
      case "Overdue":
        return <Clock className="h-3 w-3" />;
      case "Cancelled":
        return <Trash2 className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const handleDelete = async (billId: string) => {
    try {
      await billsAPI.deleteBill(billId);
      setDeleteBillId(null);
      fetchBills(pagination.page);
    } catch (error) {
      console.error('Error deleting bill:', error);
      alert('Error deleting bill');
    }
  };

  const handleGeneratePDF = async (bill: Bill) => {
    try {
      const pdfBlob = await billsAPI.generatePDF(bill.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Bill-${bill.billNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchBills(newPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalRevenue = bills
    .filter(bill => bill.paymentStatus === "Paid")
    .reduce((sum, bill) => sum + bill.finalAmount, 0);

  const pendingAmount = bills
    .filter(bill => bill.paymentStatus === "Pending" || bill.paymentStatus === "Overdue")
    .reduce((sum, bill) => sum + bill.finalAmount, 0);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Billing History</h2>
          <p className="text-muted-foreground">View and manage all billing transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => window.open('/enhanced-billing', '_blank')}>
            <Plus className="h-4 w-4 mr-2" />
            New Bill
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Total Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Check className="h-4 w-4" />
              Paid Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bills.filter(bill => bill.paymentStatus === "Paid").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by bill number, customer name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={billTypeFilter} onValueChange={setBillTypeFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="GST">GST</SelectItem>
                    <SelectItem value="Non-GST">Non-GST</SelectItem>
                    <SelectItem value="Demo">Demo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Date Range:</label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-40"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-40"
                />
                {(dateRange.start || dateRange.end) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({ start: "", end: "" })}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bills List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading bills...</p>
            </CardContent>
          </Card>
        ) : bills.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bills found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        ) : (
          bills.map(bill => (
            <Card key={bill.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Receipt className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{bill.billNumber}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatDate(bill.billDate)}</span>
                          <Badge variant="outline">{bill.billType}</Badge>
                          <Badge className={cn("flex items-center gap-1", getStatusBadgeColor(bill.paymentStatus))}>
                            {getStatusIcon(bill.paymentStatus)}
                            {bill.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Customer:</span>
                        <p className="font-semibold">{bill.customer.name}</p>
                        <p className="text-xs text-muted-foreground">{bill.customer.phone}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Items:</span>
                        <p className="font-semibold">{bill.items.length} product(s)</p>
                        <p className="text-xs text-muted-foreground">
                          {bill.items.slice(0, 2).map(item => item.productName).join(", ")}
                          {bill.items.length > 2 && ` +${bill.items.length - 2} more`}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-semibold text-lg">{formatCurrency(bill.finalAmount)}</p>
                        {bill.billType === "GST" && (
                          <p className="text-xs text-muted-foreground">Tax: {formatCurrency(bill.totalTax)}</p>
                        )}
                      </div>
                    </div>

                    {bill.dueDate && bill.paymentStatus !== "Paid" && (
                      <div className="mt-3 text-sm">
                        <span className="text-muted-foreground">Due Date: </span>
                        <span className={cn(
                          "font-medium",
                          bill.paymentStatus === "Overdue" ? "text-red-600" : "text-foreground"
                        )}>
                          {formatDate(bill.dueDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingBill(bill)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGeneratePDF(bill)}
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/enhanced-billing?edit=${bill.id}`, '_blank')}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteBillId(bill.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && bills.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} bills
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                    const pageNumber = Math.max(1, pagination.page - 2) + index;
                    if (pageNumber > pagination.totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="w-8"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Bill Dialog */}
      <Dialog open={!!viewingBill} onOpenChange={() => setViewingBill(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bill Details
            </DialogTitle>
          </DialogHeader>
          {viewingBill && (
            <div className="space-y-6">
              {/* Bill Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{viewingBill.billNumber}</h3>
                  <p className="text-muted-foreground">{formatDate(viewingBill.billDate)}</p>
                </div>
                <Badge className={cn("flex items-center gap-1", getStatusBadgeColor(viewingBill.paymentStatus))}>
                  {getStatusIcon(viewingBill.paymentStatus)}
                  {viewingBill.paymentStatus}
                </Badge>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium">{viewingBill.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{viewingBill.customer.phone}</p>
                  {viewingBill.customer.email && (
                    <p className="text-sm text-muted-foreground">{viewingBill.customer.email}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{viewingBill.customer.address}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="space-y-2">
                  {viewingBill.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatCurrency(item.rate)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.totalAmount)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(viewingBill.subtotal)}</span>
                </div>
                {viewingBill.billType === "GST" && (
                  <div className="flex justify-between">
                    <span>Total Tax:</span>
                    <span>{formatCurrency(viewingBill.totalTax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Final Amount:</span>
                  <span>{formatCurrency(viewingBill.finalAmount)}</span>
                </div>
              </div>

              {viewingBill.paymentMethod && (
                <div>
                  <span className="text-muted-foreground">Payment Method: </span>
                  <span className="font-medium">{viewingBill.paymentMethod}</span>
                </div>
              )}

              {viewingBill.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{viewingBill.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteBillId} onOpenChange={() => setDeleteBillId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBillId && handleDelete(deleteBillId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
