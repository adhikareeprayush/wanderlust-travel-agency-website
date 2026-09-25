import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { AppError } from "../utils/AppError.js";
import { logActivity } from "../utils/activity.js";
import { PERMISSIONS } from "../config/permissions.js";

// Staff accounts are created and managed by administrators only.
const router = Router();
router.use(protect, requireAdmin);

const TEAM_ROLES = ["staff", "admin"];
const id = z.string().regex(/^[a-f\d]{24}$/i, "Choose a valid team member.");
const password = z
  .string()
  .min(8, "Use at least 8 characters for the password.")
  .max(128);
const permissions = z.array(z.enum(PERMISSIONS)).max(PERMISSIONS.length);

async function findMember(memberId) {
  const member = await User.findOne({
    _id: id.parse(memberId),
    role: { $in: TEAM_ROLES },
  });
  if (!member) throw new AppError("Team member not found", 404);
  return member;
}

// At least one active administrator must always remain.
async function assertAnotherActiveAdmin(member) {
  const others = await User.countDocuments({
    _id: { $ne: member._id },
    role: "admin",
    active: { $ne: false },
  });
  if (!others)
    throw new AppError("Keep at least one active administrator.", 409);
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const members = await User.find({ role: { $in: TEAM_ROLES } }).sort({
      role: 1,
      name: 1,
    });
    res.json({
      members: members.map((member) => member.toTeamJSON()),
      permissions: PERMISSIONS,
    });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2).max(100),
        email: z.string().trim().toLowerCase().email().max(254),
        password,
        role: z.enum(TEAM_ROLES).default("staff"),
        permissions: permissions.default([]),
      })
      .parse(req.body);
    if (await User.exists({ email: data.email }))
      throw new AppError("An account with this email already exists.", 409);
    const member = await User.create({
      name: data.name,
      email: data.email,
      role: data.role,
      permissions: data.role === "admin" ? PERMISSIONS : data.permissions,
      passwordHash: await User.hashPassword(data.password),
    });
    await logActivity(
      "team",
      `${data.role === "admin" ? "Administrator" : "Staff"} account created: ${member.name}`,
    );
    res.status(201).json({ member: member.toTeamJSON() });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2).max(100).optional(),
        role: z.enum(TEAM_ROLES).optional(),
        permissions: permissions.optional(),
        active: z.boolean().optional(),
      })
      .parse(req.body);
    const member = await findMember(req.params.id);
    const self = member._id.equals(req.user._id);
    if (self && data.role && data.role !== member.role)
      throw new AppError("You cannot change your own role.", 409);
    if (self && data.active === false)
      throw new AppError("You cannot deactivate your own account.", 409);
    const losesAdmin =
      member.role === "admin" &&
      ((data.role && data.role !== "admin") || data.active === false);
    if (losesAdmin) await assertAnotherActiveAdmin(member);

    if (data.name) member.name = data.name;
    if (data.role) member.role = data.role;
    if (data.permissions) member.permissions = data.permissions;
    if (data.active !== undefined) member.active = data.active;
    await member.save();
    await logActivity("team", `Team access updated: ${member.name}`);
    res.json({ member: member.toTeamJSON() });
  }),
);

router.post(
  "/:id/password",
  asyncHandler(async (req, res) => {
    const data = z.object({ password }).parse(req.body);
    const member = await findMember(req.params.id);
    member.passwordHash = await User.hashPassword(data.password);
    await member.save();
    await logActivity("team", `Password reset for ${member.name}`);
    res.json({ ok: true });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const member = await findMember(req.params.id);
    if (member._id.equals(req.user._id))
      throw new AppError("You cannot remove your own account.", 409);
    if (member.role === "admin") await assertAnotherActiveAdmin(member);
    await member.deleteOne();
    await logActivity("team", `Team member removed: ${member.name}`);
    res.json({ ok: true });
  }),
);

export default router;
