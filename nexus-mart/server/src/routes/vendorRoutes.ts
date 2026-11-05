import { Router } from "express";
import {
  getVendors, getVendorBySlug, getMyVendorProfile, updateMyVendorProfile,
  getVendorDashboard, getAllVendorsAdmin, setVendorStatus,
} from "../controllers/vendorController";
import { protect, authorize } from "../middleware/authMiddleware";
import { UserRole } from "../types";

const router = Router();

router.get("/", getVendors);

// Specific routes must come before "/:slug"
router.get("/me", protect, authorize(UserRole.VENDOR), getMyVendorProfile);
router.put("/me", protect, authorize(UserRole.VENDOR), updateMyVendorProfile);
router.get("/me/dashboard", protect, authorize(UserRole.VENDOR), getVendorDashboard);

router.get("/admin/all", protect, authorize(UserRole.ADMIN), getAllVendorsAdmin);
router.put("/admin/:id/status", protect, authorize(UserRole.ADMIN), setVendorStatus);

router.get("/:slug", getVendorBySlug);

export default router;
