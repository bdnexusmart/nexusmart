import { Router } from "express";
import { getProductReviews, createReview, deleteReview } from "../controllers/reviewController";
import { protect, authorize } from "../middleware/authMiddleware";
import { UserRole } from "../types";

const router = Router();

router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", protect, authorize(UserRole.CUSTOMER), createReview);
router.delete("/:id", protect, deleteReview);

export default router;
