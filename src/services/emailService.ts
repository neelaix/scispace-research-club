import type { Booking } from "../types/booking";
import { INTERSTELLAR_EVENT } from "../config/interstellar";
import { SEATING } from "../config/interstellar";

/**
 * sendBookingConfirmationEmail
 * Prepares/sends confirmation email. Replaceable provider.
 * Do not hardcode venue/date if already elsewhere — use event config when available.
 */

// Read optional event date/time/venue from env or config — fallback to generic
function getEventMeta() {
  // Try env first
  const date = (typeof import.meta !== "undefined" && (import.meta.env.VITE_EVENT_DATE as string | undefined)) || process.env.EVENT_DATE || "";
  const time = (typeof import.meta !== "undefined" && (import.meta.env.VITE_EVENT_TIME as string | undefined)) || process.env.EVENT_TIME || "";
  const venue = (typeof import.meta !== "undefined" && (import.meta.env.VITE_EVENT_VENUE as string | undefined)) || process.env.EVENT_VENUE || INTERSTELLAR_EVENT.institution;
  // If not set, keep generic but still include
  return { date: date || "To be announced", time: time || "To be announced", venue };
}

export async function sendBookingConfirmationEmail(booking: Booking): Promise<{ ok: boolean; skipped?: boolean }> {
  const provider = (typeof import.meta !== "undefined" && (import.meta.env.VITE_EMAIL_PROVIDER as string | undefined)) || process.env.EMAIL_PROVIDER || "";
  // If no provider configured, just log and skip — architecture ready
  if (!provider || provider === "none") {
    console.info("Email provider not configured — skipping sendBookingConfirmationEmail for", booking.bookingId);
    // Still prepare payload for future
    return { ok: true, skipped: true };
  }

  const { date, time, venue } = getEventMeta();

  const subject = "Interstellar Ticket Confirmation | SciSpace Research Club";
  const attendeeList = booking.attendees.map((a, i) => `${i + 1}. ${a.name} (${a.registrationNumber})`).join("\n");
  const body = `
Booking ID: ${booking.bookingId}
Booking Contact: ${booking.bookingContact.name} <${booking.bookingContact.email}> ${booking.bookingContact.phone}
Attendees:
${attendeeList}
Number of Attendees: ${booking.attendeeCount}
Total Amount: ₹${booking.totalAmount} ${booking.currency}
Payment Status: ${booking.payment.displayStatus} (${booking.payment.status}) — ${booking.payment.checkResult}
Recipient: ${booking.payment.recipientName} (${booking.payment.recipientUpiId})
Transaction Reference: ${booking.payment.transactionReference ?? "—"}
General Admission
Open Seating
Event: ${booking.event.fullName}
Event Date: ${date}
Event Time: ${time}
Venue: ${venue}
Seating: ${SEATING.label}
  `.trim();

  // Placeholder for actual email send (e.g., Nodemailer, SendGrid, Resend)
  // Never expose credentials in frontend — backend should call this
  try {
    if (typeof fetch !== "undefined" && process.env.EMAIL_API_URL) {
      await fetch(process.env.EMAIL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.EMAIL_API_KEY ?? ""}` },
        body: JSON.stringify({ to: booking.bookingContact.email, subject, body, booking }),
      });
    }
    console.info("[Email] Prepared confirmation", { bookingId: booking.bookingId, subject });
    return { ok: true };
  } catch (e) {
    console.warn("[Email] Failed to send", e);
    return { ok: false };
  }
}

// For backend import alias
export { sendBookingConfirmationEmail as sendConfirmationEmail };
