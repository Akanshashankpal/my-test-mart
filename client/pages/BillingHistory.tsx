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
  TrendingDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
  paymentType: "Full" | "Partial";
  paymentMethod: "cash" | "online" | "mixed";
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
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
      filtered = filtered.filter(
        (bill) =>
          (bill.billNumber || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (bill.customerName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (bill.customerPhone || "").includes(searchTerm),
      );
    }

    // Status filter - using payment type as status since new structure doesn't have status
    if (statusFilter !== "all") {
      if (statusFilter === "paid") {
        filtered = filtered.filter((bill) => bill.paymentType === "Full");
      } else if (statusFilter === "pending") {
        filtered = filtered.filter(
          (bill) =>
            bill.paymentType === "Partial" || (bill.remainingAmount || 0) > 0,
        );
      }
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((bill) => bill.billType === typeFilter);
    }

    // Payment filter - using payment type
    if (paymentFilter !== "all") {
      if (paymentFilter === "paid") {
        filtered = filtered.filter((bill) => bill.paymentType === "Full");
      } else if (paymentFilter === "pending") {
        filtered = filtered.filter(
          (bill) =>
            bill.paymentType === "Partial" || (bill.remainingAmount || 0) > 0,
        );
      }
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(
        (bill) =>
          new Date(bill.billDate || bill.createdAt) >=
          new Date(dateRange.start),
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        (bill) =>
          new Date(bill.billDate || bill.createdAt) <= new Date(dateRange.end),
      );
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case "billNumber":
            aValue = a.billNumber || "";
            bValue = b.billNumber || "";
            break;
          case "customerName":
            aValue = a.customerName || "";
            bValue = b.customerName || "";
            break;
          case "billDate":
            aValue = new Date(a.billDate || a.createdAt);
            bValue = new Date(b.billDate || b.createdAt);
            break;
          case "billType":
            aValue = a.billType || "";
            bValue = b.billType || "";
            break;
          case "totalAmount":
            aValue = a.totalAmount || 0;
            bValue = b.totalAmount || 0;
            break;
          case "paymentType":
            aValue = a.paymentType || "";
            bValue = b.paymentType || "";
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredBills(filtered);
    setCurrentPage(1);
  }, [
    bills,
    searchTerm,
    statusFilter,
    typeFilter,
    paymentFilter,
    dateRange,
    sortField,
    sortDirection,
  ]);

  // Pagination
  const indexOfLastBill = currentPage * billsPerPage;
  const indexOfFirstBill = indexOfLastBill - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstBill, indexOfLastBill);
  const totalPages = Math.ceil(filteredBills.length / billsPerPage);

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "₹0";
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
    return (
      styles[status.toLowerCase() as keyof typeof styles] || styles.pending
    );
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

  const openEditDialog = (bill: Bill) => {
    setEditBill(bill);
    setEditFormData({
      customerName: bill.customerName || "",
      customerPhone: bill.customerPhone || "",
      customerAddress: bill.customerAddress || "",
      paymentType: bill.paymentType || "Full",
      paymentMethod: bill.paymentMethod || "cash",
      paidAmount: bill.paidAmount || 0,
      observation: bill.observation || "",
    });
  };

  const handleUpdateBill = async () => {
    if (!editBill) {
      console.error('❌ No bill selected for editing');
      return;
    }

    console.log('📝 Editing bill:', editBill);
    console.log('🆔 Bill ID:', editBill.id);

    const updates = {
      customerName: editFormData.customerName,
      customerPhone: editFormData.customerPhone,
      customerAddress: editFormData.customerAddress,
      paymentType: editFormData.paymentType,
      paymentMethod: editFormData.paymentMethod,
      paidAmount: editFormData.paidAmount,
      observation: editFormData.observation,
    };

    console.log('📤 Sending updates:', updates);

    const success = await updateBill(editBill.id, updates);
    if (success) {
      console.log('✅ Bill updated successfully');
      setEditBill(null);
      setEditFormData({
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        paymentType: "Full",
        paymentMethod: "cash",
        paidAmount: 0,
        observation: "",
      });
    } else {
      console.error('❌ Bill update failed');
    }
  };

  const downloadBillPDF = async (bill: Bill) => {
    try {
      // Dynamic import of jsPDF
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Color scheme
      const primaryColor = [27, 94, 32]; // Dark Green
      const secondaryColor = [117, 117, 117]; // Grey
      const accentColor = [21, 71, 24]; // Very Dark Green
      const lightGray = [245, 245, 245];
      const darkGray = [66, 66, 66];

      // Header Background
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, "F");

      // Company Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("SAVERA ELECTRONIC", pageWidth / 2, 20, { align: "center" });

      // Tagline
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Quality Electronics & Professional Service",
        pageWidth / 2,
        28,
        { align: "center" },
      );

      // Invoice Title
      doc.setTextColor(...accentColor);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", pageWidth / 2, 50, { align: "center" });

      // Invoice Details Box
      doc.setFillColor(...lightGray);
      doc.roundedRect(15, 60, 80, 35, 3, 3, "F");

      doc.setTextColor(...darkGray);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Invoice Details:", 20, 70);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Invoice No: ${bill.billNumber}`, 20, 77);
      doc.text(`Date: ${formatDate(bill.billDate || bill.createdAt)}`, 20, 84);
      doc.text(`Type: ${bill.billType} Billing`, 20, 91);

      // Customer Details Box
      doc.setFillColor(...lightGray);
      doc.roundedRect(110, 60, 80, 35, 3, 3, "F");

      doc.setTextColor(...darkGray);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Bill To:", 115, 70);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(bill.customerName, 115, 77);
      doc.text(`Phone: ${bill.customerPhone}`, 115, 84);
      if (bill.customerAddress) {
        const addressLines = bill.customerAddress.match(/.{1,30}/g) || [
          bill.customerAddress,
        ];
        doc.text(addressLines[0], 115, 91);
      }

      // Items Table Header
      let yPos = 110;
      doc.setFillColor(...secondaryColor);
      doc.rect(15, yPos, 175, 15, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");

      // Table headers based on bill type
      if (bill.billType === "GST") {
        doc.text("Item Description", 20, yPos + 10);
        doc.text("Qty", 100, yPos + 10, { align: "center" });
        doc.text("Rate (₹)", 120, yPos + 10, { align: "center" });
        doc.text("GST%", 140, yPos + 10, { align: "center" });
        doc.text("GST Amt (₹)", 160, yPos + 10, { align: "center" });
        doc.text("Total (₹)", 180, yPos + 10, { align: "right" });
      } else {
        doc.text("Item Description", 20, yPos + 10);
        doc.text("Qty", 110, yPos + 10, { align: "center" });
        doc.text("Rate (₹)", 140, yPos + 10, { align: "center" });
        doc.text("Total (₹)", 180, yPos + 10, { align: "right" });
      }

      yPos += 20;

      // Items
      doc.setTextColor(...darkGray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      bill.items.forEach((item, index) => {
        // Alternating row colors
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(15, yPos - 5, 175, 12, "F");
        }

        const itemTotal = item.itemPrice * item.itemQuantity;

        if (bill.billType === "GST") {
          const gstAmount = (itemTotal * bill.gstPercent) / 100;
          const totalWithGst = itemTotal + gstAmount;

          doc.text(item.itemName.substring(0, 35), 20, yPos);
          doc.text(item.itemQuantity.toString(), 100, yPos, {
            align: "center",
          });
          doc.text(`₹${item.itemPrice.toLocaleString()}`, 120, yPos, {
            align: "center",
          });
          doc.text(`${bill.gstPercent}%`, 140, yPos, { align: "center" });
          doc.text(`₹${gstAmount.toLocaleString()}`, 160, yPos, {
            align: "center",
          });
          doc.text(`₹${totalWithGst.toLocaleString()}`, 180, yPos, {
            align: "right",
          });
        } else {
          doc.text(item.itemName.substring(0, 45), 20, yPos);
          doc.text(item.itemQuantity.toString(), 110, yPos, {
            align: "center",
          });
          doc.text(`₹${item.itemPrice.toLocaleString()}`, 140, yPos, {
            align: "center",
          });
          doc.text(`₹${itemTotal.toLocaleString()}`, 180, yPos, {
            align: "right",
          });
        }

        yPos += 12;
      });

      // Table border
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(1);
      doc.rect(15, 110, 175, yPos - 110);

      // Totals Section
      yPos += 15;
      const totalsStartX = 120;

      // Totals box background
      doc.setFillColor(...lightGray);
      doc.roundedRect(totalsStartX - 5, yPos - 5, 70, 55, 3, 3, "F");

      doc.setTextColor(...darkGray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      // Subtotal
      doc.text("Subtotal:", totalsStartX, yPos);
      doc.text(`₹${bill.subtotal.toLocaleString()}`, 185, yPos, {
        align: "right",
      });
      yPos += 8;

      // Discount
      if (bill.discountAmount > 0) {
        doc.setTextColor(220, 38, 127); // Pink for discount
        doc.text("Discount:", totalsStartX, yPos);
        doc.text(`-₹${bill.discountAmount.toLocaleString()}`, 185, yPos, {
          align: "right",
        });
        doc.setTextColor(...darkGray);
        yPos += 8;
      }

      // GST breakdown
      if (bill.billType === "GST" && bill.gstAmount > 0) {
        doc.text("CGST (9%):", totalsStartX, yPos);
        doc.text(`₹${(bill.gstAmount / 2).toLocaleString()}`, 185, yPos, {
          align: "right",
        });
        yPos += 6;

        doc.text("SGST (9%):", totalsStartX, yPos);
        doc.text(`₹${(bill.gstAmount / 2).toLocaleString()}`, 185, yPos, {
          align: "right",
        });
        yPos += 6;

        doc.setFont("helvetica", "bold");
        doc.text("Total GST:", totalsStartX, yPos);
        doc.text(`₹${bill.gstAmount.toLocaleString()}`, 185, yPos, {
          align: "right",
        });
        doc.setFont("helvetica", "normal");
        yPos += 10;
      }

      // Final Amount
      doc.setFillColor(...primaryColor);
      doc.roundedRect(totalsStartX - 5, yPos - 3, 70, 12, 3, 3, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Final Amount:", totalsStartX, yPos + 5);
      doc.text(`₹${bill.totalAmount.toLocaleString()}`, 185, yPos + 5, {
        align: "right",
      });

      // Payment Status
      yPos += 20;
      if (bill.paymentType === "Full") {
        doc.setFillColor(76, 175, 80); // Green
        doc.setTextColor(255, 255, 255);
        doc.roundedRect(15, yPos, 50, 10, 2, 2, "F");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("PAID", 40, yPos + 7, { align: "center" });
      } else {
        doc.setFillColor(255, 152, 0); // Orange
        doc.setTextColor(255, 255, 255);
        doc.roundedRect(15, yPos, 50, 10, 2, 2, "F");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("PENDING", 40, yPos + 7, { align: "center" });

        if (bill.remainingAmount > 0) {
          doc.setTextColor(...darkGray);
          doc.setFont("helvetica", "normal");
          doc.text(
            `Remaining: ₹${bill.remainingAmount.toLocaleString()}`,
            70,
            yPos + 7,
          );
        }
      }

      // Footer
      yPos = pageHeight - 30;
      doc.setFillColor(...primaryColor);
      doc.rect(0, yPos, pageWidth, 30, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Thank you for your business!", pageWidth / 2, yPos + 15, {
        align: "center",
      });

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Savera Electronic - Your trusted electronics partner",
        pageWidth / 2,
        yPos + 22,
        { align: "center" },
      );

      // Save the PDF
      doc.save(`Savera_Electronic_Invoice_${bill.billNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const calculateStats = () => {
    const totalRevenue = filteredBills.reduce(
      (sum, bill) => sum + (bill.totalAmount || 0),
      0,
    );
    const paidBills = filteredBills.filter((b) => b.paymentType === "Full");
    const paidRevenue = paidBills.reduce(
      (sum, bill) => sum + (bill.totalAmount || 0),
      0,
    );
    const pendingRevenue = filteredBills.reduce(
      (sum, bill) => sum + (bill.remainingAmount || 0),
      0,
    );

    return {
      totalBills: filteredBills.length,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      gstBills: filteredBills.filter((b) => b.billType === "GST").length,
      nonGstBills: filteredBills.filter((b) => b.billType === "Non-GST").length,
      quotationBills: filteredBills.filter((b) => b.billType === "Quotation")
        .length,
    };
  };

  const stats = calculateStats();

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Billing History
          </h2>
          <p className="text-muted-foreground">
            View and manage all generated invoices
          </p>
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
              GST: {stats.gstBills} | Non-GST: {stats.nonGstBills} | Quotation:{" "}
              {stats.quotationBills}
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
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
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
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.paidRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">
              {((stats.paidRevenue / stats.totalRevenue) * 100).toFixed(1)}% of
              total
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
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.pendingRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">
              {((stats.pendingRevenue / stats.totalRevenue) * 100).toFixed(1)}%
              of total
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
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              placeholder="Start date"
            />

            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
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
          <div className="overflow-x-auto scrollbar-visible">
            <table className="w-full min-w-[800px]">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium">
                    <button
                      onClick={() => handleSort("billNumber")}
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      Bill Number
                      {getSortIcon("billNumber")}
                    </button>
                  </th>
                  <th className="p-4 font-medium">
                    <button
                      onClick={() => handleSort("customerName")}
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      Customer
                      {getSortIcon("customerName")}
                    </button>
                  </th>
                  <th className="p-4 font-medium">
                    <button
                      onClick={() => handleSort("billDate")}
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      Date
                      {getSortIcon("billDate")}
                    </button>
                  </th>
                  <th className="p-4 font-medium">
                    <button
                      onClick={() => handleSort("billType")}
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      Type
                      {getSortIcon("billType")}
                    </button>
                  </th>
                  <th className="p-4 font-medium">
                    <button
                      onClick={() => handleSort("totalAmount")}
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      Amount
                      {getSortIcon("totalAmount")}
                    </button>
                  </th>
                  <th className="p-4 font-medium">
                    <button
                      onClick={() => handleSort("paymentType")}
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      Payment
                      {getSortIcon("paymentType")}
                    </button>
                  </th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBills.map((bill) => (
                  <tr key={bill.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="font-medium">
                        {bill.billNumber || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(bill.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {bill.customerName || "Unknown"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {bill.customerPhone || "No phone"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {formatDate(bill.billDate || bill.createdAt)}
                      </div>
                      {(bill.remainingAmount || 0) > 0 && (
                        <div className="text-sm text-red-600">
                          Pending: {formatCurrency(bill.remainingAmount)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={cn("text-xs", getTypeBadge(bill.billType))}
                      >
                        {bill.billType}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {formatCurrency(bill.totalAmount)}
                      </div>
                      {(bill.discountAmount || 0) > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Discount: {formatCurrency(bill.discountAmount)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={cn(
                          "text-xs",
                          getPaymentBadge(
                            bill.paymentType === "Full" ? "paid" : "pending",
                          ),
                        )}
                      >
                        {bill.paymentType === "Full" ? "Paid" : "Pending"}
                      </Badge>
                      {bill.paymentMethod && (
                        <div className="text-sm text-muted-foreground">
                          via {bill.paymentMethod}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={cn(
                          "text-xs",
                          getStatusBadge(
                            bill.paymentType === "Full" ? "paid" : "sent",
                          ),
                        )}
                      >
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
                          onClick={() => openEditDialog(bill)}
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
              Showing {indexOfFirstBill + 1} to{" "}
              {Math.min(indexOfLastBill, filteredBills.length)} of{" "}
              {filteredBills.length} bills
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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
                      <span className="font-medium">
                        {selectedBill.billNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge
                        className={cn(
                          "text-xs",
                          getTypeBadge(selectedBill.billType),
                        )}
                      >
                        {selectedBill.billType}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">
                        {formatDate(
                          selectedBill.billDate || selectedBill.createdAt,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment:</span>
                      <Badge
                        className={cn(
                          "text-xs",
                          getPaymentBadge(
                            selectedBill.paymentType === "Full"
                              ? "paid"
                              : "pending",
                          ),
                        )}
                      >
                        {selectedBill.paymentType === "Full"
                          ? "Paid"
                          : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium">
                        {selectedBill.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="font-medium">
                        {selectedBill.customerPhone}
                      </span>
                    </div>
                    {selectedBill.customerAddress && (
                      <div className="flex justify-between">
                        <span>Address:</span>
                        <span className="font-medium">
                          {selectedBill.customerAddress}
                        </span>
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
                      <tr key={`${item.itemName}-${index}-${item.itemPrice}`} className="border-t">
                        <td className="p-3">{item.itemName}</td>
                        <td className="p-3 text-right">{item.itemQuantity}</td>
                        <td className="p-3 text-right">
                          {formatCurrency(item.itemPrice)}
                        </td>
                        <td className="p-3 text-right">
                          {formatCurrency(item.itemPrice * item.itemQuantity)}
                        </td>
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
                      <span>
                        -{formatCurrency(selectedBill.discountAmount)}
                      </span>
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
                      <span>
                        {formatCurrency(selectedBill.remainingAmount)}
                      </span>
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
                <Button
                  variant="outline"
                  onClick={() => selectedBill && downloadBillPDF(selectedBill)}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedBill) {
                      openEditDialog(selectedBill);
                      setSelectedBill(null); // Close the details dialog
                    }
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Bill Dialog */}
      <Dialog open={!!editBill} onOpenChange={() => setEditBill(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bill - {editBill?.billNumber}</DialogTitle>
          </DialogHeader>
          {editBill && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h4 className="font-semibold">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-customerName">Customer Name *</Label>
                    <Input
                      id="edit-customerName"
                      value={editFormData.customerName}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          customerName: e.target.value,
                        }))
                      }
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-customerPhone">Phone Number *</Label>
                    <Input
                      id="edit-customerPhone"
                      value={editFormData.customerPhone}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          customerPhone: e.target.value,
                        }))
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-customerAddress">Address</Label>
                  <Input
                    id="edit-customerAddress"
                    value={editFormData.customerAddress}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        customerAddress: e.target.value,
                      }))
                    }
                    placeholder="Enter customer address"
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h4 className="font-semibold">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-paymentType">Payment Type</Label>
                    <Select
                      value={editFormData.paymentType}
                      onValueChange={(value: "Full" | "Partial") =>
                        setEditFormData((prev) => ({
                          ...prev,
                          paymentType: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full">Full Payment</SelectItem>
                        <SelectItem value="Partial">Partial Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-paymentMethod">Payment Method</Label>
                    <Select
                      value={editFormData.paymentMethod}
                      onValueChange={(value: "cash" | "online" | "mixed") =>
                        setEditFormData((prev) => ({
                          ...prev,
                          paymentMethod: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {editFormData.paymentType === "Partial" && (
                  <div>
                    <Label htmlFor="edit-paidAmount">Paid Amount (₹)</Label>
                    <Input
                      id="edit-paidAmount"
                      type="number"
                      min="0"
                      max={editBill?.totalAmount || 0}
                      value={editFormData.paidAmount}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          paidAmount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="Enter paid amount"
                    />
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h4 className="font-semibold">Additional Information</h4>
                <div>
                  <Label htmlFor="edit-observation">Observation</Label>
                  <textarea
                    id="edit-observation"
                    value={editFormData.observation}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        observation: e.target.value,
                      }))
                    }
                    placeholder="Add any notes or observations..."
                    className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none text-sm"
                  />
                </div>
              </div>

              {/* Bill Summary (Read-only) */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Bill Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(editBill.subtotal)}</span>
                  </div>
                  {(editBill.discountAmount || 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(editBill.discountAmount)}</span>
                    </div>
                  )}
                  {(editBill.gstAmount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span>GST ({editBill.gstPercent}%):</span>
                      <span>{formatCurrency(editBill.gstAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(editBill.totalAmount)}</span>
                  </div>
                  {editFormData.paymentType === "Partial" && (
                    <div className="flex justify-between text-red-600">
                      <span>Remaining:</span>
                      <span>
                        {formatCurrency(
                          (editBill.totalAmount || 0) - editFormData.paidAmount,
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setEditBill(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateBill}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Update Bill
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteBillId}
        onOpenChange={() => setDeleteBillId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill? This action cannot be
              undone and will remove all associated data.
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
