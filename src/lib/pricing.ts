import { TICKET_PRICING } from "../config/interstellar";

export function calculateTotal(attendeeCount: number): number {
  if (!Number.isInteger(attendeeCount) || attendeeCount < 1) {
    throw new Error("Attendee count must be an integer >= 1");
  }
  return attendeeCount * TICKET_PRICING.pricePerPerson;
}

export function formatINR(amount: number): string {
  return `₹${amount}`;
}

export function getPricingBreakdown(attendeeCount: number) {
  const pricePerPerson = TICKET_PRICING.pricePerPerson;
  const total = calculateTotal(attendeeCount);
  return {
    attendeeCount,
    pricePerPerson,
    totalAmount: total,
    currency: TICKET_PRICING.currency,
    display: `${attendeeCount} × ₹${pricePerPerson} = ₹${total}`,
  };
}
