import nodemailer from "nodemailer";
import { env } from "../config/env.js";
const transporter = nodemailer.createTransport(
  env.smtpHost
    ? {
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        auth:
          env.smtpUser && env.smtpPass
            ? { user: env.smtpUser, pass: env.smtpPass }
            : undefined,
        connectionTimeout: 10000,
        socketTimeout: 10000,
      }
    : { jsonTransport: true },
);
export async function sendMail({ to, subject, text }) {
  try {
    await transporter.sendMail({ from: env.smtpFrom, to, subject, text });
    if (!env.smtpHost) console.log("[mail preview]", subject);
    return { delivered: Boolean(env.smtpHost) };
  } catch (error) {
    console.error("Email delivery failed:", error.code || "SMTP_ERROR");
    return { delivered: false };
  }
}
export function bookingEmail(booking, tourTitle, departureDate) {
  return {
    subject: `Wanderlust ${booking.reference}: ${booking.status}`,
    text: `Hi ${booking.guestName},\n\nYour request ${booking.reference} for ${tourTitle} departing ${departureDate} is ${booking.status}.\nTravellers: ${booking.partySize}\nEstimated trip total: $${booking.total}\n\n${booking.status === "pending" ? "Our team will review availability and get in touch. Places are not reserved until confirmation." : booking.status === "waitlist" ? "We will contact you if places become available." : ""}\nNo online payment was collected.\n\nThank you for travelling with Wanderlust.`,
  };
}
export function enquiryEmail(enquiry) {
  return {
    subject: "We received your Wanderlust enquiry",
    text: `Hi ${enquiry.name},\n\nThank you for getting in touch. Our team will review your plans and reply.\n\nYour message:\n${enquiry.message}`,
  };
}
