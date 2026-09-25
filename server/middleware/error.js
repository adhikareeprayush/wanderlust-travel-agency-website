import { AppError } from "../utils/AppError.js";

export function notFound(_req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }
  if (err?.name === "ZodError") {
    return res.status(400).json({
      message: "Validation failed",
      issues: err.issues,
    });
  }
  if (err?.name === "CastError" || err?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid request data" });
  }
  if (err?.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ message: "Duplicate value already exists" });
  }
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}
