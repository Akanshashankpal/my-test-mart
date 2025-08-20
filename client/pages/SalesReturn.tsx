import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  RotateCcw, 
  CheckCircle,
  X,
  Package,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  FileText,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SalesReturn {
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
  status: "Pending" | "Approved" | "Processed" | "Rejected";
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

// Mock data
const mockReturns: SalesReturn[] = [
  {
    id: "1",
    returnNumber: "RET/2024/0001",
    originalBillId: "1",
    originalBillNumber: "GST/24/0001",
    returnDate: new Date("2024-01-22"),
    customer: {
      id: "1",
      name: "John Doe",
      phone: "+91 9876543210",
    },
    items: [
      {
        productId: "1",
        productName: "AirPods Pro",
        originalQuantity: 1,
        returnedQuantity: 1,
        rate: 24999,
        reason: "Customer not satisfied with quality",
        condition: "Good",
        refundAmount: 24999,
      },
    ],
    totalRefundAmount: 24999,
    refundMethod: "Bank Transfer",
    status: "Pending",
    createdBy: "Sarah Wilson",
    createdAt: new Date("2024-01-22"),
    notes: "Customer wants to exchange for different model",
  },
  {
    id: "2",
    returnNumber: "RET/2024/0002",
    originalBillId: "3",
    originalBillNumber: "GST/24/0002",
    returnDate: new Date("2024-01-20"),
    customer: {
      id: "3",
      name: "Mike Johnson",
      phone: "+91 9876543212",
    },
    items: [
      {
        productId: "2",
        productName: "Samsung Galaxy S24",
        originalQuantity: 1,
        returnedQuantity: 1,
        rate: 99999,
        reason: "Product defective - screen not working",
        condition: "Defective",
        refundAmount: 99999,
      },
    ],
    totalRefundAmount: 99999,
    refundMethod: "Cash",
    status: "Approved",
    createdBy: "Mike Johnson",
    createdAt: new Date("2024-01-20"),
    approvedBy: "Admin User",
    approvedAt: new Date("2024-01-21"),
  },
];

const reasons = [
  "Product defective",
  "Wrong product delivered",
  "Customer not satisfied",
  "Product damaged in shipping",
  "Customer changed mind",
  "Quality issues",
  "Other"
];

export default function SalesReturn() {
  const [returns, setReturns] = useState<SalesReturn[]>(mockReturns);
  const [filteredReturns, setFilteredReturns] = useState<SalesReturn[]>(mockReturns);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<SalesReturn | null>(null);
  
  const [formData, setFormData] = useState({
    originalBillNumber: "",
    customerName: "",
    customerPhone: "",
    items: [
      {
        productName: "",
        originalQuantity: 1,
        returnedQuantity: 1,
        rate: 0,
        reason: "",
        condition: "Good" as const,
      }
    ],
    refundMethod: "Cash" as const,
    notes: "",
  });

  // Apply filters
  useEffect(() => {
    let filtered = [...returns];

    if (searchTerm) {
      filtered = filtered.filter(ret =>
        ret.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.originalBillNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(ret => ret.status.toLowerCase() === statusFilter);
    }

    setFilteredReturns(filtered);
  }, [returns, searchTerm, statusFilter]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-gray-100 text-gray-800 border-gray-200",
      processed: "bg-gray-100 text-gray-800 border-gray-200",
      rejected: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return styles[status.toLowerCase() as keyof typeof styles] || styles.pending;
  };

  const getConditionBadge = (condition: string) => {
    const styles = {
      good: "bg-gray-100 text-gray-800 border-gray-200",
      damaged: "bg-gray-100 text-gray-700 border-gray-200",
      defective: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return styles[condition.toLowerCase() as keyof typeof styles] || styles.good;
  };

  const handleStatusUpdate = (returnId: string, newStatus: string) => {
    setReturns(prev => prev.map(ret => 
      ret.id === returnId 
        ? { 
            ...ret, 
            status: newStatus as any,
            approvedBy: newStatus === "Approved" ? "Current User" : ret.approvedBy,
            approvedAt: newStatus === "Approved" ? new Date() : ret.approvedAt,
          } 
        : ret
    ));
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productName: "",
          originalQuantity: 1,
          returnedQuantity: 1,
          rate: 0,
          reason: "",
          condition: "Good" as const,
        }
      ]
    }));
  };

  const removeItemRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotalRefund = () => {
    return formData.items.reduce((total, item) => 
      total + (item.returnedQuantity * item.rate), 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReturn: SalesReturn = {
      id: Date.now().toString(),
      returnNumber: `RET/2024/${(returns.length + 1).toString().padStart(4, '0')}`,
      originalBillId: "mock",
      originalBillNumber: formData.originalBillNumber,
      returnDate: new Date(),
      customer: {
        id: "mock",
        name: formData.customerName,
        phone: formData.customerPhone,
      },
      items: formData.items.map(item => ({
        productId: "mock",
        productName: item.productName,
        originalQuantity: item.originalQuantity,
        returnedQuantity: item.returnedQuantity,
        rate: item.rate,
        reason: item.reason,
        condition: item.condition,
        refundAmount: item.returnedQuantity * item.rate,
      })),
      totalRefundAmount: calculateTotalRefund(),
      refundMethod: formData.refundMethod,
      status: "Pending",
      createdBy: "Current User",
      createdAt: new Date(),
      notes: formData.notes,
    };

    setReturns(prev => [newReturn, ...prev]);
    setIsCreateDialogOpen(false);
    
    // Reset form
    setFormData({
      originalBillNumber: "",
      customerName: "",
      customerPhone: "",
      items: [{
        productName: "",
        originalQuantity: 1,
        returnedQuantity: 1,
        rate: 0,
        reason: "",
        condition: "Good",
      }],
      refundMethod: "Cash",
      notes: "",
    });
  };

  const calculateStats = () => {
    const totalReturns = filteredReturns.length;
    const pendingReturns = filteredReturns.filter(r => r.status === "Pending").length;
    const approvedReturns = filteredReturns.filter(r => r.status === "Approved").length;
    const totalRefundAmount = filteredReturns.reduce((sum, ret) => sum + ret.totalRefundAmount, 0);

    return {
      totalReturns,
      pendingReturns,
      approvedReturns,
      totalRefundAmount,
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sales Returns</h2>
          <p className="text-muted-foreground">Manage product returns and refunds</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Create Return
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Sales Return</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billNumber">Original Bill Number *</Label>
                  <Input
                    id="billNumber"
                    value={formData.originalBillNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalBillNumber: e.target.value }))}
                    placeholder="GST/24/0001"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Customer Phone *</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Return Items</Label>
                  <Button type="button" variant="outline" onClick={addItemRow}>
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
                
                {formData.items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="space-y-2">
                        <Label>Product Name *</Label>
                        <Input
                          value={item.productName}
                          onChange={(e) => updateItem(index, 'productName', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Original Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.originalQuantity}
                          onChange={(e) => updateItem(index, 'originalQuantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Return Qty *</Label>
                        <Input
                          type="number"
                          min="1"
                          max={item.originalQuantity}
                          value={item.returnedQuantity}
                          onChange={(e) => updateItem(index, 'returnedQuantity', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Rate (₹) *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Condition</Label>
                        <Select
                          value={item.condition}
                          onValueChange={(value) => updateItem(index, 'condition', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Damaged">Damaged</SelectItem>
                            <SelectItem value="Defective">Defective</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Actions</Label>
                        <div className="flex gap-2">
                          <span className="text-sm font-medium">
                            ₹{(item.returnedQuantity * item.rate).toLocaleString()}
                          </span>
                          {formData.items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItemRow(index)}
                              className="text-gray-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Label>Return Reason *</Label>
                      <Select
                        value={item.reason}
                        onValueChange={(value) => updateItem(index, 'reason', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {reasons.map(reason => (
                            <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Refund Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refundMethod">Refund Method *</Label>
                  <Select
                    value={formData.refundMethod}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, refundMethod: value as any }))}
                  >
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
                
                <div className="space-y-2">
                  <Label>Total Refund Amount</Label>
                  <div className="text-2xl font-bold text-black">
                    {formatCurrency(calculateTotalRefund())}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the return..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Create Return
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Total Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReturns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingReturns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gray-700" />
              Approved Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.approvedReturns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              Total Refunds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalRefundAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search returns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Returns List */}
      <div className="space-y-4">
        {filteredReturns.map(returnItem => (
          <Card key={returnItem.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <RotateCcw className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{returnItem.returnNumber}</h4>
                      <p className="text-sm text-muted-foreground">
                        Original Bill: {returnItem.originalBillNumber}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Customer:</span>
                      <p className="font-semibold">{returnItem.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{returnItem.customer.phone}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Return Date:</span>
                      <p className="font-semibold">{formatDate(returnItem.returnDate)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Refund Amount:</span>
                      <p className="font-semibold text-red-600">{formatCurrency(returnItem.totalRefundAmount)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Refund Method:</span>
                      <p className="font-semibold">{returnItem.refundMethod}</p>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="mb-3">
                    <span className="text-muted-foreground text-sm">Items: </span>
                    {returnItem.items.map((item, index) => (
                      <span key={index} className="text-sm">
                        {item.productName} (×{item.returnedQuantity})
                        {index < returnItem.items.length - 1 && ", "}
                      </span>
                    ))}
                  </div>

                  {returnItem.notes && (
                    <div className="mb-3">
                      <span className="text-muted-foreground text-sm">Notes: </span>
                      <span className="text-sm">{returnItem.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge className={cn("text-xs", getStatusBadge(returnItem.status))}>
                    {returnItem.status}
                  </Badge>
                  
                  {returnItem.status === "Pending" && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(returnItem.id, "Approved")}
                        className="text-xs bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(returnItem.id, "Rejected")}
                        className="text-xs text-red-600 border-red-300"
                      >
                        <X className="h-3 w-3" />
                        Reject
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReturn(returnItem)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Return Details Dialog */}
      <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Return Details - {selectedReturn?.returnNumber}</DialogTitle>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-6">
              {/* Return Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Return Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Return Number:</span>
                      <span className="font-medium">{selectedReturn.returnNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Original Bill:</span>
                      <span className="font-medium">{selectedReturn.originalBillNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Return Date:</span>
                      <span className="font-medium">{formatDate(selectedReturn.returnDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={cn("text-xs", getStatusBadge(selectedReturn.status))}>
                        {selectedReturn.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium">{selectedReturn.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="font-medium">{selectedReturn.customer.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Returned Items */}
              <div>
                <h4 className="font-semibold mb-2">Returned Items</h4>
                <table className="w-full border rounded-lg">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-center">Condition</th>
                      <th className="p-3 text-left">Reason</th>
                      <th className="p-3 text-right">Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReturn.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{item.productName}</td>
                        <td className="p-3 text-center">{item.returnedQuantity}</td>
                        <td className="p-3 text-center">
                          <Badge className={cn("text-xs", getConditionBadge(item.condition))}>
                            {item.condition}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">{item.reason}</td>
                        <td className="p-3 text-right">{formatCurrency(item.refundAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Created by {selectedReturn.createdBy} on {formatDate(selectedReturn.createdAt)}
                  </p>
                  {selectedReturn.approvedBy && (
                    <p className="text-sm text-muted-foreground">
                      Approved by {selectedReturn.approvedBy} on {formatDate(selectedReturn.approvedAt!)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Refund</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(selectedReturn.totalRefundAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
