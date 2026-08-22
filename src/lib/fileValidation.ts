export const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp"] as const;
export const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export type FileValidationResult = { ok: boolean; reason?: string };

export function validateScreenshotFile(file: File): FileValidationResult {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTS.includes(ext as (typeof ALLOWED_EXTS)[number])) {
    return { ok: false, reason: `Only JPG, JPEG, PNG or WEBP images are accepted. Rejected: .${ext}` };
  }
  if (!ALLOWED_MIMES.includes(file.type as (typeof ALLOWED_MIMES)[number])) {
    return { ok: false, reason: `Invalid MIME type: ${file.type}. Only JPG, JPEG, PNG or WEBP allowed.` };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, reason: `File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB. Maximum size: 5 MB.` };
  }
  if (file.size === 0) return { ok: false, reason: "File is empty or corrupted" };

  // SVG rejection already via MIME/ext, but double check
  if (file.type === "image/svg+xml") return { ok: false, reason: "SVG files are not allowed" };

  // PDF/DOC etc already rejected via ext/MIME, but provide friendly message
  const badHints = ["pdf", "doc", "docx", "xls", "xlsx", "zip", "rar", "mp4", "mov", "svg"];
  if (badHints.includes(ext)) return { ok: false, reason: `${ext.toUpperCase()} files are not allowed. Only JPG, JPEG, PNG, WEBP.` };

  return { ok: true };
}

export function getFileExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}
