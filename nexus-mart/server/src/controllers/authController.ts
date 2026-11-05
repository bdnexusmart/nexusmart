import asyncHandler from "express-async-handler";
import { Response } from "express";
import User from "../models/User";
import Vendor from "../models/Vendor";
import generateToken from "../utils/generateToken";
import ApiError from "../utils/ApiError";
import { AuthRequest, UserRole, VendorStatus } from "../types";

const publicUser = (user: any) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  vendor: user.vendor,
});

// @route POST /api/auth/register  (public) — customer by default, or vendor with storeName
export const registerUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, role, storeName } = req.body;

  if (await User.findOne({ email })) {
    throw new ApiError(400, "An account with this email already exists");
  }

  // Only customer/vendor can self-register; admins are seeded
  const requestedRole = role === UserRole.VENDOR ? UserRole.VENDOR : UserRole.CUSTOMER;
  if (requestedRole === UserRole.VENDOR && !storeName) {
    throw new ApiError(400, "storeName is required to register as a vendor");
  }

  const user = await User.create({ name, email, password, role: requestedRole });

  if (requestedRole === UserRole.VENDOR) {
    const vendor = await Vendor.create({ user: user._id, storeName, status: VendorStatus.PENDING });
    user.vendor = vendor._id as any;
    await user.save();
  }

  const token = generateToken(res, String(user._id), user.role);
  res.status(201).json({ success: true, token, user: publicUser(user) });
});

// @route POST /api/auth/login (public)
export const loginUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (!user.isActive) throw new ApiError(403, "This account has been deactivated");

  const token = generateToken(res, String(user._id), user.role);
  res.json({ success: true, token, user: publicUser(user) });
});

// @route POST /api/auth/logout (private)
export const logoutUser = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: "Logged out successfully" });
});

// @route GET /api/auth/me (private)
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?._id).populate("vendor");
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, user });
});
