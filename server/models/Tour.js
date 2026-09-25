import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    highlights: [{ type: String }],
  },
  { _id: false },
);

const factSchema = new mongoose.Schema(
  {
    label: String,
    value: String,
  },
  { _id: false },
);

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, default: "" },
    description: { type: String, default: "" },
    region: { type: String, default: "Europe" },
    durationDays: { type: Number, required: true, min: 1 },
    basePrice: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    reviewCount: { type: String, default: "120 reviews" },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    imageKey: { type: String, default: "pkg0" },
    flagKey: { type: String, default: "" },
    galleryKeys: [{ type: String }],
    highlights: [{ type: String }],
    facts: [factSchema],
    itinerary: [itinerarySchema],
    mapTitle: { type: String, default: "" },
    mapEmbed: { type: String, default: "" },
    locationBlurb: { type: String, default: "" },
    groupLabel: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Tour = mongoose.model("Tour", tourSchema);
