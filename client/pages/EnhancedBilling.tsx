import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DollarSign,
  Search,
  Edit,
  Copy
} from 'lucide-react';
import { billsAPI, customersAPI, productsAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  gstNumber?: string;
  state: string;
  status: 'active' | 'inactive';
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  gstRate: number;
  category: string;
  stock: number;
}

interface BillItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  unit: string;
  gstRate: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

interface Bill {
  id?: string;
  billNumber?: string;
  billType: 'GST' | 'Non-GST' | 'Demo';
  financialYear: string;
  billDate: string;
  dueDate?: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    gstNumber?: string;
    state: string;
    stateCode: string;
  };
  company: {
    name: string;
    address: string;
    gstNumber: string;
    state: string;
    stateCode: string;
    phone: string;
    email: string;
  };
  items: BillItem[];
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
  paymentStatus: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
  paymentMethod?: string;
  notes?: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Cancelled';
}

// State codes mapping
const stateCodes: { [key: string]: string } = {
  'Andhra Pradesh': '37',
  'Arunachal Pradesh': '12',
  'Assam': '18',
  'Bihar': '10',
  'Chhattisgarh': '22',
  'Goa': '30',
  'Gujarat': '24',
  'Haryana': '06',
  'Himachal Pradesh': '02',
  'Jharkhand': '20',
  'Karnataka': '29',
  'Kerala': '32',
  'Madhya Pradesh': '23',
  'Maharashtra': '27',
  'Manipur': '14',
  'Meghalaya': '17',
  'Mizoram': '15',
  'Nagaland': '13',
  'Odisha': '21',
  'Punjab': '03',
  'Rajasthan': '08',
  'Sikkim': '11',
  'Tamil Nadu': '33',
  'Telangana': '36',
  'Tripura': '16',
  'Uttar Pradesh': '09',
  'Uttarakhand': '05',
  'West Bengal': '19',
  'Delhi': '07',
};

const defaultCompany = {
  name: 'ElectroMart Pvt Ltd',
  address: '123 Business Park, Electronic City, Bangalore, Karnataka 560100',
  gstNumber: '29ABCDE1234F1Z5',
  state: 'Karnataka',
  stateCode: '29',
  phone: '+91 80 2345 6789',
  email: 'info@electromart.com'
};

export default function EnhancedBilling() {
  const [bill, setBill] = useState<Bill>({
    billType: 'GST',
    financialYear: '2024-25',
    billDate: new Date().toISOString().split('T')[0],
    customer: {
      id: '',
      name: '',
      phone: '',
      address: '',
      state: 'Karnataka',
      stateCode: '29'
    },
    company: defaultCompany,
    items: [],
    subtotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    taxableAmount: 0,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    totalTax: 0,
    roundOffAmount: 0,
    finalAmount: 0,
    paymentStatus: 'Pending',
    status: 'Draft',
    notes: ''
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [customRate, setCustomRate] = useState<number | null>(null);

  // Fetch customers and products
  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customersAPI.getCustomers({ limit: 100 });
      if (response.success) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getProducts({ limit: 100 });
      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Calculate bill amounts
  const calculateBill = () => {
    const calculated = billsAPI.calculateBillAmounts(bill);
    setBill(prev => ({ ...prev, ...calculated }));
  };

  useEffect(() => {
    calculateBill();
  }, [bill.items, bill.discountPercent, bill.customer.state]);

  // Customer selection
  const selectCustomer = (customer: Customer) => {
    setBill(prev => ({
      ...prev,
      customer: {
        ...customer,
        stateCode: stateCodes[customer.state] || '29'
      }
    }));
    setIsCustomerDialogOpen(false);
    setSearchCustomer('');
  };

  // Add item to bill
  const addItem = () => {
    if (!selectedProduct) return;

    const rate = customRate || selectedProduct.price;
    const taxableAmount = productQuantity * rate;
    const gstAmount = (taxableAmount * selectedProduct.gstRate) / 100;
    
    const isInterState = bill.customer.state !== bill.company.state;
    
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (bill.billType === 'GST') {
      if (isInterState) {
        igstAmount = gstAmount;
      } else {
        cgstAmount = gstAmount / 2;
        sgstAmount = gstAmount / 2;
      }
    }

    const newItem: BillItem = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: productQuantity,
      rate,
      unit: selectedProduct.unit,
      gstRate: selectedProduct.gstRate,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount: taxableAmount + gstAmount
    };

    setBill(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Reset form
    setSelectedProduct(null);
    setProductQuantity(1);
    setCustomRate(null);
    setIsProductDialogOpen(false);
    setSearchProduct('');
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setBill(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Update item quantity
  const updateItemQuantity = (itemId: string, quantity: number) => {
    setBill(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const taxableAmount = quantity * item.rate;
          const gstAmount = (taxableAmount * item.gstRate) / 100;
          
          const isInterState = bill.customer.state !== bill.company.state;
          
          let cgstAmount = 0;
          let sgstAmount = 0;
          let igstAmount = 0;

          if (bill.billType === 'GST') {
            if (isInterState) {
              igstAmount = gstAmount;
            } else {
              cgstAmount = gstAmount / 2;
              sgstAmount = gstAmount / 2;
            }
          }

          return {
            ...item,
            quantity,
            taxableAmount,
            cgstAmount,
            sgstAmount,
            igstAmount,
            totalAmount: taxableAmount + gstAmount
          };
        }
        return item;
      })
    }));
  };

  // Save bill
  const saveBill = async () => {
    if (!bill.customer.name || bill.items.length === 0) {
      alert('Please select customer and add at least one item');
      return;
    }

    setIsLoading(true);
    try {
      const response = await billsAPI.createBill(bill);
      alert('Bill saved successfully!');
      // Reset form or redirect
    } catch (error: any) {
      console.error('Error saving bill:', error);
      alert(`Error saving bill: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate PDF
  const generatePDF = async () => {
    if (!bill.id) {
      alert('Please save the bill first');
      return;
    }

    try {
      const pdfBlob = await billsAPI.generatePDF(bill.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Bill-${bill.billNumber || 'draft'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error.message || 'Unknown error occurred'}`);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    customer.phone.includes(searchCustomer)
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.category.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Bill</h1>
          <p className="text-gray-600 mt-1">Generate GST/Non-GST bills with automatic calculations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="outline" onClick={generatePDF} disabled={!bill.id}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={saveBill} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Bill'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Bill Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bill Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Bill Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="billType">Bill Type</Label>
                  <Select value={bill.billType} onValueChange={(value: 'GST' | 'Non-GST' | 'Demo') => 
                    setBill(prev => ({ ...prev, billType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GST">GST Bill</SelectItem>
                      <SelectItem value="Non-GST">Non-GST Bill</SelectItem>
                      <SelectItem value="Demo">Demo Bill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="billDate">Bill Date</Label>
                  <Input
                    id="billDate"
                    type="date"
                    value={bill.billDate}
                    onChange={(e) => setBill(prev => ({ ...prev, billDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="financialYear">Financial Year</Label>
                  <Select value={bill.financialYear} onValueChange={(value) => 
                    setBill(prev => ({ ...prev, financialYear: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2023-24">2023-24</SelectItem>
                      <SelectItem value="2022-23">2022-23</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bill.customer.name ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{bill.customer.name}</h3>
                      <p className="text-gray-600">{bill.customer.phone}</p>
                      {bill.customer.email && (
                        <p className="text-gray-600">{bill.customer.email}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsCustomerDialogOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{bill.customer.address}</p>
                  <div className="flex gap-4 text-sm">
                    <span><strong>State:</strong> {bill.customer.state}</span>
                    {bill.customer.gstNumber && (
                      <span><strong>GST:</strong> {bill.customer.gstNumber}</span>
                    )}
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-20 border-dashed"
                  onClick={() => setIsCustomerDialogOpen(true)}
                >
                  <User className="h-6 w-6 mr-2" />
                  Select Customer
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items
                </div>
                <Button size="sm" onClick={() => setIsProductDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bill.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">GST%</TableHead>
                        {bill.billType === 'GST' && (
                          <>
                            <TableHead className="text-right">CGST</TableHead>
                            <TableHead className="text-right">SGST</TableHead>
                            <TableHead className="text-right">IGST</TableHead>
                          </>
                        )}
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bill.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-gray-500">{item.unit}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))}
                              className="w-20 text-center"
                              min="1"
                            />
                          </TableCell>
                          <TableCell className="text-right">₹{item.rate.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.gstRate}%</TableCell>
                          {bill.billType === 'GST' && (
                            <>
                              <TableCell className="text-right">₹{item.cgstAmount.toFixed(2)}</TableCell>
                              <TableCell className="text-right">₹{item.sgstAmount.toFixed(2)}</TableCell>
                              <TableCell className="text-right">₹{item.igstAmount.toFixed(2)}</TableCell>
                            </>
                          )}
                          <TableCell className="text-right font-medium">₹{item.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items added yet</p>
                  <p className="text-sm">Click "Add Item" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any additional notes or terms..."
                value={bill.notes || ''}
                onChange={(e) => setBill(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Bill Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Bill Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{bill.subtotal.toFixed(2)}</span>
                </div>
                
                {bill.discountPercent > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({bill.discountPercent}%):</span>
                    <span>-₹{bill.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Taxable Amount:</span>
                  <span>₹{bill.taxableAmount.toFixed(2)}</span>
                </div>

                {bill.billType === 'GST' && bill.totalTax > 0 && (
                  <>
                    {bill.cgstTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>CGST:</span>
                        <span>₹{bill.cgstTotal.toFixed(2)}</span>
                      </div>
                    )}
                    {bill.sgstTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>SGST:</span>
                        <span>₹{bill.sgstTotal.toFixed(2)}</span>
                      </div>
                    )}
                    {bill.igstTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>IGST:</span>
                        <span>₹{bill.igstTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Total Tax:</span>
                      <span>₹{bill.totalTax.toFixed(2)}</span>
                    </div>
                  </>
                )}

                {bill.roundOffAmount !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Round Off:</span>
                    <span>₹{bill.roundOffAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Final Amount:</span>
                    <span>₹{bill.finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Discount Input */}
              <div className="mt-4">
                <Label htmlFor="discount">Discount %</Label>
                <Input
                  id="discount"
                  type="number"
                  value={bill.discountPercent}
                  onChange={(e) => setBill(prev => ({ ...prev, discountPercent: Number(e.target.value) }))}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              {/* Payment Section */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold">Payment Details</h4>

                <div>
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select value={bill.paymentStatus} onValueChange={(value: any) =>
                    setBill(prev => ({ ...prev, paymentStatus: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bill.paymentStatus === 'Paid' && (
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={bill.paymentMethod || ''} onValueChange={(value) =>
                      setBill(prev => ({ ...prev, paymentMethod: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Debit Card">Debit Card</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Quick Payment Buttons for common amounts */}
                <div className="space-y-2">
                  <Label>Quick Payment</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBill(prev => ({ ...prev, paymentStatus: 'Paid', paymentMethod: 'Cash' }))}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Cash Payment
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBill(prev => ({ ...prev, paymentStatus: 'Paid', paymentMethod: 'UPI' }))}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      📱 UPI Payment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="font-semibold">{bill.company.name}</div>
              <div className="text-gray-600">{bill.company.address}</div>
              <div><strong>GST:</strong> {bill.company.gstNumber}</div>
              <div><strong>Phone:</strong> {bill.company.phone}</div>
              <div><strong>Email:</strong> {bill.company.email}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Selection Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select or Add Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers by name or phone..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => {
                  // Add new customer functionality
                  const name = prompt('Enter customer name:');
                  const phone = prompt('Enter phone number:');
                  const address = prompt('Enter address:');

                  if (name && phone && address) {
                    const newCustomer = {
                      id: Date.now().toString(),
                      name,
                      phone,
                      address,
                      email: '',
                      state: 'Karnataka',
                      status: 'active' as const
                    };

                    setCustomers(prev => [...prev, newCustomer]);
                    selectCustomer(newCustomer);
                  }
                }}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => selectCustomer(customer)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.phone}</div>
                      {customer.email && (
                        <div className="text-sm text-gray-600">{customer.email}</div>
                      )}
                    </div>
                    <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                      {customer.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{customer.address}</div>
                </div>
              ))}
              {filteredCustomers.length === 0 && searchCustomer && (
                <div className="p-4 text-center text-gray-500">
                  <p>No customers found matching "{searchCustomer}"</p>
                  <Button
                    onClick={() => {
                      const phone = prompt('Enter phone number:');
                      const address = prompt('Enter address:');

                      if (phone && address) {
                        const newCustomer = {
                          id: Date.now().toString(),
                          name: searchCustomer,
                          phone,
                          address,
                          email: '',
                          state: 'Karnataka',
                          status: 'active' as const
                        };

                        setCustomers(prev => [...prev, newCustomer]);
                        selectCustomer(newCustomer);
                      }
                    }}
                    variant="outline"
                    className="mt-2"
                  >
                    Create "{searchCustomer}" as new customer
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Selection Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add or Create Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products by name or category..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => {
                  // Add new product functionality
                  const name = prompt('Enter product name:');
                  const priceStr = prompt('Enter price (₹):');
                  const unit = prompt('Enter unit (e.g., pcs, kg, meter):') || 'pcs';
                  const gstRateStr = prompt('Enter GST rate (%):') || '18';
                  const category = prompt('Enter category:') || 'General';

                  if (name && priceStr) {
                    const price = parseFloat(priceStr);
                    const gstRate = parseFloat(gstRateStr);

                    if (!isNaN(price) && !isNaN(gstRate)) {
                      const newProduct = {
                        id: Date.now().toString(),
                        name,
                        price,
                        unit,
                        gstRate,
                        category,
                        stock: 100
                      };

                      setProducts(prev => [...prev, newProduct]);
                      setSelectedProduct(newProduct);
                      setCustomRate(price);
                    }
                  }
                }}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </div>
            
            {selectedProduct ? (
              <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-600">{selectedProduct.category}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate">Rate (₹)</Label>
                    <Input
                      id="rate"
                      type="number"
                      value={customRate || selectedProduct.price}
                      onChange={(e) => setCustomRate(Number(e.target.value))}
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>GST Rate</Label>
                    <div className="p-2 border rounded bg-gray-50">
                      {selectedProduct.gstRate}%
                    </div>
                  </div>
                </div>
                
                <Button onClick={addItem} className="w-full">
                  Add to Bill
                </Button>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <div className="grid gap-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{product.price}</div>
                          <div className="text-sm text-gray-600">{product.gstRate}% GST</div>
                        </div>
                      </div>
                      {product.stock && (
                        <div className="text-sm text-gray-500 mt-1">
                          Stock: {product.stock} {product.unit}
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredProducts.length === 0 && searchProduct && (
                    <div className="p-4 text-center text-gray-500">
                      <p>No products found matching "{searchProduct}"</p>
                      <Button
                        onClick={() => {
                          const priceStr = prompt('Enter price (₹):');
                          const unit = prompt('Enter unit (e.g., pcs, kg, meter):') || 'pcs';
                          const gstRateStr = prompt('Enter GST rate (%):') || '18';
                          const category = prompt('Enter category:') || 'General';

                          if (priceStr) {
                            const price = parseFloat(priceStr);
                            const gstRate = parseFloat(gstRateStr);

                            if (!isNaN(price) && !isNaN(gstRate)) {
                              const newProduct = {
                                id: Date.now().toString(),
                                name: searchProduct,
                                price,
                                unit,
                                gstRate,
                                category,
                                stock: 100
                              };

                              setProducts(prev => [...prev, newProduct]);
                              setSelectedProduct(newProduct);
                              setCustomRate(price);
                            }
                          }
                        }}
                        variant="outline"
                        className="mt-2"
                      >
                        Create "{searchProduct}" as new product
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
