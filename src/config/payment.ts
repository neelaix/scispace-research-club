/**
 * UPI Payment Configuration
 * Do NOT hardcode secrets. Read from env.
 * Frontend uses VITE_ prefixed vars, backend uses plain.
 */

function getEnv(key: string, fallback = ""): string {
  // Vite exposes import.meta.env, Node uses process.env
  try {
    // @ts-ignore
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key] !== undefined) {
      // @ts-ignore
      return String(import.meta.env[key] ?? fallback);
    }
  } catch { /* ignore */ }
  if (typeof process !== "undefined" && process.env[key] !== undefined) {
    return String(process.env[key] ?? fallback);
  }
  return fallback;
}

export const PAYMENT_UPI_ID =
  getEnv("VITE_PAYMENT_UPI_ID", getEnv("PAYMENT_UPI_ID", ""));

export const PAYMENT_RECIPIENT_NAME =
  getEnv("VITE_PAYMENT_RECIPIENT_NAME", getEnv("PAYMENT_RECIPIENT_NAME", "SciSpace Research Club"));

export const PAYMENT_CURRENCY = "INR" as const;

// For local dev fallback — updated to requested UPI
export const DEFAULT_DEMO_UPI = "mithintiramani@upi";
export const DEFAULT_DEMO_NAME = "SciSpace";

export function getEffectiveUpiId(): string {
  return PAYMENT_UPI_ID || DEFAULT_DEMO_UPI;
}

export function getEffectiveRecipientName(): string {
  return PAYMENT_RECIPIENT_NAME || DEFAULT_DEMO_NAME;
}

// Google Apps Script — prepare only, empty by default per spec
export const GOOGLE_APPS_SCRIPT_URL =
  getEnv("VITE_GOOGLE_APPS_SCRIPT_URL", getEnv("GOOGLE_APPS_SCRIPT_URL", ""));

// Also export as required exact name per spec
export const GOOGLE_APPS_SCRIPT_URL_EMPTY = "";
