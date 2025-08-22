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
  Plus,
  Search,
  Trash2,
  Receipt,
  Calculator,
  User,
  Package,
  Percent,
  FileText,
  Download,
  Printer,
  CheckCircle,
  X,
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

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
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
  customer: Customer | null;
  items: InvoiceItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  finalTotal: number;
  billingMode: "GST" | "Non-GST";
  createdAt: Date;
  status: "draft" | "finalized";
}

// Mock data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    category: "Mobile",
    brand: "Apple",
    price: 129999,
    gstPercent: 18,
    stockQuantity: 12,
  },
  {
    id: "2",
    name: "Samsung Galaxy S24",
    category: "Mobile",
    brand: "Samsung",
    price: 99999,
    gstPercent: 18,
    stockQuantity: 8,
  },
  {
    id: "3",
    name: "LG 1.5 Ton Split AC",
    category: "AC",
    brand: "LG",
    price: 45999,
    gstPercent: 28,
    stockQuantity: 3,
  },
];

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    phone: "+91 9876543210",
    address: "123 Main Street, Mumbai, Maharashtra 400001",
    email: "john@example.com",
  },
  {
    id: "2",
    name: "Sarah Smith",
    phone: "+91 9876543211",
    address: "456 Park Avenue, Delhi, Delhi 110001",
  },
];

export default function Billing() {
  const [products] = useState<Product[]>(mockProducts);
  const [customers] = useState<Customer[]>(mockCustomers);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>({
    id: "",
    invoiceNumber: "",
    customer: null,
    items: [],
    subtotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalGst: 0,
    finalTotal: 0,
    billingMode: "GST",
    createdAt: new Date(),
    status: "draft",
  });

  const [searchProduct, setSearchProduct] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSelectCustomerOpen, setIsSelectCustomerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState("1");
  const [invoicePreview, setInvoicePreview] = useState<Invoice | null>(null);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchProduct.toLowerCase()),
  );

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
      customer.phone.includes(searchCustomer),
  );

  // Calculate invoice totals
  useEffect(() => {
    const subtotal = currentInvoice.items.reduce(
      (sum, item) => sum + item.totalAmount,
      0,
    );
    const discountAmount = (subtotal * currentInvoice.discountPercent) / 100;
    const discountedSubtotal = subtotal - discountAmount;

    let cgst = 0,
      sgst = 0,
      igst = 0,
      totalGst = 0;

    if (currentInvoice.billingMode === "GST") {
      // For same state: CGST + SGST, for different state: IGST
      const isInterState =
        currentInvoice.customer?.address?.includes("Delhi") &&
        !currentInvoice.customer?.address?.includes("Maharashtra");

      currentInvoice.items.forEach((item) => {
        const itemGst =
          (item.totalAmount *
            (discountedSubtotal / subtotal) *
            item.gstPercent) /
          100;

        if (isInterState) {
          igst += itemGst;
        } else {
          cgst += itemGst / 2;
          sgst += itemGst / 2;
        }
        totalGst += itemGst;
      });
    }

    const finalTotal = discountedSubtotal + totalGst;

    setCurrentInvoice((prev) => ({
      ...prev,
      subtotal,
      discountAmount,
      cgst,
      sgst,
      igst,
      totalGst,
      finalTotal,
    }));
  }, [
    currentInvoice.items,
    currentInvoice.discountPercent,
    currentInvoice.billingMode,
    currentInvoice.customer,
  ]);

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    return `INV-${timestamp.toString().slice(-6)}`;
  };

  const addProductToInvoice = () => {
    if (!selectedProduct) return;

    const quantity = parseInt(productQuantity);
    if (quantity <= 0 || quantity > selectedProduct.stockQuantity) return;

    const totalAmount = selectedProduct.price * quantity;
    const gstAmount =
      currentInvoice.billingMode === "GST"
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

    setCurrentInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setSelectedProduct(null);
    setProductQuantity("1");
    setIsAddProductOpen(false);
  };

  const removeItem = (index: number) => {
    setCurrentInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const selectCustomer = (customer: Customer) => {
    setCurrentInvoice((prev) => ({
      ...prev,
      customer,
    }));
    setIsSelectCustomerOpen(false);
  };

  const newInvoice = () => {
    setCurrentInvoice({
      id: "",
      invoiceNumber: "",
      customer: null,
      items: [],
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalGst: 0,
      finalTotal: 0,
      billingMode: "GST",
      createdAt: new Date(),
      status: "draft",
    });
  };

  const finalizeInvoice = () => {
    if (currentInvoice.items.length === 0) return;

    const invoiceNumber = generateInvoiceNumber();
    const finalizedInvoice = {
      ...currentInvoice,
      id: Date.now().toString(),
      invoiceNumber,
      status: "finalized" as const,
    };

    setInvoicePreview(finalizedInvoice);
    newInvoice();
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Billing & Invoicing
          </h2>
          <p className="text-muted-foreground">
            Create GST and Non-GST invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={newInvoice}>
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Creation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Mode & Customer Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Billing Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={currentInvoice.billingMode}
                  onValueChange={(value: "GST" | "Non-GST") =>
                    setCurrentInvoice((prev) => ({
                      ...prev,
                      billingMode: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GST">GST Billing</SelectItem>
                    <SelectItem value="Non-GST">Non-GST Billing</SelectItem>
                    <SelectItem value="Non-GST">Quatation</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog
                  open={isSelectCustomerOpen}
                  onOpenChange={setIsSelectCustomerOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4" />
                      {currentInvoice.customer?.name || "Select Customer"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Customer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search customers..."
                          value={searchCustomer}
                          onChange={(e) => setSearchCustomer(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            onClick={() => selectCustomer(customer)}
                            className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                          >
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.phone}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Add Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoice Items</CardTitle>
                <Dialog
                  open={isAddProductOpen}
                  onOpenChange={setIsAddProductOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Product to Invoice</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search products..."
                          value={searchProduct}
                          onChange={(e) => setSearchProduct(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => setSelectedProduct(product)}
                            className={cn(
                              "p-3 border rounded-lg cursor-pointer hover:bg-muted/50",
                              selectedProduct?.id === product.id &&
                                "border-primary bg-primary/10",
                            )}
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.brand} • {formatCurrency(product.price)}{" "}
                              • Stock: {product.stockQuantity}
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedProduct && (
                        <div className="border-t pt-4 space-y-4">
                          <div>
                            <Label>Selected Product</Label>
                            <p className="font-medium">
                              {selectedProduct.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Price: {formatCurrency(selectedProduct.price)} |
                              GST: {selectedProduct.gstPercent}%
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
                              onChange={(e) =>
                                setProductQuantity(e.target.value)
                              }
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={addProductToInvoice}
                              className="flex-1"
                            >
                              Add to Invoice
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedProduct(null)}
                            >
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
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  No items added yet
                </div>
              ) : (
                <div className="space-y-3">
                  {currentInvoice.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                          {currentInvoice.billingMode === "GST" &&
                            ` (GST: ${item.gstPercent}%)`}
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="font-semibold">
                          {formatCurrency(item.totalAmount)}
                        </div>
                        {currentInvoice.billingMode === "GST" && (
                          <div className="text-xs text-muted-foreground">
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
                <CardTitle className="text-sm">Discount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={currentInvoice.discountPercent}
                    onChange={(e) =>
                      setCurrentInvoice((prev) => ({
                        ...prev,
                        discountPercent: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-24"
                  />
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground ml-2">
                    = {formatCurrency(currentInvoice.discountAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Invoice Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(currentInvoice.subtotal)}</span>
              </div>

              {currentInvoice.discountPercent > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Discount ({currentInvoice.discountPercent}%):</span>
                  <span>-{formatCurrency(currentInvoice.discountAmount)}</span>
                </div>
              )}

              {currentInvoice.billingMode === "GST" &&
                currentInvoice.totalGst > 0 && (
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
                  <span>{formatCurrency(currentInvoice.finalTotal)}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={finalizeInvoice}
                  disabled={currentInvoice.items.length === 0}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4" />
                  Finalize Invoice
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing Mode Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {currentInvoice.billingMode} Billing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={
                  currentInvoice.billingMode === "GST" ? "default" : "secondary"
                }
              >
                {currentInvoice.billingMode}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {currentInvoice.billingMode === "GST"
                  ? "Tax calculations include CGST, SGST, or IGST based on customer location"
                  : "No tax calculations applied"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog
        open={!!invoicePreview}
        onOpenChange={() => setInvoicePreview(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Invoice Generated
            </DialogTitle>
          </DialogHeader>
          {invoicePreview && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold">ElectroMart</h3>
                <p className="text-sm text-muted-foreground">
                  Electronic Shop Management
                </p>
                <div className="mt-4">
                  <Badge variant="outline" className="text-lg px-4 py-1">
                    {invoicePreview.invoiceNumber}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Bill To:</h4>
                  {invoicePreview.customer ? (
                    <div>
                      <p className="font-medium">
                        {invoicePreview.customer.name}
                      </p>
                      <p>{invoicePreview.customer.phone}</p>
                      <p className="text-xs">
                        {invoicePreview.customer.address}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Walk-in Customer</p>
                  )}
                </div>
                <div className="text-right">
                  <h4 className="font-semibold mb-2">Invoice Details:</h4>
                  <p>
                    Date: {invoicePreview.createdAt.toLocaleDateString("en-IN")}
                  </p>
                  <p>Mode: {invoicePreview.billingMode}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Items:</h4>
                {invoicePreview.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm py-1 border-b"
                  >
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span>{formatCurrency(item.totalAmount)}</span>
                  </div>
                ))}
              </div>

              <div className="text-right space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoicePreview.subtotal)}</span>
                </div>
                {invoicePreview.discountAmount > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Discount:</span>
                    <span>
                      -{formatCurrency(invoicePreview.discountAmount)}
                    </span>
                  </div>
                )}
                {invoicePreview.billingMode === "GST" && (
                  <>
                    {invoicePreview.cgst > 0 && (
                      <div className="flex justify-between">
                        <span>CGST:</span>
                        <span>{formatCurrency(invoicePreview.cgst)}</span>
                      </div>
                    )}
                    {invoicePreview.sgst > 0 && (
                      <div className="flex justify-between">
                        <span>SGST:</span>
                        <span>{formatCurrency(invoicePreview.sgst)}</span>
                      </div>
                    )}
                    {invoicePreview.igst > 0 && (
                      <div className="flex justify-between">
                        <span>IGST:</span>
                        <span>{formatCurrency(invoicePreview.igst)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(invoicePreview.finalTotal)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4" />
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
