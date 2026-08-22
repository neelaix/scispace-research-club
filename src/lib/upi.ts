import { getEffectiveUpiId, getEffectiveRecipientName } from "../config/payment";
import { TICKET_PRICING } from "../config/interstellar";

/**
 * Generate dynamic UPI payment URI.
 * Format: upi://pay?pa=UPI_ID&pn=Name&am=Amount&cu=INR&tn=Note
 * Amount must be formatted with 2 decimals for UPI spec.
 */
export function generateUpiUri(attendeeCount: number, note = "Interstellar SciSpace"): string {
  const total = attendeeCount * TICKET_PRICING.pricePerPerson; // server calc, never trust frontend total
  const upiId = getEffectiveUpiId();
  const recipient = getEffectiveRecipientName();
  const am = total.toFixed(2);
  const params = new URLSearchParams({
    pa: upiId,
    pn: recipient,
    am,
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

export function getUpiDisplay(attendeeCount: number): {
  upiId: string;
  recipientName: string;
  total: number;
  uri: string;
  breakdown: string;
} {
  const total = attendeeCount * TICKET_PRICING.pricePerPerson;
  const upiId = getEffectiveUpiId();
  const recipientName = getEffectiveRecipientName();
  return {
    upiId,
    recipientName,
    total,
    uri: generateUpiUri(attendeeCount),
    breakdown: `₹25 × ${attendeeCount} = ₹${total}`,
  };
}
