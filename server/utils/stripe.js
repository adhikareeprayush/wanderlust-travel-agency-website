import Stripe from "stripe";
import { env } from "../config/env.js";

export const stripe = env.stripeSecret ? new Stripe(env.stripeSecret) : null;

export function stripeEnabled() {
  return Boolean(stripe);
}
