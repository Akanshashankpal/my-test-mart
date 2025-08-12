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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Calculator,
  User,
  Package,
  CheckCircle,
  X,
  FileText,
  Download,
  Printer,
  Edit,
  Trash2,
  Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  gstPercent: number;
  stockQuantity: number;
}

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  gstPercent: number;
  totalAmount: number;
  gstAmount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  finalAmount: number;
  billingMode: "GST" | "Non-GST" | "Demo";
  createdAt: Date;
  status: "draft" | "finalized";
}

// Product search functionality will use products from context

export default function EnhancedBilling() {
  const { addBill } = useBilling();
  const { user } = useAuth();
  const { products, updateStock } = useProducts();
  const [billingMode, setBillingMode] = useState<"GST" | "Non-GST" | "Demo" | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>({
    id: "",
    invoiceNumber: "",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    items: [],
    subtotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalGst: 0,
    finalAmount: 0,
    billingMode: "GST",
    createdAt: new Date(),
    status: "draft",
  });

  const [searchProduct, setSearchProduct] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState("1");
  const [invoicePreview, setInvoicePreview] = useState<Invoice | null>(null);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchProduct.toLowerCase())
  );

  // Calculate invoice totals
  useEffect(() => {
    const subtotal = currentInvoice.items.reduce((sum, item) => sum + item.totalAmount, 0);
    const discountAmount = (subtotal * currentInvoice.discountPercent) / 100;
    const discountedSubtotal = subtotal - discountAmount;

    let cgst = 0, sgst = 0, igst = 0, totalGst = 0;

    if (currentInvoice.billingMode === "GST") {
      currentInvoice.items.forEach(item => {
        const itemGst = ((item.totalAmount * (discountedSubtotal / subtotal)) * item.gstPercent) / 100;
        
        // For demo, assume intra-state (CGST + SGST)
        cgst += itemGst / 2;
        sgst += itemGst / 2;
        totalGst += itemGst;
      });
    }

    const finalAmount = discountedSubtotal + totalGst;

    setCurrentInvoice(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      cgst,
      sgst,
      igst,
      totalGst,
      finalAmount,
    }));
  }, [currentInvoice.items, currentInvoice.discountPercent, currentInvoice.billingMode]);

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const prefix = billingMode === "GST" ? "GST" : billingMode === "Non-GST" ? "NGST" : "DEMO";
    return `${prefix}/24/${timestamp.toString().slice(-4)}`;
  };

  const addProductToInvoice = () => {
    if (!selectedProduct) return;

    const quantity = parseInt(productQuantity);
    if (quantity <= 0 || quantity > selectedProduct.stockQuantity) return;

    const totalAmount = selectedProduct.price * quantity;
    const gstAmount = currentInvoice.billingMode === "GST" 
      ? (totalAmount * selectedProduct.gstPercent) / 100 
      : 0;

    const newItem: InvoiceItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      price: selectedProduct.price,
      gstPercent: selectedProduct.gstPercent,
      totalAmount,
      gstAmount,
    };

    setCurrentInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setSelectedProduct(null);
    setProductQuantity("1");
    setIsAddProductOpen(false);
  };

  const removeItem = (index: number) => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const newInvoice = () => {
    setCurrentInvoice({
      id: "",
      invoiceNumber: "",
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      items: [],
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalGst: 0,
      finalAmount: 0,
      billingMode: billingMode || "GST",
      createdAt: new Date(),
      status: "draft",
    });
  };

  const downloadPDF = async () => {
    // Generate invoice number if not exists
    const invoiceNumber = currentInvoice.invoiceNumber || generateInvoiceNumber();

    // Update current invoice with generated invoice number if it doesn't exist
    if (!currentInvoice.invoiceNumber) {
      setCurrentInvoice(prev => ({
        ...prev,
        invoiceNumber: invoiceNumber
      }));
    }

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
      doc.text(`Invoice No: ${invoiceNumber}`, 20, 45);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 52);
      doc.text(`Mode: ${currentInvoice.billingMode} Billing`, 20, 59);

      // Customer Info
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To:', 20, 75);
      doc.setFont('helvetica', 'normal');
      doc.text(currentInvoice.customerName, 20, 82);
      doc.text(`Phone: ${currentInvoice.customerPhone}`, 20, 89);
      if (currentInvoice.customerAddress) {
        doc.text(`Address: ${currentInvoice.customerAddress}`, 20, 96);
      }

      // Table Headers
      let yPos = 115;
      doc.setFont('helvetica', 'bold');
      doc.text('Item', 20, yPos);
      doc.text('Qty', 80, yPos);
      doc.text('Rate (₹)', 100, yPos);
      if (currentInvoice.billingMode === 'GST') {
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
      currentInvoice.items.forEach(item => {
        doc.text(item.productName.substring(0, 25), 20, yPos);
        doc.text(item.quantity.toString(), 80, yPos);
        doc.text(item.price.toLocaleString(), 100, yPos);
        if (currentInvoice.billingMode === 'GST') {
          doc.text(`${item.gstPercent}%`, 130, yPos);
          doc.text(item.gstAmount.toLocaleString(), 150, yPos);
          doc.text(item.totalAmount.toLocaleString(), 175, yPos);
        } else {
          doc.text(item.totalAmount.toLocaleString(), 150, yPos);
        }
        yPos += 8;
      });

      // Totals section
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

      if (currentInvoice.billingMode === 'GST' && currentInvoice.totalGst > 0) {
        doc.text('CGST:', 130, yPos);
        doc.text(`₹${currentInvoice.cgst.toLocaleString()}`, 175, yPos);
        yPos += 6;

        doc.text('SGST:', 130, yPos);
        doc.text(`₹${currentInvoice.sgst.toLocaleString()}`, 175, yPos);
        yPos += 6;

        doc.text('Total GST:', 130, yPos);
        doc.text(`₹${currentInvoice.totalGst.toLocaleString()}`, 175, yPos);
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

      // Save the PDF
      doc.save(`Invoice_${invoiceNumber}.pdf`);

      // Also save to billing history
      saveBillToHistory();

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const finalizeInvoice = () => {
    if (currentInvoice.items.length === 0 || !currentInvoice.customerName) return;

    const invoiceNumber = generateInvoiceNumber();
    const finalizedInvoice = {
      ...currentInvoice,
      id: Date.now().toString(),
      invoiceNumber,
      status: "finalized" as const,
    };

    // Update stock for all items
    currentInvoice.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        updateStock(product.id, product.stockQuantity - item.quantity);
      }
    });

    // Save to billing history
    saveBillToHistory();

    setInvoicePreview(finalizedInvoice);
    newInvoice();
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const saveBillToHistory = () => {
    if (currentInvoice.items.length === 0 || !currentInvoice.customerName) return;

    const invoiceNumber = currentInvoice.invoiceNumber || generateInvoiceNumber();

    const newBill = {
      id: Date.now().toString(),
      billNumber: invoiceNumber,
      billType: currentInvoice.billingMode,
      billDate: new Date(),
      customer: {
        id: Date.now().toString(),
        name: currentInvoice.customerName,
        phone: currentInvoice.customerPhone,
        address: currentInvoice.customerAddress,
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
      taxAmount: currentInvoice.totalGst,
      cgst: currentInvoice.cgst,
      sgst: currentInvoice.sgst,
      igst: currentInvoice.igst,
      totalGst: currentInvoice.totalGst,
      finalAmount: currentInvoice.finalAmount,
      paymentStatus: "Pending" as const,
      createdBy: user?.name || "Unknown",
      createdAt: new Date(),
      status: "Draft" as const,
    };

    addBill(newBill);

    // Update the current invoice with the generated number
    setCurrentInvoice(prev => ({
      ...prev,
      invoiceNumber: invoiceNumber
    }));
  };

  // Billing mode selection screen
  if (!billingMode) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Billing Mode</h1>
            <p className="text-gray-600">Choose the type of invoice you want to create</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                mode: "GST" as const,
                title: "GST Billing",
                description: "Create GST compliant invoices with CGST, SGST, or IGST",
                icon: Calculator,
                color: "green"
              },
              {
                mode: "Non-GST" as const,
                title: "Non-GST Billing",
                description: "Create simple invoices without GST calculations",
                icon: FileText,
                color: "blue"
              },
              {
                mode: "Demo" as const,
                title: "Demo Billing",
                description: "Create demo invoices for testing purposes",
                icon: Package,
                color: "purple"
              }
            ].map((option) => (
              <Card
                key={option.mode}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-green-300"
                onClick={() => {
                  setBillingMode(option.mode);
                  setCurrentInvoice(prev => ({ ...prev, billingMode: option.mode }));
                }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className={cn(
                    "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
                    option.color === "green" && "bg-green-100 text-green-600",
                    option.color === "blue" && "bg-blue-100 text-blue-600",
                    option.color === "purple" && "bg-purple-100 text-purple-600"
                  )}>
                    <option.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                    <p className="text-gray-600 text-sm">{option.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
              <p className="text-gray-600">
                {billingMode} Billing Mode
                <Button
                  variant="link"
                  onClick={() => setBillingMode(null)}
                  className="ml-2 p-0 h-auto text-green-600"
                >
                  Change Mode
                </Button>
              </p>
            </div>
            <Button onClick={newInvoice} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={currentInvoice.customerName}
                    onChange={(e) => setCurrentInvoice(prev => ({ 
                      ...prev, 
                      customerName: e.target.value 
                    }))}
                    placeholder="Enter customer name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={currentInvoice.customerPhone}
                    onChange={(e) => setCurrentInvoice(prev => ({ 
                      ...prev, 
                      customerPhone: e.target.value 
                    }))}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Address</Label>
                <Input
                  id="customerAddress"
                  value={currentInvoice.customerAddress}
                  onChange={(e) => setCurrentInvoice(prev => ({ 
                    ...prev, 
                    customerAddress: e.target.value 
                  }))}
                  placeholder="Customer address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Invoice Items
                </CardTitle>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Product to Invoice</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search products..."
                          value={searchProduct}
                          onChange={(e) => setSearchProduct(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            onClick={() => setSelectedProduct(product)}
                            className={cn(
                              "p-3 border rounded-lg cursor-pointer hover:bg-gray-50",
                              selectedProduct?.id === product.id && "border-green-500 bg-green-50"
                            )}
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-600">
                              {product.brand} • {formatCurrency(product.price)} • Stock: {product.stockQuantity}
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedProduct && (
                        <div className="border-t pt-4 space-y-4">
                          <div>
                            <Label>Selected Product</Label>
                            <p className="font-medium">{selectedProduct.name}</p>
                            <p className="text-sm text-gray-600">
                              Price: {formatCurrency(selectedProduct.price)} | GST: {selectedProduct.gstPercent}%
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                              id="quantity"
                              type="number"
                              min="1"
                              max={selectedProduct.stockQuantity}
                              value={productQuantity}
                              onChange={(e) => setProductQuantity(e.target.value)}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={addProductToInvoice} className="flex-1">
                              Add to Invoice
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {currentInvoice.items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items added yet</p>
                  <p className="text-sm">Click "Add Product" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentInvoice.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-600">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                          {currentInvoice.billingMode === "GST" && ` (GST: ${item.gstPercent}%)`}
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="font-semibold">{formatCurrency(item.totalAmount)}</div>
                        {currentInvoice.billingMode === "GST" && (
                          <div className="text-xs text-gray-500">
                            +{formatCurrency(item.gstAmount)} GST
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discount */}
          {currentInvoice.items.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Discount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
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
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    = {formatCurrency(currentInvoice.discountAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Side Panel - Invoice Summary */}
      <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <Card className="sticky top-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Invoice Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(currentInvoice.subtotal)}</span>
              </div>
              
              {currentInvoice.discountPercent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({currentInvoice.discountPercent}%):</span>
                  <span>-{formatCurrency(currentInvoice.discountAmount)}</span>
                </div>
              )}

              {currentInvoice.billingMode === "GST" && currentInvoice.totalGst > 0 && (
                <>
                  <div className="border-t pt-2 space-y-1">
                    {currentInvoice.cgst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>CGST:</span>
                        <span>{formatCurrency(currentInvoice.cgst)}</span>
                      </div>
                    )}
                    {currentInvoice.sgst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>SGST:</span>
                        <span>{formatCurrency(currentInvoice.sgst)}</span>
                      </div>
                    )}
                    {currentInvoice.igst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>IGST:</span>
                        <span>{formatCurrency(currentInvoice.igst)}</span>
                      </div>
                    )}
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

            <div className="space-y-2">
              <Button
                onClick={finalizeInvoice}
                disabled={currentInvoice.items.length === 0 || !currentInvoice.customerName}
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalize Invoice
              </Button>

              <Button
                onClick={downloadPDF}
                disabled={currentInvoice.items.length === 0 || !currentInvoice.customerName}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>

              <div className="text-xs text-center text-gray-500">
                Mode: <Badge variant="outline">{currentInvoice.billingMode}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={!!invoicePreview} onOpenChange={() => setInvoicePreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Invoice Generated Successfully
            </DialogTitle>
          </DialogHeader>
          {invoicePreview && (
            <div className="space-y-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-green-800">Invoice Created!</h3>
                <p className="text-green-700">Invoice #{invoicePreview.invoiceNumber}</p>
                <p className="text-sm text-green-600 mt-1">
                  Total: {formatCurrency(invoicePreview.finalAmount)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
