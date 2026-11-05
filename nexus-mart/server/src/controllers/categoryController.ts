import asyncHandler from "express-async-handler";
import { Response } from "express";
import Category from "../models/Category";
import ApiError from "../utils/ApiError";
import { AuthRequest } from "../types";

export const getCategories = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, count: categories.length, categories });
});

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  category.name = req.body.name ?? category.name;
  category.parent = req.body.parent ?? category.parent;
  category.image = req.body.image ?? category.image;

  res.json({ success: true, category: await category.save() });
});

export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");
  await category.deleteOne();
  res.json({ success: true, message: "Category removed" });
});
