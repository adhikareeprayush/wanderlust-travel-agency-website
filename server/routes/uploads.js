import { Router } from "express";
import { protect, requirePermission } from "../middleware/auth.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { imagekitConfigured, uploadSignature } from "../utils/imagekit.js";

const router = Router();

router.get("/auth", protect, requirePermission("tours"), (_req, res) => {
  if (!imagekitConfigured())
    throw new AppError(
      "Image uploads are not configured. Add the ImageKit keys to the server environment.",
      503,
    );
  res.set("Cache-Control", "no-store");
  res.json({
    ...uploadSignature(),
    publicKey: env.imagekit.publicKey,
    urlEndpoint: env.imagekit.urlEndpoint,
    folder: `${env.imagekit.folder}/journeys`,
  });
});

export default router;
