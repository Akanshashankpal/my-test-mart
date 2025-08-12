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
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users,
  Shield,
  Settings,
  Eye,
  EyeOff,
  UserPlus,
  Crown,
  ShieldCheck,
  ClipboardList,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "cashier" | "accountant";
  permissions: {
    canCreateBills: boolean;
    canEditBills: boolean;
    canDeleteBills: boolean;
    canViewReports: boolean;
    canManageUsers: boolean;
    canManageSettings: boolean;
    canProcessReturns: boolean;
    canGiveDiscounts: boolean;
    maxDiscountPercent: number;
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

// Mock data
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@electromart.com",
    name: "Admin User",
    role: "admin",
    permissions: {
      canCreateBills: true,
      canEditBills: true,
      canDeleteBills: true,
      canViewReports: true,
      canManageUsers: true,
      canManageSettings: true,
      canProcessReturns: true,
      canGiveDiscounts: true,
      maxDiscountPercent: 50,
    },
    isActive: true,
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "manager@electromart.com",
    name: "Sarah Wilson",
    role: "manager",
    permissions: {
      canCreateBills: true,
      canEditBills: true,
      canDeleteBills: false,
      canViewReports: true,
      canManageUsers: false,
      canManageSettings: true,
      canProcessReturns: true,
      canGiveDiscounts: true,
      maxDiscountPercent: 20,
    },
    isActive: true,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    email: "cashier@electromart.com",
    name: "Mike Johnson",
    role: "cashier",
    permissions: {
      canCreateBills: true,
      canEditBills: false,
      canDeleteBills: false,
      canViewReports: false,
      canManageUsers: false,
      canManageSettings: false,
      canProcessReturns: true,
      canGiveDiscounts: true,
      maxDiscountPercent: 5,
    },
    isActive: true,
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
    createdAt: new Date("2024-02-01"),
  },
];

const rolePermissions = {
  admin: {
    canCreateBills: true,
    canEditBills: true,
    canDeleteBills: true,
    canViewReports: true,
    canManageUsers: true,
    canManageSettings: true,
    canProcessReturns: true,
    canGiveDiscounts: true,
    maxDiscountPercent: 50,
  },
  manager: {
    canCreateBills: true,
    canEditBills: true,
    canDeleteBills: false,
    canViewReports: true,
    canManageUsers: false,
    canManageSettings: true,
    canProcessReturns: true,
    canGiveDiscounts: true,
    maxDiscountPercent: 20,
  },
  cashier: {
    canCreateBills: true,
    canEditBills: false,
    canDeleteBills: false,
    canViewReports: false,
    canManageUsers: false,
    canManageSettings: false,
    canProcessReturns: true,
    canGiveDiscounts: true,
    maxDiscountPercent: 5,
  },
  accountant: {
    canCreateBills: false,
    canEditBills: false,
    canDeleteBills: false,
    canViewReports: true,
    canManageUsers: false,
    canManageSettings: false,
    canProcessReturns: false,
    canGiveDiscounts: false,
    maxDiscountPercent: 0,
  },
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier" as User['role'],
    permissions: rolePermissions.cashier,
    isActive: true,
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "cashier",
      permissions: rolePermissions.cashier,
      isActive: true,
    });
  };

  const handleRoleChange = (role: User['role']) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: rolePermissions[role],
    }));
  };

  const handlePermissionChange = (permission: keyof User['permissions'], value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData: User = {
      id: editingUser?.id || Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: formData.permissions,
      isActive: formData.isActive,
      lastLogin: editingUser?.lastLogin,
      createdAt: editingUser?.createdAt || new Date(),
    };

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? userData : u));
    } else {
      setUsers(prev => [...prev, userData]);
    }

    resetForm();
    setIsAddDialogOpen(false);
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setDeleteUserId(null);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-red-600" />;
      case "manager":
        return <ShieldCheck className="h-4 w-4 text-blue-600" />;
      case "cashier":
        return <Calculator className="h-4 w-4 text-green-600" />;
      case "accountant":
        return <ClipboardList className="h-4 w-4 text-purple-600" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cashier":
        return "bg-green-100 text-green-800 border-green-200";
      case "accountant":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatLastLogin = (date?: Date) => {
    if (!date) return "Never";
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts and role-based permissions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setEditingUser(null);
            }}>
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {editingUser ? "(Leave empty to keep current)" : "*"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPasswords ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required={!editingUser}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="accountant">Accountant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  User is Active
                </Label>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Switch
                        checked={formData.permissions.canCreateBills}
                        onCheckedChange={(checked) => handlePermissionChange('canCreateBills', checked)}
                      />
                      Create Bills
                    </Label>
                    
                    <Label className="flex items-center gap-2">
                      <Switch
                        checked={formData.permissions.canEditBills}
                        onCheckedChange={(checked) => handlePermissionChange('canEditBills', checked)}
                      />
                      Edit Bills
                    </Label>
                    
                    <Label className="flex items-center gap-2">
                      <Switch
                        checked={formData.permissions.canDeleteBills}
                        onCheckedChange={(checked) => handlePermissionChange('canDeleteBills', checked)}
                      />
                      Delete Bills
                    </Label>
                    
                    <Label className="flex items-center gap-2">
                      <Switch
                        checked={formData.permissions.canViewReports}
                        onCheckedChange={(checked) => handlePermissionChange('canViewReports', checked)}
                      />
                      View Reports
                    </Label>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Switch
                        checked={formData.permissions.canManageUsers}
                        onCheckedChange={(checked) => handlePermissionChange('canManageUsers', checked)}
                      />
                      Manage Users
                    </Label>
                    
                    <Label className="flex items-center gap-2">
                      <Switch
                        checked={formData.permissions.canManageSettings}
                        onCheckedChange={(checked) => handlePermissionChange('canManageSettings', checked)}
                      />
                      Manage Settings
                    </Label>
                    
                    <Label className="flex items-center gap-2">
                      <Switch
                        checked={formData.permissions.canProcessReturns}
                        onCheckedChange={(checked) => handlePermissionChange('canProcessReturns', checked)}
                      />
                      Process Returns
                    </Label>
                    
                    <Label className="flex items-center gap-2">
                      <Switch
                        checked={formData.permissions.canGiveDiscounts}
                        onCheckedChange={(checked) => handlePermissionChange('canGiveDiscounts', checked)}
                      />
                      Give Discounts
                    </Label>
                  </div>
                </div>
                
                {formData.permissions.canGiveDiscounts && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Maximum Discount Percentage</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.permissions.maxDiscountPercent}
                      onChange={(e) => handlePermissionChange('maxDiscountPercent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingUser ? "Update" : "Create"} User
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Online Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.lastLogin && Date.now() - u.lastLogin.getTime() < 5 * 60 * 1000).length}
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
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map(user => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{user.name}</h4>
                        <Badge className={cn("text-xs", getRoleBadgeColor(user.role))}>
                          {user.role}
                        </Badge>
                        {!user.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Last Login:</span>
                      <p className="font-semibold">{formatLastLogin(user.lastLogin)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Discount:</span>
                      <p className="font-semibold">{user.permissions.maxDiscountPercent}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p className="font-semibold">{user.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className={cn(
                        "font-semibold",
                        user.isActive ? "text-green-600" : "text-red-600"
                      )}>
                        {user.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>

                  {/* Permissions Summary */}
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(user.permissions).map(([key, value]) => {
                      if (key === 'maxDiscountPercent' || !value) return null;
                      const labels: { [key: string]: string } = {
                        canCreateBills: "Create Bills",
                        canEditBills: "Edit Bills", 
                        canDeleteBills: "Delete Bills",
                        canViewReports: "View Reports",
                        canManageUsers: "Manage Users",
                        canManageSettings: "Manage Settings",
                        canProcessReturns: "Process Returns",
                        canGiveDiscounts: "Give Discounts",
                      };
                      return (
                        <Badge key={key} variant="outline" className="text-xs">
                          {labels[key]}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUserStatus(user.id)}
                    className={user.isActive ? "text-orange-600" : "text-green-600"}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteUserId(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDelete(deleteUserId)}
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
