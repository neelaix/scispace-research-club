import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Printer,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Layout } from "../components/Layout";
import { QCONNECT } from "../config/qconnect";
import {
  QuantumBackdrop,
  QuantumGrid,
  QuantumParticles,
} from "../components/qconnect/QuantumBackdrop";

const base = QCONNECT.EVENT_PATH;

// ─── Shell wrapper ────────────────────────────────────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      <div className="qconnect">
        <section className="relative overflow-hidden bg-[#04060f] py-14 text-white md:py-20">
          <QuantumBackdrop />
          <QuantumGrid />
          <QuantumParticles density={45} />
          <div className="container-site relative z-10 max-w-2xl text-center">
            {children}
          </div>
        </section>
      </div>
    </Layout>
  );
}

// ─── Booking status shape ─────────────────────────────────────────────────────
interface BookingStatus {
  bookingId: string;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
}

// ─── Glow ring decoration ─────────────────────────────────────────────────────
function GlowRing({ color }: { color: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 rounded-2xl opacity-20 blur-2xl ${color}`}
    />
  );
}

// ─── QConnectSuccessPage ──────────────────────────────────────────────────────
export function QConnectSuccessPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const id = params.get("id") ?? "";

  const [data, setData] = useState<BookingStatus | null>(null);
  const [err, setErr] = useState("");
  // Instant value from the submit response (already includes this booking),
  // then kept live by polling below.
  const navSeats = (location.state as { seats?: { seatsLeft?: number; registered?: number; capacity?: number } } | null)?.seats;
  const [seats, setSeats] = useState<{ seatsLeft: number; registered: number; capacity: number } | null>(
    typeof navSeats?.seatsLeft === "number"
      ? { seatsLeft: navSeats.seatsLeft, registered: navSeats.registered ?? 0, capacity: navSeats.capacity ?? QCONNECT.MAX_PARTICIPANTS }
      : null
  );

  // Polling for PENDING → CONFIRMED transition
  // Manual UPI flow: booking stays PENDING until an admin verifies the
  // screenshot in Drive and marks CONFIRMED + sends the email.
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);
  const MAX_POLLS = 10; // 10 × 3s = 30s max

  const fetchStatus = async () => {
    if (!id) { setErr("Missing booking ID."); return; }
    try {
      const r = await fetch(`/api/qconnect/booking?id=${encodeURIComponent(id)}`);
      const j: BookingStatus & { error?: string } = await r.json();
      if (!r.ok) throw new Error(j.error || "Booking not found.");
      setData(j);
      // Stop polling once we have a terminal state
      const terminal = ["CONFIRMED", "PAYMENT_FAILED", "PAYMENT_CANCELLED"].includes(
        j.bookingStatus
      );
      if (terminal && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch (e) {
      setErr((e as Error).message);
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }
  };

  const fetchSeats = async () => {
    try {
      const r = await fetch("/api/qconnect/seats?fresh=1", { cache: "no-store" });
      const j = await r.json();
      if (r.ok && typeof j.seatsLeft === "number") {
        const next = { seatsLeft: j.seatsLeft, registered: j.registered ?? 0, capacity: j.capacity ?? QCONNECT.MAX_PARTICIPANTS };
        // Glitch guard: a fallback response must never lower the shown count.
        setSeats((prev) => (prev && j.fallback === true && next.registered < prev.registered ? prev : next));
      }
    } catch { /* keep last known value */ }
  };

  useEffect(() => {
    fetchStatus();
    // Live seat counter — refreshes every 10s so the page visibly tracks
    // new registrations without a manual refresh.
    if (!navSeats || typeof navSeats.seatsLeft !== "number") fetchSeats();
    const seatsTimer = setInterval(fetchSeats, 10_000);
    // Start polling — stops on terminal state or after MAX_POLLS
    pollRef.current = setInterval(() => {
      pollCount.current += 1;
      if (pollCount.current >= MAX_POLLS) {
        clearInterval(pollRef.current!);
        pollRef.current = null;
        return;
      }
      fetchStatus();
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); clearInterval(seatsTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Error state ────────────────────────────────────────────────────────────
  if (err) {
    return (
      <Shell>
        <div className="relative qconnect-glass overflow-hidden p-8">
          <GlowRing color="bg-red-500" />
          <XCircle className="mx-auto h-10 w-10 text-red-300" />
          <h1 className="mt-3 font-display text-2xl font-bold">Booking not found</h1>
          <p className="mt-2 text-sm text-white/60">{err}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={`${base}/register`} className="qconnect-btn-primary">Try Again</Link>
            <Link to={base} className="qconnect-btn-ghost">Back to Event</Link>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!data) {
    return (
      <Shell>
        <div className="relative qconnect-glass overflow-hidden p-10">
          <GlowRing color="bg-amber-400" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-5 h-12 w-12"
          >
            <Loader2 className="h-12 w-12 text-cyan-300" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold">
            Loading registration status…
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Please wait while we fetch your registration.
          </p>
          {id && (
            <p className="mt-3 font-mono text-xs text-cyan-200/70">
              Booking ID: {id}
            </p>
          )}
          <button
            type="button"
            onClick={() => { pollCount.current = 0; fetchStatus(); }}
            className="qconnect-btn-ghost mt-5"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Status
          </button>
        </div>
      </Shell>
    );
  }

  // ── PENDING state (manual verification) ───────────────────────────────────
  if (data.bookingStatus === "PENDING" || data.bookingStatus === "PAYMENT_PENDING") {
    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55 }}
          className="relative qconnect-glass overflow-hidden p-7 md:p-10"
        >
          <GlowRing color="bg-amber-400" />
          <CheckCircle2 className="mx-auto h-14 w-14 text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/90">
            Submitted — Pending Verification
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold md:text-4xl">
            🎫 Registration Received!
          </h1>
          <p className="mt-1.5 text-sm text-white/60">
            Your details and payment screenshot have been received. Status: PENDING.
            {seats !== null && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                </span>
                <motion.span key={seats.seatsLeft} initial={{ scale: 1.25 }} animate={{ scale: 1 }}>
                  {seats.registered}/{seats.capacity} registered · Only {seats.seatsLeft} seats left — you're in!
                </motion.span>
              </span>
            )}
          </p>

          <dl className="mx-auto mt-7 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-black/30 text-left text-sm">
            {[
              ["Event",               "Q-Connect 2026"],
              ["Booking ID",         data.bookingId],
              ["Amount",              `₹${data.totalAmount}`],
              ["Payment Status",      "PENDING"],
              ["Registration Status", "PENDING"],
              ["Venue",               QCONNECT.EVENT_VENUE],
              ["Date & Time",         `${QCONNECT.EVENT_DATE} · ${QCONNECT.EVENT_TIME}`],
            ].map(([label, value], i) => (
              <div
                key={label}
                className={`flex justify-between gap-4 px-5 py-3 ${
                  i % 2 === 0 ? "bg-white/[0.03]" : ""
                }`}
              >
                <dt className="shrink-0 text-white/50">{label}</dt>
                <dd
                  className={`text-right font-semibold ${
                    label === "Booking ID" ? "font-mono text-cyan-100" : "text-white"
                  }`}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 text-sm text-white/60">
            We will manually verify your screenshot and send the confirmation email
            from spaceresearch.club@vitap.ac.in only after verification.
            Show your Booking ID at entry along with your college ID.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.print()}
              className="qconnect-btn-primary"
            >
              <Printer className="h-4 w-4" /> Save / Print Reference
            </button>
            <Link to={base} className="qconnect-btn-ghost">
              Back to Event
            </Link>
          </div>
        </motion.div>
      </Shell>
    );
  }

  // ── CONFIRMED state ────────────────────────────────────────────────────────
  if (data.bookingStatus === "CONFIRMED") {
    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55 }}
          className="relative qconnect-glass overflow-hidden p-7 md:p-10"
        >
          {/* Quantum glow */}
          <GlowRing color="bg-emerald-400" />

          {/* Particle burst decoration */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.7, 0], scale: [0, 1.5, 2], x: Math.cos((i / 8) * Math.PI * 2) * 80, y: Math.sin((i / 8) * Math.PI * 2) * 80 }}
              transition={{ duration: 1.2, delay: 0.2 + i * 0.05 }}
              className="pointer-events-none absolute left-1/2 top-16 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-300"
            />
          ))}

          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.15 }}
          >
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]" />
          </motion.div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200/90">
            Payment Verified ✅
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold md:text-4xl">
            🎉 Registration Successful!
          </h1>
          <p className="mt-1.5 text-sm text-white/60">
            Your Q-Connect 2026 registration is confirmed.
          </p>

          {/* Details card */}
          <dl className="mx-auto mt-7 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-black/30 text-left text-sm">
            {[
              ["Event",               "Q-Connect 2026"],
              ["Booking ID",         data.bookingId],
              ["Amount Paid",         `₹${data.totalAmount}`],
              ["Payment Status",      "PAID ✅"],
              ["Registration Status", "CONFIRMED ✅"],
              ["Venue",               QCONNECT.EVENT_VENUE],
              ["Date & Time",         `${QCONNECT.EVENT_DATE} · ${QCONNECT.EVENT_TIME}`],
            ].map(([label, value], i) => (
              <div
                key={label}
                className={`flex justify-between gap-4 px-5 py-3 ${
                  i % 2 === 0 ? "bg-white/[0.03]" : ""
                }`}
              >
                <dt className="shrink-0 text-white/50">{label}</dt>
                <dd
                  className={`text-right font-semibold ${
                    label === "Booking ID" ? "font-mono text-cyan-100" : "text-white"
                  }`}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 text-sm text-white/60">
            Show your Booking ID at entry along with your college ID.
            Please arrive 30 minutes early.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.print()}
              className="qconnect-btn-primary"
            >
              <Printer className="h-4 w-4" /> Save / Print Ticket
            </button>
            <Link to={base} className="qconnect-btn-ghost">
              Back to Event
            </Link>
          </div>
        </motion.div>
      </Shell>
    );
  }

  // ── PAYMENT_FAILED state ───────────────────────────────────────────────────
  if (
    data.bookingStatus === "PAYMENT_FAILED" ||
    data.paymentStatus === "PAYMENT_FAILED"
  ) {
    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative qconnect-glass overflow-hidden p-8"
        >
          <GlowRing color="bg-red-500" />
          <XCircle className="mx-auto h-12 w-12 text-red-300 drop-shadow-[0_0_16px_rgba(248,113,113,0.5)]" />
          <h1 className="mt-3 font-display text-2xl font-bold">Payment Failed</h1>
          <p className="mt-2 text-sm text-white/60">
            Your payment could not be processed. Your registration has{" "}
            <strong className="text-white">not</strong> been confirmed.
          </p>
          {id && (
            <p className="mt-2 font-mono text-xs text-white/40">
              Reference: {id}
            </p>
          )}
          <p className="mt-4 text-sm text-white/50">
            No amount has been charged. You can safely try registering again.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={`${base}/register`} className="qconnect-btn-primary">
              Try Payment Again
            </Link>
            <Link to={base} className="qconnect-btn-ghost">
              Back to Event
            </Link>
          </div>
        </motion.div>
      </Shell>
    );
  }

  // ── PAYMENT_CANCELLED state ────────────────────────────────────────────────
  if (
    data.bookingStatus === "PAYMENT_CANCELLED" ||
    data.paymentStatus === "PAYMENT_CANCELLED"
  ) {
    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative qconnect-glass overflow-hidden p-8"
        >
          <GlowRing color="bg-amber-400" />
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-300 drop-shadow-[0_0_16px_rgba(251,191,36,0.5)]" />
          <h1 className="mt-3 font-display text-2xl font-bold">Payment Cancelled</h1>
          <p className="mt-2 text-sm text-white/60">
            You cancelled the payment. Your registration has{" "}
            <strong className="text-white">not</strong> been confirmed.
          </p>
          {id && (
            <p className="mt-2 font-mono text-xs text-white/40">
              Reference: {id}
            </p>
          )}
          <p className="mt-4 text-sm text-white/50">
            No amount has been charged. You can retry at any time.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={`${base}/register`} className="qconnect-btn-primary">
              Try Again
            </Link>
            <Link to={base} className="qconnect-btn-ghost">
              Back to Event
            </Link>
          </div>
        </motion.div>
      </Shell>
    );
  }

  // ── Fallback: unknown state — should not be reachable ─────────────────────
  return (
    <Shell>
      <div className="qconnect-glass p-8">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-300" />
        <p className="mt-3 text-sm text-white/60">Loading registration status…</p>
        <button
          type="button"
          onClick={fetchStatus}
          className="qconnect-btn-ghost mt-5"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>
    </Shell>
  );
}

// ─── QConnectFailurePage ──────────────────────────────────────────────────────
// Kept for router completeness.
export function QConnectFailurePage() {
  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative qconnect-glass overflow-hidden p-8"
      >
        <GlowRing color="bg-red-500" />
        <XCircle className="mx-auto h-12 w-12 text-red-300 drop-shadow-[0_0_16px_rgba(248,113,113,0.5)]" />
        <h1 className="mt-3 font-display text-2xl font-bold">Submission Not Found</h1>
        <p className="mt-2 text-sm text-white/60">
          Your registration could not be found. Your status is{" "}
          <strong className="text-white">not</strong> confirmed.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={`${base}/register`} className="qconnect-btn-primary">
            Try Again
          </Link>
          <Link to={base} className="qconnect-btn-ghost">
            Back to Event
          </Link>
        </div>
      </motion.div>
    </Shell>
  );
}
