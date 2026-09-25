import crypto from "node:crypto";
import { env } from "../config/env.js";

export const imagekitConfigured = () =>
  Boolean(
    env.imagekit.publicKey &&
      env.imagekit.privateKey &&
      env.imagekit.urlEndpoint,
  );

// Short-lived signature that lets the browser upload one file directly to
// ImageKit without ever seeing the private key.
export function uploadSignature() {
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;
  const signature = crypto
    .createHmac("sha1", env.imagekit.privateKey)
    .update(token + expire)
    .digest("hex");
  return { token, expire, signature };
}
