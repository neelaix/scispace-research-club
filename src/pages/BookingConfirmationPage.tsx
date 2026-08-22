import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { CheckCircle2, Ticket, ArrowRight } from "lucide-react";
import { Layout } from "../components/Layout";
import { QRTicket } from "../components/QRTicket";
import type { Booking } from "../types/booking";

export function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const stateBooking = (location.state as { booking?: Booking } | null)?.booking;
  const [booking, setBooking] = useState<Booking | null>(stateBooking ?? null);

  useEffect(() => {
    if (booking) return;
    // Try localStorage
    try {
      const raw = localStorage.getItem("scispace_bookings");
      if (raw && bookingId) {
        const list = JSON.parse(raw) as Booking[];
        const found = list.find((b) => b.bookingId === bookingId);
        if (found) setBooking(found);
      }
    } catch {
      // ignore
    }
  }, [booking, bookingId]);

  if (!booking) {
    return (
      <Layout>
        <section className="bg-brand-canvas py-20">
          <div className="container-site max-w-2xl text-center">
            <h1 className="font-display text-2xl font-bold text-brand-dark">Booking not found</h1>
            <p className="mt-2 text-sm text-brand-dark/60">
              We could not find booking <span className="font-mono">{bookingId}</span>. It may have been cleared from this browser.
            </p>
            <Link to="/booking" className="btn-accent mt-6 inline-flex">
              Go to Booking <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-brand-canvas py-10 sm:py-14">
        <div className="container-site max-w-3xl">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center sm:px-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-dark">Booking Submitted 🎉</h1>
            <p className="mt-2 text-sm leading-relaxed text-brand-dark/60">
              Payment submission received — {booking.payment.displayStatus ?? "Payment details checked"}. Present the QR ticket at the venue. A screenshot alone cannot cryptographically prove a bank transfer.
            </p>
          </div>

          {/* Booking details */}
          <div className="mt-8 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-brand-dark">Booking Details</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-brand-dark/60">Booking ID</span>
                <span className="font-mono font-bold text-brand-dark">{booking.bookingId}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-brand-dark/60">Booking Contact</span>
                <span className="text-right font-medium text-brand-dark">
                  {booking.bookingContact.name} · {booking.bookingContact.email} · {booking.bookingContact.phone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark/60">Number of Attendees</span>
                <span className="font-semibold text-brand-dark">{booking.attendeeCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark/60">Amount Paid</span>
                <span className="font-semibold text-brand-dark">₹{booking.totalAmount} {booking.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark/60">Pay To</span>
                <span className="font-mono text-xs font-semibold text-brand-dark">{booking.payment.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark/60">Transaction Ref</span>
                <span className="font-mono text-xs font-semibold text-brand-dark">{booking.payment.transactionReference || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark/60">Screenshot</span>
                <span className="font-mono text-xs font-semibold text-brand-dark">{booking.payment.screenshotReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark/60">Event</span>
                <span className="font-semibold text-brand-dark">{booking.event.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark/60">Seating</span>
                <span className="font-semibold text-emerald-700">{typeof booking.seating === "string" ? booking.seating : `${(booking.seating as unknown as { mode: string }).mode} · ${(booking.seating as unknown as { type: string }).type}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark/60">Payment Status</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{booking.payment.displayStatus ?? booking.payment.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark/60">General Admission</span>
                <span className="font-semibold text-brand-dark">Yes — Open Seating</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark/60">Venue</span>
                <span className="font-medium text-brand-dark">{booking.event.institution}</span>
              </div>
            </div>
          </div>

          {/* QR Ticket */}
          <div className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-brand-dark">
              <Ticket className="h-5 w-5 text-brand-orange" /> Your QR Ticket
            </h2>
            <QRTicket booking={booking} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-ghost px-6 py-3 text-sm"
            >
              Print / Save Ticket
            </button>
            <Link to="/events" className="btn-primary inline-flex justify-center px-6 py-3 text-sm">
              Back to Events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
