import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  Save,
  Upload,
  Download,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Camera,
  FileText,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  RefreshCcw,
  Trash2,
  Settings as SettingsIcon,
  User,
  Lock,
  Globe,
  Printer,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  Zap,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface CompanyProfile {
  name: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  country: string;
  gstNumber: string;
  panNumber: string;
  phone: string;
  email: string;
  website: string;
  logo: string | null;
  description: string;
  establishedYear: string;
  registrationNumber: string;
  bankAccount: {
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
    bankName: string;
    branch: string;
    accountType: "Savings" | "Current" | "Overdraft";
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
  };
}

interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: string;
  currencyFormat: string;
  numberFormat: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    billReminders: boolean;
    paymentAlerts: boolean;
    lowStockAlerts: boolean;
    monthlyReports: boolean;
  };
  display: {
    compactMode: boolean;
    showAnimations: boolean;
    highContrast: boolean;
    fontSize: "small" | "medium" | "large";
  };
}

interface BillingSettings {
  defaultBillType: "GST" | "Non-GST";
  autoGenerateBillNumbers: boolean;
  billNumberPrefix: string;
  billNumberSuffix: string;
  startingNumber: number;
  taxSettings: {
    defaultGSTRate: number;
    enableCess: boolean;
    cessRate: number;
    enableTCS: boolean;
    tcsRate: number;
  };
  paymentTerms: string;
  defaultDueDays: number;
  lateFeePercentage: number;
  discountTerms: string;
  footerText: string;
  includeQRCode: boolean;
  includeBankDetails: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginNotifications: boolean;
  dataBackup: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly";
    retention: number;
  };
  apiAccess: {
    enabled: boolean;
    apiKey: string;
    lastRegenerated: Date;
  };
}

// State codes mapping
const stateCodes: { [key: string]: string } = {
  "Andhra Pradesh": "37",
  "Arunachal Pradesh": "12",
  Assam: "18",
  Bihar: "10",
  Chhattisgarh: "22",
  Goa: "30",
  Gujarat: "24",
  Haryana: "06",
  "Himachal Pradesh": "02",
  Jharkhand: "20",
  Karnataka: "29",
  Kerala: "32",
  "Madhya Pradesh": "23",
  Maharashtra: "27",
  Manipur: "14",
  Meghalaya: "17",
  Mizoram: "15",
  Nagaland: "13",
  Odisha: "21",
  Punjab: "03",
  Rajasthan: "08",
  Sikkim: "11",
  "Tamil Nadu": "33",
  Telangana: "36",
  Tripura: "16",
  "Uttar Pradesh": "09",
  Uttarakhand: "05",
  "West Bengal": "19",
  Delhi: "07",
  "Jammu and Kashmir": "01",
  Ladakh: "02",
  Lakshadweep: "31",
  Puducherry: "34",
  "Andaman and Nicobar Islands": "35",
  Chandigarh: "04",
  "Dadra and Nagar Haveli and Daman and Diu": "26",
};

const indianStates = Object.keys(stateCodes);

// Mock data
const defaultCompanyProfile: CompanyProfile = {
  name: "ElectroMart Pvt Ltd",
  address: "123 Business Park, Electronic City",
  city: "Bangalore",
  state: "Karnataka",
  stateCode: "29",
  pincode: "560100",
  country: "India",
  gstNumber: "29ABCDE1234F1Z5",
  panNumber: "ABCDE1234F",
  phone: "+91 80 2345 6789",
  email: "info@electromart.com",
  website: "www.electromart.com",
  logo: null,
  description:
    "Leading electronics retailer providing quality products and excellent customer service.",
  establishedYear: "2015",
  registrationNumber: "CIN123456789",
  bankAccount: {
    accountNumber: "1234567890",
    accountHolderName: "ElectroMart Pvt Ltd",
    ifscCode: "HDFC0001234",
    bankName: "HDFC Bank",
    branch: "Electronic City",
    accountType: "Current",
  },
  socialMedia: {
    facebook: "https://facebook.com/electromart",
    twitter: "https://twitter.com/electromart",
    linkedin: "https://linkedin.com/company/electromart",
    instagram: "https://instagram.com/electromart",
  },
};

const defaultUserPreferences: UserPreferences = {
  theme: "light",
  language: "en",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  currencyFormat: "INR",
  numberFormat: "en-IN",
  notifications: {
    email: true,
    sms: false,
    push: true,
    billReminders: true,
    paymentAlerts: true,
    lowStockAlerts: true,
    monthlyReports: false,
  },
  display: {
    compactMode: false,
    showAnimations: true,
    highContrast: false,
    fontSize: "medium",
  },
};

const defaultBillingSettings: BillingSettings = {
  defaultBillType: "GST",
  autoGenerateBillNumbers: true,
  billNumberPrefix: "GST/24/",
  billNumberSuffix: "",
  startingNumber: 1,
  taxSettings: {
    defaultGSTRate: 18,
    enableCess: false,
    cessRate: 0,
    enableTCS: false,
    tcsRate: 0.1,
  },
  paymentTerms: "Payment due within 30 days",
  defaultDueDays: 30,
  lateFeePercentage: 2,
  discountTerms: "No discount applicable",
  footerText: "Thank you for your business!",
  includeQRCode: true,
  includeBankDetails: true,
};

const defaultSecuritySettings: SecuritySettings = {
  twoFactorAuth: false,
  sessionTimeout: 60,
  passwordExpiry: 90,
  loginNotifications: true,
  dataBackup: {
    enabled: true,
    frequency: "daily",
    retention: 30,
  },
  apiAccess: {
    enabled: false,
    apiKey: "sk_test_" + Math.random().toString(36).substring(2, 15),
    lastRegenerated: new Date(),
  },
};

export default function Settings() {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(
    defaultCompanyProfile,
  );
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    defaultUserPreferences,
  );
  const [billingSettings, setBillingSettings] = useState<BillingSettings>(
    defaultBillingSettings,
  );
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
    defaultSecuritySettings,
  );
  const [activeTab, setActiveTab] = useState("company");
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyProfile((prev) => ({
          ...prev,
          logo: e.target?.result as string,
        }));
        setUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Here you would save to your backend
      console.log("Saving settings:", {
        companyProfile,
        userPreferences,
        billingSettings,
        securitySettings,
      });

      setUnsavedChanges(false);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCompanyProfile(defaultCompanyProfile);
    setUserPreferences(defaultUserPreferences);
    setBillingSettings(defaultBillingSettings);
    setSecuritySettings(defaultSecuritySettings);
    setUnsavedChanges(false);
    setShowResetDialog(false);
  };

  const generateNewApiKey = () => {
    const newApiKey =
      "sk_test_" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    setSecuritySettings((prev) => ({
      ...prev,
      apiAccess: {
        ...prev.apiAccess,
        apiKey: newApiKey,
        lastRegenerated: new Date(),
      },
    }));
    setUnsavedChanges(true);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(securitySettings.apiAccess.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportSettings = () => {
    const settingsData = {
      companyProfile,
      userPreferences,
      billingSettings,
      securitySettings: {
        ...securitySettings,
        apiAccess: {
          ...securitySettings.apiAccess,
          apiKey: "[REDACTED]",
        },
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `electromart_settings_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your company profile and system preferences
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowResetDialog(true)}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !unsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {unsavedChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                You have unsaved changes. Don't forget to save!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="company" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={companyProfile.name}
                      onChange={(e) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input
                      id="establishedYear"
                      value={companyProfile.establishedYear}
                      onChange={(e) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          establishedYear: e.target.value,
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="2015"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={companyProfile.description}
                    onChange={(e) => {
                      setCompanyProfile((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="Brief description of your company"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gstNumber">GST Number *</Label>
                    <Input
                      id="gstNumber"
                      value={companyProfile.gstNumber}
                      onChange={(e) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          gstNumber: e.target.value,
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="29ABCDE1234F1Z5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="panNumber">PAN Number *</Label>
                    <Input
                      id="panNumber"
                      value={companyProfile.panNumber}
                      onChange={(e) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          panNumber: e.target.value,
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="ABCDE1234F"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="registrationNumber">
                    Registration Number
                  </Label>
                  <Input
                    id="registrationNumber"
                    value={companyProfile.registrationNumber}
                    onChange={(e) => {
                      setCompanyProfile((prev) => ({
                        ...prev,
                        registrationNumber: e.target.value,
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="CIN or registration number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Company Logo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    {companyProfile.logo ? (
                      <img
                        src={companyProfile.logo}
                        alt="Company Logo"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          No logo uploaded
                        </p>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    {companyProfile.logo && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCompanyProfile((prev) => ({
                            ...prev,
                            logo: null,
                          }));
                          setUnsavedChanges(true);
                        }}
                        className="text-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Recommended: 300x300px, Max: 5MB
                    <br />
                    Formats: JPG, PNG, SVG
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={companyProfile.phone}
                    onChange={(e) => {
                      setCompanyProfile((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="+91 80 2345 6789"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyProfile.email}
                    onChange={(e) => {
                      setCompanyProfile((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="info@company.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companyProfile.website}
                    onChange={(e) => {
                      setCompanyProfile((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="www.company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={companyProfile.address}
                    onChange={(e) => {
                      setCompanyProfile((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="Complete address"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={companyProfile.city}
                      onChange={(e) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="City name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={companyProfile.state}
                      onValueChange={(value) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          state: value,
                          stateCode: stateCodes[value] || "",
                        }));
                        setUnsavedChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={companyProfile.pincode}
                      onChange={(e) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          pincode: e.target.value,
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="560100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={companyProfile.country}
                      onChange={(e) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="India"
                    />
                  </div>
                  <div>
                    <Label>State Code</Label>
                    <Input
                      value={companyProfile.stateCode}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Bank Account Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountHolderName">
                      Account Holder Name
                    </Label>
                    <Input
                      id="accountHolderName"
                      value={companyProfile.bankAccount.accountHolderName}
                      onChange={(e) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          bankAccount: {
                            ...prev.bankAccount,
                            accountHolderName: e.target.value,
                          },
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="Account holder name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={companyProfile.bankAccount.accountNumber}
                      onChange={(e) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          bankAccount: {
                            ...prev.bankAccount,
                            accountNumber: e.target.value,
                          },
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="Account number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      value={companyProfile.bankAccount.ifscCode}
                      onChange={(e) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          bankAccount: {
                            ...prev.bankAccount,
                            ifscCode: e.target.value,
                          },
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="IFSC code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={companyProfile.bankAccount.bankName}
                      onChange={(e) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          bankAccount: {
                            ...prev.bankAccount,
                            bankName: e.target.value,
                          },
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="Bank name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="branch">Branch</Label>
                    <Input
                      id="branch"
                      value={companyProfile.bankAccount.branch}
                      onChange={(e) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          bankAccount: {
                            ...prev.bankAccount,
                            branch: e.target.value,
                          },
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="Branch name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select
                      value={companyProfile.bankAccount.accountType}
                      onValueChange={(
                        value: "Savings" | "Current" | "Overdraft",
                      ) => {
                        setCompanyProfile((prev) => ({
                          ...prev,
                          bankAccount: {
                            ...prev.bankAccount,
                            accountType: value,
                          },
                        }));
                        setUnsavedChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Current">Current</SelectItem>
                        <SelectItem value="Overdraft">Overdraft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={companyProfile.socialMedia.facebook}
                    onChange={(e) => {
                      setCompanyProfile((prev) => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          facebook: e.target.value,
                        },
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="https://facebook.com/yourcompany"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={companyProfile.socialMedia.twitter}
                    onChange={(e) => {
                      setCompanyProfile((prev) => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          twitter: e.target.value,
                        },
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="https://twitter.com/yourcompany"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={companyProfile.socialMedia.linkedin}
                    onChange={(e) => {
                      setCompanyProfile((prev) => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          linkedin: e.target.value,
                        },
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={companyProfile.socialMedia.instagram}
                    onChange={(e) => {
                      setCompanyProfile((prev) => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          instagram: e.target.value,
                        },
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="https://instagram.com/yourcompany"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings Tab */}
        <TabsContent value="billing" className="space-y-6">
          {/* Bill Generation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Bill Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultBillType">Default Bill Type</Label>
                  <Select
                    value={billingSettings.defaultBillType}
                    onValueChange={(value: "GST" | "Non-GST") => {
                      setBillingSettings((prev) => ({
                        ...prev,
                        defaultBillType: value,
                      }));
                      setUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GST">GST Invoice</SelectItem>
                      <SelectItem value="Non-GST">Non-GST Invoice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoGenerateBillNumbers"
                    checked={billingSettings.autoGenerateBillNumbers}
                    onCheckedChange={(checked) => {
                      setBillingSettings((prev) => ({
                        ...prev,
                        autoGenerateBillNumbers: checked,
                      }));
                      setUnsavedChanges(true);
                    }}
                  />
                  <Label htmlFor="autoGenerateBillNumbers">
                    Auto-generate bill numbers
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="billNumberPrefix">Bill Number Prefix</Label>
                  <Input
                    id="billNumberPrefix"
                    value={billingSettings.billNumberPrefix}
                    onChange={(e) => {
                      setBillingSettings((prev) => ({
                        ...prev,
                        billNumberPrefix: e.target.value,
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="GST/24/"
                  />
                </div>
                <div>
                  <Label htmlFor="startingNumber">Starting Number</Label>
                  <Input
                    id="startingNumber"
                    type="number"
                    value={billingSettings.startingNumber}
                    onChange={(e) => {
                      setBillingSettings((prev) => ({
                        ...prev,
                        startingNumber: Number(e.target.value),
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="billNumberSuffix">Bill Number Suffix</Label>
                  <Input
                    id="billNumberSuffix"
                    value={billingSettings.billNumberSuffix}
                    onChange={(e) => {
                      setBillingSettings((prev) => ({
                        ...prev,
                        billNumberSuffix: e.target.value,
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="Optional suffix"
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium">Preview:</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {billingSettings.billNumberPrefix}
                  {String(billingSettings.startingNumber).padStart(4, "0")}
                  {billingSettings.billNumberSuffix}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tax Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Tax Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultGSTRate">Default GST Rate (%)</Label>
                  <Input
                    id="defaultGSTRate"
                    type="number"
                    value={billingSettings.taxSettings.defaultGSTRate}
                    onChange={(e) => {
                      setBillingSettings((prev) => ({
                        ...prev,
                        taxSettings: {
                          ...prev.taxSettings,
                          defaultGSTRate: Number(e.target.value),
                        },
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="18"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableCess"
                    checked={billingSettings.taxSettings.enableCess}
                    onCheckedChange={(checked) => {
                      setBillingSettings((prev) => ({
                        ...prev,
                        taxSettings: {
                          ...prev.taxSettings,
                          enableCess: checked,
                        },
                      }));
                      setUnsavedChanges(true);
                    }}
                  />
                  <Label htmlFor="enableCess">Enable Cess</Label>
                </div>
              </div>

              {billingSettings.taxSettings.enableCess && (
                <div>
                  <Label htmlFor="cessRate">Cess Rate (%)</Label>
                  <Input
                    id="cessRate"
                    type="number"
                    value={billingSettings.taxSettings.cessRate}
                    onChange={(e) => {
                      setBillingSettings((prev) => ({
                        ...prev,
                        taxSettings: {
                          ...prev.taxSettings,
                          cessRate: Number(e.target.value),
                        },
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="0"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableTCS"
                    checked={billingSettings.taxSettings.enableTCS}
                    onCheckedChange={(checked) => {
                      setBillingSettings((prev) => ({
                        ...prev,
                        taxSettings: {
                          ...prev.taxSettings,
                          enableTCS: checked,
                        },
                      }));
                      setUnsavedChanges(true);
                    }}
                  />
                  <Label htmlFor="enableTCS">Enable TCS</Label>
                </div>
                {billingSettings.taxSettings.enableTCS && (
                  <div>
                    <Label htmlFor="tcsRate">TCS Rate (%)</Label>
                    <Input
                      id="tcsRate"
                      type="number"
                      value={billingSettings.taxSettings.tcsRate}
                      onChange={(e) => {
                        setBillingSettings((prev) => ({
                          ...prev,
                          taxSettings: {
                            ...prev.taxSettings,
                            tcsRate: Number(e.target.value),
                          },
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="0.1"
                      step="0.1"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment & Terms Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment & Terms Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultDueDays">Default Due Days</Label>
                  <Input
                    id="defaultDueDays"
                    type="number"
                    value={billingSettings.defaultDueDays}
                    onChange={(e) => {
                      setBillingSettings((prev) => ({
                        ...prev,
                        defaultDueDays: Number(e.target.value),
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="lateFeePercentage">Late Fee (%)</Label>
                  <Input
                    id="lateFeePercentage"
                    type="number"
                    value={billingSettings.lateFeePercentage}
                    onChange={(e) => {
                      setBillingSettings((prev) => ({
                        ...prev,
                        lateFeePercentage: Number(e.target.value),
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="2"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Textarea
                  id="paymentTerms"
                  value={billingSettings.paymentTerms}
                  onChange={(e) => {
                    setBillingSettings((prev) => ({
                      ...prev,
                      paymentTerms: e.target.value,
                    }));
                    setUnsavedChanges(true);
                  }}
                  placeholder="Payment due within 30 days"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="discountTerms">Discount Terms</Label>
                <Textarea
                  id="discountTerms"
                  value={billingSettings.discountTerms}
                  onChange={(e) => {
                    setBillingSettings((prev) => ({
                      ...prev,
                      discountTerms: e.target.value,
                    }));
                    setUnsavedChanges(true);
                  }}
                  placeholder="No discount applicable"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Invoice Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="footerText">Footer Text</Label>
                <Textarea
                  id="footerText"
                  value={billingSettings.footerText}
                  onChange={(e) => {
                    setBillingSettings((prev) => ({
                      ...prev,
                      footerText: e.target.value,
                    }));
                    setUnsavedChanges(true);
                  }}
                  placeholder="Thank you for your business!"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeQRCode"
                    checked={billingSettings.includeQRCode}
                    onCheckedChange={(checked) => {
                      setBillingSettings((prev) => ({
                        ...prev,
                        includeQRCode: checked,
                      }));
                      setUnsavedChanges(true);
                    }}
                  />
                  <Label htmlFor="includeQRCode">
                    Include QR Code for payments
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeBankDetails"
                    checked={billingSettings.includeBankDetails}
                    onCheckedChange={(checked) => {
                      setBillingSettings((prev) => ({
                        ...prev,
                        includeBankDetails: checked,
                      }));
                      setUnsavedChanges(true);
                    }}
                  />
                  <Label htmlFor="includeBankDetails">
                    Include bank details in invoice
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={userPreferences.theme}
                    onValueChange={(value: "light" | "dark" | "system") => {
                      setUserPreferences((prev) => ({ ...prev, theme: value }));
                      setUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select
                    value={userPreferences.display.fontSize}
                    onValueChange={(value: "small" | "medium" | "large") => {
                      setUserPreferences((prev) => ({
                        ...prev,
                        display: { ...prev.display, fontSize: value },
                      }));
                      setUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compactMode"
                    checked={userPreferences.display.compactMode}
                    onCheckedChange={(checked) => {
                      setUserPreferences((prev) => ({
                        ...prev,
                        display: { ...prev.display, compactMode: checked },
                      }));
                      setUnsavedChanges(true);
                    }}
                  />
                  <Label htmlFor="compactMode">Compact mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showAnimations"
                    checked={userPreferences.display.showAnimations}
                    onCheckedChange={(checked) => {
                      setUserPreferences((prev) => ({
                        ...prev,
                        display: { ...prev.display, showAnimations: checked },
                      }));
                      setUnsavedChanges(true);
                    }}
                  />
                  <Label htmlFor="showAnimations">Show animations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="highContrast"
                    checked={userPreferences.display.highContrast}
                    onCheckedChange={(checked) => {
                      setUserPreferences((prev) => ({
                        ...prev,
                        display: { ...prev.display, highContrast: checked },
                      }));
                      setUnsavedChanges(true);
                    }}
                  />
                  <Label htmlFor="highContrast">High contrast mode</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Localization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={userPreferences.language}
                    onValueChange={(value) => {
                      setUserPreferences((prev) => ({
                        ...prev,
                        language: value,
                      }));
                      setUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="kn">Kannada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={userPreferences.timezone}
                    onValueChange={(value) => {
                      setUserPreferences((prev) => ({
                        ...prev,
                        timezone: value,
                      }));
                      setUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">
                        Asia/Kolkata (IST)
                      </SelectItem>
                      <SelectItem value="Asia/Dubai">
                        Asia/Dubai (GST)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        Europe/London (GMT)
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        America/New_York (EST)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={userPreferences.dateFormat}
                    onValueChange={(value) => {
                      setUserPreferences((prev) => ({
                        ...prev,
                        dateFormat: value,
                      }));
                      setUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currencyFormat">Currency</Label>
                  <Select
                    value={userPreferences.currencyFormat}
                    onValueChange={(value) => {
                      setUserPreferences((prev) => ({
                        ...prev,
                        currencyFormat: value,
                      }));
                      setUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="numberFormat">Number Format</Label>
                  <Select
                    value={userPreferences.numberFormat}
                    onValueChange={(value) => {
                      setUserPreferences((prev) => ({
                        ...prev,
                        numberFormat: value,
                      }));
                      setUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-IN">Indian (1,00,000)</SelectItem>
                      <SelectItem value="en-US">US (100,000)</SelectItem>
                      <SelectItem value="de-DE">German (100.000)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={userPreferences.notifications.email}
                    onCheckedChange={(checked) => {
                      setUserPreferences((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          email: checked,
                        },
                      }));
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={userPreferences.notifications.sms}
                    onCheckedChange={(checked) => {
                      setUserPreferences((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, sms: checked },
                      }));
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={userPreferences.notifications.push}
                    onCheckedChange={(checked) => {
                      setUserPreferences((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, push: checked },
                      }));
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <h4 className="font-medium">Specific Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="billReminders">
                      Bill payment reminders
                    </Label>
                    <Switch
                      id="billReminders"
                      checked={userPreferences.notifications.billReminders}
                      onCheckedChange={(checked) => {
                        setUserPreferences((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            billReminders: checked,
                          },
                        }));
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="paymentAlerts">
                      Payment received alerts
                    </Label>
                    <Switch
                      id="paymentAlerts"
                      checked={userPreferences.notifications.paymentAlerts}
                      onCheckedChange={(checked) => {
                        setUserPreferences((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            paymentAlerts: checked,
                          },
                        }));
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lowStockAlerts">Low stock alerts</Label>
                    <Switch
                      id="lowStockAlerts"
                      checked={userPreferences.notifications.lowStockAlerts}
                      onCheckedChange={(checked) => {
                        setUserPreferences((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            lowStockAlerts: checked,
                          },
                        }));
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="monthlyReports">Monthly reports</Label>
                    <Switch
                      id="monthlyReports"
                      checked={userPreferences.notifications.monthlyReports}
                      onCheckedChange={(checked) => {
                        setUserPreferences((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            monthlyReports: checked,
                          },
                        }));
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Authentication & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => {
                    setSecuritySettings((prev) => ({
                      ...prev,
                      twoFactorAuth: checked,
                    }));
                    setUnsavedChanges(true);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => {
                      setSecuritySettings((prev) => ({
                        ...prev,
                        sessionTimeout: Number(e.target.value),
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="60"
                  />
                </div>
                <div>
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => {
                      setSecuritySettings((prev) => ({
                        ...prev,
                        passwordExpiry: Number(e.target.value),
                      }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="90"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="loginNotifications">
                    Login Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Get notified when someone logs into your account
                  </p>
                </div>
                <Switch
                  id="loginNotifications"
                  checked={securitySettings.loginNotifications}
                  onCheckedChange={(checked) => {
                    setSecuritySettings((prev) => ({
                      ...prev,
                      loginNotifications: checked,
                    }));
                    setUnsavedChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* API Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="apiAccess">Enable API Access</Label>
                  <p className="text-sm text-gray-500">
                    Allow third-party applications to access your data
                  </p>
                </div>
                <Switch
                  id="apiAccess"
                  checked={securitySettings.apiAccess.enabled}
                  onCheckedChange={(checked) => {
                    setSecuritySettings((prev) => ({
                      ...prev,
                      apiAccess: { ...prev.apiAccess, enabled: checked },
                    }));
                    setUnsavedChanges(true);
                  }}
                />
              </div>

              {securitySettings.apiAccess.enabled && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label>API Key</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={securitySettings.apiAccess.apiKey}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={copyApiKey}>
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Last regenerated:</p>
                      <p className="text-sm text-gray-500">
                        {securitySettings.apiAccess.lastRegenerated.toLocaleDateString(
                          "en-IN",
                        )}
                      </p>
                    </div>
                    <Button variant="outline" onClick={generateNewApiKey}>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Important:</p>
                        <p>
                          Keep your API key secret. Regenerating will invalidate
                          the previous key.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dataBackupEnabled">Automatic Backup</Label>
                  <p className="text-sm text-gray-500">
                    Automatically backup your data
                  </p>
                </div>
                <Switch
                  id="dataBackupEnabled"
                  checked={securitySettings.dataBackup.enabled}
                  onCheckedChange={(checked) => {
                    setSecuritySettings((prev) => ({
                      ...prev,
                      dataBackup: { ...prev.dataBackup, enabled: checked },
                    }));
                    setUnsavedChanges(true);
                  }}
                />
              </div>

              {securitySettings.dataBackup.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select
                      value={securitySettings.dataBackup.frequency}
                      onValueChange={(
                        value: "daily" | "weekly" | "monthly",
                      ) => {
                        setSecuritySettings((prev) => ({
                          ...prev,
                          dataBackup: { ...prev.dataBackup, frequency: value },
                        }));
                        setUnsavedChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="backupRetention">
                      Retention Period (days)
                    </Label>
                    <Input
                      id="backupRetention"
                      type="number"
                      value={securitySettings.dataBackup.retention}
                      onChange={(e) => {
                        setSecuritySettings((prev) => ({
                          ...prev,
                          dataBackup: {
                            ...prev.dataBackup,
                            retention: Number(e.target.value),
                          },
                        }));
                        setUnsavedChanges(true);
                      }}
                      placeholder="30"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Manual Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all settings to their default
              values? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700"
            >
              Reset Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
