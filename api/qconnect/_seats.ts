/**
 * _seats.ts — shared live seat counting for Q-Connect 2026.
 *
 * Sheet (via GAS `list`) is the source of truth; the in-memory store is
 * only a fallback. Test rows (QCON-2026-999xxx) never occupy seats.
 */

import { gasCall } from "./_gas.js";
import { getStats } from "./_store.js";

export const SEAT_CAPACITY = 160;
const TEST_ID = /^QCON-2026-999\d{3}$/;

// Manual baseline: 22 verified registrations lost to the pre-fix duplicate
// booking-ID bug (their screenshots are in Drive but Sheets has no rows).
// Displayed total = live Sheet count + this baseline (18 + 22 = 40,
// 160 − 40 = 120 seats left). New submissions add on top normally.
// TODO: set to 0 once the missing rows are backfilled in the Sheet.
const MANUAL_BASELINE = 22;

function buildCounts(confirmed: number, pending: number, fallback = false): SeatCounts {
  const registered = Math.min(SEAT_CAPACITY, confirmed + pending + MANUAL_BASELINE);
  const seatsLeft = Math.max(0, SEAT_CAPACITY - registered);
  return {
    capacity: SEAT_CAPACITY,
    confirmed,
    pending,
    registered,
    seatsLeft,
    soldOut: seatsLeft <= 0,
    ...(fallback ? { fallback: true as const } : {}),
  };
}

export interface SeatCounts {
  capacity: number;
  confirmed: number;
  pending: number;
  registered: number;
  seatsLeft: number;
  soldOut: boolean;
  fallback?: boolean;
}

export async function getLiveSeatCounts(): Promise<SeatCounts> {
  try {
    let confirmed = 0;
    let pending = 0;
    let page = 1;
    for (;;) {
      const sheet = await gasCall<{
        ok: boolean;
        rows?: Array<{ bookingId?: string; bookingStatus?: string }>;
        total?: number;
      }>("list", { query: "", page, limit: 50 });
      for (const r of sheet.rows ?? []) {
        const id = String(r.bookingId ?? "");
        if (TEST_ID.test(id)) continue;
        if (String(r.bookingStatus ?? "").toUpperCase() === "CONFIRMED") confirmed++;
        else pending++;
      }
      const total = Number(sheet.total ?? 0);
      if (page * 50 >= total || (sheet.rows ?? []).length === 0 || page >= 6) break;
      page++;
    }
    return buildCounts(confirmed, pending);
  } catch {
    const s = getStats();
    const confirmed = Number(s.confirmed ?? 0);
    const pending = Number(s.pending ?? 0);
    return buildCounts(confirmed, pending, true);
  }
}
