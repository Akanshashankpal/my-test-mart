import apiClient from '@/lib/api';

// GST Configuration for state detection
const gstConfig = {
  DELHI: {
    names: ["delhi", "new delhi"],
    codes: ["110", "11"],
    gst: 18,
  },
  MUMBAI: {
    names: ["mumbai", "maharashtra"],
    codes: ["400", "401", "402", "403"],
    gst: 18,
  },
  BANGALORE: {
    names: ["bangalore", "bengaluru", "karnataka"],
    codes: ["560"],
    gst: 18,
  },
  OTHER: {
    names: [],
    codes: [],
    gst: 18,
  },
};

// Calculate Bill function as provided
function calculateBill(data: any) {
  // 1��⃣ Subtotal
  let subtotal = data.items.reduce(
    (acc: number, item: any) => acc + item.itemPrice * item.itemQuantity,
    0,
  );

  // 2️⃣ Discount
  let discountAmount = (subtotal * (data.discount || 0)) / 100;
  let afterDiscount = subtotal - discountAmount;

  // 3️⃣ Detect state from address / pincode
  let stateKey = "OTHER";

  for (let key in gstConfig) {
    const cfg = gstConfig[key];

    // Match by pincode prefix
    if (
      data.pincode &&
      cfg.codes.some((code) => data.pincode.startsWith(code))
    ) {
      stateKey = key;
      break;
    }

    // Match by state name in address
    if (
      data.customerAddress &&
      cfg.names.some((name) =>
        data.customerAddress.toLowerCase().includes(name.toLowerCase()),
      )
    ) {
      stateKey = key;
      break;
    }
  }

  // 4️⃣ GST %
  let gstPercent = gstConfig[stateKey].gst;
  let gstAmount = (afterDiscount * gstPercent) / 100;

  // 5️⃣ Final Total
  let totalAmount = afterDiscount + gstAmount;

  // 6️⃣ Payment logic
  let remainingAmount = 0;
  if (data.paymentType === "Partial") {
    remainingAmount = totalAmount - (data.paidAmount || 0);
  }

  return {
    subtotal,
    discountAmount,
    afterDiscount,
    gstPercent,
    gstAmount,
    totalAmount,
    paidAmount: data.paidAmount || 0,
    remainingAmount,
    stateKey,
  };
}

// Bill Service Interface
export interface BillItem {
  itemName: string;
  itemPrice: number;
  itemQuantity: number;
  itemTotal?: number;
}

export interface BillData {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  pincode?: string;
  items: BillItem[];
  discount?: number;
  paymentType: "Full" | "Partial";
  paidAmount?: number;
  paymentMethod: "cash" | "online" | "mixed";
  observation?: string;
  termsAndConditions?: string;
  billType: "GST" | "Non-GST" | "Quotation";
}

export interface Bill extends BillData {
  id: string;
  billNumber: string;
  billDate: string;
  subtotal: number;
  discountAmount: number;
  afterDiscount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  remainingAmount: number;
  stateKey: string;
  createdAt: string;
  updatedAt?: string;
}

// Billing Service using axios
export const billingService = {
  // Create new bill
  async createBill(billData: BillData): Promise<Bill> {
    // Calculate bill totals using the provided function
    const calculations = calculateBill(billData);

    const billPayload = {
      ...billData,
      ...calculations,
      billDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Log the payload for debugging
    console.log('Creating bill with payload:', JSON.stringify(billPayload, null, 2));

    const response = await apiClient.post("/api/newBill/register", billPayload);

    // Log the response for debugging
    console.log('Create bill response:', response.data);

    // Handle different response formats
    if (response.data && response.data.bill) {
      return response.data.bill;
    }
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Get all bills
  async getAllBills(): Promise<Bill[]> {
    const response = await apiClient.get("/api/newBill/getBills");

    // Handle different response formats
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && response.data.success && response.data.bills) {
      return response.data.bills;
    }
    return [];
  },

  // Get bill by ID
  async getBillById(id: string): Promise<Bill> {
    const response = await apiClient.get(`/getBillsbyid/${id}`);

    // Handle different response formats
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Update bill
  async updateBill(id: string, billData: Partial<BillData>): Promise<Bill> {
    // Try multiple possible endpoints for update
    const updateEndpoints = [
      `/api/newBill/updateBills/${id}`,
      `/api/updateBills/${id}`,
      `/updateBills/${id}`,
      `/api/newBill/updateBills/${id}`
    ];

    console.warn('⚠️ Server update endpoint not confirmed. Trying multiple endpoints...');

    for (const endpoint of updateEndpoints) {
      try {
        // Recalculate if items or discount changed
        const calculations = billData.items
          ? calculateBill(billData as BillData)
          : {};

        const billPayload = {
          ...billData,
          ...calculations,
          updatedAt: new Date().toISOString(),
        };

        const response = await apiClient.put(endpoint, billPayload);

        console.log(`✅ Update successful using endpoint: ${endpoint}`);

        // Handle different response formats
        if (response.data && response.data.data) {
          return response.data.data;
        }
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn(`❌ Endpoint ${endpoint} not found, trying next...`);
          continue;
        }
        // If it's not a 404, throw the error
        throw error;
      }
    }

    // If all endpoints fail, throw a helpful error
    throw new Error(
      'Update bill functionality is not available on the server. The server needs to implement an update endpoint like /api/newBill/update/:id'
    );
  },

  // Delete bill
  async deleteBill(id: string): Promise<void> {
    // Try multiple possible endpoints for delete
    const deleteEndpoints = [
      `/api/newBill/delete/${id}`,
      `/api/deleteBills/${id}`,
      `/deleteBills/${id}`,
      `/api/newBill/${id}`
    ];

    console.warn('⚠️ Server delete endpoint not confirmed. Trying multiple endpoints...');

    for (const endpoint of deleteEndpoints) {
      try {
        await apiClient.delete(endpoint);
        console.log(`✅ Delete successful using endpoint: ${endpoint}`);
        return;
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn(`❌ Endpoint ${endpoint} not found, trying next...`);
          continue;
        }
        // If it's not a 404, throw the error
        throw error;
      }
    }

    // If all endpoints fail, throw a helpful error
    throw new Error(
      'Delete bill functionality is not available on the server. The server needs to implement a delete endpoint like /api/newBill/delete/:id'
    );
  },

  // Calculate bill totals (utility function)
  calculateBill,

  // Generate bill number
  generateBillNumber(billType: string = "GST"): string {
    const timestamp = Date.now();
    const prefix =
      billType === "GST" ? "GST" : billType === "Non-GST" ? "NGST" : "QUO";
    return `${prefix}/24/${timestamp.toString().slice(-6)}`;
  },
};

export default billingService;
