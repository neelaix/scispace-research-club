/**
 * _gas.ts — Thin proxy to the Q-Connect Google Apps Script backend.
 *
 * Used by Step 1 (saveLead → LEADS tab) and Step 2 (uploadScreenshot →
 * Drive, savePending → REGISTRATIONS tab). Never called from the frontend —
 * the browser never touches GAS directly (secret stays server-side).
 * Failures ARE fatal to the request: collect/submit return 5xx so the user
 * retries. Nothing is saved to the Sheet when GAS fails.
 */

export async function gasCall<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  const url    = process.env.QCONNECT_GAS_URL;
  const secret = process.env.QCONNECT_GAS_SECRET;

  if (!url || !secret) throw new Error("QCONNECT backend not configured.");

  let res: Response;
  try {
    res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action, secret, ...payload }),
    });
  } catch (e) {
    throw new Error(`GAS unreachable: ${(e as Error).message}`);
  }

  const text = await res.text();
  let data: T & { ok?: boolean; error?: string };
  try {
    data = JSON.parse(text) as T & { ok?: boolean; error?: string };
  } catch {
    throw new Error(
      `GAS returned non-JSON (status ${res.status}). Check the GAS deployment URL / access.`
    );
  }

  if (!res.ok || data.ok === false) {
    throw new Error(data.error || "GAS returned an error.");
  }

  return data;
}
