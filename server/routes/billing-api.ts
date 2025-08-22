import express from 'express';
import {
  getBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
  generateBillPDF,
  getDashboardStats,
  getSalesReturns,
  createSalesReturn,
  updateSalesReturnStatus
} from './billing';

const router = express.Router();

// Mock middleware functions (replace with actual implementations)
const authenticate = (req: any, res: any, next: any) => {
  // Mock user for development
  req.user = { id: 'user123', role: 'admin' };
  next();
};

const authorize = (...roles: string[]) => (req: any, res: any, next: any) => {
  if (roles.includes(req.user?.role)) {
    next();
  } else {
    res.status(403).json({ error: 'Insufficient permissions' });
  }
};

const validateBill = (req: any, res: any, next: any) => {
  // Basic validation - extend as needed
  const { customer, items, billType } = req.body;
  
  if (!customer || !customer.name || !customer.phone) {
    return res.status(400).json({ error: 'Customer information is required' });
  }
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one item is required' });
  }
  
  if (!billType || !['GST', 'Non-GST', 'Demo'].includes(billType)) {
    return res.status(400).json({ error: 'Valid bill type is required' });
  }
  
  next();
};

const validateObjectId = (paramName: string) => (req: any, res: any, next: any) => {
  const id = req.params[paramName];
  if (!id || id.length < 3) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
};

const validatePagination = (req: any, res: any, next: any) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(page) || page < 1)) {
    return res.status(400).json({ error: 'Page must be a positive number' });
  }
  
  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    return res.status(400).json({ error: 'Limit must be between 1 and 100' });
  }
  
  next();
};

const validateDateRange = (req: any, res: any, next: any) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({ error: 'Invalid start date format' });
  }
  
  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({ error: 'Invalid end date format' });
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ error: 'Start date cannot be after end date' });
  }
  
  next();
};

const handleValidationErrors = (req: any, res: any, next: any) => {
  // This would typically handle express-validator errors
  next();
};

// @route   GET /api/bills/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get(
  '/dashboard',
  authenticate,
  getDashboardStats
);

// @route   GET /api/bills/returns
// @desc    Get all sales returns
// @access  Private
router.get(
  '/returns',
  authenticate,
  validatePagination,
  handleValidationErrors,
  getSalesReturns
);

// @route   POST /api/bills/returns
// @desc    Create new sales return
// @access  Private
router.post(
  '/returns',
  authenticate,
  createSalesReturn
);

// @route   PUT /api/bills/returns/:id/status
// @desc    Update sales return status
// @access  Private
router.put(
  '/returns/:id/status',
  authenticate,
  validateObjectId('id'),
  handleValidationErrors,
  updateSalesReturnStatus
);

// @route   GET /api/bills
// @desc    Get all bills with filtering and pagination
// @access  Private
router.get(
  '/',
  authenticate,
  validatePagination,
  handleValidationErrors,
  getBills
);

// @route   GET /api/bills/:id
// @desc    Get single bill
// @access  Private
router.get(
  '/:id',
  authenticate,
  validateObjectId('id'),
  handleValidationErrors,
  getBillById
);

// @route   POST /api/bills
// @desc    Create new bill
// @access  Private
router.post(
  '/',
  authenticate,
  validateBill,
  handleValidationErrors,
  createBill
);

// @route   PUT /api/bills/:id
// @desc    Update bill
// @access  Private
router.put(
  '/:id',
  authenticate,
  validateObjectId('id'),
  handleValidationErrors,
  updateBill
);

// @route   DELETE /api/bills/:id
// @desc    Delete bill (soft delete)
// @access  Private (Admin/Manager)
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  validateObjectId('id'),
  handleValidationErrors,
  deleteBill
);

// @route   GET /api/bills/:id/pdf
// @desc    Generate PDF for bill
// @access  Private
router.get(
  '/:id/pdf',
  authenticate,
  validateObjectId('id'),
  handleValidationErrors,
  generateBillPDF
);

export default router;
