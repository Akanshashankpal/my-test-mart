import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings as SettingsIcon,
  Building,
  FileText,
  Palette,
  Calculator,
  Save,
  RotateCcw,
  Upload,
  Download,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanySettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  state: string;
  stateCode: string;
  logo?: string;
}

interface InvoiceSettings {
  template: "standard" | "modern" | "minimal";
  fields: {
    showLogo: boolean;
    showGSTNumber: boolean;
    showEmail: boolean;
    showPhone: boolean;
    showTerms: boolean;
    showSignature: boolean;
  };
  numbering: {
    gstPrefix: string;
    nonGstPrefix: string;
    demoPrefix: string;
    resetYearly: boolean;
  };
  financialYear: {
    startMonth: number;
    current: string;
  };
  taxSettings: {
    defaultGSTRate: number;
    enableRoundOff: boolean;
    decimalPlaces: number;
  };
  termsAndConditions: string;
}

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

const stateCodes: { [key: string]: string } = {
  "Andhra Pradesh": "37", "Arunachal Pradesh": "12", "Assam": "18", "Bihar": "10",
  "Chhattisgarh": "22", "Goa": "30", "Gujarat": "24", "Haryana": "06",
  "Himachal Pradesh": "02", "Jharkhand": "20", "Karnataka": "29", "Kerala": "32",
  "Madhya Pradesh": "23", "Maharashtra": "27", "Manipur": "14", "Meghalaya": "17",
  "Mizoram": "15", "Nagaland": "13", "Odisha": "21", "Punjab": "03",
  "Rajasthan": "08", "Sikkim": "11", "Tamil Nadu": "33", "Telangana": "36",
  "Tripura": "16", "Uttar Pradesh": "09", "Uttarakhand": "05", "West Bengal": "19",
  "Delhi": "07"
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"company" | "invoice" | "preview">("company");
  const [hasChanges, setHasChanges] = useState(false);

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: "ElectroMart",
    address: "123 Business Street, Mumbai, Maharashtra 400001",
    phone: "+91 9876543210",
    email: "info@electromart.com",
    gstNumber: "27ABCDE1234F1Z5",
    state: "Maharashtra",
    stateCode: "27",
  });

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    template: "modern",
    fields: {
      showLogo: true,
      showGSTNumber: true,
      showEmail: true,
      showPhone: true,
      showTerms: true,
      showSignature: false,
    },
    numbering: {
      gstPrefix: "GST",
      nonGstPrefix: "NGST",
      demoPrefix: "DEMO",
      resetYearly: true,
    },
    financialYear: {
      startMonth: 4, // April
      current: "2024-25",
    },
    taxSettings: {
      defaultGSTRate: 18,
      enableRoundOff: true,
      decimalPlaces: 2,
    },
    termsAndConditions: "1. Payment is due within 30 days of invoice date.\n2. Interest @ 18% per annum will be charged on overdue amounts.\n3. All disputes are subject to Mumbai jurisdiction only.\n4. Goods once sold will not be taken back or exchanged.",
  });

  const handleCompanyChange = (field: keyof CompanySettings, value: string) => {
    setCompanySettings(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "state") {
        updated.stateCode = stateCodes[value] || "";
      }
      return updated;
    });
    setHasChanges(true);
  };

  const handleInvoiceChange = (field: string, value: any) => {
    setInvoiceSettings(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [keys[0]]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof InvoiceSettings],
            [keys[1]]: value,
          },
        };
      }
      return prev;
    });
    setHasChanges(true);
  };

  const saveSettings = () => {
    // In real app, this would call API
    console.log("Saving settings:", { companySettings, invoiceSettings });
    setHasChanges(false);
    
    // Show success notification
    alert("Settings saved successfully!");
  };

  const resetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      // Reset to default values
      setHasChanges(false);
    }
  };

  const generateFinancialYear = () => {
    const currentYear = new Date().getFullYear();
    const startMonth = invoiceSettings.financialYear.startMonth;
    const currentMonth = new Date().getMonth() + 1;
    
    if (currentMonth >= startMonth) {
      return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
    } else {
      return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
    }
  };

  const tabs = [
    { id: "company", label: "Company Details", icon: Building },
    { id: "invoice", label: "Invoice Settings", icon: FileText },
    { id: "preview", label: "Preview", icon: Eye },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Settings</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Configure company details and invoice preferences</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={resetSettings} size="sm" className="sm:size-default">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
          <Button onClick={saveSettings} disabled={!hasChanges} size="sm" className="sm:size-default">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Company Details Tab */}
      {activeTab === "company" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companySettings.companyName}
                    onChange={(e) => handleCompanyChange('companyName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number *</Label>
                  <Input
                    id="gstNumber"
                    value={companySettings.gstNumber}
                    onChange={(e) => handleCompanyChange('gstNumber', e.target.value)}
                    placeholder="27ABCDE1234F1Z5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={companySettings.address}
                  onChange={(e) => handleCompanyChange('address', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select
                    value={companySettings.state}
                    onValueChange={(value) => handleCompanyChange('state', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stateCode">State Code</Label>
                  <Input
                    id="stateCode"
                    value={companySettings.stateCode}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e) => handleCompanyChange('phone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => handleCompanyChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Recommended: 200x100px, PNG or JPG
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoice Settings Tab */}
      {activeTab === "invoice" && (
        <div className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Invoice Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["standard", "modern", "minimal"].map((template) => (
                  <div
                    key={template}
                    onClick={() => handleInvoiceChange('template', template)}
                    className={cn(
                      "p-4 border-2 rounded-lg cursor-pointer transition-colors",
                      invoiceSettings.template === template
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <div className="text-center">
                      <div className="w-full h-20 bg-muted rounded mb-2 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold capitalize">{template}</h4>
                      <p className="text-xs text-muted-foreground">
                        {template === "standard" && "Classic business invoice layout"}
                        {template === "modern" && "Clean, contemporary design"}
                        {template === "minimal" && "Simple, minimal styling"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(invoiceSettings.fields).map(([field, enabled]) => {
                  const labels: { [key: string]: string } = {
                    showLogo: "Company Logo",
                    showGSTNumber: "GST Number",
                    showEmail: "Email Address",
                    showPhone: "Phone Number",
                    showTerms: "Terms & Conditions",
                    showSignature: "Signature Line",
                  };
                  
                  return (
                    <Label key={field} className="flex items-center gap-2">
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => handleInvoiceChange(`fields.${field}`, checked)}
                      />
                      {labels[field]}
                    </Label>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Numbering */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Numbering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gstPrefix">GST Bill Prefix</Label>
                  <Input
                    id="gstPrefix"
                    value={invoiceSettings.numbering.gstPrefix}
                    onChange={(e) => handleInvoiceChange('numbering.gstPrefix', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nonGstPrefix">Non-GST Bill Prefix</Label>
                  <Input
                    id="nonGstPrefix"
                    value={invoiceSettings.numbering.nonGstPrefix}
                    onChange={(e) => handleInvoiceChange('numbering.nonGstPrefix', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="demoPrefix">Demo Bill Prefix</Label>
                  <Input
                    id="demoPrefix"
                    value={invoiceSettings.numbering.demoPrefix}
                    onChange={(e) => handleInvoiceChange('numbering.demoPrefix', e.target.value)}
                  />
                </div>
              </div>

              <Label className="flex items-center gap-2">
                <Switch
                  checked={invoiceSettings.numbering.resetYearly}
                  onCheckedChange={(checked) => handleInvoiceChange('numbering.resetYearly', checked)}
                />
                Reset numbering every financial year
              </Label>
            </CardContent>
          </Card>

          {/* Financial Year */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Year</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fyStart">Financial Year Start Month</Label>
                  <Select
                    value={invoiceSettings.financialYear.startMonth.toString()}
                    onValueChange={(value) => handleInvoiceChange('financialYear.startMonth', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const monthName = new Date(2024, i, 1).toLocaleString('default', { month: 'long' });
                        return (
                          <SelectItem key={month} value={month.toString()}>
                            {monthName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentFY">Current Financial Year</Label>
                  <Input
                    id="currentFY"
                    value={generateFinancialYear()}
                    disabled
                    className="bg-muted"
                  />
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="defaultGST">Default GST Rate (%)</Label>
                  <Input
                    id="defaultGST"
                    type="number"
                    min="0"
                    max="100"
                    value={invoiceSettings.taxSettings.defaultGSTRate}
                    onChange={(e) => handleInvoiceChange('taxSettings.defaultGSTRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="decimalPlaces">Decimal Places</Label>
                  <Select
                    value={invoiceSettings.taxSettings.decimalPlaces.toString()}
                    onValueChange={(value) => handleInvoiceChange('taxSettings.decimalPlaces', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Label className="flex items-center gap-2">
                <Switch
                  checked={invoiceSettings.taxSettings.enableRoundOff}
                  onCheckedChange={(checked) => handleInvoiceChange('taxSettings.enableRoundOff', checked)}
                />
                Enable automatic round-off
              </Label>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="terms">Default Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={invoiceSettings.termsAndConditions}
                  onChange={(e) => handleInvoiceChange('termsAndConditions', e.target.value)}
                  rows={6}
                  placeholder="Enter your default terms and conditions..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Preview how your invoice will look with current settings
              </p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white text-black max-w-2xl mx-auto">
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    {invoiceSettings.fields.showLogo && (
                      <div className="w-24 h-12 bg-gray-200 rounded mb-2 flex items-center justify-center">
                        <span className="text-xs text-gray-500">LOGO</span>
                      </div>
                    )}
                    <h1 className="text-2xl font-bold">{companySettings.companyName}</h1>
                    <p className="text-sm text-gray-600">{companySettings.address}</p>
                    {invoiceSettings.fields.showPhone && (
                      <p className="text-sm">Phone: {companySettings.phone}</p>
                    )}
                    {invoiceSettings.fields.showEmail && (
                      <p className="text-sm">Email: {companySettings.email}</p>
                    )}
                    {invoiceSettings.fields.showGSTNumber && (
                      <p className="text-sm">GST: {companySettings.gstNumber}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold">INVOICE</h2>
                    <p className="text-sm">#{invoiceSettings.numbering.gstPrefix}/24/0001</p>
                    <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <div className="text-sm">
                    <p>Sample Customer</p>
                    <p>123 Customer Street</p>
                    <p>City, State 123456</p>
                    <p>Phone: +91 9876543210</p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full border-collapse border border-gray-300 mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Item</th>
                      <th className="border border-gray-300 p-2 text-right">Qty</th>
                      <th className="border border-gray-300 p-2 text-right">Rate</th>
                      <th className="border border-gray-300 p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">Sample Product</td>
                      <td className="border border-gray-300 p-2 text-right">1</td>
                      <td className="border border-gray-300 p-2 text-right">₹1,000.00</td>
                      <td className="border border-gray-300 p-2 text-right">₹1,000.00</td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-64">
                    <div className="flex justify-between py-1">
                      <span>Subtotal:</span>
                      <span>₹1,000.00</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>CGST (9%):</span>
                      <span>₹90.00</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>SGST (9%):</span>
                      <span>₹90.00</span>
                    </div>
                    <div className="flex justify-between py-1 font-bold border-t">
                      <span>Total:</span>
                      <span>₹1,180.00</span>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                {invoiceSettings.fields.showTerms && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Terms & Conditions:</h3>
                    <div className="text-xs text-gray-600 whitespace-pre-line">
                      {invoiceSettings.termsAndConditions}
                    </div>
                  </div>
                )}

                {/* Signature */}
                {invoiceSettings.fields.showSignature && (
                  <div className="text-right">
                    <div className="inline-block">
                      <div className="w-40 border-t border-gray-400 mt-16 mb-2"></div>
                      <p className="text-sm">Authorized Signature</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
