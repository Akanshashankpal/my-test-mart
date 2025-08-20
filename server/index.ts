import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Dashboard routes
import { getDashboardStats, getNotifications, getRecentTransactions, markNotificationRead } from "./routes/dashboard";

// Products routes
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories, getBrands } from "./routes/products";

// Customers routes
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, getTopCustomers, getCustomerStats } from "./routes/customers";

// Billing routes
import { getBills, getBillById, createBill, updateBill, deleteBill, generateBillPDF, getDashboardStats as getBillingStats, getSalesReturns, createSalesReturn, updateSalesReturnStatus } from "./routes/billing";

// Users routes
import { getUsers, getUserById, createUser, updateUser, deleteUser, getUserStats } from "./routes/users";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Dashboard API routes
  app.get("/api/dashboard/stats", getDashboardStats);
  app.get("/api/dashboard/notifications", getNotifications);
  app.get("/api/dashboard/transactions", getRecentTransactions);
  app.put("/api/notifications/:id/read", markNotificationRead);

  // Products API routes
  app.get("/api/products", getProducts);
  app.get("/api/products/categories", getCategories);
  app.get("/api/products/brands", getBrands);
  app.get("/api/products/:id", getProductById);
  app.post("/api/products", createProduct);
  app.put("/api/products/:id", updateProduct);
  app.delete("/api/products/:id", deleteProduct);

  // Customers API routes
  app.get("/api/customers", getCustomers);
  app.get("/api/customers/top", getTopCustomers);
  app.get("/api/customers/stats", getCustomerStats);
  app.get("/api/customers/:id", getCustomerById);
  app.post("/api/customers", createCustomer);
  app.put("/api/customers/:id", updateCustomer);
  app.delete("/api/customers/:id", deleteCustomer);

  // Billing API routes
  app.get("/api/bills", getBills);
  app.get("/api/bills/:id", getBillById);
  app.post("/api/bills", createBill);
  app.put("/api/bills/:id", updateBill);
  app.delete("/api/bills/:id", deleteBill);
  app.get("/api/bills/:id/pdf", generateBillPDF);

  // Sales Returns API routes
  app.get("/api/sales-returns", getSalesReturns);
  app.post("/api/sales-returns", createSalesReturn);
  app.put("/api/sales-returns/:id/status", updateSalesReturnStatus);

  // Users API routes
  app.get("/api/users", getUsers);
  app.get("/api/users/:id", getUserById);
  app.post("/api/users", createUser);
  app.put("/api/users/:id", updateUser);
  app.delete("/api/users/:id", deleteUser);

  return app;
}
