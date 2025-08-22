import { RequestHandler } from "express";

// Sample Bill interface matching the API
interface BillItem {
  itemName: string;
  itemPrice: number;
  itemQuantity: number;
  itemTotal?: number;
}

interface Bill {
  id: string;
  billNumber: string;
  billDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  pincode?: string;
  items: BillItem[];
  subtotal: number;
  discountAmount: number;
  afterDiscount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentType: 'Full' | 'Partial';
  paymentMethod: 'cash' | 'online' | 'mixed';
  observation?: string;
  termsAndConditions?: string;
  billType: 'GST' | 'Non-GST' | 'Quotation';
  stateKey: string;
  createdAt: string;
  updatedAt?: string;
}

// Mock data store (in production, use database)
let bills: Bill[] = [];
let billCounter = 1;

// Create new bill
export const createBill: RequestHandler = (req, res) => {
  try {
    const billData = req.body;
    
    const newBill: Bill = {
      id: Date.now().toString(),
      billNumber: billData.billNumber || `BILL/${new Date().getFullYear()}/${String(billCounter++).padStart(4, '0')}`,
      billDate: billData.billDate || new Date().toISOString(),
      ...billData,
      createdAt: new Date().toISOString(),
    };

    bills.unshift(newBill);

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: newBill
    });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating bill',
      error: (error as Error).message
    });
  }
};

// Get all bills
export const getAllBills: RequestHandler = (req, res) => {
  try {
    res.json({
      success: true,
      data: bills
    });
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bills',
      error: (error as Error).message
    });
  }
};

// Get bill by ID
export const getBillById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const bill = bills.find(b => b.id === id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bill',
      error: (error as Error).message
    });
  }
};

// Update bill
export const updateBill: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const billIndex = bills.findIndex(b => b.id === id);
    
    if (billIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    bills[billIndex] = {
      ...bills[billIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Bill updated successfully',
      data: bills[billIndex]
    });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bill',
      error: (error as Error).message
    });
  }
};

// Delete bill
export const deleteBill: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const billIndex = bills.findIndex(b => b.id === id);
    
    if (billIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    bills.splice(billIndex, 1);

    res.json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting bill',
      error: (error as Error).message
    });
  }
};
