import { useState, useEffect } from 'react';
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
  Copy,
  Eye,
  Settings,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  gstNumber?: string;
  state: string;
  stateCode: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  gstRate: number;
  category: string;
  stock: number;
  description?: string;
  hsnCode?: string;
}

interface BillItem {
  id: string;
  productId: string;
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
}

interface Payment {
  id: string;
  method: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Cheque';
  amount: number;
  date: Date;
  reference?: string;
  notes?: string;
}

interface CompanyProfile {
  name: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstNumber: string;
  phone: string;
  email: string;
  logo?: string;
  website?: string;
  bankAccount?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
}

interface Bill {
  id?: string;
  billNumber?: string;
  billType: 'GST' | 'Non-GST' | 'Quotation';
  financialYear: string;
  billDate: string;
  dueDate?: string;
  customer: Customer;
  company: CompanyProfile;
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
  paidAmount: number;
  pendingAmount: number;
  payments: Payment[];
  paymentStatus: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
  notes?: string;
  terms?: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Cancelled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// State codes mapping
const stateCodes: { [key: string]: string } = {
  'Andhra Pradesh': '37', 'Arunachal Pradesh': '12', 'Assam': '18', 'Bihar': '10',
  'Chhattisgarh': '22', 'Goa': '30', 'Gujarat': '24', 'Haryana': '06',
  'Himachal Pradesh': '02', 'Jharkhand': '20', 'Karnataka': '29', 'Kerala': '32',
  'Madhya Pradesh': '23', 'Maharashtra': '27', 'Manipur': '14', 'Meghalaya': '17',
  'Mizoram': '15', 'Nagaland': '13', 'Odisha': '21', 'Punjab': '03',
  'Rajasthan': '08', 'Sikkim': '11', 'Tamil Nadu': '33', 'Telangana': '36',
  'Tripura': '16', 'Uttar Pradesh': '09', 'Uttarakhand': '05', 'West Bengal': '19',
  'Delhi': '07', 'Jammu and Kashmir': '01', 'Ladakh': '02', 'Lakshadweep': '31',
  'Puducherry': '34', 'Andaman and Nicobar Islands': '35', 'Chandigarh': '04',
  'Dadra and Nagar Haveli and Daman and Diu': '26'
};

const indianStates = Object.keys(stateCodes);

// Default company profile
const defaultCompany: CompanyProfile = {
  name: 'ElectroMart Pvt Ltd',
  address: '123 Business Park, Electronic City',
  city: 'Bangalore',
  state: 'Karnataka',
  stateCode: '29',
  pincode: '560100',
  gstNumber: '29ABCDE1234F1Z5',
  phone: '+91 80 2345 6789',
  email: 'info@electromart.com',
  website: 'www.electromart.com',
  bankAccount: {
    accountNumber: '1234567890',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
    accountHolderName: 'ElectroMart Pvt Ltd'
  }
};

// Mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+91 9876543210',
    email: 'john@example.com',
    address: '123 Main Street, Koramangala',
    state: 'Karnataka',
    stateCode: '29',
    status: 'active',
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Sarah Smith',
    phone: '+91 9876543211',
    email: 'sarah@example.com',
    address: '456 Park Avenue, Connaught Place',
    state: 'Delhi',
    stateCode: '07',
    gstNumber: '07ABCDE5678F1Z1',
    status: 'active',
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Rajesh Kumar',
    phone: '+91 9876543212',
    address: '789 Market Street, Andheri West',
    state: 'Maharashtra',
    stateCode: '27',
    status: 'active',
    createdAt: new Date()
  }
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 129999,
    unit: 'pcs',
    gstRate: 18,
    category: 'Mobile',
    stock: 25,
    hsnCode: '8517'
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24',
    price: 99999,
    unit: 'pcs',
    gstRate: 18,
    category: 'Mobile',
    stock: 30,
    hsnCode: '8517'
  },
  {
    id: '3',
    name: 'LG 1.5 Ton Split AC',
    price: 45999,
    unit: 'pcs',
    gstRate: 28,
    category: 'Appliances',
    stock: 8,
    hsnCode: '8415'
  },
  {
    id: '4',
    name: 'Dell Laptop i5',
    price: 65999,
    unit: 'pcs',
    gstRate: 18,
    category: 'Computer',
    stock: 15,
    hsnCode: '8471'
  }
];

export default function BillCreator() {
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
      stateCode: '29',
      status: 'active',
      createdAt: new Date()
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
    paidAmount: 0,
    pendingAmount: 0,
    payments: [],
    paymentStatus: 'Pending',
    status: 'Draft',
    createdBy: 'Current User',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [itemDiscount, setItemDiscount] = useState(0);
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    method: 'Cash',
    amount: 0,
    date: new Date(),
    reference: '',
    notes: ''
  });

  // Customer form for quick add
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    state: 'Karnataka',
    gstNumber: ''
  });

  // Product form for quick add
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    unit: 'pcs',
    gstRate: 18,
    category: '',
    stock: 0,
    hsnCode: ''
  });

  // Calculate bill amounts
  const calculateBill = () => {
    let subtotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const isInterState = bill.customer.state !== bill.company.state;

    bill.items.forEach(item => {
      subtotal += item.taxableAmount;
      
      if (bill.billType === 'GST') {
        if (isInterState) {
          igstTotal += item.igstAmount;
        } else {
          cgstTotal += item.cgstAmount;
          sgstTotal += item.sgstAmount;
        }
      }
    });

    const discountAmount = (subtotal * bill.discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const totalTax = cgstTotal + sgstTotal + igstTotal;
    const totalAmount = taxableAmount + totalTax;
    const roundOffAmount = Math.round(totalAmount) - totalAmount;
    const finalAmount = Math.round(totalAmount);
    const paidAmount = bill.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = finalAmount - paidAmount;

    setBill(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      taxableAmount,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalTax,
      roundOffAmount,
      finalAmount,
      paidAmount,
      pendingAmount,
      paymentStatus: paidAmount >= finalAmount ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending'
    }));
  };

  useEffect(() => {
    calculateBill();
  }, [bill.items, bill.discountPercent, bill.customer.state, bill.payments]);

  // Add customer
  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      alert('Please fill in required fields');
      return;
    }

    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email || '',
      address: newCustomer.address || '',
      state: newCustomer.state || 'Karnataka',
      stateCode: stateCodes[newCustomer.state || 'Karnataka'],
      gstNumber: newCustomer.gstNumber,
      status: 'active',
      createdAt: new Date()
    };

    setCustomers(prev => [...prev, customer]);
    selectCustomer(customer);
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      address: '',
      state: 'Karnataka',
      gstNumber: ''
    });
  };

  // Select customer
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

  // Add product
  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in required fields');
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: newProduct.price,
      unit: newProduct.unit || 'pcs',
      gstRate: newProduct.gstRate || 18,
      category: newProduct.category || 'General',
      stock: newProduct.stock || 0,
      hsnCode: newProduct.hsnCode
    };

    setProducts(prev => [...prev, product]);
    setSelectedProduct(product);
    setNewProduct({
      name: '',
      price: 0,
      unit: 'pcs',
      gstRate: 18,
      category: '',
      stock: 0,
      hsnCode: ''
    });
  };

  // Add item to bill
  const addItem = () => {
    if (!selectedProduct) return;

    const rate = customRate || selectedProduct.price;
    const discountAmount = (rate * productQuantity * itemDiscount) / 100;
    const taxableAmount = (rate * productQuantity) - discountAmount;
    const gstAmount = bill.billType === 'GST' ? (taxableAmount * selectedProduct.gstRate) / 100 : 0;
    
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
      hsnCode: selectedProduct.hsnCode,
      quantity: productQuantity,
      rate,
      unit: selectedProduct.unit,
      gstRate: selectedProduct.gstRate,
      discount: itemDiscount,
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
    setItemDiscount(0);
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
          const discountAmount = (item.rate * quantity * item.discount) / 100;
          const taxableAmount = (item.rate * quantity) - discountAmount;
          const gstAmount = bill.billType === 'GST' ? (taxableAmount * item.gstRate) / 100 : 0;
          
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

  // Add payment
  const addPayment = () => {
    if (!newPayment.amount || newPayment.amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (bill.paidAmount + newPayment.amount > bill.finalAmount) {
      alert('Payment amount cannot exceed the bill amount');
      return;
    }

    const payment: Payment = {
      id: Date.now().toString(),
      method: newPayment.method as Payment['method'],
      amount: newPayment.amount,
      date: newPayment.date || new Date(),
      reference: newPayment.reference || '',
      notes: newPayment.notes || ''
    };

    setBill(prev => ({
      ...prev,
      payments: [...prev.payments, payment]
    }));

    setNewPayment({
      method: 'Cash',
      amount: 0,
      date: new Date(),
      reference: '',
      notes: ''
    });
    setIsPaymentDialogOpen(false);
  };

  // Remove payment
  const removePayment = (paymentId: string) => {
    setBill(prev => ({
      ...prev,
      payments: prev.payments.filter(payment => payment.id !== paymentId)
    }));
  };

  // Generate bill number
  const generateBillNumber = () => {
    const prefix = bill.billType === 'GST' ? 'GST' : bill.billType === 'Non-GST' ? 'NGST' : 'QUO';
    const year = bill.financialYear.split('-')[0].slice(-2);
    const sequence = String(Date.now()).slice(-4);
    return `${prefix}/${year}/${sequence}`;
  };

  // Save bill
  const saveBill = async () => {
    if (!bill.customer.name || bill.items.length === 0) {
      alert('Please select customer and add at least one item');
      return;
    }

    setIsLoading(true);
    try {
      const billToSave = {
        ...bill,
        id: bill.id || Date.now().toString(),
        billNumber: bill.billNumber || generateBillNumber(),
        updatedAt: new Date()
      };

      setBill(billToSave);
      
      // Here you would call your API
      console.log('Saving bill:', billToSave);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Bill saved successfully!');
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Error saving bill');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate PDF
  const generatePDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Company Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(bill.company.name, 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(bill.company.address, 105, 28, { align: 'center' });
      doc.text(`${bill.company.city}, ${bill.company.state} - ${bill.company.pincode}`, 105, 35, { align: 'center' });
      doc.text(`GST: ${bill.company.gstNumber} | Phone: ${bill.company.phone}`, 105, 42, { align: 'center' });

      // Invoice Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${bill.billType} INVOICE`, 105, 55, { align: 'center' });

      // Invoice Details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice No: ${bill.billNumber || 'DRAFT'}`, 20, 70);
      doc.text(`Date: ${new Date(bill.billDate).toLocaleDateString('en-IN')}`, 20, 77);
      doc.text(`Financial Year: ${bill.financialYear}`, 20, 84);

      // Customer Info
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To:', 20, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(bill.customer.name, 20, 107);
      doc.text(bill.customer.phone, 20, 114);
      if (bill.customer.email) {
        doc.text(bill.customer.email, 20, 121);
      }
      doc.text(bill.customer.address, 20, 128);
      doc.text(`${bill.customer.state} - ${bill.customer.stateCode}`, 20, 135);
      if (bill.customer.gstNumber) {
        doc.text(`GST: ${bill.customer.gstNumber}`, 20, 142);
      }

      // Table Headers
      let yPos = 160;
      doc.setFont('helvetica', 'bold');
      doc.text('Item', 20, yPos);
      doc.text('HSN', 70, yPos);
      doc.text('Qty', 90, yPos);
      doc.text('Rate', 110, yPos);
      doc.text('Discount', 130, yPos);
      if (bill.billType === 'GST') {
        doc.text('GST%', 155, yPos);
        doc.text('Tax Amt', 170, yPos);
      }
      doc.text('Amount', 185, yPos);

      // Draw line under headers
      doc.line(20, yPos + 2, 200, yPos + 2);
      yPos += 10;

      // Items
      doc.setFont('helvetica', 'normal');
      bill.items.forEach(item => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.text(item.productName.substring(0, 20), 20, yPos);
        doc.text(item.hsnCode || '', 70, yPos);
        doc.text(`${item.quantity} ${item.unit}`, 90, yPos);
        doc.text(`₹${item.rate.toFixed(2)}`, 110, yPos);
        doc.text(`${item.discount}%`, 130, yPos);
        if (bill.billType === 'GST') {
          doc.text(`${item.gstRate}%`, 155, yPos);
          doc.text(`₹${(item.cgstAmount + item.sgstAmount + item.igstAmount).toFixed(2)}`, 170, yPos);
        }
        doc.text(`₹${item.totalAmount.toFixed(2)}`, 185, yPos);
        yPos += 8;
      });

      // Totals section
      yPos += 10;
      doc.line(110, yPos, 200, yPos);
      yPos += 8;

      doc.text('Subtotal:', 130, yPos);
      doc.text(`₹${bill.subtotal.toFixed(2)}`, 185, yPos);
      yPos += 6;

      if (bill.discountAmount > 0) {
        doc.text(`Discount (${bill.discountPercent}%):`, 130, yPos);
        doc.text(`-₹${bill.discountAmount.toFixed(2)}`, 185, yPos);
        yPos += 6;
      }

      doc.text('Taxable Amount:', 130, yPos);
      doc.text(`₹${bill.taxableAmount.toFixed(2)}`, 185, yPos);
      yPos += 6;

      if (bill.billType === 'GST' && bill.totalTax > 0) {
        if (bill.cgstTotal > 0) {
          doc.text(`CGST (${bill.items[0]?.gstRate/2 || 0}%):`, 130, yPos);
          doc.text(`₹${bill.cgstTotal.toFixed(2)}`, 185, yPos);
          yPos += 6;

          doc.text(`SGST (${bill.items[0]?.gstRate/2 || 0}%):`, 130, yPos);
          doc.text(`₹${bill.sgstTotal.toFixed(2)}`, 185, yPos);
          yPos += 6;
        }
        
        if (bill.igstTotal > 0) {
          doc.text(`IGST (${bill.items[0]?.gstRate || 0}%):`, 130, yPos);
          doc.text(`₹${bill.igstTotal.toFixed(2)}`, 185, yPos);
          yPos += 6;
        }
      }

      if (bill.roundOffAmount !== 0) {
        doc.text('Round Off:', 130, yPos);
        doc.text(`₹${bill.roundOffAmount.toFixed(2)}`, 185, yPos);
        yPos += 6;
      }

      // Final total
      doc.line(130, yPos, 200, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Final Amount:', 130, yPos);
      doc.text(`₹${bill.finalAmount.toFixed(2)}`, 185, yPos);

      // Payment details
      if (bill.payments.length > 0) {
        yPos += 15;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Details:', 20, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        
        bill.payments.forEach(payment => {
          doc.text(`${payment.date.toLocaleDateString('en-IN')} - ${payment.method}: ₹${payment.amount.toFixed(2)}`, 20, yPos);
          if (payment.reference) {
            doc.text(`Ref: ${payment.reference}`, 120, yPos);
          }
          yPos += 6;
        });

        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.text(`Paid Amount: ₹${bill.paidAmount.toFixed(2)}`, 20, yPos);
        yPos += 6;
        doc.text(`Pending Amount: ₹${bill.pendingAmount.toFixed(2)}`, 20, yPos);
      }

      // Bank details
      if (bill.company.bankAccount) {
        yPos += 15;
        doc.setFont('helvetica', 'bold');
        doc.text('Bank Details:', 20, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`Account: ${bill.company.bankAccount.accountNumber}`, 20, yPos);
        yPos += 5;
        doc.text(`IFSC: ${bill.company.bankAccount.ifscCode}`, 20, yPos);
        yPos += 5;
        doc.text(`Bank: ${bill.company.bankAccount.bankName}`, 20, yPos);
      }

      // Terms and conditions
      if (bill.terms) {
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('Terms & Conditions:', 20, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        const terms = bill.terms.split('\n');
        terms.forEach(term => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(term, 20, yPos);
          yPos += 5;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you for your business!', 105, 285, { align: 'center' });

      // Save the PDF
      doc.save(`${bill.billType}_Invoice_${bill.billNumber || 'draft'}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
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
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Bill</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive GST/Non-GST bills with payment tracking</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="outline" onClick={() => setIsPreviewDialogOpen(true)} disabled={bill.items.length === 0}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={generatePDF} disabled={bill.items.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={saveBill} disabled={isLoading || bill.items.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Bill'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Bill Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Bill Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Bill Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="billType">Bill Type</Label>
                  <Select value={bill.billType} onValueChange={(value: 'GST' | 'Non-GST' | 'Quotation') => 
                    setBill(prev => ({ ...prev, billType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GST">GST Invoice</SelectItem>
                      <SelectItem value="Non-GST">Non-GST Invoice</SelectItem>
                      <SelectItem value="Quotation">Quotation</SelectItem>
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
              
              {bill.billType === 'Quotation' && (
                <div>
                  <Label htmlFor="dueDate">Valid Until</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={bill.dueDate || ''}
                    onChange={(e) => setBill(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              )}
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
                    <div className="flex-1">
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
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span><strong>State:</strong> {bill.customer.state}</span>
                    <span><strong>State Code:</strong> {bill.customer.stateCode}</span>
                    {bill.customer.gstNumber && (
                      <span><strong>GST:</strong> {bill.customer.gstNumber}</span>
                    )}
                  </div>
                  {bill.customer.state !== bill.company.state && (
                    <Badge variant="secondary" className="text-xs">
                      Inter-State Transaction (IGST applicable)
                    </Badge>
                  )}
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
                  Items ({bill.items.length})
                </div>
                <Button size="sm" onClick={() => setIsProductDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bill.items.length > 0 ? (
                <div className="space-y-4">
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Disc%</TableHead>
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
                                <div className="text-sm text-gray-500">{item.hsnCode} | {item.unit}</div>
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
                            <TableCell className="text-right">{item.discount}%</TableCell>
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

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3">
                    {bill.items.map((item) => (
                      <Card key={item.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.productName}</h4>
                            <p className="text-sm text-gray-500">{item.hsnCode} | {item.unit}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span>Quantity:</span>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))}
                              className="w-16 h-6 text-center"
                              min="1"
                            />
                          </div>
                          <div className="flex justify-between">
                            <span>Rate:</span>
                            <span>₹{item.rate.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>{item.discount}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>GST:</span>
                            <span>{item.gstRate}%</span>
                          </div>
                          {bill.billType === 'GST' && (
                            <>
                              {item.cgstAmount > 0 && (
                                <div className="flex justify-between">
                                  <span>CGST:</span>
                                  <span>₹{item.cgstAmount.toFixed(2)}</span>
                                </div>
                              )}
                              {item.sgstAmount > 0 && (
                                <div className="flex justify-between">
                                  <span>SGST:</span>
                                  <span>₹{item.sgstAmount.toFixed(2)}</span>
                                </div>
                              )}
                              {item.igstAmount > 0 && (
                                <div className="flex justify-between">
                                  <span>IGST:</span>
                                  <span>₹{item.igstAmount.toFixed(2)}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t flex justify-between font-medium">
                          <span>Total:</span>
                          <span>₹{item.totalAmount.toFixed(2)}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
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

          {/* Notes and Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes..."
                  value={bill.notes || ''}
                  onChange={(e) => setBill(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  placeholder="Enter terms and conditions..."
                  value={bill.terms || ''}
                  onChange={(e) => setBill(prev => ({ ...prev, terms: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary and Payments */}
        <div className="space-y-4 sm:space-y-6">
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
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Tracking
                </div>
                <Button size="sm" onClick={() => setIsPaymentDialogOpen(true)} disabled={bill.finalAmount <= 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">₹{bill.finalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span className="text-green-600 font-medium">₹{bill.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Amount:</span>
                  <span className="text-orange-600 font-medium">₹{bill.pendingAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span>Payment Status:</span>
                  <Badge variant={
                    bill.paymentStatus === 'Paid' ? 'default' :
                    bill.paymentStatus === 'Partial' ? 'secondary' :
                    'outline'
                  }>
                    {bill.paymentStatus}
                  </Badge>
                </div>
              </div>

              {/* Payment List */}
              {bill.payments.length > 0 && (
                <div className="space-y-2">
                  <Label>Payment History</Label>
                  {bill.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {payment.method === 'Cash' && <Banknote className="h-4 w-4" />}
                          {payment.method === 'UPI' && <Smartphone className="h-4 w-4" />}
                          {payment.method === 'Card' && <CreditCard className="h-4 w-4" />}
                          <span className="text-sm font-medium">{payment.method}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.date.toLocaleDateString('en-IN')}
                          {payment.reference && ` • ${payment.reference}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">₹{payment.amount.toFixed(2)}</span>
                        <Button variant="ghost" size="sm" onClick={() => removePayment(payment.id)}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Payment Buttons */}
              <div className="space-y-2">
                <Label>Quick Payment</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewPayment({
                        method: 'Cash',
                        amount: bill.pendingAmount,
                        date: new Date(),
                        reference: '',
                        notes: 'Full payment in cash'
                      });
                      setIsPaymentDialogOpen(true);
                    }}
                    disabled={bill.pendingAmount <= 0}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Banknote className="h-4 w-4 mr-1" />
                    Cash Full
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewPayment({
                        method: 'UPI',
                        amount: bill.pendingAmount,
                        date: new Date(),
                        reference: '',
                        notes: 'Full payment via UPI'
                      });
                      setIsPaymentDialogOpen(true);
                    }}
                    disabled={bill.pendingAmount <= 0}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Smartphone className="h-4 w-4 mr-1" />
                    UPI Full
                  </Button>
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
              <div className="text-gray-600">{bill.company.city}, {bill.company.state} - {bill.company.pincode}</div>
              <div><strong>GST:</strong> {bill.company.gstNumber}</div>
              <div><strong>Phone:</strong> {bill.company.phone}</div>
              <div><strong>Email:</strong> {bill.company.email}</div>
              {bill.company.website && (
                <div><strong>Website:</strong> {bill.company.website}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Selection Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            </div>

            {/* Add New Customer Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Name *</Label>
                    <Input
                      id="customerName"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone *</Label>
                    <Input
                      id="customerPhone"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerState">State</Label>
                    <Select value={newCustomer.state} onValueChange={(value) => 
                      setNewCustomer(prev => ({ ...prev, state: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="customerAddress">Address</Label>
                    <Textarea
                      id="customerAddress"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Full address"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerGst">GST Number (Optional)</Label>
                    <Input
                      id="customerGst"
                      value={newCustomer.gstNumber}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, gstNumber: e.target.value }))}
                      placeholder="27ABCDE1234F1Z5"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addCustomer} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Customer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Existing Customers */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              <Label>Existing Customers</Label>
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
                    <div className="text-right">
                      <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                        {customer.status}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-1">{customer.state}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{customer.address}</div>
                  {customer.gstNumber && (
                    <div className="text-sm text-gray-500 mt-1">GST: {customer.gstNumber}</div>
                  )}
                </div>
              ))}
              {filteredCustomers.length === 0 && searchCustomer && (
                <div className="p-4 text-center text-gray-500">
                  <p>No customers found matching "{searchCustomer}"</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Selection Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Product to Bill</DialogTitle>
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
            </div>

            {/* Add New Product Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Product</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="productName">Name *</Label>
                    <Input
                      id="productName"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productPrice">Price *</Label>
                    <Input
                      id="productPrice"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productUnit">Unit</Label>
                    <Select value={newProduct.unit} onValueChange={(value) => 
                      setNewProduct(prev => ({ ...prev, unit: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">Pieces</SelectItem>
                        <SelectItem value="kg">Kilogram</SelectItem>
                        <SelectItem value="ltr">Liter</SelectItem>
                        <SelectItem value="mtr">Meter</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="set">Set</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="productGst">GST Rate %</Label>
                    <Select value={newProduct.gstRate?.toString()} onValueChange={(value) => 
                      setNewProduct(prev => ({ ...prev, gstRate: Number(value) }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                        <SelectItem value="28">28%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="productCategory">Category</Label>
                    <Input
                      id="productCategory"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Electronics"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productHsn">HSN Code</Label>
                    <Input
                      id="productHsn"
                      value={newProduct.hsnCode}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, hsnCode: e.target.value }))}
                      placeholder="8517"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productStock">Stock</Label>
                    <Input
                      id="productStock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addProduct} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {selectedProduct ? (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Configure Selected Product</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                      <p className="text-sm text-gray-600">{selectedProduct.category} | HSN: {selectedProduct.hsnCode}</p>
                      <p className="text-sm text-gray-600">Default Price: ₹{selectedProduct.price} per {selectedProduct.unit}</p>
                      <p className="text-sm text-gray-600">Stock: {selectedProduct.stock} {selectedProduct.unit} | GST: {selectedProduct.gstRate}%</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={productQuantity}
                          onChange={(e) => setProductQuantity(Number(e.target.value))}
                          min="1"
                          max={selectedProduct.stock || 999}
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
                        <Label htmlFor="itemDiscount">Discount %</Label>
                        <Input
                          id="itemDiscount"
                          type="number"
                          value={itemDiscount}
                          onChange={(e) => setItemDiscount(Number(e.target.value))}
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={addItem} className="w-full">
                          Add to Bill
                        </Button>
                      </div>
                    </div>

                    {/* Item Preview */}
                    <div className="p-3 bg-white border rounded">
                      <h4 className="font-medium mb-2">Item Preview</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Quantity:</span>
                          <span>{productQuantity} {selectedProduct.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate:</span>
                          <span>₹{(customRate || selectedProduct.price).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{((customRate || selectedProduct.price) * productQuantity).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount ({itemDiscount}%):</span>
                          <span>-₹{(((customRate || selectedProduct.price) * productQuantity * itemDiscount) / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxable Amount:</span>
                          <span>₹{(((customRate || selectedProduct.price) * productQuantity) - (((customRate || selectedProduct.price) * productQuantity * itemDiscount) / 100)).toFixed(2)}</span>
                        </div>
                        {bill.billType === 'GST' && (
                          <div className="flex justify-between">
                            <span>GST ({selectedProduct.gstRate}%):</span>
                            <span>₹{((((customRate || selectedProduct.price) * productQuantity) - (((customRate || selectedProduct.price) * productQuantity * itemDiscount) / 100)) * selectedProduct.gstRate / 100).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium border-t pt-2 col-span-2">
                          <span>Total Amount:</span>
                          <span>₹{(((customRate || selectedProduct.price) * productQuantity) - (((customRate || selectedProduct.price) * productQuantity * itemDiscount) / 100) + (bill.billType === 'GST' ? ((((customRate || selectedProduct.price) * productQuantity) - (((customRate || selectedProduct.price) * productQuantity * itemDiscount) / 100)) * selectedProduct.gstRate / 100) : 0)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <Label>Select Product</Label>
                <div className="grid gap-2 mt-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.category} | HSN: {product.hsnCode}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{product.price}</div>
                          <div className="text-sm text-gray-600">{product.gstRate}% GST</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Stock: {product.stock} {product.unit}
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && searchProduct && (
                    <div className="p-4 text-center text-gray-500">
                      <p>No products found matching "{searchProduct}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between text-sm">
                <span>Pending Amount:</span>
                <span className="font-medium">₹{bill.pendingAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={newPayment.method} onValueChange={(value: Payment['method']) =>
                  setNewPayment(prev => ({ ...prev, method: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Credit/Debit Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentAmount">Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  max={bill.pendingAmount}
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={newPayment.date?.toISOString().split('T')[0]}
                onChange={(e) => setNewPayment(prev => ({ ...prev, date: new Date(e.target.value) }))}
              />
            </div>

            <div>
              <Label htmlFor="paymentReference">Reference (Optional)</Label>
              <Input
                id="paymentReference"
                value={newPayment.reference}
                onChange={(e) => setNewPayment(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Transaction ID, Cheque number, etc."
              />
            </div>

            <div>
              <Label htmlFor="paymentNotes">Notes (Optional)</Label>
              <Textarea
                id="paymentNotes"
                value={newPayment.notes}
                onChange={(e) => setNewPayment(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addPayment} className="flex-1">
                Add Payment
              </Button>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bill Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Bill Preview
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-4">
            {/* Company Header */}
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold">{bill.company.name}</h1>
              <p className="text-sm text-gray-600">{bill.company.address}</p>
              <p className="text-sm text-gray-600">{bill.company.city}, {bill.company.state} - {bill.company.pincode}</p>
              <p className="text-sm text-gray-600">GST: {bill.company.gstNumber} | Phone: {bill.company.phone}</p>
              <div className="mt-4">
                <Badge variant="outline" className="text-lg px-4 py-1">
                  {bill.billType} {bill.billType === 'Quotation' ? 'QUOTATION' : 'INVOICE'}
                </Badge>
              </div>
            </div>

            {/* Bill and Customer Details */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Bill Details</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Bill Number:</span>
                    <span className="font-medium">{bill.billNumber || 'DRAFT'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(bill.billDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Financial Year:</span>
                    <span>{bill.financialYear}</span>
                  </div>
                  {bill.dueDate && (
                    <div className="flex justify-between">
                      <span>{bill.billType === 'Quotation' ? 'Valid Until:' : 'Due Date:'}</span>
                      <span>{new Date(bill.dueDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Bill To</h3>
                <div className="text-sm">
                  <p className="font-medium">{bill.customer.name}</p>
                  <p>{bill.customer.phone}</p>
                  {bill.customer.email && <p>{bill.customer.email}</p>}
                  <p>{bill.customer.address}</p>
                  <p>{bill.customer.state} - {bill.customer.stateCode}</p>
                  {bill.customer.gstNumber && <p>GST: {bill.customer.gstNumber}</p>}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left border">Item</th>
                      <th className="p-2 text-center border">HSN</th>
                      <th className="p-2 text-center border">Qty</th>
                      <th className="p-2 text-right border">Rate</th>
                      <th className="p-2 text-right border">Disc%</th>
                      <th className="p-2 text-right border">Taxable</th>
                      {bill.billType === 'GST' && (
                        <>
                          {bill.customer.state === bill.company.state ? (
                            <>
                              <th className="p-2 text-right border">CGST</th>
                              <th className="p-2 text-right border">SGST</th>
                            </>
                          ) : (
                            <th className="p-2 text-right border">IGST</th>
                          )}
                        </>
                      )}
                      <th className="p-2 text-right border">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item, index) => (
                      <tr key={index}>
                        <td className="p-2 border">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-xs text-gray-500">{item.unit}</div>
                        </td>
                        <td className="p-2 border text-center text-sm">{item.hsnCode}</td>
                        <td className="p-2 border text-center">{item.quantity}</td>
                        <td className="p-2 border text-right">₹{item.rate.toFixed(2)}</td>
                        <td className="p-2 border text-right">{item.discount}%</td>
                        <td className="p-2 border text-right">₹{item.taxableAmount.toFixed(2)}</td>
                        {bill.billType === 'GST' && (
                          <>
                            {bill.customer.state === bill.company.state ? (
                              <>
                                <td className="p-2 border text-right">₹{item.cgstAmount.toFixed(2)}</td>
                                <td className="p-2 border text-right">₹{item.sgstAmount.toFixed(2)}</td>
                              </>
                            ) : (
                              <td className="p-2 border text-right">₹{item.igstAmount.toFixed(2)}</td>
                            )}
                          </>
                        )}
                        <td className="p-2 border text-right font-medium">₹{item.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{bill.subtotal.toFixed(2)}</span>
                </div>
                {bill.discountAmount > 0 && (
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
                      <div className="flex justify-between">
                        <span>CGST:</span>
                        <span>₹{bill.cgstTotal.toFixed(2)}</span>
                      </div>
                    )}
                    {bill.sgstTotal > 0 && (
                      <div className="flex justify-between">
                        <span>SGST:</span>
                        <span>₹{bill.sgstTotal.toFixed(2)}</span>
                      </div>
                    )}
                    {bill.igstTotal > 0 && (
                      <div className="flex justify-between">
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
                  <div className="flex justify-between">
                    <span>Round Off:</span>
                    <span>₹{bill.roundOffAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Final Amount:</span>
                    <span>₹{bill.finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            {bill.payments.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Payment Details</h3>
                <div className="space-y-2">
                  {bill.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                      <span>{payment.date.toLocaleDateString('en-IN')} - {payment.method}</span>
                      <span className="font-medium">���{payment.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-medium">
                      <span>Paid Amount:</span>
                      <span className="text-green-600">₹{bill.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Pending Amount:</span>
                      <span className="text-orange-600">₹{bill.pendingAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details */}
            {bill.company.bankAccount && (
              <div>
                <h3 className="font-semibold mb-2">Bank Details</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Account:</strong> {bill.company.bankAccount.accountNumber}</p>
                  <p><strong>IFSC:</strong> {bill.company.bankAccount.ifscCode}</p>
                  <p><strong>Bank:</strong> {bill.company.bankAccount.bankName}</p>
                  <p><strong>Account Holder:</strong> {bill.company.bankAccount.accountHolderName}</p>
                </div>
              </div>
            )}

            {/* Notes and Terms */}
            {(bill.notes || bill.terms) && (
              <div className="space-y-4">
                {bill.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm">{bill.notes}</p>
                  </div>
                )}
                {bill.terms && (
                  <div>
                    <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                    <div className="text-sm whitespace-pre-line">{bill.terms}</div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={() => setIsPreviewDialogOpen(false)} variant="outline" className="flex-1">
                Close Preview
              </Button>
              <Button onClick={generatePDF} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
