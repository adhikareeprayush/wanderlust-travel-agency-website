import { Activity } from "../models/Activity.js";

export async function logActivity(type, message) {
  await Activity.create({ type, message });
}
