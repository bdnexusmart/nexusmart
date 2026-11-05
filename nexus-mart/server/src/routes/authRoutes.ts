import { Router } from "express";
import { body } from "express-validator";
import { registerUser, loginUser, logoutUser, getMe } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import validate from "../middleware/validate";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  loginUser
);

router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);

export default router;
