import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useBilling } from "@/contexts/BillingContext";
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
  DialogTrigger,
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
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  Download,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Printer,
  RefreshCcw,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Bill {
  id: string;
  billNumber: string;
  billType: "GST" | "Non-GST" | "Quotation";
  billDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  pincode?: string;
  items: {
    itemName: string;
    itemPrice: number;
    itemQuantity: number;
    itemTotal?: number;
  }[];
  subtotal: number;
  discountAmount: number;
  afterDiscount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentType: 'Full' | 'Partial';
  paymentMethod: 'cash' | 'online' | 'mixed';
  observation?: string;
  termsAndConditions?: string;
  stateKey: string;
  createdAt: string;
  updatedAt?: string;
}

// Using real API data from BillingContext

export default function BillingHistory() {
  const { bills, deleteBill, updateBill } = useBilling();
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [editFormData, setEditFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    paymentType: "Full" as "Full" | "Partial",
    paymentMethod: "cash" as "cash" | "online" | "mixed",
    paidAmount: 0,
    observation: "",
  });
  const [deleteBillId, setDeleteBillId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [billsPerPage] = useState(10);

  // Sync with bills from context
  useEffect(() => {
    if (bills && Array.isArray(bills)) {
      setFilteredBills(bills);
    }
  }, [bills]);

  // Apply filters
  useEffect(() => {
    if (!bills || !Array.isArray(bills)) {
      setFilteredBills([]);
      return;
    }
    let filtered = [...bills];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bill =>
        (bill.billNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.customerPhone || '').includes(searchTerm)
      );
    }

    // Status filter - using payment type as status since new structure doesn't have status
    if (statusFilter !== "all") {
      if (statusFilter === "paid") {
        filtered = filtered.filter(bill => bill.paymentType === "Full");
      } else if (statusFilter === "pending") {
        filtered = filtered.filter(bill => bill.paymentType === "Partial" || (bill.remainingAmount || 0) > 0);
      }
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(bill => bill.billType === typeFilter);
    }

    // Payment filter - using payment type
    if (paymentFilter !== "all") {
      if (paymentFilter === "paid") {
        filtered = filtered.filter(bill => bill.paymentType === "Full");
      } else if (paymentFilter === "pending") {
        filtered = filtered.filter(bill => bill.paymentType === "Partial" || (bill.remainingAmount || 0) > 0);
      }
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(bill => new Date(bill.billDate || bill.createdAt) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(bill => new Date(bill.billDate || bill.createdAt) <= new Date(dateRange.end));
    }

    setFilteredBills(filtered);
    setCurrentPage(1);
  }, [bills, searchTerm, statusFilter, typeFilter, paymentFilter, dateRange]);

  // Pagination
  const indexOfLastBill = currentPage * billsPerPage;
  const indexOfFirstBill = indexOfLastBill - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstBill, indexOfLastBill);
  const totalPages = Math.ceil(filteredBills.length / billsPerPage);

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₹0';
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: "bg-green-100 text-green-800 border-green-200",
      sent: "bg-blue-100 text-blue-800 border-blue-200",
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status.toLowerCase() as keyof typeof styles] || styles.draft;
  };

  const getPaymentBadge = (status: string) => {
    const styles = {
      paid: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      partial: "bg-orange-100 text-orange-800 border-orange-200",
      overdue: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status.toLowerCase() as keyof typeof styles] || styles.pending;
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      gst: "bg-green-100 text-green-800 border-green-200",
      "non-gst": "bg-blue-100 text-blue-800 border-blue-200",
      demo: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return styles[type.toLowerCase() as keyof typeof styles] || styles.gst;
  };

  const handleDelete = (billId: string) => {
    deleteBill(billId);
    setDeleteBillId(null);
  };

  const downloadBillPDF = async (bill: Bill) => {
    try {
      // Dynamic import of jsPDF
      const { default: jsPDF } = await import('jspdf');

      const doc = new jsPDF();

      // Company Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('ElectroMart', 105, 20, { align: 'center' });

      doc.setFontSize(16);
      doc.text('INVOICE', 105, 30, { align: 'center' });

      // Invoice details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice No: ${bill.billNumber}`, 20, 45);
      doc.text(`Date: ${formatDate(bill.billDate || bill.createdAt)}`, 20, 52);
      doc.text(`Mode: ${bill.billType} Billing`, 20, 59);

      // Customer Info
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To:', 20, 75);
      doc.setFont('helvetica', 'normal');
      doc.text(bill.customerName, 20, 82);
      doc.text(`Phone: ${bill.customerPhone}`, 20, 89);
      if (bill.customerAddress) {
        doc.text(`Address: ${bill.customerAddress}`, 20, 96);
      }

      // Table Headers
      let yPos = 115;
      doc.setFont('helvetica', 'bold');
      doc.text('Item', 20, yPos);
      doc.text('Qty', 80, yPos);
      doc.text('Rate (₹)', 100, yPos);
      if (bill.billType === 'GST') {
        doc.text('GST%', 130, yPos);
        doc.text('GST Amt (₹)', 150, yPos);
        doc.text('Total (₹)', 175, yPos);
      } else {
        doc.text('Total (₹)', 150, yPos);
      }

      // Draw line under headers
      doc.line(20, yPos + 2, 190, yPos + 2);
      yPos += 10;

      // Items
      doc.setFont('helvetica', 'normal');
      bill.items.forEach(item => {
        doc.text(item.itemName.substring(0, 25), 20, yPos);
        doc.text(item.itemQuantity.toString(), 80, yPos);
        doc.text(item.itemPrice.toLocaleString(), 100, yPos);
        if (bill.billType === 'GST') {
          doc.text(`${bill.gstPercent}%`, 130, yPos);
          doc.text((item.itemPrice * item.itemQuantity * bill.gstPercent / 100).toLocaleString(), 150, yPos);
          doc.text((item.itemPrice * item.itemQuantity * (1 + bill.gstPercent / 100)).toLocaleString(), 175, yPos);
        } else {
          doc.text((item.itemPrice * item.itemQuantity).toLocaleString(), 150, yPos);
        }
        yPos += 8;
      });

      // Totals section
      yPos += 10;
      doc.line(100, yPos, 190, yPos);
      yPos += 8;

      doc.text('Subtotal:', 130, yPos);
      doc.text(`₹${bill.subtotal.toLocaleString()}`, 175, yPos);
      yPos += 6;

      if (bill.discountAmount > 0) {
        doc.text(`Discount:`, 130, yPos);
        doc.text(`-₹${bill.discountAmount.toLocaleString()}`, 175, yPos);
        yPos += 6;
      }

      if (bill.billType === 'GST' && bill.gstAmount > 0) {
        doc.text('CGST (9%):', 130, yPos);
        doc.text(`₹${(bill.gstAmount / 2).toLocaleString()}`, 175, yPos);
        yPos += 6;

        doc.text('SGST (9%):', 130, yPos);
        doc.text(`₹${(bill.gstAmount / 2).toLocaleString()}`, 175, yPos);
        yPos += 6;

        doc.text('Total GST:', 130, yPos);
        doc.text(`₹${bill.gstAmount.toLocaleString()}`, 175, yPos);
        yPos += 8;
      }

      // Final total
      doc.line(130, yPos, 190, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Final Amount:', 130, yPos);
      doc.text(`₹${bill.totalAmount.toLocaleString()}`, 175, yPos);

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for your business!', 105, 280, { align: 'center' });

      // Save the PDF
      doc.save(`Invoice_${bill.billNumber}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const calculateStats = () => {
    const totalRevenue = filteredBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const paidBills = filteredBills.filter(b => b.paymentType === "Full");
    const paidRevenue = paidBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const pendingRevenue = filteredBills.reduce((sum, bill) => sum + (bill.remainingAmount || 0), 0);

    return {
      totalBills: filteredBills.length,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      gstBills: filteredBills.filter(b => b.billType === "GST").length,
      nonGstBills: filteredBills.filter(b => b.billType === "Non-GST").length,
      quotationBills: filteredBills.filter(b => b.billType === "Quotation").length,
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Billing History</h2>
          <p className="text-muted-foreground">View and manage all generated invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBills}</div>
            <div className="text-sm text-muted-foreground">
              GST: {stats.gstBills} | Non-GST: {stats.nonGstBills} | Quotation: {stats.quotationBills}
            </div>
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
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+12.5%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Paid Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidRevenue)}</div>
            <div className="text-sm text-muted-foreground">
              {((stats.paidRevenue / stats.totalRevenue) * 100).toFixed(1)}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              Pending Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pendingRevenue)}</div>
            <div className="text-sm text-muted-foreground">
              {((stats.pendingRevenue / stats.totalRevenue) * 100).toFixed(1)}% of total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="GST">GST</SelectItem>
                <SelectItem value="Non-GST">Non-GST</SelectItem>
                <SelectItem value="Quotation">Quotation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              placeholder="Start date"
            />

            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              placeholder="End date"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bills ({filteredBills.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium">Bill Number</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Payment</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBills.map((bill) => (
                  <tr key={bill.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="font-medium">{bill.billNumber || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(bill.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{bill.customerName || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">
                        {bill.customerPhone || 'No phone'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{formatDate(bill.billDate || bill.createdAt)}</div>
                      {(bill.remainingAmount || 0) > 0 && (
                        <div className="text-sm text-red-600">
                          Pending: {formatCurrency(bill.remainingAmount)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge className={cn("text-xs", getTypeBadge(bill.billType))}>
                        {bill.billType}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{formatCurrency(bill.totalAmount)}</div>
                      {(bill.discountAmount || 0) > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Discount: {formatCurrency(bill.discountAmount)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge className={cn("text-xs", getPaymentBadge(bill.paymentType === "Full" ? "paid" : "pending"))}>
                        {bill.paymentType === "Full" ? "Paid" : "Pending"}
                      </Badge>
                      {bill.paymentMethod && (
                        <div className="text-sm text-muted-foreground">
                          via {bill.paymentMethod}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge className={cn("text-xs", getStatusBadge(bill.paymentType === "Full" ? "paid" : "sent"))}>
                        {bill.paymentType === "Full" ? "Paid" : "Sent"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBill(bill)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadBillPDF(bill)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteBillId(bill.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstBill + 1} to {Math.min(indexOfLastBill, filteredBills.length)} of {filteredBills.length} bills
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill Details Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill Details - {selectedBill?.billNumber}</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-6">
              {/* Bill Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Bill Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bill Number:</span>
                      <span className="font-medium">{selectedBill.billNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge className={cn("text-xs", getTypeBadge(selectedBill.billType))}>
                        {selectedBill.billType}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{formatDate(selectedBill.billDate || selectedBill.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment:</span>
                      <Badge className={cn("text-xs", getPaymentBadge(selectedBill.paymentType === "Full" ? "paid" : "pending"))}>
                        {selectedBill.paymentType === "Full" ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium">{selectedBill.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="font-medium">{selectedBill.customerPhone}</span>
                    </div>
                    {selectedBill.customerAddress && (
                      <div className="flex justify-between">
                        <span>Address:</span>
                        <span className="font-medium">{selectedBill.customerAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <table className="w-full border rounded-lg">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{item.itemName}</td>
                        <td className="p-3 text-right">{item.itemQuantity}</td>
                        <td className="p-3 text-right">{formatCurrency(item.itemPrice)}</td>
                        <td className="p-3 text-right">{formatCurrency(item.itemPrice * item.itemQuantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-80 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedBill.subtotal)}</span>
                  </div>
                  {(selectedBill.discountAmount || 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(selectedBill.discountAmount)}</span>
                    </div>
                  )}
                  {(selectedBill.gstAmount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span>GST ({selectedBill.gstPercent}%):</span>
                      <span>{formatCurrency(selectedBill.gstAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedBill.totalAmount)}</span>
                  </div>
                  {(selectedBill.remainingAmount || 0) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Remaining:</span>
                      <span>{formatCurrency(selectedBill.remainingAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button>
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" onClick={() => selectedBill && downloadBillPDF(selectedBill)}>
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              </div>
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
              Are you sure you want to delete this bill? This action cannot be undone and will remove all associated data.
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
