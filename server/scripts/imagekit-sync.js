// Uploads the site's photography to ImageKit under IMAGEKIT_FOLDER
// (e.g. /wanderlust/switzerland.jpg) so the website can serve it from there.
// Safe to re-run: files keep the same names and are overwritten.
//
//   node server/scripts/imagekit-sync.js
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";
import { imagekitConfigured } from "../utils/imagekit.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const candidates = [path.join(root, "dist/images"), path.join(root, "public/images")];
const IMAGE = /\.(jpe?g|png|webp|avif)$/i;

if (!imagekitConfigured()) {
  console.error(
    "Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT first.",
  );
  process.exit(1);
}

let dir;
for (const candidate of candidates) {
  try {
    await fs.access(candidate);
    dir = candidate;
    break;
  } catch {
    // try the next location
  }
}
if (!dir) {
  console.error("No images folder found in dist/images or public/images.");
  process.exit(1);
}

const auth =
  "Basic " + Buffer.from(`${env.imagekit.privateKey}:`).toString("base64");
const files = (await fs.readdir(dir)).filter((name) => IMAGE.test(name));
let failed = 0;
for (const name of files) {
  const body = new FormData();
  body.append("file", new Blob([await fs.readFile(path.join(dir, name))]), name);
  body.append("fileName", name);
  body.append("folder", env.imagekit.folder);
  body.append("useUniqueFileName", "false");
  body.append("overwriteFile", "true");
  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: auth },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (response.ok) console.log(`uploaded  ${data.url}`);
  else {
    failed += 1;
    console.error(`failed    ${name}: ${data.message || response.status}`);
  }
}
console.log(`${files.length - failed}/${files.length} images synced to ImageKit.`);
process.exit(failed ? 1 : 0);
