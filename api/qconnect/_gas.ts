/**
 * _gas.ts — Thin proxy to the Q-Connect Google Apps Script backend.
 *
 * Called ONLY after a payment is verified and confirmed server-side.
 * Never called from the frontend — the browser never touches GAS directly.
 * Failures are non-fatal: the registration is already CONFIRMED in _store.ts;
 * GAS is an audit log / data collection layer, not the source of truth.
 */

export async function gasCall<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  const url    = process.env.QCONNECT_GAS_URL;
  const secret = process.env.QCONNECT_GAS_SECRET;

  if (!url || !secret) throw new Error("QCONNECT backend not configured.");

  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ action, secret, ...payload }),
  });

  const data = (await res.json()) as T & { ok?: boolean; error?: string };

  if (!res.ok || data.ok === false) {
    throw new Error(data.error || "GAS returned an error.");
  }

  return data;
}
