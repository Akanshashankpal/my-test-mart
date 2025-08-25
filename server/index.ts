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

  // Billing API routes
  app.post("/api/newbill", createBill);
  app.get("/getBills", getAllBills);
  app.get("/getBillsbyid/:id", getBillById);
  app.put("/updateBills/:id", updateBill);
  app.delete("/deleteBills/:id", deleteBill);

  return app;
}
