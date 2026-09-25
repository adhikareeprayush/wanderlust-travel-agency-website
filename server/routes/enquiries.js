import { Router } from "express";
import { z } from "zod";
import { Enquiry } from "../models/Enquiry.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requireStaff } from "../middleware/auth.js";
import { enquiryEmail, sendMail } from "../utils/mailer.js";
import { logActivity } from "../utils/activity.js";
import { AppError } from "../utils/AppError.js";
const router = Router();
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2).max(100),
        email: z.string().trim().toLowerCase().email().max(254),
        phone: z.string().trim().max(30).optional(),
        message: z.string().trim().min(8).max(5000),
        tourSlug: z.string().max(100).optional(),
      })
      .parse(req.body);
    const enquiry = await Enquiry.create(data);
    await logActivity("enquiry", `New enquiry from ${enquiry.name}`);
    await sendMail({ to: enquiry.email, ...enquiryEmail(enquiry) });
    res.status(201).json({ ok: true, id: enquiry._id });
  }),
);
router.get(
  "/",
  protect,
  requireStaff,
  asyncHandler(async (_req, res) =>
    res.json({
      enquiries: await Enquiry.find().sort({ createdAt: -1 }).limit(500),
    }),
  ),
);
router.patch(
  "/:id",
  protect,
  requireStaff,
  asyncHandler(async (req, res) => {
    const { status } = z
      .object({ status: z.enum(["new", "in_progress", "closed"]) })
      .parse(req.body);
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );
    if (!enquiry) throw new AppError("Enquiry not found", 404);
    res.json({ enquiry });
  }),
);
export default router;
