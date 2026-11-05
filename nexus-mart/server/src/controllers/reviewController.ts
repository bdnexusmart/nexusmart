import asyncHandler from "express-async-handler";
import { Response } from "express";
import { Types } from "mongoose";
import Review from "../models/Review";
import Product from "../models/Product";
import Order from "../models/Order";
import ApiError from "../utils/ApiError";
import { AuthRequest, UserRole } from "../types";

const recalculateProductRating = async (productId: string) => {
  const stats = await Review.aggregate([
    { $match: { product: new Types.ObjectId(productId) } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingAverage: stats.length ? Number(stats[0].avgRating.toFixed(1)) : 0,
    ratingCount: stats.length ? stats[0].count : 0,
  });
};

// @route GET /api/reviews/product/:productId (public)
export const getProductReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await Review.find({ product: req.params.productId }).populate("user", "name avatar").sort({ createdAt: -1 });
  res.json({ success: true, count: reviews.length, reviews });
});

// @route POST /api/reviews/product/:productId (customer who bought it)
export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const purchased = await Order.exists({ user: req.user?._id, "items.product": productId });
  if (!purchased) throw new ApiError(403, "You can only review products you have purchased");

  if (await Review.findOne({ product: productId, user: req.user?._id })) {
    throw new ApiError(400, "You have already reviewed this product");
  }

  const review = await Review.create({ product: productId, user: req.user?._id, rating, comment });
  await recalculateProductRating(productId);
  res.status(201).json({ success: true, review });
});

// @route DELETE /api/reviews/:id (owner or admin)
export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  const isOwner = String(review.user) === String(req.user?._id);
  if (!isOwner && req.user?.role !== UserRole.ADMIN) throw new ApiError(403, "Not authorized to delete this review");

  const productId = String(review.product);
  await review.deleteOne();
  await recalculateProductRating(productId);
  res.json({ success: true, message: "Review removed" });
});
