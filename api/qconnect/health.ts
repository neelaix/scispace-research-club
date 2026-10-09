/**
 * GET /api/qconnect/health
 *
 * Read-only diagnostics (no secrets leaked):
 * - whether QCONNECT_GAS_URL / QCONNECT_GAS_SECRET are set
 * - whether the GAS web app answers its public GET (service check)
 *
 * Open in browser on prod to verify Vercel env without touching the Sheet.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors, setSecurityHeaders, safeError } from "../_security.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  if (!handleCors(req, res)) return safeError(res, 403, "Forbidden");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return safeError(res, 405, "Method not allowed");

  const gasUrl = process.env.QCONNECT_GAS_URL ?? "";
  const gasSecret = process.env.QCONNECT_GAS_SECRET ?? "";

  let gas: { reachable: boolean; status?: number; service?: boolean; error?: string } = {
    reachable: false,
  };
  if (gasUrl) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10000);
      const r = await fetch(gasUrl, { method: "GET", signal: ctrl.signal });
      clearTimeout(t);
      const text = await r.text();
      gas = {
        reachable: r.ok,
        status: r.status,
        service: text.includes("qconnect-2026"),
      };
    } catch (e) {
      gas = { reachable: false, error: (e as Error).message.slice(0, 120) };
    }
  } else {
    gas = { reachable: false, error: "QCONNECT_GAS_URL not set" };
  }

  return res.status(200).json({
    ok: true,
    env: {
      gasUrlSet: Boolean(gasUrl),
      gasSecretSet: Boolean(gasSecret),
    },
    gas,
    hint: "Step 1 saves to LEADS tab, Step 2 saves to REGISTRATIONS tab + Drive. Test via `vercel dev` or the deployed URL — plain `vite dev` has no /api.",
  });
}
