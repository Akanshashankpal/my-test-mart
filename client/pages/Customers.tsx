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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Phone,
  MapPin,
  ShoppingBag,
  History,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { customersAPI } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  totalPurchases: number;
  lastPurchase?: string;
  status: 'active' | 'inactive';
  gstNumber?: string;
}

interface Purchase {
  id: string;
  customerId: string;
  amount: number;
  date: Date;
  items: number;
  invoiceNumber: string;
  type: "GST" | "Non-GST";
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface CustomersResponse {
  customers: Customer[];
  pagination: Pagination;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [purchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  });

  // Fetch customers from API
  const fetchCustomers = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('isActive', statusFilter);

      const response = await customersAPI.getCustomers(params);

      if (response.success) {
        setCustomers(response.data.customers);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch customers on component mount and when filters change
  useEffect(() => {
    fetchCustomers(1);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        fetchCustomers(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getCustomerPurchases = (customerId: string) => {
    return purchases.filter(p => p.customerId === customerId);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      email: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData: Customer = {
      id: editingCustomer?.id || Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      email: formData.email || undefined,
      createdAt: editingCustomer?.createdAt || new Date(),
      updatedAt: new Date(),
      totalPurchases: editingCustomer?.totalPurchases || 0,
      lastPurchase: editingCustomer?.lastPurchase,
    };

    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? customerData : c));
    } else {
      setCustomers(prev => [...prev, customerData]);
    }

    resetForm();
    setIsAddDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      email: customer.email || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    setDeleteCustomerId(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customers</h2>
          <p className="text-muted-foreground">Manage customer information and purchase history</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setEditingCustomer(null);
            }}>
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Complete address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCustomer ? "Update" : "Add"} Customer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{customers.reduce((sum, c) => sum + c.totalPurchases, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Avg. Purchase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{Math.round(customers.reduce((sum, c) => sum + c.totalPurchases, 0) / customers.length).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.map(customer => {
          const customerPurchases = getCustomerPurchases(customer.id);
          return (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{customer.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                          {customer.email && (
                            <span>{customer.email}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />
                      <span>{customer.address}</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Purchases:</span>
                        <p className="font-semibold text-slate-700">₹{customer.totalPurchases.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Orders:</span>
                        <p className="font-semibold">{customerPurchases.length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Purchase:</span>
                        <p className="font-semibold">
                          {customer.lastPurchase ? formatDate(customer.lastPurchase) : "Never"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Customer Since:</span>
                        <p className="font-semibold">{formatDate(customer.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingCustomer(customer)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(customer)}
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteCustomerId(customer.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={!!viewingCustomer} onOpenChange={() => setViewingCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Details
            </DialogTitle>
          </DialogHeader>
          {viewingCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-semibold">{viewingCustomer.name}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-semibold">{viewingCustomer.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <p className="font-semibold">{viewingCustomer.address}</p>
                </div>
                {viewingCustomer.email && (
                  <div>
                    <Label>Email</Label>
                    <p className="font-semibold">{viewingCustomer.email}</p>
                  </div>
                )}
              </div>

              {/* Purchase History */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Purchase History
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {getCustomerPurchases(viewingCustomer.id).map(purchase => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{purchase.invoiceNumber}</span>
                          <Badge variant={purchase.type === "GST" ? "default" : "secondary"} className="text-xs">
                            {purchase.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(purchase.date)} • {purchase.items} items
                        </div>
                      </div>
                      <div className="font-semibold">₹{purchase.amount.toLocaleString()}</div>
                    </div>
                  ))}
                  {getCustomerPurchases(viewingCustomer.id).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No purchases yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCustomerId} onOpenChange={() => setDeleteCustomerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone and will remove all associated purchase history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCustomerId && handleDelete(deleteCustomerId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
