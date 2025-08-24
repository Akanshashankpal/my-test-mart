import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  billingService,
  Bill as ApiBill,
  BillData,
} from "@/services/billingService";
import { useToast } from "@/hooks/use-toast";

// Updated interface to match API structure
export interface BillItem {
  itemName: string;
  itemPrice: number;
  itemQuantity: number;
  itemTotal?: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  billType: "GST" | "Non-GST" | "Quotation";
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
  paymentType: "Full" | "Partial";
  paymentMethod: "cash" | "online" | "mixed";
  observation?: string;
  termsAndConditions?: string;
  stateKey: string;
  createdAt: string;
  updatedAt?: string;
}

interface BillingContextType {
  bills: Bill[];
  isLoading: boolean;
  error: string | null;
  fetchBills: () => Promise<void>;
  addBill: (billData: BillData) => Promise<Bill | null>;
  updateBill: (
    billId: string,
    updates: Partial<BillData>,
  ) => Promise<Bill | null>;
  deleteBill: (billId: string) => Promise<boolean>;
  getBillById: (billId: string) => Bill | undefined;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export function BillingProvider({ children }: { children: ReactNode }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all bills from API
  const fetchBills = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiBills = await billingService.getAllBills();
      setBills(apiBills);

      // If no bills returned and no error, show informational message
      if (apiBills.length === 0) {
        console.info("��� No bills found");
      } else {
        console.info(`📋 Loaded ${apiBills.length} bills successfully`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch bills";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new bill
  const addBill = async (billData: BillData): Promise<Bill | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate bill number
      const billNumber = billingService.generateBillNumber(billData.billType);
      const billWithNumber = { ...billData, billNumber };

      const newBill = await billingService.createBill(billWithNumber);
      setBills((prev) => [newBill, ...prev]);

      toast({
        title: "Success",
        description: "Bill created successfully!",
        variant: "default",
      });

      return newBill;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create bill";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update bill
  const updateBill = async (
    billId: string,
    updates: Partial<BillData>,
  ): Promise<Bill | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedBill = await billingService.updateBill(billId, updates);

      // Ensure the updated bill has the correct ID
      const normalizedBill = {
        ...updatedBill,
        id: updatedBill.id || updatedBill._id || billId,
      };

      setBills((prev) =>
        prev.map((bill) => (bill.id === billId ? normalizedBill : bill)),
      );

      toast({
        title: "Success",
        description: "Bill updated successfully!",
        variant: "default",
      });

      return normalizedBill;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update bill";

      console.error("❌ Update bill error:", err);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete bill
  const deleteBill = async (billId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await billingService.deleteBill(billId);
      setBills((prev) => prev.filter((bill) => bill.id !== billId));

      toast({
        title: "Success",
        description: "Bill deleted successfully!",
        variant: "default",
      });

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete bill";

      // Check if it's a server endpoint issue
      if (errorMessage.includes("not available on the server")) {
        toast({
          title: "Feature Not Available",
          description:
            "Bill deletion is not yet supported by the server. Please contact support.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }

      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get bill by ID
  const getBillById = (billId: string) => {
    return bills.find((bill) => bill.id === billId);
  };

  // Fetch bills on component mount
  useEffect(() => {
    fetchBills();
  }, []);

  const value = {
    bills,
    isLoading,
    error,
    fetchBills,
    addBill,
    updateBill,
    deleteBill,
    getBillById,
  };

  return (
    <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
  );
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error("useBilling must be used within a BillingProvider");
  }
  return context;
}
