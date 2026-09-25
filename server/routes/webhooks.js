import { Router } from "express";
import { env } from "../config/env.js";
import { stripe, stripeEnabled } from "../utils/stripe.js";
import { Booking } from "../models/Booking.js";
import { confirmBooking } from "../utils/booking.js";

const router = Router();

router.post("/", async (req, res) => {
  if (!stripeEnabled()) return res.status(400).send("Stripe not configured");
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    if (env.stripeWebhookSecret && signature) {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        env.stripeWebhookSecret,
      );
    } else {
      event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    }
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) await confirmBooking(booking, { paid: true });
    }
  }

  res.json({ received: true });
});

export default router;
