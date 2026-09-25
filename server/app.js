import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import auth from "./routes/auth.js";
import tours from "./routes/tours.js";
import departures from "./routes/departures.js";
import bookings from "./routes/bookings.js";
import guests from "./routes/guests.js";
import guides from "./routes/guides.js";
import suppliers from "./routes/suppliers.js";
import enquiries from "./routes/enquiries.js";
import analytics from "./routes/analytics.js";
import settings from "./routes/settings.js";
import team from "./routes/team.js";
import uploads from "./routes/uploads.js";
import newsletter from "./routes/newsletter.js";
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", env.trustProxy);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "data:", "https:"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        // Journey cover images are uploaded straight from the browser to ImageKit.
        "connect-src": ["'self'", "https://upload.imagekit.io"],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
      },
    },
  }),
);
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "100kb" }));
// Limits submissions and sign-in attempts; signed-in staff reading lists and
// session checks (GET) are not counted.
const limiter = (limit) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    skip: (req) => req.method === "GET",
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      message: "Too many requests. Please try again in a few minutes.",
    },
  });
app.get("/api/health", (_req, res) =>
  res
    .status(mongoose.connection.readyState === 1 ? 200 : 503)
    .json({ ok: mongoose.connection.readyState === 1 }),
);
app.use("/api/auth", limiter(60), auth);
app.use("/api/tours", tours);
app.use("/api/departures", departures);
app.use("/api/bookings", limiter(100), bookings);
app.use("/api/guests", guests);
app.use("/api/guides", guides);
app.use("/api/suppliers", suppliers);
app.use("/api/enquiries", limiter(30), enquiries);
app.use("/api/newsletter", limiter(30), newsletter);
app.use("/api/analytics", analytics);
app.use("/api/settings", settings);
app.use("/api/team", limiter(100), team);
app.use("/api/uploads", uploads);
app.use("/api", notFound);
const dist = fileURLToPath(new URL("../dist/", import.meta.url));
// Built assets have hashed names, so browsers can cache them for a year.
app.use(
  "/assets",
  express.static(path.join(dist, "assets"), { immutable: true, maxAge: "1y" }),
);
app.use(express.static(dist));
app.get("/{*splat}", (req, res, next) => {
  if (path.extname(req.path)) return next();
  res.sendFile(path.join(dist, "index.html"), (error) => {
    if (error) next(error);
  });
});
app.use(notFound);
app.use(errorHandler);
export default app;
