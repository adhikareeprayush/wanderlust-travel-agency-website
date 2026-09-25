import { Router } from "express";
import { protect, requireStaff } from "../middleware/auth.js";
import { env } from "../config/env.js";
const router = Router();
router.use(protect, requireStaff);
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
