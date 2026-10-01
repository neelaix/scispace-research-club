/**
 * _email.ts — Confirmation email via Resend.
 *
 * Manual UPI flow: called MANUALLY by an admin only after the payment
 * screenshot in Google Drive has been verified and the booking marked
 * CONFIRMED. Never called automatically on submit, never called for
 * PENDING bookings. Duplicate-safe: emailSent flag prevents resending.
 */

import { Resend } from "resend";
import type { Registration } from "./_store";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured.");
  return new Resend(key);
}

/** Quantum-themed HTML confirmation email */
function buildEmailHtml(reg: Registration): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Q-Connect 2026 — Registration Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#04060f;font-family:'Segoe UI',Arial,sans-serif;color:#e2f4ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#04060f;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:linear-gradient(135deg,#0b1530 0%,#0f1e3a 60%,#1a0f35 100%);border:1px solid rgba(34,211,238,0.25);border-radius:20px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:32px 32px 24px;text-align:center;background:linear-gradient(180deg,rgba(34,211,238,0.08) 0%,transparent 100%);border-bottom:1px solid rgba(34,211,238,0.15);">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;color:#22d3ee;font-weight:700;text-transform:uppercase;">SciSpace Research Club · VIT-AP University</p>
            <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;line-height:1.2;">⚛️ Q-Connect 2026</h1>
            <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">A Research Session on Reference Quantum Computing</p>
          </td>
        </tr>

        <!-- Success badge -->
        <tr>
          <td style="padding:28px 32px 0;text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.05));border:1px solid rgba(16,185,129,0.35);border-radius:50px;padding:10px 24px;">
              <span style="font-size:13px;font-weight:700;color:#34d399;letter-spacing:2px;text-transform:uppercase;">✅ Registration Confirmed</span>
            </div>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:20px 32px 0;">
            <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);">Hi <strong style="color:#ffffff;">${reg.fullName}</strong>,</p>
            <p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.6;">Your registration for Q-Connect 2026 is confirmed. Your payment has been successfully verified.</p>
          </td>
        </tr>

        <!-- Details table -->
        <tr>
          <td style="padding:24px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;font-size:13px;">
              ${[
                ["Booking ID",           reg.bookingId,          "#22d3ee", "font-family:monospace"],
                ["Event",                "Q-Connect 2026",        "#ffffff", ""],
                ["Date",                 "21 October 2026",       "#ffffff", ""],
                ["Time",                 "11:00 AM – 3:00 PM",    "#ffffff", ""],
                ["Venue",                "SRM - AP University",   "#ffffff", ""],
                ["Participant",          reg.fullName,            "#ffffff", ""],
                ["Registration No.",     reg.registrationNumber,  "#ffffff", "font-family:monospace"],
                ["Amount Paid",          `₹${reg.amount}`,        "#34d399", "font-weight:700"],
                ["Payment Status",       "PAID ✅",               "#34d399", "font-weight:700"],
                ["Registration Status",  "CONFIRMED ✅",          "#34d399", "font-weight:700"],
              ].map(([label, value, vc, extra], i) =>
                `<tr style="background:${i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent"};">
                  <td style="padding:10px 16px;color:rgba(255,255,255,0.45);white-space:nowrap;">${label}</td>
                  <td style="padding:10px 16px;color:${vc};text-align:right;${extra}">${value}</td>
                </tr>`
              ).join("")}
            </table>
          </td>
        </tr>

        <!-- Instructions -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="background:rgba(34,211,238,0.06);border:1px solid rgba(34,211,238,0.15);border-radius:12px;padding:16px 20px;">
              <p style="margin:0;font-size:12px;font-weight:700;color:#22d3ee;letter-spacing:1px;text-transform:uppercase;">Entry Instructions</p>
              <ul style="margin:10px 0 0;padding-left:18px;font-size:13px;color:rgba(255,255,255,0.65);line-height:1.8;">
                <li>Show your Booking ID <strong style="color:#22d3ee;font-family:monospace;">${reg.bookingId}</strong> at entry.</li>
                <li>Carry your college ID card for verification.</li>
                <li>Please arrive at least 30 minutes before the session begins.</li>
              </ul>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 32px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);margin-top:28px;">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);">SciSpace Research Club · VIT-AP University</p>
            <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.2);">This is an automated confirmation. Please do not reply to this email.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Plain-text fallback */
function buildEmailText(reg: Registration): string {
  return `Q-Connect 2026 — Registration Confirmed

Hi ${reg.fullName},

Your registration for Q-Connect 2026 has been confirmed.

Booking ID:           ${reg.bookingId}
Event:                Q-Connect 2026
Date:                 21 October 2026
Time:                 11:00 AM – 3:00 PM
Venue:                SRM - AP University
Participant:          ${reg.fullName}
Registration No.:     ${reg.registrationNumber}
Amount Paid:          ₹${reg.amount}
Payment Status:       PAID
Registration Status:  CONFIRMED

Entry instructions:
- Show Booking ID ${reg.bookingId} at entry.
- Carry your college ID card.
- Arrive at least 30 minutes early.

— SciSpace Research Club, VIT-AP University
`;
}

/**
 * Sends confirmation email to the registered participant.
 * Returns true on success, false on failure (logs error; never throws).
 */
export async function sendConfirmationEmail(reg: Registration): Promise<boolean> {
  try {
    const resend = getResend();
    const fromAddress = process.env.RESEND_FROM_EMAIL || "Q-Connect 2026 <spaceresearch.club@vitap.ac.in>";

    const { error } = await resend.emails.send({
      from:    fromAddress,
      to:      reg.email,
      subject: `✅ Registration Confirmed — Q-Connect 2026 [${reg.bookingId}]`,
      html:    buildEmailHtml(reg),
      text:    buildEmailText(reg),
    });

    if (error) {
      console.error("[qconnect-email] Resend error:", JSON.stringify(error));
      return false;
    }

    console.log("[qconnect-email] Confirmation sent to", reg.email, "for", reg.bookingId);
    return true;
  } catch (e) {
    console.error("[qconnect-email] Unexpected error:", (e as Error).message);
    return false;
  }
}
