import { Router } from "express";
import { z } from "zod";
import { Supplier } from "../models/Supplier.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requirePermission } from "../middleware/auth.js";
import { AppError } from "../utils/AppError.js";

const router = Router();
router.use(protect, requirePermission("suppliers"));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const suppliers = await Supplier.find().sort({ vendor: 1 });
    res.json({ suppliers });
  }),
);

const schema = z.object({
  vendor: z.string().min(2),
  type: z.enum(["Transport", "Hotels", "Guides", "Experiences"]).optional(),
  status: z.string().optional(),
  action: z.string().optional(),
  notes: z.string().optional(),
});

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const supplier = await Supplier.create(schema.parse(req.body));
    res.status(201).json({ supplier });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      schema.partial().parse(req.body),
      { new: true },
    );
    if (!supplier) throw new AppError("Supplier not found", 404);
    res.json({ supplier });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) throw new AppError("Supplier not found", 404);
    res.json({ ok: true });
  }),
);

export default router;
