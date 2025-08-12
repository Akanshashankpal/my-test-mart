import { RequestHandler } from "express";
import { BillingService } from "../services/billing-service";

export interface BillItem {
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

export interface Bill {
  id: string;
  billNumber: string;
  billType: "GST" | "Non-GST" | "Demo";
  financialYear: string;
  billDate: Date;
  dueDate?: Date;
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
  paymentStatus: "Paid" | "Pending" | "Partial" | "Overdue";
  paymentMethod?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: "Draft" | "Sent" | "Paid" | "Cancelled";
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  originalBillId: string;
  originalBillNumber: string;
  returnDate: Date;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  items: {
    productId: string;
    productName: string;
    originalQuantity: number;
    returnedQuantity: number;
    rate: number;
    reason: string;
    condition: "Good" | "Damaged" | "Defective";
    refundAmount: number;
  }[];
  totalRefundAmount: number;
  refundMethod: "Cash" | "Bank Transfer" | "Credit Note";
  status: "Pending" | "Approved" | "Processed";
  createdBy: string;
  createdAt: Date;
}

const billingService = new BillingService();

// Get all bills with pagination and filters
export const getBills: RequestHandler = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      billType,
      paymentStatus,
      startDate,
      endDate,
      customerId,
    } = req.query;

    const filters: any = {};
    
    if (search) {
      filters.$or = [
        { billNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }
    
    if (billType) filters.billType = billType;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (customerId) filters['customer.id'] = customerId;
    
    if (startDate || endDate) {
      filters.billDate = {};
      if (startDate) filters.billDate.$gte = new Date(startDate as string);
      if (endDate) filters.billDate.$lte = new Date(endDate as string);
    }

    const bills = await billingService.getBills(filters, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
};

// Get single bill by ID
export const getBillById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await billingService.getBillById(id);
    
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
};

// Create new bill
export const createBill: RequestHandler = async (req, res) => {
  try {
    const billData = req.body;
    const userId = req.user?.id; // Assuming middleware sets user
    
    // Auto-calculate taxes and amounts
    const calculatedBill = await billingService.calculateBillAmounts(billData);
    
    // Generate bill number
    const billNumber = await billingService.generateBillNumber(
      billData.billType,
      billData.financialYear
    );
    
    const newBill = await billingService.createBill({
      ...calculatedBill,
      billNumber,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    res.status(201).json(newBill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bill' });
  }
};

// Update bill
export const updateBill: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.id;
    
    // Check permissions
    const existingBill = await billingService.getBillById(id);
    if (!existingBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    // Recalculate if items changed
    let updatedData = updates;
    if (updates.items) {
      updatedData = await billingService.calculateBillAmounts(updates);
    }
    
    const updatedBill = await billingService.updateBill(id, {
      ...updatedData,
      updatedAt: new Date(),
    });
    
    res.json(updatedBill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bill' });
  }
};

// Delete bill (soft delete)
export const deleteBill: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    // Check permissions - only admin can delete
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    await billingService.deleteBill(id);
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bill' });
  }
};

// Generate PDF for bill
export const generateBillPDF: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await billingService.getBillById(id);
    
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    const pdfBuffer = await billingService.generatePDF(bill);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Bill-${bill.billNumber}.pdf"`,
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

// Get dashboard statistics
export const getDashboardStats: RequestHandler = async (req, res) => {
  try {
    const stats = await billingService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// Sales Returns

// Get all sales returns
export const getSalesReturns: RequestHandler = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      startDate,
      endDate,
    } = req.query;

    const filters: any = {};
    
    if (search) {
      filters.$or = [
        { returnNumber: { $regex: search, $options: 'i' } },
        { originalBillNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status) filters.status = status;
    
    if (startDate || endDate) {
      filters.returnDate = {};
      if (startDate) filters.returnDate.$gte = new Date(startDate as string);
      if (endDate) filters.returnDate.$lte = new Date(endDate as string);
    }

    const returns = await billingService.getSalesReturns(filters, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json(returns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales returns' });
  }
};

// Create sales return
export const createSalesReturn: RequestHandler = async (req, res) => {
  try {
    const returnData = req.body;
    const userId = req.user?.id;
    
    // Generate return number
    const returnNumber = await billingService.generateReturnNumber();
    
    const newReturn = await billingService.createSalesReturn({
      ...returnData,
      returnNumber,
      createdBy: userId,
      createdAt: new Date(),
    });
    
    res.status(201).json(newReturn);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sales return' });
  }
};

// Update sales return status
export const updateSalesReturnStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedReturn = await billingService.updateSalesReturnStatus(id, status);
    res.json(updatedReturn);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sales return' });
  }
};
