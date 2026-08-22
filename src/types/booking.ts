export interface Attendee {
  name: string;
  registrationNumber: string;
  email: string;
}

export interface BookingContact {
  name: string;
  email: string;
  phone: string;
}

export interface BookingPayment {
  method: "UPI";
  recipientName: string;
  recipientUpiId: string;
  expectedAmount: number;
  amount: number; // same as expectedAmount for consistency
  currency: string;
  screenshotReference: string; // safe stored filename
  transactionReference: string | null; // extracted if available
  status: "PAYMENT_CHECK_PASSED" | "PAYMENT_CHECK_FAILED" | "PAYMENT_SUBMISSION_RECEIVED" | "PENDING_REVIEW" | "SUBMITTED";
  checkResult: "PAYMENT_CHECK_PASSED" | "PAYMENT_CHECK_FAILED";
  // For display only, never claim bank verified from screenshot alone
  displayStatus: string; // "Payment details checked" | "Payment submission received"
}

export interface Booking {
  bookingId: string;
  bookingContact: BookingContact;
  attendees: Attendee[];
  attendeeCount: number;
  pricePerPerson: number;
  totalAmount: number;
  currency: string;
  payment: BookingPayment;
  event: {
    name: string;
    club: string;
    institution: string;
    fullName: string;
  };
  seating: string; // "Open Seating"
  createdAt: string;
  // For Google Sheets / email parity
  venue?: string;
}

// For API submission (multipart or JSON with base64)
export interface SubmitBookingRequest {
  attendeeCount: number;
  attendees: Attendee[];
  bookingContact: BookingContact;
  // screenshot as base64 or file ref — frontend will send base64 JSON for simplicity
  screenshot?: {
    name: string;
    mime: string;
    size: number;
    data: string; // base64 without prefix
  };
  // optional extracted transaction ref if user pasted? Not needed, backend extracts
}

export interface SubmitBookingResponse {
  success: boolean;
  booking?: Booking;
  message?: string;
  check?: string;
}
