import { Router } from "express";
import { updateProfile, addAddress, getUsers, setUserStatus } from "../controllers/userController";
import { protect, authorize } from "../middleware/authMiddleware";
import { UserRole } from "../types";

const router = Router();

router.put("/profile", protect, updateProfile);
router.post("/addresses", protect, addAddress);
router.get("/", protect, authorize(UserRole.ADMIN), getUsers);
router.put("/:id/status", protect, authorize(UserRole.ADMIN), setUserStatus);

export default router;
