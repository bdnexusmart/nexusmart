import asyncHandler from "express-async-handler";
import { Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import ApiError from "../utils/ApiError";
import { AuthRequest } from "../types";

const populated = (userId: any) =>
  Cart.findOne({ user: userId }).populate("items.product", "name slug images price discountPrice stock isActive");

const getOrCreateCart = async (userId: any) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// @route GET /api/cart
export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  await getOrCreateCart(req.user?._id);
  res.json({ success: true, cart: await populated(req.user?._id) });
});

// @route POST /api/cart/items
export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, selectedVariants } = req.body;
  const quantity = Math.max(Number(req.body.quantity) || 1, 1);

  const product = await Product.findById(productId);
  if (!product || !product.isActive || !product.isApproved) throw new ApiError(404, "Product not available");

  const cart = await getOrCreateCart(req.user?._id);
  const existing = cart.items.find((i) => String(i.product) === String(productId));
  const newQty = (existing?.quantity || 0) + quantity;

  if (product.stock < newQty) throw new ApiError(400, "Not enough stock available");

  if (existing) {
    existing.quantity = newQty;
    existing.price = product.discountPrice || product.price;
  } else {
    cart.items.push({
      product: product._id as any,
      vendor: product.vendor,
      quantity,
      price: product.discountPrice || product.price,
      selectedVariants,
    });
  }

  await cart.save();
  res.status(201).json({ success: true, cart: await populated(req.user?._id) });
});

// @route PUT /api/cart/items/:itemId
export const updateCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const quantity = Number(req.body.quantity);
  const cart = await Cart.findOne({ user: req.user?._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  const item = cart.items.find((i) => String(i._id) === req.params.itemId);
  if (!item) throw new ApiError(404, "Cart item not found");

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => String(i._id) !== req.params.itemId) as any;
  } else {
    const product = await Product.findById(item.product);
    if (!product || product.stock < quantity) throw new ApiError(400, "Not enough stock available");
    item.quantity = quantity;
  }

  await cart.save();
  res.json({ success: true, cart: await populated(req.user?._id) });
});

// @route DELETE /api/cart/items/:itemId
export const removeCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await Cart.findOne({ user: req.user?._id });
  if (!cart) throw new ApiError(404, "Cart not found");
  cart.items = cart.items.filter((i) => String(i._id) !== req.params.itemId) as any;
  await cart.save();
  res.json({ success: true, cart: await populated(req.user?._id) });
});

// @route DELETE /api/cart
export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await Cart.findOne({ user: req.user?._id });
  if (cart) {
    cart.items = [] as any;
    await cart.save();
  }
  res.json({ success: true, cart });
});
