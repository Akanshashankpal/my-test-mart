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
  RotateCcw,
  Search,
  Plus,
  FileText,
  Calendar,
  User,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import { billsAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SalesReturn {
  id: string;
  returnNumber: string;
  originalBillId: string;
  originalBillNumber: string;
  returnDate: string;
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
    condition: 'Good' | 'Damaged' | 'Defective';
    refundAmount: number;
  }[];
  totalRefundAmount: number;
  refundMethod: 'Cash' | 'Bank Transfer' | 'Credit Note';
  status: 'Pending' | 'Approved' | 'Processed';
  createdBy: string;
  createdAt: string;
}

interface Bill {
  id: string;
  billNumber: string;
  billDate: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  items: {
    productId: string;
    productName: string;
    quantity: number;
    rate: number;
    totalAmount: number;
  }[];
  finalAmount: number;
}

export default function SalesReturn() {
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [searchBill, setSearchBill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [newReturn, setNewReturn] = useState<Partial<SalesReturn>>({
    returnDate: new Date().toISOString().split('T')[0],
    refundMethod: 'Cash',
    status: 'Pending',
    items: []
  });

  // Fetch sales returns
  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const response = await billsAPI.getSalesReturns({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      
      if (response.returns) {
        setReturns(response.returns);
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch bills for selection
  const fetchBills = async () => {
    try {
      const response = await billsAPI.getBills({ limit: 100 });
      if (response.bills) {
        setBills(response.bills);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  useEffect(() => {
    fetchReturns();
    fetchBills();
  }, [searchTerm, statusFilter]);

  const filteredBills = bills.filter(bill =>
    bill.billNumber.toLowerCase().includes(searchBill.toLowerCase()) ||
    bill.customer.name.toLowerCase().includes(searchBill.toLowerCase())
  );

  const selectBill = (bill: Bill) => {
    setSelectedBill(bill);
    setNewReturn(prev => ({
      ...prev,
      originalBillId: bill.id,
      originalBillNumber: bill.billNumber,
      customer: bill.customer,
      items: bill.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        originalQuantity: item.quantity,
        returnedQuantity: 0,
        rate: item.rate,
        reason: '',
        condition: 'Good' as const,
        refundAmount: 0
      }))
    }));
  };

  const updateReturnItem = (productId: string, field: string, value: any) => {
    setNewReturn(prev => ({
      ...prev,
      items: prev.items?.map(item => {
        if (item.productId === productId) {
          const updated = { ...item, [field]: value };
          
          // Recalculate refund amount when quantity changes
          if (field === 'returnedQuantity') {
            updated.refundAmount = updated.returnedQuantity * updated.rate;
          }
          
          return updated;
        }
        return item;
      })
    }));
  };

  const calculateTotalRefund = () => {
    return newReturn.items?.reduce((total, item) => total + item.refundAmount, 0) || 0;
  };

  const createReturn = async () => {
    if (!selectedBill || !newReturn.items?.some(item => item.returnedQuantity > 0)) {
      alert('Please select a bill and specify return quantities');
      return;
    }

    try {
      const returnData = {
        ...newReturn,
        totalRefundAmount: calculateTotalRefund(),
        items: newReturn.items?.filter(item => item.returnedQuantity > 0)
      };

      await billsAPI.createSalesReturn(returnData);
      alert('Sales return created successfully!');
      
      // Reset form
      setNewReturn({
        returnDate: new Date().toISOString().split('T')[0],
        refundMethod: 'Cash',
        status: 'Pending',
        items: []
      });
      setSelectedBill(null);
      setIsCreateDialogOpen(false);
      fetchReturns();
    } catch (error) {
      console.error('Error creating return:', error);
      alert('Error creating sales return');
    }
  };

  const updateReturnStatus = async (returnId: string, status: string) => {
    try {
      await billsAPI.updateSalesReturnStatus(returnId, status);
      fetchReturns();
    } catch (error) {
      console.error('Error updating return status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-blue-100 text-blue-800';
      case 'Processed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Approved': return <CheckCircle className="h-4 w-4" />;
      case 'Processed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Returns</h1>
          <p className="text-gray-600 mt-1">Manage product returns and refunds</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Return
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Sales Return</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Bill Selection */}
                {!selectedBill ? (
                  <div className="space-y-4">
                    <Label>Select Original Bill</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search bills by number or customer..."
                        value={searchBill}
                        onChange={(e) => setSearchBill(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {filteredBills.map((bill) => (
                        <div
                          key={bill.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => selectBill(bill)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{bill.billNumber}</div>
                              <div className="text-sm text-gray-600">{bill.customer.name}</div>
                              <div className="text-xs text-gray-500">{bill.billDate}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">₹{bill.finalAmount}</div>
                              <div className="text-sm text-gray-600">{bill.items.length} items</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Selected Bill Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Selected Bill: {selectedBill.billNumber}</span>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedBill(null)}>
                            Change Bill
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Customer:</strong> {selectedBill.customer.name}</div>
                          <div><strong>Phone:</strong> {selectedBill.customer.phone}</div>
                          <div><strong>Date:</strong> {selectedBill.billDate}</div>
                          <div><strong>Amount:</strong> ₹{selectedBill.finalAmount}</div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Return Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="returnDate">Return Date</Label>
                        <Input
                          id="returnDate"
                          type="date"
                          value={newReturn.returnDate}
                          onChange={(e) => setNewReturn(prev => ({ ...prev, returnDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="refundMethod">Refund Method</Label>
                        <Select value={newReturn.refundMethod} onValueChange={(value: any) => 
                          setNewReturn(prev => ({ ...prev, refundMethod: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Credit Note">Credit Note</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Return Items */}
                    <div>
                      <Label>Return Items</Label>
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Original Qty</TableHead>
                              <TableHead>Return Qty</TableHead>
                              <TableHead>Rate</TableHead>
                              <TableHead>Condition</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead>Refund</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {newReturn.items?.map((item) => (
                              <TableRow key={item.productId}>
                                <TableCell className="font-medium">{item.productName}</TableCell>
                                <TableCell>{item.originalQuantity}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={item.returnedQuantity}
                                    onChange={(e) => updateReturnItem(item.productId, 'returnedQuantity', Number(e.target.value))}
                                    min="0"
                                    max={item.originalQuantity}
                                    className="w-20"
                                  />
                                </TableCell>
                                <TableCell>₹{item.rate}</TableCell>
                                <TableCell>
                                  <Select value={item.condition} onValueChange={(value) => 
                                    updateReturnItem(item.productId, 'condition', value)
                                  }>
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Good">Good</SelectItem>
                                      <SelectItem value="Damaged">Damaged</SelectItem>
                                      <SelectItem value="Defective">Defective</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    placeholder="Reason..."
                                    value={item.reason}
                                    onChange={(e) => updateReturnItem(item.productId, 'reason', e.target.value)}
                                    className="w-32"
                                  />
                                </TableCell>
                                <TableCell className="font-medium">₹{item.refundAmount.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold">Total Refund Amount:</span>
                      <span className="text-xl font-bold">₹{calculateTotalRefund().toFixed(2)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createReturn}>
                        Create Return
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search returns by number, bill number, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Processed">Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Returns List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading returns...</p>
            </CardContent>
          </Card>
        ) : returns.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sales returns found</p>
              <p className="text-sm">Create your first return to get started</p>
            </CardContent>
          </Card>
        ) : (
          returns.map((salesReturn) => (
            <Card key={salesReturn.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{salesReturn.returnNumber}</h3>
                      <Badge className={cn("flex items-center gap-1", getStatusColor(salesReturn.status))}>
                        {getStatusIcon(salesReturn.status)}
                        {salesReturn.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Original Bill:</span>
                        <p className="font-medium">{salesReturn.originalBillNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Customer:</span>
                        <p className="font-medium">{salesReturn.customer.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Return Date:</span>
                        <p className="font-medium">{salesReturn.returnDate}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Refund Method:</span>
                        <p className="font-medium">{salesReturn.refundMethod}</p>
                      </div>
                    </div>

                    <div className="text-lg font-semibold text-green-600">
                      Total Refund: ₹{salesReturn.totalRefundAmount.toFixed(2)}
                    </div>

                    <div className="text-sm text-gray-600">
                      {salesReturn.items.length} item(s) returned
                    </div>
                  </div>

                  {salesReturn.status === 'Pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateReturnStatus(salesReturn.id, 'Approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateReturnStatus(salesReturn.id, 'Processed')}
                      >
                        Process
                      </Button>
                    </div>
                  )}

                  {salesReturn.status === 'Approved' && (
                    <Button
                      size="sm"
                      onClick={() => updateReturnStatus(salesReturn.id, 'Processed')}
                    >
                      Mark Processed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
