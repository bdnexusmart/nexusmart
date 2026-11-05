import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Response, NextFunction } from "express";
import User from "../models/User";
import ApiError from "../utils/ApiError";
import { AuthRequest, JwtPayload, UserRole } from "../types";

// Verifies the JWT (cookie or Authorization header) and loads the user
export const protect = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) throw new ApiError(401, "Not authorized, no token provided");

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  } catch {
    throw new ApiError(401, "Not authorized, token invalid or expired");
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user || !user.isActive) {
    throw new ApiError(401, "Not authorized, user not found or inactive");
  }

  req.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
  next();
});

// Restricts a route to one or more roles, e.g. authorize(UserRole.ADMIN)
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user?.role ?? "unknown"}' is not permitted to access this resource`);
    }
    next();
  };
};
