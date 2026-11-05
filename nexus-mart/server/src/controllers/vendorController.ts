import asyncHandler from "express-async-handler";
import { Response } from "express";
import Vendor from "../models/Vendor";
import Product from "../models/Product";
import Order from "../models/Order";
import ApiError from "../utils/ApiError";
import { AuthRequest, VendorStatus } from "../types";

// @route GET /api/vendors (public, approved only)
export const getVendors = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const vendors = await Vendor.find({ status: VendorStatus.APPROVED }).select("-bankDetails");
  res.json({ success: true, count: vendors.length, vendors });
});

// @route GET /api/vendors/:slug (public)
export const getVendorBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vendor = await Vendor.findOne({ slug: req.params.slug, status: VendorStatus.APPROVED }).select("-bankDetails");
  if (!vendor) throw new ApiError(404, "Vendor not found");
  res.json({ success: true, vendor });
});

// @route GET /api/vendors/me (vendor)
export const getMyVendorProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vendor = await Vendor.findOne({ user: req.user?._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");
  res.json({ success: true, vendor });
});

// @route PUT /api/vendors/me (vendor)
export const updateMyVendorProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vendor = await Vendor.findOne({ user: req.user?._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  ["storeName", "description", "logo", "banner", "address", "bankDetails"].forEach((field) => {
    if (req.body[field] !== undefined) (vendor as any)[field] = req.body[field];
  });

  res.json({ success: true, vendor: await vendor.save() });
});

// @route GET /api/vendors/me/dashboard (vendor)
export const getVendorDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vendor = await Vendor.findOne({ user: req.user?._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const productCount = await Product.countDocuments({ vendor: vendor._id });
  const orders = await Order.find({ "items.vendor": vendor._id });

  let totalSales = 0;
  let totalOrders = 0;
  orders.forEach((order) => {
    const mine = order.items.filter((i) => String(i.vendor) === String(vendor._id));
    if (mine.length) {
      totalOrders += 1;
      totalSales += mine.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }
  });

  res.json({
    success: true,
    dashboard: {
      storeName: vendor.storeName,
      status: vendor.status,
      productCount,
      totalOrders,
      totalSales,
      ratingAverage: vendor.ratingAverage,
    },
  });
});

// @route GET /api/vendors/admin/all (admin)
export const getAllVendorsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;
  const vendors = await Vendor.find(filter).populate("user", "name email").sort({ createdAt: -1 });
  res.json({ success: true, count: vendors.length, vendors });
});

// @route PUT /api/vendors/admin/:id/status (admin)
export const setVendorStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!Object.values(VendorStatus).includes(status)) throw new ApiError(400, "Invalid vendor status");

  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) throw new ApiError(404, "Vendor not found");

  vendor.status = status;
  await vendor.save();
  res.json({ success: true, vendor });
});
