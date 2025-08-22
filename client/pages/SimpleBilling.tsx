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
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
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

            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">New Invoice</h1>
              <p className="text-gray-600">Enter customer details to create a new invoice</p>
            </div>
          </div>
          
          {/* Billing Mode Selection */}
          <Card className="mb-6">
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
          
          {/* Customer Form */}
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
              Create Invoice
            </Button>
          </div>
        </div>
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
