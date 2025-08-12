import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useBilling } from "@/contexts/BillingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductContext";
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
  X
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
  finalAmount: number;
  billingMode: "GST" | "Non-GST";
  createdAt: Date;
  status: "draft" | "saved";
}

export default function SimpleBilling() {
  const { addBill, bills } = useBilling();
  const { user } = useAuth();
  const { products } = useProducts();
  
  // Current workflow state
  const [currentStep, setCurrentStep] = useState<"customer" | "invoice" | "list">("list");
  const [billingMode, setBillingMode] = useState<"GST" | "Non-GST">("GST");
  
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
    finalAmount: 0,
    billingMode: "GST",
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
    if (billingMode === "GST") {
      gstTotal = currentInvoice.items.reduce((sum, item) => sum + item.gstAmount, 0);
    }
    
    const finalAmount = discountedSubtotal + gstTotal;
    
    setCurrentInvoice(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      gstTotal,
      finalAmount,
    }));
  }, [currentInvoice.items, currentInvoice.discountPercent, billingMode]);
  
  // Start new invoice
  const startNewInvoice = () => {
    setCustomer({ name: "", phone: "", address: "" });
    setCurrentStep("customer");
  };
  
  // Create invoice from customer details
  const createInvoice = () => {
    if (!customer.name || !customer.phone) {
      alert("Please fill in customer name and phone number");
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
      finalAmount: 0,
      billingMode,
      createdAt: new Date(),
      status: "draft",
    });
    
    setCurrentStep("invoice");
  };
  
  // Add item to invoice
  const addItem = () => {
    if (!newItem.productName || newItem.quantity <= 0 || newItem.price <= 0) {
      alert("Please fill in all item details");
      return;
    }
    
    const totalAmount = newItem.quantity * newItem.price;
    const gstAmount = billingMode === "GST" ? (totalAmount * newItem.gstPercent) / 100 : 0;
    
    const item: InvoiceItem = {
      id: Date.now().toString(),
      productName: newItem.productName,
      quantity: newItem.quantity,
      price: newItem.price,
      gstPercent: newItem.gstPercent,
      totalAmount,
      gstAmount,
    };
    
    setCurrentInvoice(prev => ({
      ...prev,
      items: [...prev.items, item],
    }));
    
    setNewItem({
      productName: "",
      quantity: 1,
      price: 0,
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
      alert("Please add at least one item to the invoice");
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
    alert("Invoice saved successfully!");
  };
  
  // Download PDF
  const downloadPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('ElectroMart', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text('INVOICE', 105, 30, { align: 'center' });
      
      // Invoice details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice No: ${currentInvoice.billNumber}`, 20, 45);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 52);
      doc.text(`Mode: ${billingMode} Billing`, 20, 59);
      
      // Customer details
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To:', 20, 75);
      doc.setFont('helvetica', 'normal');
      doc.text(currentInvoice.customer.name, 20, 82);
      doc.text(`Phone: ${currentInvoice.customer.phone}`, 20, 89);
      if (currentInvoice.customer.address) {
        doc.text(`Address: ${currentInvoice.customer.address}`, 20, 96);
      }
      
      // Items table
      let yPos = 115;
      doc.setFont('helvetica', 'bold');
      doc.text('Item', 20, yPos);
      doc.text('Qty', 80, yPos);
      doc.text('Rate (₹)', 100, yPos);
      if (billingMode === 'GST') {
        doc.text('GST%', 130, yPos);
        doc.text('GST Amt (₹)', 150, yPos);
        doc.text('Total (₹)', 175, yPos);
      } else {
        doc.text('Total (₹)', 150, yPos);
      }
      
      doc.line(20, yPos + 2, 190, yPos + 2);
      yPos += 10;
      
      // Items
      doc.setFont('helvetica', 'normal');
      currentInvoice.items.forEach(item => {
        doc.text(item.productName.substring(0, 25), 20, yPos);
        doc.text(item.quantity.toString(), 80, yPos);
        doc.text(item.price.toLocaleString(), 100, yPos);
        if (billingMode === 'GST') {
          doc.text(`${item.gstPercent}%`, 130, yPos);
          doc.text(item.gstAmount.toLocaleString(), 150, yPos);
          doc.text(item.totalAmount.toLocaleString(), 175, yPos);
        } else {
          doc.text(item.totalAmount.toLocaleString(), 150, yPos);
        }
        yPos += 8;
      });
      
      // Totals
      yPos += 10;
      doc.line(100, yPos, 190, yPos);
      yPos += 8;
      
      doc.text('Subtotal:', 130, yPos);
      doc.text(`₹${currentInvoice.subtotal.toLocaleString()}`, 175, yPos);
      yPos += 6;
      
      if (currentInvoice.discountAmount > 0) {
        doc.text(`Discount (${currentInvoice.discountPercent}%):`, 130, yPos);
        doc.text(`-₹${currentInvoice.discountAmount.toLocaleString()}`, 175, yPos);
        yPos += 6;
      }
      
      if (billingMode === 'GST' && currentInvoice.gstTotal > 0) {
        doc.text('Total GST:', 130, yPos);
        doc.text(`₹${currentInvoice.gstTotal.toLocaleString()}`, 175, yPos);
        yPos += 8;
      }
      
      // Final total
      doc.line(130, yPos, 190, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Final Amount:', 130, yPos);
      doc.text(`₹${currentInvoice.finalAmount.toLocaleString()}`, 175, yPos);
      
      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for your business!', 105, 280, { align: 'center' });
      
      doc.save(`Invoice_${currentInvoice.billNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };
  
  // Print invoice
  const printInvoice = () => {
    window.print();
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

  // Customer Input Form
  if (currentStep === "customer") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">New Invoice</h1>
            <p className="text-gray-600">Enter customer details to create a new invoice</p>
          </div>
          
          {/* Billing Mode Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Billing Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={billingMode === "GST" ? "default" : "outline"}
                  onClick={() => setBillingMode("GST")}
                  className="flex-1"
                >
                  GST Billing
                </Button>
                <Button
                  variant={billingMode === "Non-GST" ? "default" : "outline"}
                  onClick={() => setBillingMode("Non-GST")}
                  className="flex-1"
                >
                  Non-GST Billing
                </Button>
              </div>
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

  // Invoice Creation Form
  if (currentStep === "invoice") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
                <p className="text-gray-600">Invoice No: {currentInvoice.billNumber}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep("list")}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Invoice Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Details (Read-only) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Details
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
              
              {/* Add Item Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Add Item
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
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
                        onChange={(e) => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    {billingMode === "GST" && (
                      <div>
                        <Label htmlFor="gstPercent">GST %</Label>
                        <Input
                          id="gstPercent"
                          type="number"
                          min="0"
                          max="100"
                          value={newItem.gstPercent}
                          onChange={(e) => setNewItem(prev => ({ ...prev, gstPercent: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    )}
                  </div>
                  <Button onClick={addItem} className="mt-4 w-full bg-green-600 hover:bg-green-700">
                    <Package className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardContent>
              </Card>
              
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
                      <div className="flex justify-between">
                        <span>Total GST:</span>
                        <span>{formatCurrency(currentInvoice.gstTotal)}</span>
                      </div>
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
              
              {/* Action Buttons */}
              <Card>
                <CardContent className="pt-6 space-y-3">
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
                </CardContent>
              </Card>
            </div>
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
