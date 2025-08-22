import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useBilling } from "@/contexts/BillingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductContext";
import { useToast } from "@/hooks/use-toast";
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
  Plus,
  User,
  Receipt,
  Download,
  Printer,
  Save,
  Trash2,
  Calculator,
  Package,
  Calendar,
  X,
  FileText,
  ArrowLeft,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  name: string;
  phone: string;
  address: string;
}

interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  gstPercent: number;
  totalAmount: number;
  gstAmount: number;
}

interface Invoice {
  id: string;
  billNumber: string;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  gstTotal: number;
  cgst: number;
  sgst: number;
  finalAmount: number;
  billingMode: "GST" | "Non-GST" | "Quotation";
  observation: string;
  termsAndConditions: string;
  isReturnSale: boolean;
  paymentMode: "full" | "partial";
  paidAmount: number;
  pendingAmount: number;
  paymentMethod: "cash" | "online" | "mixed";
  createdAt: Date;
  status: "draft" | "saved";
}

export default function SimpleBilling() {
  const { addBill, bills } = useBilling();
  const { user } = useAuth();
  const { products } = useProducts();
  const { toast } = useToast();
  
  // Current workflow state
  const [currentStep, setCurrentStep] = useState<"list" | "create">("list");
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1); // 1: Customer, 2: Items, 3: Review
  const [billingMode, setBillingMode] = useState<"GST" | "Non-GST" | "Quotation">("GST");
  
  // Customer form state
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    address: "",
  });
  
  // Invoice state
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>({
    id: "",
    billNumber: "",
    customer: { name: "", phone: "", address: "" },
    items: [],
    subtotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    gstTotal: 0,
    cgst: 0,
    sgst: 0,
    finalAmount: 0,
    billingMode: "GST",
    observation: "",
    termsAndConditions: "1. Payment due within 30 days\n2. Goods once sold will not be taken back\n3. Subject to Delhi jurisdiction",
    isReturnSale: false,
    paymentMode: "full",
    paidAmount: 0,
    pendingAmount: 0,
    paymentMethod: "cash",
    createdAt: new Date(),
    status: "draft",
  });
  
  // Product adding state
  const [newItem, setNewItem] = useState({
    productName: "",
    quantity: 1,
    price: 0,
    gstPercent: 18,
  });

  // Bill preview dialog state
  const [showPreview, setShowPreview] = useState(false);

  // Payment dialog state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Generate bill number
  const generateBillNumber = () => {
    const timestamp = Date.now();
    const prefix = billingMode === "GST" ? "GST" : "NGST";
    return `${prefix}/24/${timestamp.toString().slice(-4)}`;
  };
  
  // Calculate invoice totals
  useEffect(() => {
    const subtotal = currentInvoice.items.reduce((sum, item) => sum + item.totalAmount, 0);
    const discountAmount = (subtotal * currentInvoice.discountPercent) / 100;
    const discountedSubtotal = subtotal - discountAmount;

    let gstTotal = 0;
    let cgst = 0;
    let sgst = 0;

    if (billingMode === "GST") {
      gstTotal = currentInvoice.items.reduce((sum, item) => sum + item.gstAmount, 0);
      cgst = gstTotal / 2;
      sgst = gstTotal / 2;
    }

    const finalAmount = discountedSubtotal + gstTotal;
    const pendingAmount = finalAmount - currentInvoice.paidAmount;

    setCurrentInvoice(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      gstTotal,
      cgst,
      sgst,
      finalAmount,
      pendingAmount,
    }));
  }, [currentInvoice.items, currentInvoice.discountPercent, currentInvoice.paidAmount, billingMode]);
  
  // Start new invoice
  const startNewInvoice = () => {
    setCustomer({ name: "", phone: "", address: "" });
    setCreateStep(1);
    setCurrentStep("create");
  };
  
  // Create invoice from customer details
  const createInvoice = () => {
    if (!customer.name || !customer.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer name and phone number",
        variant: "destructive"
      });
      return;
    }
    
    const billNumber = generateBillNumber();
    setCurrentInvoice({
      id: Date.now().toString(),
      billNumber,
      customer,
      items: [],
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      gstTotal: 0,
      cgst: 0,
      sgst: 0,
      finalAmount: 0,
      billingMode,
      observation: "",
      termsAndConditions: "1. Payment due within 30 days\n2. Goods once sold will not be taken back\n3. Subject to Delhi jurisdiction",
      isReturnSale: false,
      paymentMode: "full",
      paidAmount: 0,
      pendingAmount: 0,
      paymentMethod: "cash",
      createdAt: new Date(),
      status: "draft",
    });
    
    setCreateStep(2);
  };
  
  // Add item to invoice
  const addItem = () => {
    const quantity = parseFloat(newItem.quantity) || 0;
    const price = parseFloat(newItem.price) || 0;

    if (!newItem.productName || quantity <= 0 || price <= 0) {
      toast({
        title: "Invalid Item Details",
        description: "Please fill in all item details with valid values",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = quantity * price;
    const gstAmount = billingMode === "GST" ? (totalAmount * newItem.gstPercent) / 100 : 0;

    const item: InvoiceItem = {
      id: Date.now().toString(),
      productName: newItem.productName,
      quantity,
      price,
      gstPercent: newItem.gstPercent,
      totalAmount,
      gstAmount,
    };

    setCurrentInvoice(prev => ({
      ...prev,
      items: [...prev.items, item],
    }));

    // Auto-clear form after adding item
    setNewItem({
      productName: "",
      quantity: "",
      price: "",
      gstPercent: 18,
    });
  };
  
  // Remove item from invoice
  const removeItem = (itemId: string) => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };
  
  // Save invoice
  const saveInvoice = () => {
    if (currentInvoice.items.length === 0) {
      toast({
        title: "Empty Invoice",
        description: "Please add at least one item to the invoice",
        variant: "destructive"
      });
      return;
    }
    
    const billToSave = {
      id: currentInvoice.id,
      billNumber: currentInvoice.billNumber,
      billType: currentInvoice.billingMode,
      billDate: currentInvoice.createdAt,
      customer: {
        id: Date.now().toString(),
        name: currentInvoice.customer.name,
        phone: currentInvoice.customer.phone,
        address: currentInvoice.customer.address,
      },
      items: currentInvoice.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        gstPercent: item.gstPercent,
        totalAmount: item.totalAmount,
        gstAmount: item.gstAmount,
      })),
      subtotal: currentInvoice.subtotal,
      discountAmount: currentInvoice.discountAmount,
      discountPercent: currentInvoice.discountPercent,
      taxAmount: currentInvoice.gstTotal,
      cgst: currentInvoice.gstTotal / 2,
      sgst: currentInvoice.gstTotal / 2,
      igst: 0,
      totalGst: currentInvoice.gstTotal,
      finalAmount: currentInvoice.finalAmount,
      paymentStatus: "Pending" as const,
      createdBy: user?.name || "Unknown",
      createdAt: currentInvoice.createdAt,
      status: "Draft" as const,
    };
    
    addBill(billToSave);
    setCurrentStep("list");
    setCreateStep(1);
    toast({
      title: "Success",
      description: "Invoice saved successfully!",
      variant: "default"
    });
  };
  
  // Download PDF
  const downloadPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Enhanced Header (matching preview format)
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('ElectroMart', 20, 25);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Business Management Solution', 20, 32);
      doc.text('Delhi, India', 20, 38);

      // Right side header info
      const documentTitle = billingMode === "Quotation" ? "QUOTATION" : currentInvoice.isReturnSale ? "RETURN INVOICE" : "INVOICE";
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(documentTitle, 150, 25);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`No: ${currentInvoice.billNumber}`, 150, 32);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 150, 38);
      doc.text(`Type: ${billingMode}`, 150, 44);

      // Header border line
      doc.line(20, 50, 190, 50);

      // Customer details
      let yPos = 60;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Bill To:', 20, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(currentInvoice.customer.name, 20, yPos);
      yPos += 6;
      doc.text(`Phone: ${currentInvoice.customer.phone}`, 20, yPos);
      yPos += 6;
      if (currentInvoice.customer.address) {
        doc.text(`Address: ${currentInvoice.customer.address}`, 20, yPos);
        yPos += 6;
      }

      // Items table header
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Item', 20, yPos);
      doc.text('Qty', 80, yPos);
      doc.text('Rate (₹)', 105, yPos);
      if (billingMode === 'GST') {
        doc.text('GST%', 130, yPos);
        doc.text('GST (₹)', 150, yPos);
      }
      doc.text('Total (₹)', 175, yPos);

      // Table header line
      doc.line(20, yPos + 2, 190, yPos + 2);
      yPos += 8;

      // Items
      doc.setFont('helvetica', 'normal');
      currentInvoice.items.forEach(item => {
        doc.text(item.productName.substring(0, 20), 20, yPos);
        doc.text(item.quantity.toString(), 80, yPos);
        doc.text(item.price.toLocaleString(), 105, yPos);
        if (billingMode === 'GST') {
          doc.text(`${item.gstPercent}%`, 130, yPos);
          doc.text(item.gstAmount.toLocaleString(), 150, yPos);
        }
        doc.text(item.totalAmount.toLocaleString(), 175, yPos);
        yPos += 7;
      });

      // Totals section
      yPos += 10;
      doc.line(105, yPos, 190, yPos);
      yPos += 8;

      // Subtotal
      doc.text('Subtotal:', 130, yPos);
      doc.text(`₹${currentInvoice.subtotal.toLocaleString()}`, 175, yPos);
      yPos += 6;

      // Discount
      if (currentInvoice.discountAmount > 0) {
        doc.text(`Discount (${currentInvoice.discountPercent}%):`, 130, yPos);
        doc.text(`-₹${currentInvoice.discountAmount.toLocaleString()}`, 175, yPos);
        yPos += 6;
      }

      // GST breakdown (matching preview format)
      if (billingMode === 'GST' && currentInvoice.gstTotal > 0) {
        doc.text('CGST (9%):', 130, yPos);
        doc.text(`₹${currentInvoice.cgst.toLocaleString()}`, 175, yPos);
        yPos += 6;
        doc.text('SGST (9%):', 130, yPos);
        doc.text(`₹${currentInvoice.sgst.toLocaleString()}`, 175, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('Total GST:', 130, yPos);
        doc.text(`₹${currentInvoice.gstTotal.toLocaleString()}`, 175, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 8;
      }

      // Final total
      doc.line(130, yPos, 190, yPos);
      yPos += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Final Amount:', 130, yPos);
      doc.text(`₹${currentInvoice.finalAmount.toLocaleString()}`, 175, yPos);
      yPos += 12;

      // Payment Details Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Payment Details:', 20, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Method: ${currentInvoice.paymentMethod.toUpperCase()}`, 20, yPos);
      yPos += 5;
      doc.text(`Status: ${currentInvoice.paymentMode === "full" ? "Paid in Full" : "Partial Payment"}`, 20, yPos);
      yPos += 5;

      if (currentInvoice.paymentMode === "partial") {
        doc.text(`Paid: ₹${currentInvoice.paidAmount.toLocaleString()}`, 20, yPos);
        yPos += 5;
        doc.setTextColor(255, 0, 0); // Red color for pending
        doc.text(`Pending: ₹${currentInvoice.pendingAmount.toLocaleString()}`, 20, yPos);
        doc.setTextColor(0, 0, 0); // Reset to black
        yPos += 5;
      }

      // Observation
      if (currentInvoice.observation) {
        yPos += 8;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Observation:', 20, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const observationLines = doc.splitTextToSize(currentInvoice.observation, 170);
        doc.text(observationLines, 20, yPos);
        yPos += observationLines.length * 4;
      }

      // Terms & Conditions
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Terms & Conditions:', 20, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const termsLines = currentInvoice.termsAndConditions.split('\\n');
      termsLines.forEach(term => {
        if (term.trim()) {
          doc.text(term, 20, yPos);
          yPos += 4;
        }
      });

      // Footer
      yPos += 15;
      doc.line(20, yPos, 190, yPos);
      yPos += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Thank you for your business!', 105, yPos, { align: 'center' });
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('This is a computer-generated document and does not require a signature.', 105, yPos, { align: 'center' });

      // Generate filename based on document type
      const filename = billingMode === "Quotation" ? `Quotation_${currentInvoice.billNumber}.pdf` :
                      currentInvoice.isReturnSale ? `Return_${currentInvoice.billNumber}.pdf` :
                      `Invoice_${currentInvoice.billNumber}.pdf`;

      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Error generating PDF. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Print invoice
  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const billContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Invoice - ${currentInvoice.billNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 14px;
              line-height: 1.4;
              color: #000;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .company-info h1 {
              font-size: 28px;
              color: #16a34a;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .company-info p {
              font-size: 12px;
              color: #666;
              margin: 2px 0;
            }
            .document-info {
              text-align: right;
            }
            .document-info h2 {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .document-info p {
              font-size: 12px;
              margin: 2px 0;
            }
            .customer-section {
              margin-bottom: 20px;
            }
            .customer-section h3 {
              font-weight: bold;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .customer-section p {
              font-size: 12px;
              margin: 3px 0;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            .items-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .items-table .text-center {
              text-align: center;
            }
            .items-table .text-right {
              text-align: right;
            }
            .totals-section {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 20px;
            }
            .totals-table {
              width: 300px;
            }
            .totals-table tr {
              border-bottom: 1px solid #eee;
            }
            .totals-table td {
              padding: 5px;
              font-size: 12px;
            }
            .totals-table .final-total {
              font-weight: bold;
              font-size: 14px;
              border-top: 2px solid #000;
              padding-top: 8px;
            }
            .payment-section,
            .observation-section,
            .terms-section {
              margin-bottom: 20px;
            }
            .payment-section h3,
            .observation-section h3,
            .terms-section h3 {
              font-weight: bold;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .payment-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              font-size: 12px;
            }
            .payment-details p {
              margin: 3px 0;
            }
            .pending-amount {
              color: #dc2626;
              font-weight: bold;
            }
            .observation-content,
            .terms-content {
              background-color: #f9f9f9;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 12px;
            }
            .terms-content p {
              margin: 3px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
            }
            .footer .thank-you {
              font-weight: bold;
              font-size: 14px;
              color: #000;
              margin-bottom: 5px;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h1>ElectroMart</h1>
              <p>Business Management Solution</p>
              <p>Delhi, India</p>
            </div>
            <div class="document-info">
              <h2>${billingMode === "Quotation" ? "QUOTATION" : currentInvoice.isReturnSale ? "RETURN INVOICE" : "INVOICE"}</h2>
              <p><strong>No:</strong> ${currentInvoice.billNumber}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
              <p><strong>Type:</strong> ${billingMode}</p>
            </div>
          </div>

          <div class="customer-section">
            <h3>Bill To:</h3>
            <p><strong>${currentInvoice.customer.name}</strong></p>
            <p>Phone: ${currentInvoice.customer.phone}</p>
            ${currentInvoice.customer.address ? `<p>Address: ${currentInvoice.customer.address}</p>` : ''}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Rate (₹)</th>
                ${billingMode === 'GST' ? '<th class="text-center">GST%</th><th class="text-right">GST Amt (₹)</th>' : ''}
                <th class="text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${currentInvoice.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${item.price.toLocaleString()}</td>
                  ${billingMode === 'GST' ? `
                    <td class="text-center">${item.gstPercent}%</td>
                    <td class="text-right">${item.gstAmount.toLocaleString()}</td>
                  ` : ''}
                  <td class="text-right">${item.totalAmount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td>Subtotal:</td>
                <td class="text-right">₹${currentInvoice.subtotal.toLocaleString()}</td>
              </tr>
              ${currentInvoice.discountAmount > 0 ? `
                <tr>
                  <td>Discount (${currentInvoice.discountPercent}%):</td>
                  <td class="text-right" style="color: #16a34a;">-₹${currentInvoice.discountAmount.toLocaleString()}</td>
                </tr>
              ` : ''}
              ${billingMode === 'GST' && currentInvoice.gstTotal > 0 ? `
                <tr>
                  <td>CGST (9%):</td>
                  <td class="text-right">₹${currentInvoice.cgst.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>SGST (9%):</td>
                  <td class="text-right">₹${currentInvoice.sgst.toLocaleString()}</td>
                </tr>
                <tr>
                  <td><strong>Total GST:</strong></td>
                  <td class="text-right"><strong>₹${currentInvoice.gstTotal.toLocaleString()}</strong></td>
                </tr>
              ` : ''}
              <tr class="final-total">
                <td><strong>Final Amount:</strong></td>
                <td class="text-right"><strong>₹${currentInvoice.finalAmount.toLocaleString()}</strong></td>
              </tr>
            </table>
          </div>

          <div class="payment-section">
            <h3>Payment Details:</h3>
            <div class="payment-details">
              <div>
                <p><strong>Method:</strong> ${currentInvoice.paymentMethod.toUpperCase()}</p>
                <p><strong>Status:</strong> ${currentInvoice.paymentMode === "full" ? "Paid in Full" : "Partial Payment"}</p>
                ${currentInvoice.paymentMode === "partial" ? `
                  <p><strong>Paid:</strong> ₹${currentInvoice.paidAmount.toLocaleString()}</p>
                  <p class="pending-amount"><strong>Pending:</strong> ₹${currentInvoice.pendingAmount.toLocaleString()}</p>
                ` : ''}
              </div>
              ${currentInvoice.observation ? `
                <div>
                  <h4 style="font-weight: bold; margin-bottom: 5px;">Observation:</h4>
                  <p style="font-size: 11px; background: #f9f9f9; padding: 8px; border-radius: 3px;">${currentInvoice.observation}</p>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="terms-section">
            <h3>Terms & Conditions:</h3>
            <div class="terms-content">
              ${currentInvoice.termsAndConditions.split('\\n').map(term =>
                term.trim() ? `<p>${term}</p>` : ''
              ).join('')}
            </div>
          </div>

          <div class="footer">
            <p class="thank-you">Thank you for your business!</p>
            <p>This is a computer-generated document and does not require a signature.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(billContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Step Indicator Component
  const StepIndicator = ({ currentStep, steps }: { currentStep: number, steps: Array<{number: number, title: string, description: string}> }) => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-colors",
                    currentStep >= step.number
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {step.number}
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-sm font-medium",
                    currentStep >= step.number ? "text-green-600" : "text-gray-500"
                  )}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors",
                    currentStep > step.number ? "bg-green-600" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Unified Invoice Creation Form
  if (currentStep === "create") {
    const steps = [
      { number: 1, title: "Customer Details", description: "Enter customer information" },
      { number: 2, title: "Add Items", description: "Add products to invoice" },
      { number: 3, title: "Review & Save", description: "Review and finalize invoice" }
    ];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className={cn("mx-auto", createStep <= 1 ? "max-w-4xl" : "max-w-7xl")}>
          {/* Header */}
          <div className="mb-8">
            {/* Mobile Back Button */}
            <div className="flex items-center gap-4 mb-4 lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep("list")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {createStep <= 1 ? "New Invoice" : `Create Invoice - ${currentInvoice.billNumber}`}
              </h1>
              <p className="text-gray-600">
                {createStep === 1 && "Enter customer details and select document type"}
                {createStep === 2 && "Add items to your invoice"}
                {createStep === 3 && "Review invoice details and save"}
              </p>
            </div>

            {/* Step Indicator */}
            <StepIndicator currentStep={createStep} steps={steps} />
          </div>

          {/* Step 1: Customer Details & Document Type */}
          {createStep === 1 && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Document Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Document Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={billingMode} onValueChange={(value: "GST" | "Non-GST" | "Quotation") => setBillingMode(value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select billing mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GST">GST Billing</SelectItem>
                      <SelectItem value="Non-GST">Non-GST Billing</SelectItem>
                      <SelectItem value="Quotation">Quotation</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={customer.name}
                      onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter customer name"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      value={customer.phone}
                      onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">Address</Label>
                    <Input
                      id="customerAddress"
                      value={customer.address}
                      onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter customer address"
                      className="h-12"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("list")}
                  className="flex-1 h-12"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createInvoice}
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                >
                  <Receipt className="h-5 w-5 mr-2" />
                  Continue to Items
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 & 3: Invoice Creation */}
          {(createStep === 2 || createStep === 3) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Invoice Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Details (Read-only) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Details
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCreateStep(1)}
                        className="ml-auto text-green-600 hover:text-green-700"
                      >
                        Edit
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{currentInvoice.customer.name}</p>
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{currentInvoice.customer.phone}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label>Address</Label>
                        <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{currentInvoice.customer.address || "Not provided"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {createStep === 2 && (
                  <>
                    {/* Add Item Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Add Item
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="productName">Product Name</Label>
                            <Input
                              id="productName"
                              value={newItem.productName}
                              onChange={(e) => setNewItem(prev => ({ ...prev, productName: e.target.value }))}
                              placeholder="Enter product name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                              id="quantity"
                              type="number"
                              min="1"
                              value={newItem.quantity}
                              onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                              placeholder="Enter quantity"
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input
                              id="price"
                              type="number"
                              min="0"
                              step="0.01"
                              value={newItem.price}
                              onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                              placeholder="Enter price"
                            />
                          </div>
                        </div>
                        <Button onClick={addItem} className="mt-4 w-full bg-green-600 hover:bg-green-700">
                          <Package className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Items List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Items ({currentInvoice.items.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentInvoice.items.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No items added yet</p>
                    ) : (
                      <div className="space-y-2">
                        {currentInvoice.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.productName}</h4>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × {formatCurrency(item.price)}
                                {billingMode === "GST" && ` (GST: ${item.gstPercent}%)`}
                              </p>
                            </div>
                            <div className="text-right mr-4">
                              <div className="font-medium">{formatCurrency(item.totalAmount)}</div>
                              {billingMode === "GST" && (
                                <div className="text-xs text-gray-500">
                                  +{formatCurrency(item.gstAmount)} GST
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Invoice Summary & Actions */}
              <div className="space-y-6">
                {/* Discount */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Discount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={currentInvoice.discountPercent}
                        onChange={(e) => setCurrentInvoice(prev => ({
                          ...prev,
                          discountPercent: parseFloat(e.target.value) || 0
                        }))}
                        placeholder="0"
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                    {currentInvoice.discountPercent > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        Discount: {formatCurrency(currentInvoice.discountAmount)}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Invoice Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Invoice Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(currentInvoice.subtotal)}</span>
                      </div>

                      {currentInvoice.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({currentInvoice.discountPercent}%):</span>
                          <span>-{formatCurrency(currentInvoice.discountAmount)}</span>
                        </div>
                      )}

                      {billingMode === "GST" && currentInvoice.gstTotal > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span>CGST (9%):</span>
                            <span>{formatCurrency(currentInvoice.cgst)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>SGST (9%):</span>
                            <span>{formatCurrency(currentInvoice.sgst)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Total GST:</span>
                            <span>{formatCurrency(currentInvoice.gstTotal)}</span>
                          </div>
                        </>
                      )}

                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span className="text-green-600">{formatCurrency(currentInvoice.finalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {createStep === 3 && (
                  <>
                    {/* Return Sale Toggle */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Return Sale
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="returnSale"
                            checked={currentInvoice.isReturnSale}
                            onChange={(e) => setCurrentInvoice(prev => ({
                              ...prev,
                              isReturnSale: e.target.checked
                            }))}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <Label htmlFor="returnSale" className="text-sm">
                            This is a return sale
                          </Label>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Observation */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Observation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <textarea
                          value={currentInvoice.observation}
                          onChange={(e) => setCurrentInvoice(prev => ({
                            ...prev,
                            observation: e.target.value
                          }))}
                          placeholder="Add any notes or observations for this invoice..."
                          className="w-full h-16 p-3 border border-gray-300 rounded-lg resize-none text-sm"
                        />
                      </CardContent>
                    </Card>

                    {/* Terms & Conditions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Terms & Conditions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <textarea
                          value={currentInvoice.termsAndConditions}
                          onChange={(e) => setCurrentInvoice(prev => ({
                            ...prev,
                            termsAndConditions: e.target.value
                          }))}
                          placeholder="Enter terms and conditions..."
                          className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none text-sm"
                        />
                      </CardContent>
                    </Card>

                    {/* Payment Management */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Payment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select
                              value={currentInvoice.paymentMethod}
                              onValueChange={(value: "cash" | "online" | "mixed") =>
                                setCurrentInvoice(prev => ({ ...prev, paymentMethod: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="mixed">Mixed (Cash + Online)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="paymentMode">Payment Status</Label>
                            <Select
                              value={currentInvoice.paymentMode}
                              onValueChange={(value: "full" | "partial") =>
                                setCurrentInvoice(prev => ({ ...prev, paymentMode: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full">Full Payment</SelectItem>
                                <SelectItem value="partial">Partial Payment</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {currentInvoice.paymentMode === "partial" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="paidAmount">Paid Amount (₹)</Label>
                              <Input
                                id="paidAmount"
                                type="number"
                                min="0"
                                max={currentInvoice.finalAmount}
                                value={currentInvoice.paidAmount}
                                onChange={(e) => setCurrentInvoice(prev => ({
                                  ...prev,
                                  paidAmount: parseFloat(e.target.value) || 0
                                }))}
                                placeholder="Enter paid amount"
                              />
                            </div>
                            <div>
                              <Label>Pending Amount</Label>
                              <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm">
                                {formatCurrency(currentInvoice.pendingAmount)}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Action Buttons */}
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    {createStep === 2 && (
                      <Button
                        onClick={() => setCreateStep(3)}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={currentInvoice.items.length === 0}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Continue to Review
                      </Button>
                    )}

                    {createStep === 3 && (
                      <>
                        <Button
                          onClick={() => setShowPreview(true)}
                          variant="outline"
                          className="w-full"
                          disabled={currentInvoice.items.length === 0}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Preview Bill
                        </Button>

                        <Button
                          onClick={saveInvoice}
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={currentInvoice.items.length === 0}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Invoice
                        </Button>

                        <Button
                          onClick={downloadPDF}
                          variant="outline"
                          className="w-full"
                          disabled={currentInvoice.items.length === 0}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>

                        <Button
                          onClick={printInvoice}
                          variant="outline"
                          className="w-full"
                          disabled={currentInvoice.items.length === 0}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print Invoice
                        </Button>

                        <Button
                          onClick={() => setCreateStep(2)}
                          variant="outline"
                          className="w-full"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Items
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Bill Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Preview - {currentInvoice.billNumber}</DialogTitle>
            </DialogHeader>
            <div className="bg-white p-8 border border-gray-200 rounded-lg">
              {/* Invoice Header */}
              <div className="border-b pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-green-600 mb-2">ElectroMart</h1>
                    <p className="text-sm text-gray-600">Business Management Solution</p>
                    <p className="text-sm text-gray-600">Delhi, India</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold mb-2">
                      {billingMode === "Quotation" ? "QUOTATION" : currentInvoice.isReturnSale ? "RETURN INVOICE" : "INVOICE"}
                    </h2>
                    <p><strong>No:</strong> {currentInvoice.billNumber}</p>
                    <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                    <p><strong>Type:</strong> {billingMode}</p>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="mb-6">
                <h3 className="font-bold mb-2">Bill To:</h3>
                <p className="font-medium">{currentInvoice.customer.name}</p>
                <p>Phone: {currentInvoice.customer.phone}</p>
                {currentInvoice.customer.address && (
                  <p>Address: {currentInvoice.customer.address}</p>
                )}
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Item</th>
                      <th className="border border-gray-300 p-2 text-center">Qty</th>
                      <th className="border border-gray-300 p-2 text-right">Rate (₹)</th>
                      {billingMode === 'GST' && (
                        <>
                          <th className="border border-gray-300 p-2 text-center">GST%</th>
                          <th className="border border-gray-300 p-2 text-right">GST Amt (₹)</th>
                        </>
                      )}
                      <th className="border border-gray-300 p-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 p-2">{item.productName}</td>
                        <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 p-2 text-right">{item.price.toLocaleString()}</td>
                        {billingMode === 'GST' && (
                          <>
                            <td className="border border-gray-300 p-2 text-center">{item.gstPercent}%</td>
                            <td className="border border-gray-300 p-2 text-right">{item.gstAmount.toLocaleString()}</td>
                          </>
                        )}
                        <td className="border border-gray-300 p-2 text-right">{item.totalAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-64">
                  <div className="flex justify-between py-1">
                    <span>Subtotal:</span>
                    <span>₹{currentInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  {currentInvoice.discountAmount > 0 && (
                    <div className="flex justify-between py-1 text-green-600">
                      <span>Discount ({currentInvoice.discountPercent}%):</span>
                      <span>-₹{currentInvoice.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {billingMode === 'GST' && currentInvoice.gstTotal > 0 && (
                    <>
                      <div className="flex justify-between py-1">
                        <span>CGST (9%):</span>
                        <span>₹{currentInvoice.cgst.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>SGST (9%):</span>
                        <span>₹{currentInvoice.sgst.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1 font-medium">
                        <span>Total GST:</span>
                        <span>₹{currentInvoice.gstTotal.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Final Amount:</span>
                      <span>₹{currentInvoice.finalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mb-6 grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold mb-2">Payment Details:</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Method:</strong> {currentInvoice.paymentMethod.toUpperCase()}</p>
                    <p><strong>Status:</strong> {currentInvoice.paymentMode === "full" ? "Paid in Full" : "Partial Payment"}</p>
                    {currentInvoice.paymentMode === "partial" && (
                      <>
                        <p><strong>Paid:</strong> ₹{currentInvoice.paidAmount.toLocaleString()}</p>
                        <p className="text-red-600"><strong>Pending:</strong> ₹{currentInvoice.pendingAmount.toLocaleString()}</p>
                      </>
                    )}
                  </div>
                </div>

                {currentInvoice.observation && (
                  <div>
                    <h3 className="font-bold mb-2">Observation:</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded border">{currentInvoice.observation}</p>
                  </div>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="mb-6">
                <h3 className="font-bold mb-2">Terms & Conditions:</h3>
                <div className="text-sm bg-gray-50 p-3 rounded border">
                  {currentInvoice.termsAndConditions.split('\\n').map((term, index) => (
                    <p key={index} className="mb-1">{term}</p>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-600 mt-8 border-t pt-4">
                <p className="font-medium">Thank you for your business!</p>
                <p className="text-xs mt-1">This is a computer-generated document and does not require a signature.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button onClick={() => setShowPreview(false)} variant="outline" className="flex-1">
                Close Preview
              </Button>
              <Button onClick={downloadPDF} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }


  // Billing List View (Default)
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing</h2>
          <p className="text-gray-600">Manage your invoices and billing</p>
        </div>
        <Button onClick={startNewInvoice} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Bills List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {bills && bills.length > 0 ? (
            <div className="space-y-3">
              {bills.slice(0, 10).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Receipt className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{bill.billNumber}</h4>
                        <p className="text-sm text-gray-600">{bill.customer.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <div className="font-medium">{formatCurrency(bill.finalAmount || 0)}</div>
                    <div className="text-xs text-gray-500">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {formatDate(bill.billDate)}
                    </div>
                  </div>
                  <Badge 
                    variant="outline"
                    className={cn(
                      bill.billType === "GST" ? "border-green-200 text-green-800" : "border-blue-200 text-blue-800"
                    )}
                  >
                    {bill.billType}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-600 mb-4">Create your first invoice to get started</p>
              <Button onClick={startNewInvoice} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
