import { useEffect, useState } from "react";
import type { Booking } from "../types/booking";
import { config } from "../config/config";
import { INTERSTELLAR_EVENT, SEATING } from "../config/interstellar";

interface Props {
  booking: Booking;
}

/**
 * QR generation: we generate a data-URL via lightweight canvas QR using
 * the public API `https://api.qrserver.com/v1/create-qr-code` as a
 * fallback, but also try to use `qrcode` lib if available.
 * To avoid adding heavy deps, we first try dynamic import of `qrcode`,
 * else fallback to external image.
 */
export function QRTicket({ booking }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const qrPayload = booking.bookingId; // Do NOT put sensitive attendee info

  useEffect(() => {
    let cancelled = false;
    async function gen() {
      try {
        const mod = await import("qrcode");
        const url = await (mod as unknown as { toDataURL: (text: string, opts: unknown) => Promise<string> }).toDataURL(qrPayload, {
          width: 220,
          margin: 1,
          color: { dark: "#1C1C24", light: "#FFFFFF" },
        });
        if (!cancelled) setQrDataUrl(url);
      } catch {
        // Fallback: use external QR API image URL
        const fallback = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayload)}`;
        if (!cancelled) setQrDataUrl(fallback);
      }
    }
    gen();
    return () => { cancelled = true; };
  }, [qrPayload]);

  return (
    <div className="overflow-hidden rounded-3xl border border-brand-dark/10 bg-white shadow-card">
      {/* Header */}
      <div className="bg-brand-dark px-6 py-5 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest2 text-white/50">
          {config.CLUB_NAME_FULL} · {config.INSTITUTION}
        </p>
        <h3 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {INTERSTELLAR_EVENT.title}
        </h3>
        <p className="mt-1 text-sm text-white/60">{INTERSTELLAR_EVENT.fullName}</p>
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/40">Booking ID</p>
              <p className="mt-1 font-mono text-sm font-bold text-brand-dark">{booking.bookingId}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/40">Attendees</p>
              <p className="mt-1 text-sm font-semibold text-brand-dark">{booking.attendeeCount}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/40">Amount Paid</p>
              <p className="mt-1 text-sm font-semibold text-brand-dark">₹{booking.totalAmount} {booking.currency}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/40">Payment</p>
              <p className="mt-1 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                {booking.payment.status}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-dark px-3 py-1 text-xs font-semibold text-white">{SEATING.type}</span>
            <span className="rounded-full bg-brand-orange px-3 py-1 text-xs font-semibold text-white">{SEATING.mode}</span>
          </div>

          <div className="rounded-xl bg-brand-mist px-4 py-3 text-xs leading-relaxed text-brand-dark/60">
            {SEATING.label} · Please carry this ticket (digital or printed) and a valid VIT-AP ID for verification at the venue.
          </div>

          <p className="text-xs text-brand-dark/40">
            Pay to {booking.payment.recipientName} · ₹{booking.payment.expectedAmount} · {booking.payment.displayStatus}
          </p>
          {booking.payment.transactionReference && (
            <p className="text-xs text-brand-dark/40">
              Ref: <span className="font-mono">{booking.payment.transactionReference}</span>
            </p>
          )}
        </div>

        {/* QR */}
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl border border-brand-dark/10 bg-white p-3 shadow-sm">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code for booking ${booking.bookingId}`}
                width={220}
                height={220}
                className="h-[180px] w-[180px] object-contain sm:h-[200px] sm:w-[200px]"
              />
            ) : (
              <div className="grid h-[180px] w-[180px] place-items-center bg-brand-canvas text-xs text-brand-dark/40">
                Generating QR…
              </div>
            )}
          </div>
          <p className="max-w-[200px] text-center text-xs font-medium tracking-wide text-brand-dark/50">
            Scan at entry — contains Booking ID only
          </p>
          <p className="font-mono text-xs font-semibold text-brand-dark">{booking.bookingId}</p>
        </div>
      </div>

      {/* Attendee list (names only, no sensitive data in QR) */}
      <div className="border-t border-brand-dark/5 bg-brand-canvas px-6 py-5 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/50">
          Attendees — {booking.attendeeCount}
        </p>
        <ul className="mt-3 grid gap-2 text-sm">
          {booking.attendees.map((a, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 ring-1 ring-brand-dark/5">
              <span className="font-medium text-brand-dark">{i + 1}. {a.name}</span>
              <span className="font-mono text-xs text-brand-dark/50">{a.registrationNumber}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
