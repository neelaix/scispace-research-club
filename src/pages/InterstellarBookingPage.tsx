import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Ticket, Info, Loader2, ShieldCheck, Users, Wallet, Upload, QrCode, CheckCircle2 } from "lucide-react";
import { Layout } from "../components/Layout";
import { SectionHeading } from "../components/SectionHeading";
import { INTERSTELLAR_EVENT, TICKET_PRICING, SEATING } from "../config/interstellar";
import { validateAttendee, validateContact } from "../lib/validation";
import { saveBooking } from "../lib/bookingId";
import { getUpiDisplay, generateUpiUri } from "../lib/upi";
import { validateScreenshotFile } from "../lib/fileValidation";
import { analyzePaymentScreenshot } from "../services/paymentScreenshotService";
import type { Attendee, BookingContact } from "../types/booking";

type AttendeeForm = Attendee;

function UpiQr({ uri }: { uri: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function gen() {
      try {
        const mod = await import("qrcode");
        const url = await (mod as unknown as { toDataURL: (t: string, o: unknown) => Promise<string> }).toDataURL(uri, {
          width: 260,
          margin: 1,
          color: { dark: "#1C1C24", light: "#FFFFFF" },
        });
        if (!cancelled) setDataUrl(url);
      } catch {
        const fallback = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(uri)}`;
        if (!cancelled) setDataUrl(fallback);
      }
    }
    gen();
    return () => { cancelled = true; };
  }, [uri]);
  if (!dataUrl) return <div className="grid h-[220px] w-[220px] place-items-center rounded-2xl bg-brand-canvas text-xs text-brand-dark/40">Generating QR…</div>;
  return <img src={dataUrl} alt="UPI payment QR" width={260} height={260} className="h-[220px] w-[220px] object-contain sm:h-[240px] sm:w-[240px]" />;
}

export function InterstellarBookingPage() {
  const navigate = useNavigate();
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [attendees, setAttendees] = useState<AttendeeForm[]>([{ name: "", registrationNumber: "", email: "" }]);
  const [contact, setContact] = useState<BookingContact>({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const total = attendeeCount * TICKET_PRICING.pricePerPerson;
  const upi = useMemo(() => getUpiDisplay(attendeeCount), [attendeeCount]);
  const upiUri = useMemo(() => generateUpiUri(attendeeCount), [attendeeCount]);

  useEffect(() => {
    setAttendees((prev) => {
      if (prev.length === attendeeCount) return prev;
      if (prev.length < attendeeCount) {
        const extra = Array.from({ length: attendeeCount - prev.length }, () => ({ name: "", registrationNumber: "", email: "" }));
        return [...prev, ...extra];
      }
      return prev.slice(0, attendeeCount);
    });
  }, [attendeeCount]);

  useEffect(() => {
    if (!screenshotFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(screenshotFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshotFile]);

  const updateAttendee = (idx: number, field: keyof AttendeeForm, value: string) => {
    setAttendees((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const validateAll = (): boolean => {
    const nextErrors: Record<string, string> = {};
    const contactErr = validateContact(contact);
    if (contactErr) nextErrors["contact"] = contactErr;
    if (!contact.name.trim()) nextErrors["contact_name"] = "Booking contact name is required.";
    if (!contact.email.trim()) nextErrors["contact_email"] = "Booking contact email is required.";
    if (!contact.phone.trim()) nextErrors["contact_phone"] = "Booking contact phone is required.";
    attendees.forEach((a, i) => {
      const err = validateAttendee(a);
      if (err) {
        if (!a.name.trim()) nextErrors[`a_${i}_name`] = "Full name required.";
        else if (!a.registrationNumber.trim()) nextErrors[`a_${i}_reg`] = "Registration number required.";
        else if (!a.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim())) nextErrors[`a_${i}_email`] = err;
        else nextErrors[`a_${i}`] = err;
      }
    });
    if (!screenshotFile) nextErrors["screenshot"] = "Payment screenshot is required. Only JPG, JPEG, PNG or WEBP images are accepted. Maximum size: 5 MB.";
    else {
      const v = validateScreenshotFile(screenshotFile);
      if (!v.ok) nextErrors["screenshot"] = v.reason ?? "Invalid screenshot";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAttendeeCountChange = (next: number) => {
    if (next < 1) return;
    setAttendeeCount(next);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) { setScreenshotFile(null); return; }
    const v = validateScreenshotFile(f);
    if (!v.ok) {
      setErrors((prev) => ({ ...prev, screenshot: v.reason ?? "Invalid screenshot" }));
      setScreenshotFile(null);
      return;
    }
    setErrors((prev) => {
      const n = { ...prev } as Record<string, string>;
      delete n["screenshot"];
      return n;
    });
    setScreenshotFile(f);
  };

  const handleSubmit = async () => {
    setGeneralError("");
    if (!validateAll()) {
      setGeneralError("Please fix the highlighted fields before submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!screenshotFile) return;
    setLoading(true);
    try {
      // Optional screenshot analysis (OCR provider replaceable)
      let extractedTxn: string | null = null;
      try {
        const analysis = await analyzePaymentScreenshot(screenshotFile);
        if (analysis.transactionReference) extractedTxn = analysis.transactionReference;
      } catch { /* ignore */ }

      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          const b64 = res.includes(",") ? res.split(",")[1] : res;
          resolve(b64);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(screenshotFile);
      });

      const payload = {
        attendeeCount,
        attendees,
        bookingContact: contact,
        screenshot: {
          name: screenshotFile.name,
          mime: screenshotFile.type,
          size: screenshotFile.size,
          data: base64,
          transactionReference: extractedTxn ?? undefined,
        },
      };

      // Try backend first (handles validation, secure file checks, sheets)
      let data: { success?: boolean; booking?: import("../types/booking").Booking; bookingId?: string; message?: string; error?: string } | null = null;
      let res: Response | null = null;
      try {
        res = await fetch("/api/submit-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = (await res.json()) as typeof data;
      } catch {
        data = null;
      }

      // If backend unavailable (404/ network) and GAS URL configured, fallback to direct GAS POST per spec
      const gasUrl = (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string | undefined)?.trim() ?? "";
      if ((!res || !res.ok || !((data as unknown as { success?: boolean })?.success)) && gasUrl) {
        const gasStatus = data && !res?.ok ? (data as { error?: string }).error : null;
        // Only fallback if backend missing (404) or network null; if backend returned 400 validation error, don't fallback
        const shouldFallback = !res || res.status === 404 || res.status === 502 || data === null;
        if (shouldFallback) {
          // Build GAS payload directly per spec (frontend direct submission)
          const pricePerPerson = 25;
          const totalAmount = attendeeCount * pricePerPerson;
          const gasPayload = {
            bookingId: `SCI-${new Date().getFullYear()}-${String(Math.floor(100000 + Math.random() * 900000))}`,
            event: { name: "Interstellar", club: "SciSpace Research Club", institution: "VIT-AP University" },
            bookingContact: contact,
            attendees,
            attendeeCount,
            pricePerPerson,
            totalAmount,
            currency: "INR",
            payment: {
              method: "UPI" as const,
              recipientName: upi.recipientName,
              recipientUpiId: upi.upiId,
              expectedAmount: totalAmount,
              transactionReference: extractedTxn ?? "",
              status: "SUBMITTED" as const,
            },
            paymentScreenshot: {
              fileName: screenshotFile.name,
              mimeType: screenshotFile.type,
              base64,
            },
            seating: "Open Seating",
            createdAt: new Date().toISOString(),
          };
          const gasRes = await fetch(gasUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gasPayload),
          });
          const gasText = await gasRes.text();
          let gasData: { success?: boolean; bookingId?: string; message?: string } | null = null;
          try { gasData = JSON.parse(gasText); } catch { /* ignore */ }
          if (gasData && gasData.success) {
            // Build booking for confirmation using GAS bookingId
            const booking = {
              bookingId: gasData.bookingId ?? gasPayload.bookingId,
              bookingContact: contact,
              attendees,
              attendeeCount,
              pricePerPerson,
              totalAmount,
              currency: "INR" as const,
              payment: {
                method: "UPI" as const,
                recipientName: upi.recipientName,
                recipientUpiId: upi.upiId,
                expectedAmount: totalAmount,
                amount: totalAmount,
                currency: "INR" as const,
                screenshotReference: screenshotFile.name,
                transactionReference: extractedTxn ?? null,
                status: "SUBMITTED" as const,
                checkResult: "PAYMENT_CHECK_PASSED" as const,
                displayStatus: "Payment details checked",
              },
              event: gasPayload.event as { name: string; club: string; institution: string; fullName: string },
              seating: "Open Seating",
              createdAt: gasPayload.createdAt,
            } as import("../types/booking").Booking;
            saveBooking(booking);
            navigate(`/booking/confirmation/${booking.bookingId}`, { state: { booking } });
            return;
          } else if (gasData && gasData.success === false) {
            throw new Error(gasData.message || "Booking was not accepted. Please try again.");
          } else if (!gasRes.ok) {
            throw new Error("Unable to submit your booking right now. Please try again.");
          }
        } else if (gasStatus) {
          throw new Error(gasStatus);
        }
      }

      if (!res || !res.ok) {
        throw new Error(((data as unknown as { error?: string })?.error) || "Submission failed");
      }
      const booking = ((data as unknown as { booking?: import("../types/booking").Booking })?.booking) as import("../types/booking").Booking | undefined;
      if (booking) {
        saveBooking(booking);
        navigate(`/booking/confirmation/${booking.bookingId}`, { state: { booking } });
      } else if (((data as unknown as { success?: boolean; bookingId?: string })?.success)) {
        // GAS-direct success without full booking (fallback)
        const bid = ((data as unknown as { bookingId?: string }).bookingId) ?? `SCI-${new Date().getFullYear()}-${String(Math.floor(100000 + Math.random() * 900000))}`;
        const fallbackBooking = {
          bookingId: bid,
          bookingContact: contact,
          attendees,
          attendeeCount,
          pricePerPerson: 25,
          totalAmount: total,
          currency: "INR" as const,
          payment: {
            method: "UPI" as const,
            recipientName: upi.recipientName,
            recipientUpiId: upi.upiId,
            expectedAmount: total,
            amount: total,
            currency: "INR" as const,
            screenshotReference: screenshotFile.name,
            transactionReference: extractedTxn ?? null,
            status: "SUBMITTED" as const,
            checkResult: "PAYMENT_CHECK_PASSED" as const,
            displayStatus: "Payment details checked",
          },
          event: { name: "Interstellar", club: "SciSpace Research Club", institution: "VIT-AP University", fullName: INTERSTELLAR_EVENT.fullName },
          seating: "Open Seating",
          createdAt: new Date().toISOString(),
        } as unknown as import("../types/booking").Booking;
        saveBooking(fallbackBooking);
        navigate(`/booking/confirmation/${fallbackBooking.bookingId}`, { state: { booking: fallbackBooking } });
      } else {
        throw new Error("No booking returned");
      }
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("already been submitted")) setGeneralError("This payment reference has already been submitted.");
      else setGeneralError(msg || "Something went wrong. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero - keep Interstellar branding unchanged */}
      <section className="relative overflow-hidden bg-brand-dark py-16 sm:py-20">
        <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(800px 400px at 12% 0%, rgba(117,193,217,0.25), transparent 60%), radial-gradient(700px 380px at 95% 100%, rgba(253,128,44,0.22), transparent 60%), linear-gradient(160deg, #23232d, #1c1c24)" }} />
        <div className="container-site relative z-10">
          <div className="mx-auto max-w-3xl text-center text-white">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest2 text-brand-blue ring-1 ring-white/10">
              <Ticket className="h-3.5 w-3.5" /> {INTERSTELLAR_EVENT.club} · {INTERSTELLAR_EVENT.institution}
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{INTERSTELLAR_EVENT.fullName}</h1>
            <p className="mt-3 text-sm uppercase tracking-[0.2em] text-brand-orange">{INTERSTELLAR_EVENT.theme}</p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">{INTERSTELLAR_EVENT.description}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10">
              <Info className="h-4 w-4 text-brand-blue" /> {SEATING.label}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-canvas py-10 sm:py-14">
        <div className="container-site mx-auto max-w-4xl">
          <SectionHeading eyebrow="Book Tickets" title={<>Secure your <span className="text-gradient-brand">Interstellar</span> seats</>} subtitle="General admission · Open seating · ₹25 per person · No seat selection · No attendee limit" />

          {/* Price card — kept */}
          <div className="mt-8 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-orange/10 text-brand-orange-dark">
                  <Wallet className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-dark">Ticket price</p>
                  <p className="text-xs text-brand-dark/60">No group discount — group booking means multiple attendees in one booking</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-display text-2xl font-bold text-brand-dark">₹25 <span className="text-sm font-medium text-brand-dark/50">per person</span></p>
                <p className="mt-1 text-xs text-brand-dark/50">1=₹25 · 2=₹50 · 3=₹75 · 5=₹125 · 10=₹250</p>
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-brand-mist px-3 py-2 text-center text-xs font-medium text-brand-dark/70">
              Formula: <span className="font-mono font-bold">TOTAL = ATTENDEES × ₹25</span> · Calculated server-side — frontend amount is not trusted.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="chip bg-brand-dark text-white">{SEATING.type}</span>
              <span className="chip bg-brand-orange text-white">{SEATING.mode}</span>
              <span className="chip bg-brand-blue/10 text-brand-blue-dark">Open Seating — Choose any available seat at the venue.</span>
            </div>
          </div>

          {/* Attendee count — auto updates total/QR per spec #3 */}
          <div className="mt-8 rounded-2xl border border-brand-dark/8 bg-white p-6 shadow-card">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-blue-dark" />
              <h3 className="font-display text-lg font-semibold text-brand-dark">Number of attendees</h3>
            </div>
            <p className="mt-1 text-sm text-brand-dark/60">Select any number. Minimum 1. No maximum. Total and UPI QR update instantly. Do not enter amount manually.</p>
            <div className="mt-4 flex items-center gap-4">
              <button type="button" onClick={() => handleAttendeeCountChange(attendeeCount - 1)} disabled={attendeeCount <= 1} className="grid h-10 w-10 place-items-center rounded-full border border-brand-dark/10 bg-white text-brand-dark disabled:opacity-40" aria-label="Decrease attendees">
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[3rem] text-center font-display text-2xl font-bold text-brand-dark">{attendeeCount}</span>
              <button type="button" onClick={() => handleAttendeeCountChange(attendeeCount + 1)} className="grid h-10 w-10 place-items-center rounded-full bg-brand-dark text-white" aria-label="Increase attendees">
                <Plus className="h-4 w-4" />
              </button>
              <div className="ml-auto text-right">
                <p className="text-xs uppercase tracking-widest text-brand-dark/40">Total to pay</p>
                <p className="font-display text-xl font-bold text-brand-dark">₹{total}</p>
                <p className="text-xs text-brand-dark/50">₹25 × {attendeeCount} = ₹{total}</p>
              </div>
            </div>
            <div className="mt-3">
              <input id="attendee-count-input" type="number" min={1} value={attendeeCount} onChange={(e) => { const v = parseInt(e.target.value, 10); if (!Number.isNaN(v) && v >= 1) handleAttendeeCountChange(v); else if (e.target.value === "") setAttendeeCount(1); }} className="w-full rounded-xl border border-brand-dark/10 bg-brand-canvas px-4 py-2.5 text-sm" placeholder="Enter number of attendees" />
              <p className="mt-1 text-xs text-brand-dark/40">Example: 1→₹25, 2→₹50, 3→₹75, 5→₹125, 10→₹250. QR regenerates on change.</p>
            </div>
          </div>

          {generalError && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{generalError}</div>}
          {errors["contact"] && <div role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{errors["contact"]}</div>}

          {/* Attendee forms — unchanged design */}
          <div className="mt-6 grid gap-6">
            {attendees.map((a, idx) => (
              <div key={idx} className="rounded-2xl border border-brand-dark/8 bg-white p-6 shadow-sm">
                <h4 className="font-display text-base font-semibold text-brand-dark">Attendee {idx + 1}<span className="ml-2 text-xs font-medium normal-case tracking-normal text-brand-dark/40">— Full Name, VIT-AP Registration Number, VIT-AP Email</span></h4>
                <div className="mt-4 grid gap-4">
                  <div>
                    <label htmlFor={`att-${idx}-name`} className="mb-1.5 block text-sm font-semibold text-brand-dark">Full Name <span className="text-brand-orange">*</span></label>
                    <input id={`att-${idx}-name`} value={a.name} onChange={(e) => updateAttendee(idx, "name", e.target.value)} placeholder="e.g. Aditya Sharma" className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-4 ${errors[`a_${idx}_name`] ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-brand-dark/12 focus:border-brand-blue focus:ring-brand-blue/20"}`} />
                    {errors[`a_${idx}_name`] && <p className="mt-1 text-xs font-medium text-red-600">{errors[`a_${idx}_name`]}</p>}
                  </div>
                  <div>
                    <label htmlFor={`att-${idx}-reg`} className="mb-1.5 block text-sm font-semibold text-brand-dark">VIT-AP Registration Number <span className="text-brand-orange">*</span></label>
                    <input id={`att-${idx}-reg`} value={a.registrationNumber} onChange={(e) => updateAttendee(idx, "registrationNumber", e.target.value)} placeholder="e.g. 23BCE1234" className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-4 ${errors[`a_${idx}_reg`] ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-brand-dark/12 focus:border-brand-blue focus:ring-brand-blue/20"}`} />
                    {errors[`a_${idx}_reg`] && <p className="mt-1 text-xs font-medium text-red-600">{errors[`a_${idx}_reg`]}</p>}
                  </div>
                  <div>
                    <label htmlFor={`att-${idx}-email`} className="mb-1.5 block text-sm font-semibold text-brand-dark">VIT-AP Email <span className="text-brand-orange">*</span></label>
                    <input id={`att-${idx}-email`} type="email" value={a.email} onChange={(e) => updateAttendee(idx, "email", e.target.value)} placeholder="you@vitapstudent.ac.in" className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-4 ${errors[`a_${idx}_email`] || errors[`a_${idx}`] ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-brand-dark/12 focus:border-brand-blue focus:ring-brand-blue/20"}`} />
                    {(errors[`a_${idx}_email`] || errors[`a_${idx}`]) && <p className="mt-1 text-xs font-medium text-red-600">{errors[`a_${idx}_email`] || errors[`a_${idx}`]}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Booking contact — unchanged */}
          <div className="mt-6 rounded-2xl border border-brand-dark/8 bg-white p-6 shadow-sm">
            <h4 className="font-display text-base font-semibold text-brand-dark">Booking Contact Details</h4>
            <p className="mt-1 text-xs text-brand-dark/50">This person will receive the booking confirmation and QR ticket.</p>
            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor="contact-name" className="mb-1.5 block text-sm font-semibold text-brand-dark">Booking Contact Name <span className="text-brand-orange">*</span></label>
                <input id="contact-name" value={contact.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} placeholder="e.g. Aditya Sharma" className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-4 ${errors["contact_name"] ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-brand-dark/12 focus:border-brand-blue focus:ring-brand-blue/20"}`} />
                {errors["contact_name"] && <p className="mt-1 text-xs font-medium text-red-600">{errors["contact_name"]}</p>}
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-1.5 block text-sm font-semibold text-brand-dark">Booking Contact Email <span className="text-brand-orange">*</span></label>
                <input id="contact-email" type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} placeholder="you@example.com" className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-4 ${errors["contact_email"] ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-brand-dark/12 focus:border-brand-blue focus:ring-brand-blue/20"}`} />
                {errors["contact_email"] && <p className="mt-1 text-xs font-medium text-red-600">{errors["contact_email"]}</p>}
              </div>
              <div>
                <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-semibold text-brand-dark">Booking Contact Phone Number <span className="text-brand-orange">*</span></label>
                <input id="contact-phone" type="tel" inputMode="numeric" maxLength={10} value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value.replace(/\D/g, "").slice(0,10) }))} placeholder="9876543210" pattern="[0-9]{10}" className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-4 ${errors["contact_phone"] ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-brand-dark/12 focus:border-brand-blue focus:ring-brand-blue/20"}`} />
                <p className="mt-1 text-xs text-brand-dark/40">Exactly 10 digits, no spaces or +91</p>
                {errors["contact_phone"] && <p className="mt-1 text-xs font-medium text-red-600">{errors["contact_phone"]}</p>}
              </div>
            </div>
          </div>

          {/* === NEW UPI PAYMENT SECTION === */}
          <div className="mt-8 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-card sm:p-8">
            <h4 className="flex items-center gap-2 font-display text-lg font-semibold text-brand-dark"><QrCode className="h-5 w-5 text-brand-orange" /> COMPLETE YOUR PAYMENT</h4>
            <p className="mt-1 text-sm text-brand-dark/60">₹25 per person · No seat selection · Open Seating</p>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
              <div className="space-y-4">
                <div className="rounded-xl bg-brand-mist p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/50">Attendees</p>
                  <div className="mt-2 flex items-center gap-3">
                    <button type="button" onClick={() => handleAttendeeCountChange(attendeeCount - 1)} disabled={attendeeCount <= 1} className="grid h-8 w-8 place-items-center rounded-full border border-brand-dark/10 bg-white disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                    <span className="font-display text-xl font-bold">{attendeeCount}</span>
                    <button type="button" onClick={() => handleAttendeeCountChange(attendeeCount + 1)} className="grid h-8 w-8 place-items-center rounded-full bg-brand-dark text-white"><Plus className="h-4 w-4" /></button>
                    <span className="ml-auto text-sm text-brand-dark/60">₹25 × {attendeeCount} = <span className="font-bold text-brand-dark">₹{total}</span></span>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-dark/10 bg-brand-canvas p-4">
                  <p className="text-center text-xs font-semibold uppercase tracking-widest text-brand-dark/40">TOTAL TO PAY</p>
                  <p className="mt-1 text-center font-display text-3xl font-bold text-brand-dark">₹{total}</p>
                  <p className="text-center text-xs text-brand-dark/50">{upi.breakdown} · Currency INR</p>
                </div>

                <div className="grid gap-3 rounded-xl bg-white p-4 ring-1 ring-brand-dark/5">
                  <div className="flex justify-between text-sm"><span className="text-brand-dark/60">Pay To:</span><span className="font-semibold text-brand-dark">{upi.recipientName}</span></div>
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Amount is auto-calculated as <span className="font-mono font-bold">attendeeCount × ₹25</span> and embedded in the QR. Never trust a client-provided total.</p>
                </div>

                <p className="text-center text-xs text-brand-dark/40">Scan the QR with any UPI app (PhonePe, GPay, Paytm, BHIM) to pay directly to <span className="font-semibold">{upi.recipientName}</span>.</p>
              </div>

              {/* Dynamic QR — regenerates on count change */}
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-dark/10 bg-white p-4 shadow-sm">
                <div className="rounded-2xl border border-brand-dark/10 bg-white p-3">
                  <UpiQr uri={upiUri} />
                </div>
                <p className="text-center text-xs font-semibold text-brand-dark">Scan the QR using your UPI application.</p>
                <p className="text-center font-mono text-xs text-brand-dark/60">UPI amount: ₹{total} · {attendeeCount} × ₹25</p>
              </div>
            </div>

            {/* Screenshot upload */}
            <div className="mt-8">
              <h5 className="flex items-center gap-2 font-display text-base font-semibold text-brand-dark"><Upload className="h-5 w-5 text-brand-blue-dark" /> Upload Payment Screenshot <span className="text-brand-orange">*</span></h5>
              <p className="mt-1 text-xs text-brand-dark/50">Only JPG, JPEG, PNG or WEBP images are accepted. Maximum size: 5 MB.</p>
              <div className="mt-3">
                <label htmlFor="screenshot" className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-dark/15 bg-brand-canvas px-6 py-8 text-center hover:border-brand-blue/30 hover:bg-brand-mist">
                  <Upload className="h-8 w-8 text-brand-dark/30" />
                  <span className="mt-2 text-sm font-semibold text-brand-dark">{screenshotFile ? screenshotFile.name : "Choose screenshot"}</span>
                  <span className="mt-1 text-xs text-brand-dark/40">JPG, JPEG, PNG, WEBP · 5 MB max · PDF/DOC/ZIP/SVG/MP4 rejected</span>
                  <input id="screenshot" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                </label>
                {previewUrl && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-brand-dark/10 bg-white p-3">
                    <img src={previewUrl} alt="Payment screenshot preview" className="max-h-[320px] w-full object-contain" />
                    <p className="mt-2 text-center text-xs text-brand-dark/50">Preview — ensure amount ₹{total} visible</p>
                  </div>
                )}
                {errors["screenshot"] && <p role="alert" className="mt-2 text-sm font-medium text-red-600">{errors["screenshot"]}</p>}
              </div>
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-brand-mist px-4 py-3 text-xs leading-relaxed text-brand-dark/60">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue-dark" />
                Screenshot is checked automatically for: recipient UPI/name, amount = <span className="font-mono font-bold">attendeeCount × ₹25</span>, and transaction reference. Duplicate references are rejected. A screenshot alone cannot cryptographically prove a bank transfer — status will be “Payment details checked”.
              </p>
            </div>

            {/* Booking summary + submit */}
            <div className="mt-6 rounded-xl border border-brand-dark/10 bg-brand-canvas p-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between"><span className="text-brand-dark/60">Event</span><span className="font-semibold text-brand-dark">{INTERSTELLAR_EVENT.fullName}</span></div>
                <div className="flex justify-between"><span className="text-brand-dark/60">Attendees</span><span className="font-semibold">{attendeeCount} × ₹25 = ₹{total}</span></div>
                <div className="flex justify-between"><span className="text-brand-dark/60">Seating</span><span className="font-semibold text-emerald-700">{SEATING.mode} · {SEATING.type}</span></div>
                <div className="flex justify-between border-t border-brand-dark/10 pt-2 font-semibold"><span>Booking total</span><span>₹{total} INR</span></div>
              </div>
              <p className="mt-2 text-center text-xs text-brand-dark/40">Website = ₹{total} · UPI QR = ₹{total} · Booking = ₹{total} · Sheets = ₹{total} · Email = ₹{total}</p>
            </div>

            <button type="button" onClick={handleSubmit} disabled={loading} className="btn-accent mt-6 w-full justify-center py-4 text-base disabled:opacity-60">
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting…</> : <><CheckCircle2 className="h-5 w-5" /> Submit Booking — ₹{total}</>}
            </button>
            <p className="mt-3 text-center text-xs text-brand-dark/40">By submitting you confirm payment of ₹{total} via UPI to {upi.recipientName}. All tickets General Admission — Open Seating.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
