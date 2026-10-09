/**
 * _store.ts — In-memory registration store for Q-Connect 2026.
 *
 * Manual UPI flow: participant submits details + payment screenshot,
 * booking is stored as PENDING. An admin manually verifies the screenshot
 * in Google Drive, then marks CONFIRMED and sends the confirmation email
 * from spaceresearch.club@vitap.ac.in. No automatic confirmation.
 *
 * Google Sheet column layout is unchanged (10 columns); screenshot lives
 * only in Google Drive (filename contains booking ID + reg number).
 */

export interface Registration {
  bookingId:         string;
  event:             string;
  createdAt:         string;        // ISO string
  // Participant (always exactly 1)
  fullName:          string;
  registrationNumber:string;
  phone:             string;
  email:             string;
  // Payment (manual UPI — always ₹50)
  amount:            number;        // always 50
  cashfreeOrderId:   string;        // unused (kept so Sheet mapping is unchanged, always "")
  cashfreePaymentId: string;        // unused (kept so Sheet mapping is unchanged, always "")
  screenshotFileId:  string;        // Google Drive file ID (in-memory + Drive filename only)
  screenshotUrl:     string;        // Google Drive file URL (in-memory only, never in Sheet)
  paymentStatus:     "PENDING" | "PAYMENT_PENDING" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "PAYMENT_CANCELLED";
  bookingStatus:     "PENDING" | "PAYMENT_PENDING" | "CONFIRMED" | "PAYMENT_FAILED" | "PAYMENT_CANCELLED";
  emailSent:         boolean;
}

// ─── Store (module-level singleton) ──────────────────────────────────────────
const store = new Map<string, Registration>();

// ─── ID generation ───────────────────────────────────────────────────────────
// MUST be globally unique across Vercel serverless instances (each instance
// has its own memory, so a sequential counter produces duplicate IDs like
// QCON-2026-000001 on every cold start — GAS then dedupes them via
// findRow_ and silently drops Sheet rows while Drive files still pile up).
// Fix: crypto-random 6-digit IDs in 100000–899999 (avoids 999xxx test range).
// Collision chance with <200 rows is negligible; submit.ts retries on
// alreadySaved as a safety net.
export function nextBookingId(): string {
  for (let i = 0; i < 20; i++) {
    const n = 100000 + Math.floor(Math.random() * 800000);
    const id = `QCON-2026-${String(n)}`;
    if (!store.has(id)) return id;
  }
  // Fallback: timestamp-derived (still 6 digits, still avoids 999xxx)
  const n = 100000 + (Date.now() % 800000);
  return `QCON-2026-${String(n).padStart(6, "0")}`;
}

/** No-op kept for callers — counter no longer exists (IDs are random). */
function syncCounter() {}

// ─── CRUD ─────────────────────────────────────────────────────────────────────
export function createRegistration(data: Omit<Registration, "bookingId" | "createdAt">): Registration {
  syncCounter();
  const bookingId = nextBookingId();
  const reg: Registration = { ...data, bookingId, createdAt: new Date().toISOString() };
  store.set(bookingId, reg);
  return reg;
}

export function getRegistration(bookingId: string): Registration | undefined {
  return store.get(bookingId);
}

export function updateRegistration(bookingId: string, patch: Partial<Registration>): Registration | null {
  const existing = store.get(bookingId);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  store.set(bookingId, updated);
  return updated;
}

export function listRegistrations(query = "", page = 1, limit = 25) {
  const q = query.toLowerCase();
  const all = [...store.values()].reverse(); // newest first
  const filtered = q
    ? all.filter((r) =>
        [r.bookingId, r.fullName, r.registrationNumber, r.bookingStatus, r.paymentStatus]
          .join(" ").toLowerCase().includes(q)
      )
    : all;
  const total = filtered.length;
  const rows  = filtered.slice((page - 1) * limit, page * limit);
  return { rows, total, page };
}

export function getStats() {
  let confirmed = 0, pending = 0, failed = 0, cancelled = 0;
  const capacity = 160;
  for (const r of store.values()) {
    if      (r.bookingStatus === "CONFIRMED")         confirmed++;
    else if (r.bookingStatus === "PENDING" || r.bookingStatus === "PAYMENT_PENDING") pending++;
    else if (r.bookingStatus === "PAYMENT_FAILED")     failed++;
    else if (r.bookingStatus === "PAYMENT_CANCELLED")  cancelled++;
  }
  return { confirmed, pending, failed, cancelled, capacity, seatsLeft: Math.max(0, capacity - confirmed - pending) };
}
