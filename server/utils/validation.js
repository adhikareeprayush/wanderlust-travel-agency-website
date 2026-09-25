import { AppError } from "./AppError.js";
export function literalSearch(value) {
  if (typeof value !== "string" || value.length > 100)
    throw new AppError("Search must be 100 characters or fewer.", 400);
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}
export function validId(req, res, next, value) {
  if (!/^[a-f\d]{24}$/i.test(value))
    return next(new AppError("Invalid record identifier", 400));
  next();
}
