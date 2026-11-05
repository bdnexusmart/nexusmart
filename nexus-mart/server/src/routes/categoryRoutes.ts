import { Router } from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController";
import { protect, authorize } from "../middleware/authMiddleware";
import { UserRole } from "../types";

const router = Router();

router.get("/", getCategories);
router.post("/", protect, authorize(UserRole.ADMIN), createCategory);
router.put("/:id", protect, authorize(UserRole.ADMIN), updateCategory);
router.delete("/:id", protect, authorize(UserRole.ADMIN), deleteCategory);

export default router;
