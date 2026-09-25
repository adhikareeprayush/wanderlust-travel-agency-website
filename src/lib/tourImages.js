const destinationImages = {
  "swiss-alps-lakes": "/images/switzerland.jpg",
  "amalfi-coast-sunsets": "/images/italy.jpg",
  "kyoto-heritage": "/images/japan.jpg",
  "bali-slow-travel": "/images/bali.jpg",
  "scottish-highlands": "/images/scotland.jpg",
  "lisbon-porto": "/images/lisbon.jpg",
  "moroccan-medina": "/images/morocco.jpg",
  "patagonia-trek": "/images/patagonia.jpg",
};
export const tourImageMap = {
  pkg0: "/images/switzerland.jpg",
  pkg1: "/images/italy.jpg",
  pkg2: "/images/scotland.jpg",
  pkgInner: "/images/switzerland.jpg",
  view1: "/images/lisbon.jpg",
  banner1: "/images/patagonia.jpg",
  banner2: "/images/japan.jpg",
  holiday: "/images/bali.jpg",
  sec3: "/images/morocco.jpg",
  card1: "/images/switzerland.jpg",
};
export function resolveTourImage(key, slug) {
  if (typeof key === "string" && /^(https?:\/\/|\/)/.test(key)) return key;
  return (
    destinationImages[slug] || tourImageMap[key] || "/images/switzerland.jpg"
  );
}
export function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number(value) % 1 ? 2 : 0,
  }).format(Number(value) || 0);
}
export function formatDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime()))
    return "Date to be confirmed";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
