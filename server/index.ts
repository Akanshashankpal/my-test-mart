import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
} from "./routes/billing";
import {
  login,
  refreshToken,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  getSettings,
  updateSettings,
  checkPermission,
  requirePermission,
  requireRole,
} from "./routes/users";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication API routes
  app.post("/api/auth/login", login);
  app.post("/api/auth/refresh", refreshToken);
  app.get("/api/auth/profile", getUserProfile);

  // User Management API routes
  app.get("/api/users", getUsers);
  app.post("/api/users", createUser);
  app.put("/api/users/:id", updateUser);
  app.delete("/api/users/:id", deleteUser);
  app.get("/api/users/permission/:permission", checkPermission);

  // Settings API routes
  app.get("/api/settings", getSettings);
  app.put("/api/settings", updateSettings);

  // Billing API routes
  app.post("/api/newbill", createBill);
  app.get("/getBills", getAllBills);
  app.get("/getBillsbyid/:id", getBillById);
  app.put("/updateBills/:id", updateBill);
  app.delete("/deleteBills/:id", deleteBill);

  return app;
}
