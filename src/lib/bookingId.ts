/**
 * Booking ID generation: SCI-2026-000001
 * In production this should be server-side with persistence.
 * For the SPA we generate a unique ID client-side after verified payment
 * and persist a counter in localStorage as a fallback.
 */

const PREFIX = "SCI";
const YEAR = new Date().getFullYear();
const STORAGE_KEY = "scispace_booking_counter";
const BOOKINGS_KEY = "scispace_bookings";

export function generateBookingId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let counter = raw ? parseInt(raw, 10) : 0;
    counter += 1;
    localStorage.setItem(STORAGE_KEY, String(counter));
    const padded = String(counter).padStart(6, "0");
    return `${PREFIX}-${YEAR}-${padded}`;
  } catch {
    // Fallback: random suffix if storage unavailable
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `${PREFIX}-${YEAR}-${rand}`;
  }
}

export function saveBooking(booking: unknown) {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push(booking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function getBookingById(id: string): unknown | null {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return null;
    const list = JSON.parse(raw) as Array<{ bookingId: string }>;
    return list.find((b) => b.bookingId === id) ?? null;
  } catch {
    return null;
  }
}

export function getLastBooking(): unknown | null {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return null;
    const list = JSON.parse(raw) as unknown[];
    return list[list.length - 1] ?? null;
  } catch {
    return null;
  }
}
