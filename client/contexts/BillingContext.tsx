import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BillItem {
  productName: string;
  quantity: number;
  price: number;
  gstPercent: number;
  totalAmount: number;
  gstAmount: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  billType: "GST" | "Non-GST" | "Demo";
  billDate: Date;
  dueDate?: Date;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  items: BillItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  finalAmount: number;
  paymentStatus: "Paid" | "Pending" | "Partial" | "Overdue";
  paymentMethod?: string;
  createdBy: string;
  createdAt: Date;
  status: "Draft" | "Sent" | "Paid" | "Cancelled";
}

interface BillingContextType {
  bills: Bill[];
  addBill: (bill: Bill) => void;
  updateBill: (billId: string, updates: Partial<Bill>) => void;
  deleteBill: (billId: string) => void;
  getBillById: (billId: string) => Bill | undefined;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

// Mock initial data
const initialBills: Bill[] = [
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
      address: "123 Main St, Mumbai"
    },
    items: [
      { 
        productName: "iPhone 15 Pro", 
        quantity: 1, 
        price: 129999, 
        gstPercent: 18,
        gstAmount: 23399.82,
        totalAmount: 153398.82
      },
      { 
        productName: "AirPods Pro", 
        quantity: 1, 
        price: 24999, 
        gstPercent: 18,
        gstAmount: 4499.82,
        totalAmount: 29498.82
      },
    ],
    subtotal: 154998,
    discountAmount: 5000,
    discountPercent: 3.2,
    taxAmount: 27000,
    cgst: 13500,
    sgst: 13500,
    igst: 0,
    totalGst: 27000,
    finalAmount: 176998,
    paymentStatus: "Paid",
    paymentMethod: "Card",
    createdBy: "Sarah Wilson",
    createdAt: new Date("2024-01-20"),
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
      address: "456 Oak St, Delhi"
    },
    items: [
      { 
        productName: "Phone Cover", 
        quantity: 2, 
        price: 500, 
        gstPercent: 0,
        gstAmount: 0,
        totalAmount: 1000
      },
    ],
    subtotal: 1000,
    discountAmount: 0,
    discountPercent: 0,
    taxAmount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalGst: 0,
    finalAmount: 1000,
    paymentStatus: "Pending",
    createdBy: "Mike Johnson",
    createdAt: new Date("2024-01-19"),
    status: "Sent",
  },
];

export function BillingProvider({ children }: { children: ReactNode }) {
  const [bills, setBills] = useState<Bill[]>(initialBills);

  const addBill = (bill: Bill) => {
    setBills(prev => [bill, ...prev]);
  };

  const updateBill = (billId: string, updates: Partial<Bill>) => {
    setBills(prev => prev.map(bill => 
      bill.id === billId ? { ...bill, ...updates } : bill
    ));
  };

  const deleteBill = (billId: string) => {
    setBills(prev => prev.filter(bill => bill.id !== billId));
  };

  const getBillById = (billId: string) => {
    return bills.find(bill => bill.id === billId);
  };

  const value = {
    bills,
    addBill,
    updateBill,
    deleteBill,
    getBillById,
  };

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
}
