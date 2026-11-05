import { Router } from "express";
import {
  createOrder, getMyOrders, getOrderById, getVendorOrders,
  updateOrderItemStatus, getAllOrdersAdmin, updatePaymentStatus,
} from "../controllers/orderController";
import { protect, authorize } from "../middleware/authMiddleware";
import { UserRole } from "../types";

const router = Router();

router.post("/", protect, authorize(UserRole.CUSTOMER), createOrder);
router.get("/mine", protect, authorize(UserRole.CUSTOMER), getMyOrders);

router.get("/vendor/mine", protect, authorize(UserRole.VENDOR), getVendorOrders);
router.put("/:id/items/:itemId/status", protect, authorize(UserRole.VENDOR), updateOrderItemStatus);

router.get("/admin/all", protect, authorize(UserRole.ADMIN), getAllOrdersAdmin);
router.put("/admin/:id/payment-status", protect, authorize(UserRole.ADMIN), updatePaymentStatus);

router.get("/:id", protect, getOrderById);

export default router;
