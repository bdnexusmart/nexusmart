import { Router } from "express";
import {
  getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct,
  getMyProducts, setProductApproval, getAllProductsAdmin,
} from "../controllers/productController";
import { protect, authorize } from "../middleware/authMiddleware";
import { UserRole } from "../types";

const router = Router();

router.get("/", getProducts);

router.get("/vendor/mine", protect, authorize(UserRole.VENDOR), getMyProducts);
router.get("/admin/all", protect, authorize(UserRole.ADMIN), getAllProductsAdmin);
router.put("/admin/:id/approve", protect, authorize(UserRole.ADMIN), setProductApproval);

router.post("/", protect, authorize(UserRole.VENDOR), createProduct);
router.put("/:id", protect, authorize(UserRole.VENDOR), updateProduct);
router.delete("/:id", protect, authorize(UserRole.VENDOR), deleteProduct);

router.get("/:slug", getProductBySlug);

export default router;
