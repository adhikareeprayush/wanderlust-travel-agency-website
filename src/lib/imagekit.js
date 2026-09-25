// Serves images through ImageKit when VITE_IMAGEKIT_URL_ENDPOINT is set at
// build time; otherwise the bundled /images files are used as they are.
const ENDPOINT = (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || "").replace(
  /\/+$/,
  "",
);
// Site photography is synced to this folder by server/scripts/imagekit-sync.js.
const SITE_FOLDER = "wanderlust";

export function imageUrl(src, { width, quality = 80 } = {}) {
  if (!src || !ENDPOINT) return src;
  const url = src.startsWith("/images/")
    ? `${ENDPOINT}/${SITE_FOLDER}/${src.slice("/images/".length)}`
    : src;
  if (!url.startsWith(ENDPOINT + "/")) return src;
  const transform = [width && `w-${width}`, `q-${quality}`]
    .filter(Boolean)
    .join(",");
  return `${url}${url.includes("?") ? "&" : "?"}tr=${transform}`;
}
