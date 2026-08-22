export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^[0-9]{10}$/;

export function validateAttendee(a: { name: string; registrationNumber: string; email: string }): string | null {
  if (!a.name.trim() || a.name.trim().length < 2) return "Full name is required (min 2 characters).";
  if (!a.registrationNumber.trim()) return "VIT-AP Registration Number is required.";
  if (!a.email.trim()) return "VIT-AP Email is required.";
  if (!EMAIL_RE.test(a.email.trim())) return "Please enter a valid email address.";
  return null;
}

export function validateContact(c: { name: string; email: string; phone: string }): string | null {
  if (!c.name.trim() || c.name.trim().length < 2) return "Booking contact name is required.";
  if (!c.email.trim()) return "Booking contact email is required.";
  if (!EMAIL_RE.test(c.email.trim())) return "Please enter a valid booking contact email.";
  if (!c.phone.trim()) return "Booking contact phone number is required.";
  const digits = c.phone.replace(/\D/g, "");
  if (digits.length !== 10) return "Phone number must be exactly 10 digits.";
  if (!PHONE_RE.test(digits)) return "Phone number must be exactly 10 digits.";
  return null;
}
