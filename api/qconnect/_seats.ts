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
    const seatsLeft = Math.max(0, SEAT_CAPACITY - confirmed - pending);
    return {
      capacity: SEAT_CAPACITY,
      confirmed,
      pending,
      registered: confirmed + pending,
      seatsLeft,
      soldOut: seatsLeft <= 0,
    };
  } catch {
    const s = getStats();
    const confirmed = Number(s.confirmed ?? 0);
    const pending = Number(s.pending ?? 0);
    const seatsLeft = Math.max(0, SEAT_CAPACITY - confirmed - pending);
    return {
      capacity: SEAT_CAPACITY,
      confirmed,
      pending,
      registered: confirmed + pending,
      seatsLeft,
      soldOut: seatsLeft <= 0,
      fallback: true,
    };
  }
}
