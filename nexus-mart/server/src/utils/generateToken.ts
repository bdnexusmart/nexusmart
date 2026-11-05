import jwt from "jsonwebtoken";
import { Response } from "express";
import { UserRole } from "../types";

const generateToken = (res: Response, userId: string, role: UserRole): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];
  const token = jwt.sign({ id: userId, role }, secret, { expiresIn });
  const cookieDays = Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: cookieDays * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;
