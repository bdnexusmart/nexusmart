import { Request } from "express";
import { Types } from "mongoose";

export enum UserRole {
  CUSTOMER = "customer",
  VENDOR = "vendor",
  ADMIN = "admin",
}

export enum VendorStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
}

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  UNPAID = "unpaid",
  PAID = "paid",
  REFUNDED = "refunded",
  FAILED = "failed",
}

export interface JwtPayload {
  id: string;
  role: UserRole;
}

export interface AuthUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: UserRole;
}

// Extends Express Request so req.user is typed after the `protect` middleware runs
export interface AuthRequest extends Request {
  user?: AuthUser;
}
