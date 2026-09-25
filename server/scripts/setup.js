import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { Tour } from "../models/Tour.js";
import { Departure } from "../models/Departure.js";
import { seedTours } from "../data/catalog.js";
// --catalog adds only the sample journeys and departure dates (no demo
// sign-ins), and is the only mode allowed in production.
const catalogOnly = process.argv.includes("--catalog");
if (process.env.NODE_ENV === "production" && !catalogOnly)
  throw new Error(
    "Demo setup is disabled in production. To add the sample journeys without demo accounts, run: node server/scripts/setup.js --catalog",
  );
try {
  await connectDb();
  const accounts = [
    [
      "admin@wanderlust.travel",
      "WanderlustAdmin1!",
      "Wanderlust Admin",
      "admin",
    ],
    ["staff@wanderlust.travel", "WanderlustStaff1!", "Travel Team", "staff"],
    [
      "guest@wanderlust.travel",
      "WanderlustGuest1!",
      "Demo Traveller",
      "customer",
    ],
  ];
  for (const [email, password, name, role] of catalogOnly ? [] : accounts)
    if (!(await User.exists({ email })))
      await User.create({
        email,
        name,
        role,
        passwordHash: await User.hashPassword(password),
      });
  for (const spec of seedTours) {
    const existing = await Tour.findOne({ slug: spec.slug });
    const tour = existing || (await Tour.create(spec));
    // Upgrade only recognisable legacy demo content, never custom operator content.
    if (
      existing &&
      existing.itinerary?.[0]?.title === "Arrival & Welcome Walk"
    ) {
      existing.itinerary = spec.itinerary;
      existing.imageKey = spec.imageKey;
      existing.galleryKeys = spec.galleryKeys;
      existing.mapEmbed = "";
      existing.locationBlurb = spec.locationBlurb.replace(
        "Add it during checkout.",
        "Ask your travel expert when making a request.",
      );
      await existing.save();
    }
    const upcoming = await Departure.countDocuments({
      tour: tour._id,
      startDate: { $gt: new Date() },
      status: { $ne: "cancelled" },
    });
    if (!upcoming)
      for (const offset of [21, 51, 81]) {
        const date = new Date();
        date.setUTCDate(
          date.getUTCDate() + offset + seedTours.indexOf(spec) * 2,
        );
        date.setUTCHours(9, 0, 0, 0);
        await Departure.create({
          tour: tour._id,
          startDate: date,
          seats: 16,
          bookedCount: 0,
          status: "open",
        });
      }
  }
  await BookingIndexes();
  console.log(
    catalogOnly
      ? "Sample journeys and departure dates added. Existing records preserved."
      : "Demo setup complete. Existing records preserved. See README for local demo sign-in.",
  );
} finally {
  await mongoose.disconnect();
}
async function BookingIndexes() {
  const { Booking } = await import("../models/Booking.js");
  await Booking.createIndexes();
}
