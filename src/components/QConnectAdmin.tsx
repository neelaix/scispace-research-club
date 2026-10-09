import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  confirmedParticipants:  number;
  pendingParticipants:    number;
  failedParticipants:     number;
  cancelledParticipants:  number;
  capacity:               number;
  seatsLeft:              number;
}

interface Row {
  bookingId:         string;
  fullName:          string;
  registrationNumber:string;
  amount:            number;
  cashfreeOrderId:   string;
  cashfreePaymentId: string;
  paymentStatus:     string;
  bookingStatus:     string;
  createdAt:         string;
}

interface Detail extends Row {
  phone:        string;
  email:        string;
  emailSent:    boolean;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const color =
    status === "CONFIRMED"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
      : status === "PAYMENT_PENDING"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
      : status === "PAYMENT_FAILED"
      ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${color}`}>
      {status}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function QConnectAdmin({ token }: { token: string }) {
  const [stats,  setStats]  = useState<Stats | null>(null);
  const [rows,   setRows]   = useState<Row[]>([]);
  const [q,      setQ]      = useState("");
  const [msg,    setMsg]    = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [confirming, setConfirming] = useState(false);

  const auth = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setMsg("");
    try {
      const [sRes, lRes] = await Promise.all([
        fetch("/api/qconnect/admin?view=stats",                         { headers: auth }),
        fetch(`/api/qconnect/admin?q=${encodeURIComponent(q)}`,         { headers: auth }),
      ]);
      const [s, l] = await Promise.all([sRes.json(), lRes.json()]);
      if (!sRes.ok) throw new Error(s.error || "Could not load stats");
      if (!lRes.ok) throw new Error(l.error || "Could not load bookings");
      setStats(s);
      setRows((l.rows ?? []) as Row[]);
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  useEffect(() => { load().catch(() => undefined); }, []);

  const openDetail = async (bookingId: string) => {
    setMsg("");
    try {
      const r = await fetch(
        `/api/qconnect/admin?action=get&id=${encodeURIComponent(bookingId)}`,
        { headers: auth }
      );
      const d = await r.json();
      if (!r.ok || d.ok === false) throw new Error(d.error || "Not found");
      setDetail(d.booking as Detail);
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const exportCsv = async () => {
    setMsg("");
    try {
      const r = await fetch(`/api/qconnect/admin?format=csv&q=${encodeURIComponent(q)}`, { headers: auth });
      if (!r.ok) throw new Error("Export failed (unauthorized?).");
      const blob = await r.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "qconnect-bookings.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const confirmBooking = async (bookingId: string) => {
    setMsg("");
    setConfirming(true);
    try {
      const r = await fetch("/api/qconnect/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ action: "confirm", bookingId }),
      });
      const d = await r.json();
      if (!r.ok || d.ok === false) throw new Error(d.error || "Confirm failed");
      setDetail(d.booking as Detail);
      await load();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-brand-dark/10 bg-white p-6 dark:border-white/10 dark:bg-[#1E1E24]">
      <h2 className="font-display text-xl font-bold text-brand-dark dark:text-white">
        Q-Connect 2026 — UPI Registrations
      </h2>
      <p className="mt-1 text-xs text-brand-dark/50 dark:text-white/50">
        Verify payment screenshots in Google Drive, then confirm manually. Confirmation emails are sent from spaceresearch.club@vitap.ac.in only after manual verification.
      </p>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">
          {(
            [
              ["Confirmed",  stats.confirmedParticipants,  "text-emerald-600"],
              ["Pending",    stats.pendingParticipants,    "text-amber-500"],
              ["Failed",     stats.failedParticipants,     "text-red-500"],
              ["Cancelled",  stats.cancelledParticipants,  "text-gray-400"],
              ["Capacity",   stats.capacity,               ""],
              ["Seats Left", stats.seatsLeft,              "text-sky-500"],
            ] as [string, number, string][]
          ).map(([k, v, cls]) => (
            <div key={k} className="rounded-xl bg-brand-canvas p-3 dark:bg-[#25252e]">
              <p className="text-xs uppercase tracking-widest text-brand-dark/50 dark:text-white/50">{k}</p>
              <p className={`font-display text-xl font-bold ${cls || "text-brand-dark dark:text-white"}`}>
                {v}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Search + actions bar ──────────────────────────────────────────── */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") load(); }}
          placeholder="Search booking ID, status…"
          className="flex-1 rounded-xl border border-brand-dark/12 px-4 py-2.5 text-sm dark:border-white/10 dark:bg-[#25252e] dark:text-white"
        />
        <button
          onClick={load}
          className="rounded-full bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-black"
        >
          Search
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-full border border-brand-dark/15 px-5 py-2.5 text-center text-sm font-semibold"
        >
          Export CSV
        </button>
      </div>

      {msg && <p role="status" className="mt-3 text-sm text-red-600 dark:text-red-400">{msg}</p>}

      {/* ── Bookings table ─────────────────────────────────────────────────── */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-brand-dark/50 dark:text-white/50">
              <th className="p-2">Booking ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Reg No.</th>
              <th className="p-2">Amount</th>
              <th className="p-2">CF Payment ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Created</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.bookingId} className="border-t border-brand-dark/8 dark:border-white/8">
                <td className="p-2 font-mono text-xs">{r.bookingId}</td>
                <td className="p-2">{r.fullName}</td>
                <td className="p-2 font-mono text-xs">{r.registrationNumber}</td>
                <td className="p-2">₹{r.amount}</td>
                <td className="p-2 font-mono text-xs text-white/60 dark:text-white/40">
                  {r.cashfreePaymentId || "—"}
                </td>
                <td className="p-2"><StatusBadge status={r.bookingStatus} /></td>
                <td className="p-2 text-xs text-brand-dark/50 dark:text-white/40">
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => openDetail(r.bookingId)}
                    className="rounded-full border border-brand-dark/15 px-3 py-1 text-xs dark:border-white/15"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-brand-dark/40 dark:text-white/30">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Detail modal ──────────────────────────────────────────────────── */}
      {detail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Booking ${detail.bookingId}`}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 dark:bg-[#1E1E24]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-mono text-lg font-bold">{detail.bookingId}</h3>
                <p className="text-sm text-brand-dark/60 dark:text-white/60">
                  {detail.registrationNumber} · ₹{detail.amount}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="rounded-full border px-3 py-1 text-xs"
              >
                Close
              </button>
            </div>

            {/* Status row */}
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={detail.bookingStatus} />
              {detail.cashfreePaymentId && (
                <span className="font-mono text-xs text-brand-dark/50 dark:text-white/40">
                  CF: {detail.cashfreePaymentId}
                </span>
              )}
            </div>

            {/* Participants */}
            <div className="mt-4 grid gap-2 text-sm">
              <div className="rounded-xl bg-brand-canvas p-3 dark:bg-[#25252e]">
                <p className="font-semibold">{detail.fullName}</p>
                <p className="font-mono text-xs text-brand-dark/60 dark:text-white/50">
                  {detail.registrationNumber} · {detail.phone} · {detail.email}
                </p>
                {detail.emailSent && (
                  <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">✅ Confirmation email sent</p>
                )}
              </div>
            </div>

            <p className="mt-4 text-xs text-brand-dark/40 dark:text-white/30">
              Manual UPI flow: verify the payment screenshot in Google Drive, then confirm manually.
            </p>
            {detail.bookingStatus !== "CONFIRMED" && (
              <button
                type="button"
                disabled={confirming}
                onClick={() => confirmBooking(detail.bookingId)}
                className="mt-4 w-full rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {confirming ? "Confirming…" : detail.emailSent ? "Resend confirmation" : "Verify screenshot & confirm + email"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
