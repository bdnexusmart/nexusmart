import asyncHandler from "express-async-handler";
import { Response } from "express";
import Product from "../models/Product";
import Vendor from "../models/Vendor";
import ApiError from "../utils/ApiError";
import { AuthRequest, VendorStatus } from "../types";

// @route GET /api/products (public) — search, filter, paginate
export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 12, 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = { isActive: true, isApproved: true };
  if (req.query.keyword) filter.$text = { $search: String(req.query.keyword) };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.vendor) filter.vendor = req.query.vendor;
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {
      ...(req.query.minPrice ? { $gte: Number(req.query.minPrice) } : {}),
      ...(req.query.maxPrice ? { $lte: Number(req.query.maxPrice) } : {}),
    };
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("vendor", "storeName slug")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ success: true, count: products.length, total, page, pages: Math.ceil(total / limit), products });
});

// @route GET /api/products/:slug (public)
export const getProductBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true, isApproved: true })
    .populate("vendor", "storeName slug ratingAverage")
    .populate("category", "name slug");
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, product });
});

// @route POST /api/products (vendor)
export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vendor = await Vendor.findOne({ user: req.user?._id });
  if (!vendor) throw new ApiError(403, "Vendor profile not found");
  if (vendor.status !== VendorStatus.APPROVED) {
    throw new ApiError(403, "Your vendor account is not yet approved");
  }

  // whitelist fields so vendors can't set isApproved, ratings, etc.
  const { name, description, category, images, price, discountPrice, stock, sku, variants } = req.body;
  const product = await Product.create({
    name, description, category, images, price, discountPrice, stock, sku, variants,
    vendor: vendor._id,
  });
  res.status(201).json({ success: true, product });
});

const getOwnedProduct = async (req: AuthRequest) => {
  const vendor = await Vendor.findOne({ user: req.user?._id });
  if (!vendor) throw new ApiError(403, "Vendor profile not found");

  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  if (String(product.vendor) !== String(vendor._id)) throw new ApiError(403, "You do not own this product");
  return product;
};

// @route PUT /api/products/:id (vendor, own only)
export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await getOwnedProduct(req);

  ["name", "description", "category", "images", "price", "discountPrice", "stock", "sku", "variants", "isActive"].forEach(
    (field) => {
      if (req.body[field] !== undefined) (product as any)[field] = req.body[field];
    }
  );

  product.isApproved = false; // edits go back to moderation
  res.json({ success: true, product: await product.save() });
});

// @route DELETE /api/products/:id (vendor, own only)
export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await getOwnedProduct(req);
  await product.deleteOne();
  res.json({ success: true, message: "Product removed" });
});

// @route GET /api/products/vendor/mine (vendor)
export const getMyProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vendor = await Vendor.findOne({ user: req.user?._id });
  if (!vendor) throw new ApiError(403, "Vendor profile not found");
  const products = await Product.find({ vendor: vendor._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: products.length, products });
});

// @route GET /api/products/admin/all (admin) — includes unapproved/inactive
export const getAllProductsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 50, 200);

  const [products, total] = await Promise.all([
    Product.find()
      .populate("vendor", "storeName slug")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(),
  ]);
  res.json({ success: true, count: products.length, total, products });
});

// @route PUT /api/products/admin/:id/approve (admin)
export const setProductApproval = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  product.isApproved = Boolean(req.body.isApproved);
  await product.save();
  res.json({ success: true, product });
});
