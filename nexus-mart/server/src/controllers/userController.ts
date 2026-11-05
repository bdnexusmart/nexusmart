import asyncHandler from "express-async-handler";
import { Response } from "express";
import User from "../models/User";
import ApiError from "../utils/ApiError";
import { AuthRequest } from "../types";

// @route PUT /api/users/profile (private)
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(404, "User not found");

  user.name = req.body.name ?? user.name;
  user.phone = req.body.phone ?? user.phone;
  if (req.body.password) user.password = req.body.password;

  const updated = await user.save();
  res.json({
    success: true,
    user: { _id: updated._id, name: updated.name, email: updated.email, role: updated.role, phone: updated.phone },
  });
});

// @route POST /api/users/addresses (private)
export const addAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(404, "User not found");
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

// @route GET /api/users (admin)
export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// @route PUT /api/users/:id/status (admin)
export const setUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (String(user._id) === String(req.user?._id)) {
    throw new ApiError(400, "You cannot deactivate your own account");
  }
  user.isActive = req.body.isActive;
  await user.save();
  res.json({ success: true, user: { _id: user._id, isActive: user.isActive } });
});
