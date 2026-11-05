import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError";

const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array().map((e) => e.msg).join(", "));
  }
  next();
};

export default validate;
