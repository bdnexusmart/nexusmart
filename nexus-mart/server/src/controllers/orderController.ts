import asyncHandler from "express-async-handler";
import { Response } from "express";
import Order from "../models/Order";
import Cart from "../models/Cart";
import Product from "../models/Product";
import Vendor from "../models/Vendor";
import ApiError from "../utils/ApiError";
import { AuthRequest, OrderStatus, PaymentStatus, UserRole } from "../types";

const SHIPPING_FLAT_RATE = 5;
const TAX_RATE = 0.05;

// @route POST /api/orders (customer) — checkout from cart
export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user?._id });
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Your cart is empty");

  const orderItems: any[] = [];
  const reserved: { id: any; qty: number }[] = []; // for rollback
  let itemsPrice = 0;
  let platformCommission = 0;
  const commissionCache = new Map<string, number>();

  try {
    for (const item of cart.items) {
      // Atomic reserve: only succeeds if enough stock remains (prevents overselling)
      const product = await Product.findOneAndUpdate(
        { _id: item.product, isActive: true, isApproved: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, soldCount: item.quantity } },
        { new: true }
      );
      if (!product) throw new ApiError(400, "An item in your cart is out of stock or no longer available");
      reserved.push({ id: product._id, qty: item.quantity });

      // Use the CURRENT price, not the snapshot stored when the item was added
      const unitPrice = product.discountPrice || product.price;

      orderItems.push({
        product: product._id,
        vendor: product.vendor,
        name: product.name,
        image: product.images?.[0] || "",
        price: unitPrice,
        quantity: item.quantity,
        status: OrderStatus.PENDING,
      });
      itemsPrice += unitPrice * item.quantity;

      const vKey = String(product.vendor);
      if (!commissionCache.has(vKey)) {
        const vendor = await Vendor.findById(product.vendor);
        commissionCache.set(vKey, vendor?.commissionRate ?? 10);
      }
      platformCommission += unitPrice * item.quantity * ((commissionCache.get(vKey) as number) / 100);
    }

    const shippingPrice = SHIPPING_FLAT_RATE;
    const taxPrice = Number((itemsPrice * TAX_RATE).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    const order = await Order.create({
      user: req.user?._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "cod",
      paymentStatus: PaymentStatus.UNPAID,
      itemsPrice: Number(itemsPrice.toFixed(2)),
      shippingPrice,
      taxPrice,
      totalPrice,
      platformCommission: Number(platformCommission.toFixed(2)),
    });

    cart.items = [] as any;
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (err) {
    // roll back any stock we already reserved
    await Promise.all(
      reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty, soldCount: -r.qty } }))
    );
    throw err;
  }
});

// @route GET /api/orders/mine (customer)
export const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orders = await Order.find({ user: req.user?._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
});

// @route GET /api/orders/:id (owner, involved vendor, or admin)
export const getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) throw new ApiError(404, "Order not found");

  const ownerId = (order.user as any)._id ?? order.user;
  const isOwner = String(ownerId) === String(req.user?._id);
  const isAdmin = req.user?.role === UserRole.ADMIN;

  let isInvolvedVendor = false;
  if (req.user?.role === UserRole.VENDOR) {
    const vendor = await Vendor.findOne({ user: req.user._id });
    isInvolvedVendor = !!vendor && order.items.some((i) => String(i.vendor) === String(vendor._id));
  }

  if (!isOwner && !isAdmin && !isInvolvedVendor) throw new ApiError(403, "Not authorized to view this order");
  res.json({ success: true, order });
});

// @route GET /api/orders/vendor/mine (vendor) — only this vendor's line items
export const getVendorOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vendor = await Vendor.findOne({ user: req.user?._id });
  if (!vendor) throw new ApiError(403, "Vendor profile not found");

  const orders = await Order.find({ "items.vendor": vendor._id }).populate("user", "name email").sort({ createdAt: -1 });

  const scoped = orders.map((order) => ({
    _id: order._id,
    user: order.user,
    shippingAddress: order.shippingAddress,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    items: order.items.filter((i) => String(i.vendor) === String(vendor._id)),
  }));

  res.json({ success: true, count: scoped.length, orders: scoped });
});

// @route PUT /api/orders/:id/items/:itemId/status (vendor)
export const updateOrderItemStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!Object.values(OrderStatus).includes(status)) throw new ApiError(400, "Invalid order status");

  const vendor = await Vendor.findOne({ user: req.user?._id });
  if (!vendor) throw new ApiError(403, "Vendor profile not found");

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const item = order.items.find((i) => String(i._id) === req.params.itemId);
  if (!item) throw new ApiError(404, "Order item not found");
  if (String(item.vendor) !== String(vendor._id)) throw new ApiError(403, "You do not own this order item");

  item.status = status;

  const active = order.items.filter((i) => i.status !== OrderStatus.CANCELLED);
  if (active.length > 0 && active.every((i) => i.status === OrderStatus.DELIVERED)) {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  await order.save();
  res.json({ success: true, order });
});

// @route GET /api/orders/admin/all (admin)
export const getAllOrdersAdmin = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
});

// @route PUT /api/orders/admin/:id/payment-status (admin)
export const updatePaymentStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { paymentStatus } = req.body;
  if (!Object.values(PaymentStatus).includes(paymentStatus)) throw new ApiError(400, "Invalid payment status");

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  order.paymentStatus = paymentStatus;
  await order.save();
  res.json({ success: true, order });
});
