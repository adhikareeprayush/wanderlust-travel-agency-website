import { Router } from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import { env } from "../config/env.js";
const router = Router();
router.use(protect, requireAdmin);
router.get("/", (_req, res) =>
  res.json({
    settings: {
      bookingMode: "request",
      currency: "USD",
      emailConfigured: Boolean(env.smtpHost),
      onlinePayments: false,
    },
  }),
);
export default router;
