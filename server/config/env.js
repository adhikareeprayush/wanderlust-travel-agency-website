import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

// "1" when one reverse proxy (e.g. Caddy) sits in front of the app, so rate
// limits and logs see the visitor's address rather than the proxy's.
function parseTrustProxy(value) {
  if (!value || value === "false") return false;
  if (value === "true") return true;
  const hops = Number(value);
  return Number.isInteger(hops) ? hops : value;
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wanderlust",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  allowDevPayments: process.env.ALLOW_DEV_PAYMENTS !== "false",
  stripeSecret: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom:
    process.env.SMTP_FROM || "Wanderlust Travel <hello@wanderlust.travel>",
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: (process.env.IMAGEKIT_URL_ENDPOINT || "").replace(/\/+$/, ""),
    folder: process.env.IMAGEKIT_FOLDER || "/wanderlust",
  },
};

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    /change-me|dev-only/i.test(process.env.JWT_SECRET))
) {
  throw new Error(
    "Set a strong JWT_SECRET of at least 32 characters before running production.",
  );
}
