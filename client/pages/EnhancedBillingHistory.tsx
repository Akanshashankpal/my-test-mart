import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  Share,
  BarChart3,
  PieChart,
  Activity,
  CreditCard,
  Banknote,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableHeaderCell,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableCell,
  MobileTableCard,
  MobileTableRowItem,
  useResponsiveTable,
} from "@/components/ui/responsive-table";

// Types
interface Bill {
  id: string;
  billNumber: string;
  billType: "GST" | "Non-GST" | "Quotation";
  billDate: Date;
  dueDate?: Date;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    state: string;
    gstNumber?: string;
  };
  company: {
    name: string;
    gstNumber: string;
    state: string;
  };
  items: {
    productName: string;
    hsnCode?: string;
    quantity: number;
    rate: number;
    unit: string;
    gstRate: number;
    discount: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalAmount: number;
  }[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalTax: number;
  roundOffAmount: number;
  finalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  payments: {
    id: string;
    method: "Cash" | "UPI" | "Card" | "Bank Transfer" | "Cheque";
    amount: number;
    date: Date;
    reference?: string;
    notes?: string;
  }[];
  paymentStatus: "Paid" | "Pending" | "Partial" | "Overdue";
  paymentMethod?: string;
  notes?: string;
  terms?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: "Draft" | "Sent" | "Paid" | "Cancelled";
}

// Mock data with enhanced structure
const mockBills: Bill[] = [
  {
    id: "1",
    billNumber: "GST/24/0001",
    billType: "GST",
    billDate: new Date("2024-01-20"),
    dueDate: new Date("2024-02-20"),
    customer: {
      id: "1",
      name: "John Doe",
      phone: "+91 9876543210",
      email: "john@example.com",
      address: "123 Main Street, Koramangala, Bangalore",
      state: "Karnataka",
      gstNumber: "29ABCDE1234F1Z5",
    },
    company: {
      name: "ElectroMart Pvt Ltd",
      gstNumber: "29ABCDE1234F1Z5",
      state: "Karnataka",
    },
    items: [
      {
        productName: "iPhone 15 Pro",
        hsnCode: "8517",
        quantity: 1,
        rate: 129999,
        unit: "pcs",
        gstRate: 18,
        discount: 0,
        taxableAmount: 129999,
        cgstAmount: 11699.91,
        sgstAmount: 11699.91,
        igstAmount: 0,
        totalAmount: 153398.82,
      },
      {
        productName: "AirPods Pro",
        hsnCode: "8518",
        quantity: 1,
        rate: 24999,
        unit: "pcs",
        gstRate: 18,
        discount: 0,
        taxableAmount: 24999,
        cgstAmount: 2249.91,
        sgstAmount: 2249.91,
        igstAmount: 0,
        totalAmount: 29498.82,
      },
    ],
    subtotal: 154998,
    discountPercent: 3.2,
    discountAmount: 4959.94,
    taxableAmount: 150038.06,
    cgstTotal: 13503.43,
    sgstTotal: 13503.43,
    igstTotal: 0,
    totalTax: 27006.86,
    roundOffAmount: 0.08,
    finalAmount: 177045,
    paidAmount: 177045,
    pendingAmount: 0,
    payments: [
      {
        id: "p1",
        method: "Card",
        amount: 177045,
        date: new Date("2024-01-20"),
        reference: "TXN123456789",
        notes: "Full payment via credit card",
      },
    ],
    paymentStatus: "Paid",
    notes: "Customer satisfied with purchase",
    terms: "Warranty: 1 year\nReturn policy: 7 days",
    createdBy: "Sarah Wilson",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
    status: "Paid",
  },
  {
    id: "2",
    billNumber: "NGST/24/0001",
    billType: "Non-GST",
    billDate: new Date("2024-01-19"),
    customer: {
      id: "2",
      name: "Sarah Smith",
      phone: "+91 9876543211",
      address: "456 Park Avenue, Connaught Place, Delhi",
      state: "Delhi",
    },
    company: {
      name: "ElectroMart Pvt Ltd",
      gstNumber: "29ABCDE1234F1Z5",
      state: "Karnataka",
    },
    items: [
      {
        productName: "Phone Cover",
        quantity: 2,
        rate: 500,
        unit: "pcs",
        gstRate: 0,
        discount: 0,
        taxableAmount: 1000,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalAmount: 1000,
      },
    ],
    subtotal: 1000,
    discountPercent: 0,
    discountAmount: 0,
    taxableAmount: 1000,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    totalTax: 0,
    roundOffAmount: 0,
    finalAmount: 1000,
    paidAmount: 0,
    pendingAmount: 1000,
    payments: [],
    paymentStatus: "Pending",
    createdBy: "Mike Johnson",
    createdAt: new Date("2024-01-19"),
    updatedAt: new Date("2024-01-19"),
    status: "Sent",
  },
  {
    id: "3",
    billNumber: "GST/24/0002",
    billType: "GST",
    billDate: new Date("2024-01-18"),
    dueDate: new Date("2024-02-18"),
    customer: {
      id: "3",
      name: "Rajesh Kumar",
      phone: "+91 9876543212",
      email: "rajesh@example.com",
      address: "789 Market Street, Andheri West, Mumbai",
      state: "Maharashtra",
      gstNumber: "27ABCDE5678F1Z1",
    },
    company: {
      name: "ElectroMart Pvt Ltd",
      gstNumber: "29ABCDE1234F1Z5",
      state: "Karnataka",
    },
    items: [
      {
        productName: "Samsung Galaxy S24",
        hsnCode: "8517",
        quantity: 1,
        rate: 99999,
        unit: "pcs",
        gstRate: 18,
        discount: 2,
        taxableAmount: 97999.02,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 17639.82,
        totalAmount: 115638.84,
      },
    ],
    subtotal: 99999,
    discountPercent: 2,
    discountAmount: 1999.98,
    taxableAmount: 97999.02,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 17639.82,
    totalTax: 17639.82,
    roundOffAmount: 0.34,
    finalAmount: 115639,
    paidAmount: 50000,
    pendingAmount: 65639,
    payments: [
      {
        id: "p2",
        method: "UPI",
        amount: 50000,
        date: new Date("2024-01-18"),
        reference: "UPI789123456",
        notes: "Partial payment advance",
      },
    ],
    paymentStatus: "Partial",
    notes: "Balance payment due before delivery",
    terms: "Delivery after full payment",
    createdBy: "Admin User",
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-19"),
    status: "Sent",
  },
  {
    id: "4",
    billNumber: "QUO/24/0001",
    billType: "Quotation",
    billDate: new Date("2024-01-17"),
    dueDate: new Date("2024-02-16"),
    customer: {
      id: "4",
      name: "Priya Sharma",
      phone: "+91 9876543213",
      email: "priya@example.com",
      address: "321 Tech Park, Sector 62, Noida",
      state: "Uttar Pradesh",
    },
    company: {
      name: "ElectroMart Pvt Ltd",
      gstNumber: "29ABCDE1234F1Z5",
      state: "Karnataka",
    },
    items: [
      {
        productName: "Dell Laptop i5",
        hsnCode: "8471",
        quantity: 5,
        rate: 65999,
        unit: "pcs",
        gstRate: 18,
        discount: 5,
        taxableAmount: 313495.25,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 56429.15,
        totalAmount: 369924.4,
      },
      {
        productName: "Wireless Mouse",
        hsnCode: "8471",
        quantity: 5,
        rate: 1999,
        unit: "pcs",
        gstRate: 18,
        discount: 0,
        taxableAmount: 9995,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 1799.1,
        totalAmount: 11794.1,
      },
    ],
    subtotal: 339990,
    discountPercent: 7.8,
    discountAmount: 26519.22,
    taxableAmount: 313470.78,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 56424.74,
    totalTax: 56424.74,
    roundOffAmount: 0.48,
    finalAmount: 369896,
    paidAmount: 0,
    pendingAmount: 369896,
    payments: [],
    paymentStatus: "Pending",
    notes: "Bulk order quotation for corporate client",
    terms:
      "Valid for 30 days\nDelivery: 7-10 working days\nPayment: 50% advance, 50% on delivery",
    createdBy: "Sales Team",
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
    status: "Sent",
  },
];

export default function EnhancedBillingHistory() {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [filteredBills, setFilteredBills] = useState<Bill[]>(mockBills);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [deleteBillId, setDeleteBillId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [billsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("all");

  // Apply filters
  useEffect(() => {
    let filtered = [...bills];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (bill) =>
          bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.customer.phone.includes(searchTerm) ||
          bill.createdBy.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (bill) => bill.status.toLowerCase() === statusFilter,
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((bill) => bill.billType === typeFilter);
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(
        (bill) => bill.paymentStatus.toLowerCase() === paymentFilter,
      );
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(
        (bill) => bill.billDate >= new Date(dateRange.start),
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        (bill) => bill.billDate <= new Date(dateRange.end),
      );
    }

    // Tab filter
    if (activeTab !== "all") {
      if (activeTab === "draft") {
        filtered = filtered.filter((bill) => bill.status === "Draft");
      } else if (activeTab === "pending") {
        filtered = filtered.filter(
          (bill) =>
            bill.paymentStatus === "Pending" ||
            bill.paymentStatus === "Partial",
        );
      } else if (activeTab === "paid") {
        filtered = filtered.filter((bill) => bill.paymentStatus === "Paid");
      } else if (activeTab === "overdue") {
        filtered = filtered.filter((bill) => bill.paymentStatus === "Overdue");
      }
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
    activeTab,
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
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
      gst: "bg-blue-100 text-blue-800 border-blue-200",
      "non-gst": "bg-purple-100 text-purple-800 border-purple-200",
      quotation: "bg-indigo-100 text-indigo-800 border-indigo-200",
    };
    return styles[type.toLowerCase() as keyof typeof styles] || styles.gst;
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
  };

  const handleDelete = (billId: string) => {
    setBills((prev) => prev.filter((bill) => bill.id !== billId));
    setDeleteBillId(null);
  };

  const handleDuplicate = (bill: Bill) => {
    const duplicatedBill: Bill = {
      ...bill,
      id: Date.now().toString(),
      billNumber: `${bill.billNumber}-COPY`,
      status: "Draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      paidAmount: 0,
      pendingAmount: bill.finalAmount,
      payments: [],
      paymentStatus: "Pending",
    };
    setBills((prev) => [duplicatedBill, ...prev]);
  };

  const updateBillStatus = (billId: string, newStatus: Bill["status"]) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === billId
          ? { ...bill, status: newStatus, updatedAt: new Date() }
          : bill,
      ),
    );
  };

  const downloadBillPDF = async (bill: Bill) => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Company Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(bill.company.name, 105, 20, { align: "center" });

      doc.setFontSize(16);
      doc.text(
        bill.billType === "Quotation" ? "QUOTATION" : "INVOICE",
        105,
        30,
        { align: "center" },
      );

      // Bill details
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `${bill.billType === "Quotation" ? "Quotation" : "Invoice"} No: ${bill.billNumber}`,
        20,
        45,
      );
      doc.text(`Date: ${formatDate(bill.billDate)}`, 20, 52);
      if (bill.dueDate) {
        doc.text(
          `${bill.billType === "Quotation" ? "Valid Until" : "Due Date"}: ${formatDate(bill.dueDate)}`,
          20,
          59,
        );
      }

      // Customer Info
      doc.setFont("helvetica", "bold");
      doc.text("Bill To:", 20, 75);
      doc.setFont("helvetica", "normal");
      doc.text(bill.customer.name, 20, 82);
      doc.text(`Phone: ${bill.customer.phone}`, 20, 89);
      if (bill.customer.email) {
        doc.text(`Email: ${bill.customer.email}`, 20, 96);
      }
      doc.text(`Address: ${bill.customer.address}`, 20, 103);
      if (bill.customer.gstNumber) {
        doc.text(`GST: ${bill.customer.gstNumber}`, 20, 110);
      }

      // Table Headers
      let yPos = 130;
      doc.setFont("helvetica", "bold");
      doc.text("Item", 20, yPos);
      doc.text("HSN", 70, yPos);
      doc.text("Qty", 85, yPos);
      doc.text("Rate", 100, yPos);
      doc.text("Disc%", 120, yPos);
      if (bill.billType === "GST") {
        doc.text("GST%", 135, yPos);
        if (bill.customer.state === bill.company.state) {
          doc.text("CGST", 150, yPos);
          doc.text("SGST", 165, yPos);
        } else {
          doc.text("IGST", 150, yPos);
        }
        doc.text("Total", 180, yPos);
      } else {
        doc.text("Total", 150, yPos);
      }

      // Draw line under headers
      doc.line(20, yPos + 2, 190, yPos + 2);
      yPos += 10;

      // Items
      doc.setFont("helvetica", "normal");
      bill.items.forEach((item) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.text(item.productName.substring(0, 25), 20, yPos);
        doc.text(item.hsnCode || "", 70, yPos);
        doc.text(`${item.quantity} ${item.unit}`, 85, yPos);
        doc.text(`₹${item.rate.toFixed(2)}`, 100, yPos);
        doc.text(`${item.discount}%`, 120, yPos);
        if (bill.billType === "GST") {
          doc.text(`${item.gstRate}%`, 135, yPos);
          if (bill.customer.state === bill.company.state) {
            doc.text(`₹${item.cgstAmount.toFixed(2)}`, 150, yPos);
            doc.text(`₹${item.sgstAmount.toFixed(2)}`, 165, yPos);
          } else {
            doc.text(`₹${item.igstAmount.toFixed(2)}`, 150, yPos);
          }
          doc.text(`₹${item.totalAmount.toFixed(2)}`, 180, yPos);
        } else {
          doc.text(`₹${item.totalAmount.toFixed(2)}`, 150, yPos);
        }
        yPos += 8;
      });

      // Totals section
      yPos += 10;
      doc.line(100, yPos, 190, yPos);
      yPos += 8;

      doc.text("Subtotal:", 130, yPos);
      doc.text(`₹${bill.subtotal.toFixed(2)}`, 175, yPos);
      yPos += 6;

      if (bill.discountAmount > 0) {
        doc.text(`Discount (${bill.discountPercent}%):`, 130, yPos);
        doc.text(`-₹${bill.discountAmount.toFixed(2)}`, 175, yPos);
        yPos += 6;
      }

      doc.text("Taxable Amount:", 130, yPos);
      doc.text(`₹${bill.taxableAmount.toFixed(2)}`, 175, yPos);
      yPos += 6;

      if (bill.billType === "GST" && bill.totalTax > 0) {
        if (bill.cgstTotal > 0) {
          doc.text("CGST:", 130, yPos);
          doc.text(`₹${bill.cgstTotal.toFixed(2)}`, 175, yPos);
          yPos += 6;

          doc.text("SGST:", 130, yPos);
          doc.text(`₹${bill.sgstTotal.toFixed(2)}`, 175, yPos);
          yPos += 6;
        }

        if (bill.igstTotal > 0) {
          doc.text("IGST:", 130, yPos);
          doc.text(`₹${bill.igstTotal.toFixed(2)}`, 175, yPos);
          yPos += 6;
        }

        doc.text("Total Tax:", 130, yPos);
        doc.text(`₹${bill.totalTax.toFixed(2)}`, 175, yPos);
        yPos += 6;
      }

      if (bill.roundOffAmount !== 0) {
        doc.text("Round Off:", 130, yPos);
        doc.text(`₹${bill.roundOffAmount.toFixed(2)}`, 175, yPos);
        yPos += 6;
      }

      // Final total
      doc.line(130, yPos, 190, yPos);
      yPos += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Final Amount:", 130, yPos);
      doc.text(`₹${bill.finalAmount.toFixed(2)}`, 175, yPos);

      // Payment details if any
      if (bill.payments.length > 0) {
        yPos += 15;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Payment Details:", 20, yPos);
        yPos += 8;
        doc.setFont("helvetica", "normal");

        bill.payments.forEach((payment) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(
            `${formatDate(payment.date)} - ${payment.method}: ₹${payment.amount.toFixed(2)}`,
            20,
            yPos,
          );
          if (payment.reference) {
            doc.text(`Ref: ${payment.reference}`, 120, yPos);
          }
          yPos += 6;
        });

        yPos += 5;
        doc.setFont("helvetica", "bold");
        doc.text(`Paid Amount: ₹${bill.paidAmount.toFixed(2)}`, 20, yPos);
        yPos += 6;
        doc.text(`Pending Amount: ₹${bill.pendingAmount.toFixed(2)}`, 20, yPos);
      }

      // Notes and terms
      if (bill.notes || bill.terms) {
        yPos += 15;
        if (bill.notes) {
          doc.setFont("helvetica", "bold");
          doc.text("Notes:", 20, yPos);
          yPos += 6;
          doc.setFont("helvetica", "normal");
          doc.text(bill.notes, 20, yPos);
          yPos += 10;
        }

        if (bill.terms) {
          doc.setFont("helvetica", "bold");
          doc.text("Terms & Conditions:", 20, yPos);
          yPos += 6;
          doc.setFont("helvetica", "normal");
          const terms = bill.terms.split("\n");
          terms.forEach((term) => {
            if (yPos > 280) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(term, 20, yPos);
            yPos += 5;
          });
        }
      }

      // Footer
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Thank you for your business!", 105, 285, { align: "center" });

      // Save the PDF
      doc.save(`${bill.billType}_${bill.billNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Bill Number",
      "Type",
      "Date",
      "Customer",
      "Phone",
      "Amount",
      "Paid Amount",
      "Pending Amount",
      "Payment Status",
      "Status",
      "Created By",
    ];

    const csvData = filteredBills.map((bill) => [
      bill.billNumber,
      bill.billType,
      formatDate(bill.billDate),
      bill.customer.name,
      bill.customer.phone,
      bill.finalAmount,
      bill.paidAmount,
      bill.pendingAmount,
      bill.paymentStatus,
      bill.status,
      bill.createdBy,
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `billing_history_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateStats = () => {
    const totalRevenue = filteredBills.reduce(
      (sum, bill) => sum + (bill.finalAmount || 0),
      0,
    );
    const paidBills = filteredBills.filter((b) => b.paymentStatus === "Paid");
    const paidRevenue = paidBills.reduce(
      (sum, bill) => sum + (bill.finalAmount || 0),
      0,
    );
    const pendingRevenue = filteredBills
      .filter((b) => b.paymentStatus === "Pending")
      .reduce((sum, bill) => sum + (bill.finalAmount || 0), 0);
    const partialRevenue = filteredBills
      .filter((b) => b.paymentStatus === "Partial")
      .reduce((sum, bill) => sum + (bill.pendingAmount || 0), 0);
    const overdueRevenue = filteredBills
      .filter((b) => b.paymentStatus === "Overdue")
      .reduce((sum, bill) => sum + (bill.pendingAmount || 0), 0);

    return {
      totalBills: filteredBills.length,
      totalRevenue,
      paidRevenue,
      pendingRevenue: pendingRevenue + partialRevenue + overdueRevenue,
      gstBills: filteredBills.filter((b) => b.billType === "GST").length,
      nonGstBills: filteredBills.filter((b) => b.billType === "Non-GST").length,
      quotations: filteredBills.filter((b) => b.billType === "Quotation")
        .length,
      draftBills: filteredBills.filter((b) => b.status === "Draft").length,
      paidBills: paidBills.length,
      pendingBills: filteredBills.filter(
        (b) => b.paymentStatus === "Pending" || b.paymentStatus === "Partial",
      ).length,
      overdueBills: filteredBills.filter((b) => b.paymentStatus === "Overdue")
        .length,
    };
  };

  const stats = calculateStats();
  const { isMobile } = useResponsiveTable();

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Billing History
          </h2>
          <p className="text-muted-foreground">
            Comprehensive view and management of all bills
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => (window.location.href = "/bill-creator")}>
            <Plus className="h-4 w-4 mr-2" />
            New Bill
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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
              GST: {stats.gstBills} | Non-GST: {stats.nonGstBills} | Quotes:{" "}
              {stats.quotations}
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
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Paid Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.paidRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.paidBills} bills (
              {((stats.paidRevenue / stats.totalRevenue) * 100).toFixed(1)}%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              Pending Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.pendingRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.pendingBills} bills pending payment
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Draft Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.draftBills}
            </div>
            <div className="text-sm text-muted-foreground">
              Needs completion
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Bills</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
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

          {/* Bills Table/Cards */}
          {isMobile ? (
            <div className="space-y-3">
              {currentBills.map((bill) => (
                <MobileTableCard key={bill.id}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium">{bill.billNumber}</div>
                      <div className="text-xs text-gray-500">
                        by {bill.createdBy}
                      </div>
                    </div>
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
                        onClick={() => handleEdit(bill)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <MobileTableRowItem label="Customer">
                    {bill.customer.name}
                  </MobileTableRowItem>
                  <MobileTableRowItem label="Phone">
                    {bill.customer.phone}
                  </MobileTableRowItem>
                  <MobileTableRowItem label="Date">
                    {formatDate(bill.billDate)}
                  </MobileTableRowItem>
                  <MobileTableRowItem label="Type">
                    <Badge
                      className={cn("text-xs", getTypeBadge(bill.billType))}
                    >
                      {bill.billType}
                    </Badge>
                  </MobileTableRowItem>
                  <MobileTableRowItem label="Amount">
                    {formatCurrency(bill.finalAmount)}
                  </MobileTableRowItem>
                  <MobileTableRowItem label="Paid">
                    {formatCurrency(bill.paidAmount)}
                  </MobileTableRowItem>
                  <MobileTableRowItem label="Pending">
                    {formatCurrency(bill.pendingAmount)}
                  </MobileTableRowItem>
                  <MobileTableRowItem label="Payment">
                    <Badge
                      className={cn(
                        "text-xs",
                        getPaymentBadge(bill.paymentStatus),
                      )}
                    >
                      {bill.paymentStatus}
                    </Badge>
                  </MobileTableRowItem>
                  <MobileTableRowItem label="Status">
                    <Badge
                      className={cn("text-xs", getStatusBadge(bill.status))}
                    >
                      {bill.status}
                    </Badge>
                  </MobileTableRowItem>
                </MobileTableCard>
              ))}
            </div>
          ) : (
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
                        <th className="p-4 font-medium">Paid</th>
                        <th className="p-4 font-medium">Pending</th>
                        <th className="p-4 font-medium">Payment</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBills.map((bill) => (
                        <tr
                          key={bill.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-4">
                            <div className="font-medium">{bill.billNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              by {bill.createdBy}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">
                              {bill.customer.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {bill.customer.phone}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">
                              {formatDate(bill.billDate)}
                            </div>
                            {bill.dueDate && (
                              <div className="text-sm text-muted-foreground">
                                Due: {formatDate(bill.dueDate)}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge
                              className={cn(
                                "text-xs",
                                getTypeBadge(bill.billType),
                              )}
                            >
                              {bill.billType}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">
                              {formatCurrency(bill.finalAmount)}
                            </div>
                            {(bill.discountAmount || 0) > 0 && (
                              <div className="text-sm text-muted-foreground">
                                Disc: {formatCurrency(bill.discountAmount)}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-green-600">
                              {formatCurrency(bill.paidAmount)}
                            </div>
                            {bill.payments.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                {bill.payments.length} payment
                                {bill.payments.length > 1 ? "s" : ""}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-orange-600">
                              {formatCurrency(bill.pendingAmount)}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={cn(
                                "text-xs",
                                getPaymentBadge(bill.paymentStatus),
                              )}
                            >
                              {bill.paymentStatus}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Badge
                                className={cn(
                                  "text-xs",
                                  getStatusBadge(bill.status),
                                )}
                              >
                                {bill.status}
                              </Badge>
                              {bill.status === "Draft" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    updateBillStatus(bill.id, "Sent")
                                  }
                                  title="Send bill"
                                >
                                  <Send className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedBill(bill)}
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadBillPDF(bill)}
                                title="Download PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(bill)}
                                title="Edit bill"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicate(bill)}
                                title="Duplicate bill"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteBillId(bill.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete bill"
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="px-3 py-1 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
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
          )}
        </TabsContent>
      </Tabs>

      {/* Bill Details Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill Details - {selectedBill?.billNumber}</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-6">
              {/* Bill Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        {formatDate(selectedBill.billDate)}
                      </span>
                    </div>
                    {selectedBill.dueDate && (
                      <div className="flex justify-between">
                        <span>
                          {selectedBill.billType === "Quotation"
                            ? "Valid Until:"
                            : "Due Date:"}
                        </span>
                        <span className="font-medium">
                          {formatDate(selectedBill.dueDate)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge
                        className={cn(
                          "text-xs",
                          getStatusBadge(selectedBill.status),
                        )}
                      >
                        {selectedBill.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Created by:</span>
                      <span className="font-medium">
                        {selectedBill.createdBy}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium">
                        {selectedBill.customer.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="font-medium">
                        {selectedBill.customer.phone}
                      </span>
                    </div>
                    {selectedBill.customer.email && (
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-medium">
                          {selectedBill.customer.email}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>State:</span>
                      <span className="font-medium">
                        {selectedBill.customer.state}
                      </span>
                    </div>
                    {selectedBill.customer.gstNumber && (
                      <div className="flex justify-between">
                        <span>GST:</span>
                        <span className="font-medium">
                          {selectedBill.customer.gstNumber}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Address: {selectedBill.customer.address}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Financial Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedBill.subtotal)}</span>
                    </div>
                    {selectedBill.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>
                          -{formatCurrency(selectedBill.discountAmount)}
                        </span>
                      </div>
                    )}
                    {selectedBill.totalTax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(selectedBill.totalTax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedBill.finalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Paid:</span>
                      <span>{formatCurrency(selectedBill.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span>Pending:</span>
                      <span>{formatCurrency(selectedBill.pendingAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Status:</span>
                      <Badge
                        className={cn(
                          "text-xs",
                          getPaymentBadge(selectedBill.paymentStatus),
                        )}
                      >
                        {selectedBill.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">
                  Items ({selectedBill.items.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border rounded-lg">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-center">HSN</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Rate</th>
                        <th className="p-3 text-right">Disc%</th>
                        <th className="p-3 text-right">Taxable</th>
                        {selectedBill.billType === "GST" && (
                          <>
                            {selectedBill.customer.state ===
                            selectedBill.company.state ? (
                              <>
                                <th className="p-3 text-right">CGST</th>
                                <th className="p-3 text-right">SGST</th>
                              </>
                            ) : (
                              <th className="p-3 text-right">IGST</th>
                            )}
                          </>
                        )}
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">
                            <div className="font-medium">
                              {item.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.unit}
                            </div>
                          </td>
                          <td className="p-3 text-center text-sm">
                            {item.hsnCode}
                          </td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">
                            {formatCurrency(item.rate)}
                          </td>
                          <td className="p-3 text-right">{item.discount}%</td>
                          <td className="p-3 text-right">
                            {formatCurrency(item.taxableAmount)}
                          </td>
                          {selectedBill.billType === "GST" && (
                            <>
                              {selectedBill.customer.state ===
                              selectedBill.company.state ? (
                                <>
                                  <td className="p-3 text-right">
                                    {formatCurrency(item.cgstAmount)}
                                  </td>
                                  <td className="p-3 text-right">
                                    {formatCurrency(item.sgstAmount)}
                                  </td>
                                </>
                              ) : (
                                <td className="p-3 text-right">
                                  {formatCurrency(item.igstAmount)}
                                </td>
                              )}
                            </>
                          )}
                          <td className="p-3 text-right font-medium">
                            {formatCurrency(item.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment History */}
              {selectedBill.payments.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">
                    Payment History ({selectedBill.payments.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedBill.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-3">
                          {payment.method === "Cash" && (
                            <Banknote className="h-4 w-4" />
                          )}
                          {payment.method === "UPI" && (
                            <Smartphone className="h-4 w-4" />
                          )}
                          {payment.method === "Card" && (
                            <CreditCard className="h-4 w-4" />
                          )}
                          <div>
                            <div className="font-medium">{payment.method}</div>
                            <div className="text-sm text-gray-500">
                              {formatDate(payment.date)}
                              {payment.reference &&
                                ` • Ref: ${payment.reference}`}
                            </div>
                            {payment.notes && (
                              <div className="text-sm text-gray-500">
                                {payment.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="font-medium text-green-600">
                          {formatCurrency(payment.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes and Terms */}
              {(selectedBill.notes || selectedBill.terms) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedBill.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded">
                        {selectedBill.notes}
                      </p>
                    </div>
                  )}
                  {selectedBill.terms && (
                    <div>
                      <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                      <div className="text-sm bg-gray-50 p-3 rounded whitespace-pre-line">
                        {selectedBill.terms}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  onClick={() => selectedBill && downloadBillPDF(selectedBill)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEdit(selectedBill)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Bill
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDuplicate(selectedBill)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                {selectedBill.status === "Draft" && (
                  <Button
                    variant="outline"
                    onClick={() => updateBillStatus(selectedBill.id, "Sent")}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Bill
                  </Button>
                )}
                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBill(null)}
                  className="ml-auto"
                >
                  Close
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
              undone and will remove all associated data including payment
              history.
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
