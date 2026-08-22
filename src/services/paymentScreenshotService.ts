/**
 * paymentScreenshotService
 * Provides: analyzePaymentScreenshot(file)
 * Extracts: paid amount, recipient name/UPI, transaction ref, date/time
 * OCR provider is replaceable — respects env OCR_PROVIDER
 * For now, returns best-effort extraction via heuristics / OCR placeholder
 */

export interface ScreenshotAnalysis {
  paidAmount: number | null; // e.g., 50.00
  recipientName: string | null;
  recipientUpiId: string | null;
  transactionReference: string | null;
  paymentDateTime: string | null;
  rawText?: string; // OCR raw if available
  provider: string; // "none" | "tesseract" etc
  confidence?: number;
}

async function tryOcr(file: File): Promise<string | null> {
  const provider = (import.meta.env.VITE_OCR_PROVIDER as string | undefined) ?? (typeof process !== "undefined" ? process.env.OCR_PROVIDER : undefined) ?? "";
  if (!provider || provider === "none") return null;
  // Placeholder for replaceable OCR.
  try {
    if (provider === "tesseract") {
      // Use variable import to avoid Vite bundling failure when not installed
      const modName = "tesseract.js";
      const mod = (await import(/* @vite-ignore */ modName as string)) as { createWorker: (lang: string) => Promise<{ recognize: (buf: unknown) => Promise<{ data: { text: string } }>; terminate: () => Promise<void> }> };
      const worker = await mod.createWorker("eng");
      const arrayBuf = await file.arrayBuffer();
      const { data } = await worker.recognize(arrayBuf as unknown as string);
      await worker.terminate();
      return data.text;
    }
  } catch {
    return null;
  }
  return null;
}

function extractFromText(text: string): Partial<ScreenshotAnalysis> {
  // Heuristic regexes — best effort
  const amountMatch = text.match(/(?:₹|Rs\.?|INR)\s*([0-9]+(?:\.[0-9]{1,2})?)/i) || text.match(/Paid\s*([0-9]+)/i);
  const upiMatch = text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+/);
  const txnMatch = text.match(/(?:UPI Ref|Transaction ID|Txn ID|Ref No|UTR)\s*[:\-]?\s*([A-Z0-9]{8,20})/i) || text.match(/\b([0-9]{12})\b/);
  const recipientMatch = text.match(/(?:To|Paid to|Recipient)[:\s]+([A-Za-z ]{2,40})/i);

  return {
    paidAmount: amountMatch ? parseFloat(amountMatch[1]) : null,
    recipientUpiId: upiMatch ? upiMatch[0] : null,
    transactionReference: txnMatch ? txnMatch[1].trim().toUpperCase() : null,
    recipientName: recipientMatch ? recipientMatch[1].trim() : null,
  };
}

export async function analyzePaymentScreenshot(file: File): Promise<ScreenshotAnalysis> {
  // Basic corrupted check: try to load image
  try {
    const url = URL.createObjectURL(file);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        URL.revokeObjectURL(url);
        // Check dimensions not zero
        if (img.width === 0 || img.height === 0) reject(new Error("Corrupted image"));
        else resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Unreadable image"));
      };
      img.src = url;
    });
  } catch {
    return {
      paidAmount: null,
      recipientName: null,
      recipientUpiId: null,
      transactionReference: null,
      paymentDateTime: null,
      provider: "none",
    };
  }

  const ocrText = await tryOcr(file);
  if (ocrText) {
    const extracted = extractFromText(ocrText);
    return {
      paidAmount: extracted.paidAmount ?? null,
      recipientName: extracted.recipientName ?? null,
      recipientUpiId: extracted.recipientUpiId ?? null,
      transactionReference: extracted.transactionReference ?? null,
      paymentDateTime: null,
      rawText: ocrText,
      provider: (import.meta.env.VITE_OCR_PROVIDER as string) ?? "tesseract",
    };
  }

  // No OCR configured — return nulls, allow backend to still validate amount via expectedAmount
  return {
    paidAmount: null,
    recipientName: null,
    recipientUpiId: null,
    transactionReference: null,
    paymentDateTime: null,
    provider: "none",
  };
}

// For backend: analyze from buffer + mime (Node)
export async function analyzePaymentScreenshotBuffer(_buffer: Buffer, _mime: string): Promise<ScreenshotAnalysis> {
  // Placeholder for server OCR (same env check). Could use tesseract node or cloud vision.
  // Keep replaceable — respects OCR_PROVIDER env
  const provider = process.env.OCR_PROVIDER ?? "none";
  if (provider === "none") {
    return {
      paidAmount: null,
      recipientName: null,
      recipientUpiId: null,
      transactionReference: null,
      paymentDateTime: null,
      provider: "none",
    };
  }
  // If provider configured, implement here (e.g., Google Vision)
  return {
    paidAmount: null,
    recipientName: null,
    recipientUpiId: null,
    transactionReference: null,
    paymentDateTime: null,
    provider,
  };
}
