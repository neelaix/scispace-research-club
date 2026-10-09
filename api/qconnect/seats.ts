/**
 * GET /api/qconnect/seats
 *
 * Public live seat counter for Q-Connect 2026 (no auth, no PII).
 * Source of truth is Google Sheets; the in-memory store is only
 * a fallback when GAS is unreachable. Cached for 30s.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getLiveSeatCounts } from "./_seats.js";
import { handleCors, setSecurityHeaders, rateLimit, safeError } from "../_security.js";

// Short in-memory cache so every visitor doesn't hammer GAS.
let cache: { at: number; body: Record<string, unknown> } | null = null;
const CACHE_MS = 8_000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  if (!handleCors(req, res)) return safeError(res, 403, "Forbidden");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return safeError(res, 405, "Method not allowed");
  if (!rateLimit(req, "qconnect-seats", 60, 60_000))
    return safeError(res, 429, "Too many requests.");

  if (cache && Date.now() - cache.at < CACHE_MS && String(req.query.fresh ?? "") !== "1") {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ...cache.body, cached: true });
  }

  try {
    const counts = await getLiveSeatCounts();
    const body: Record<string, unknown> = { ok: true, ...counts };
    cache = { at: Date.now(), body };
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(body);
  } catch (e) {
    console.error("[qconnect-seats]", (e as Error).message);
    return safeError(res, 500, "Could not load seat availability.");
  }
}
