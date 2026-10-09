import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, Ticket, UserRound,
  BadgeCheck, Zap, Lock, CreditCard, CheckCircle2, Pencil, Upload, Copy, Check,
} from "lucide-react";
import QRCode from "qrcode";
import { Layout } from "../components/Layout";
import { QCONNECT } from "../config/qconnect";
import { QuantumBackdrop, QuantumGrid, QuantumParticles } from "../components/qconnect/QuantumBackdrop";

// ─── Participant fields (exactly 1) ───────────────────────────────────────────
interface Participant {
  fullName:           string;
  registrationNumber: string;
  phone:              string;
  email:              string;
}

const blank = (): Participant => ({ fullName: "", registrationNumber: "", phone: "", email: "" });

function validate(p: Participant): Partial<Record<keyof Participant, string>> {
  const errs: Partial<Record<keyof Participant, string>> = {};
  if (!/^[a-zA-Z\s.'-]{2,80}$/.test(p.fullName.trim()))
    errs.fullName = "Enter a valid full name.";
  if (!/^[A-Za-z0-9-]{5,20}$/.test(p.registrationNumber.trim()))
    errs.registrationNumber = "Enter a valid registration number.";
  if (!/^[0-9]{10}$/.test(p.phone.replace(/\D/g, "")))
    errs.phone = "Enter a valid 10-digit phone number.";
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(p.email.trim()))
    errs.email = "Enter a valid email address.";
  return errs;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result ?? "");
      const i = s.indexOf("base64,");
      resolve(i >= 0 ? s.slice(i + 7) : s);
    };
    r.onerror = () => reject(new Error("Could not read the screenshot file."));
    r.readAsDataURL(file);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
// Manual UPI flow (no payment gateway):
// Step 1: Participant Details → POST /api/qconnect/collect → LEADS tab.
// Step 2: UPI instructions/QR → upload screenshot + tick checkbox →
//         POST /api/qconnect/submit → Drive + REGISTRATIONS PENDING row.
// Confirmation email is sent MANUALLY later from spaceresearch.club@vitap.ac.in.
export function QConnectRegisterPage() {
  const nav = useNavigate();
  const [p,       setP]       = useState<Participant>(blank());
  const [errs,    setErrs]    = useState<Partial<Record<keyof Participant, string>>>({});
  const [busy,    setBusy]    = useState(false);
  const [payBusy, setPayBusy] = useState(false);
  const [fail,    setFail]    = useState("");
  const [payFail, setPayFail] = useState("");
  const [saved,   setSaved]   = useState(false);
  const [leadId,  setLeadId]  = useState<string | null>(null);
  const [qrSrc,   setQrSrc]   = useState("");
  const [copied,  setCopied]  = useState(false);
  const [shot,    setShot]    = useState<File | null>(null);
  const [ticked,  setTicked]  = useState(false);
  const [seats,   setSeats]   = useState<{ seatsLeft: number; registered: number; capacity: number } | null>(null);

  // Live seats badge (Sheet truth) — refreshes so submit visibly moves the count
  useEffect(() => {
    let cancelled = false;
    const loadSeats = async () => {
      try {
        const r = await fetch("/api/qconnect/seats?fresh=1", { cache: "no-store" });
        const j = await r.json();
        if (!cancelled && r.ok && typeof j.seatsLeft === "number") {
          const next = { seatsLeft: j.seatsLeft, registered: j.registered ?? 0, capacity: j.capacity ?? QCONNECT.MAX_PARTICIPANTS };
          // Glitch guard: a fallback response must never lower the shown count.
          setSeats((prev) => (prev && j.fallback === true && next.registered < prev.registered ? prev : next));
        }
      } catch { /* badge stays hidden */ }
    };
    loadSeats();
    const t = setInterval(loadSeats, 10_000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const setField = (k: keyof Participant, v: string) => {
    setP((prev) => ({ ...prev, [k]: v }));
    if (errs[k]) setErrs((prev) => ({ ...prev, [k]: undefined }));
  };

  // UPI QR for exact ₹50 (generated client-side, no gateway)
  useEffect(() => {
    const upiUrl =
      `upi://pay?pa=${encodeURIComponent(QCONNECT.UPI_ID)}` +
      `&pn=${encodeURIComponent(QCONNECT.UPI_PAYEE)}` +
      `&am=${QCONNECT.TICKET_PRICE}&cu=${QCONNECT.CURRENCY}` +
      `&tn=${encodeURIComponent(QCONNECT.UPI_NOTE)}`;
    QRCode.toDataURL(upiUrl, { width: 220, margin: 1 })
      .then(setQrSrc)
      .catch(() => setQrSrc(""));
  }, []);

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(QCONNECT.UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable — user can copy manually */ }
  };

  const submitDetails = async () => {
    if (busy) return;
    setFail("");

    // Validate
    const fieldErrs = validate(p);
    setErrs(fieldErrs);
    if (Object.keys(fieldErrs).length > 0) {
      document.getElementById("qconnect-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setBusy(true);
    try {
      let res: Response;
      try {
        res = await fetch("/api/qconnect/collect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participant: p }),
        });
      } catch {
        throw new Error("Cannot reach the server. Check your connection and try again.");
      }

      let data: Record<string, unknown>;
      const text = await res.text();
      try { data = text ? (JSON.parse(text) as Record<string, unknown>) : {}; }
      catch {
        // Non-JSON usually means the API route isn't running (e.g. `vite dev`
        // without `vercel dev`, or a proxy 500 page) — not a data problem.
        throw new Error(
          `Server error (${res.status}). The registration API did not return JSON — if testing locally, run the API with "vercel dev".`
        );
      }
      if (!res.ok) throw new Error((data.error as string) || "Could not save your details.");

      setLeadId((data.leadId as string) ?? null);
      setSaved(true);

      // Move to the next/payment section after successful save
      requestAnimationFrame(() => {
        document.getElementById("qconnect-payment")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (e) {
      setFail((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const editDetails = () => {
    setSaved(false);
    setFail("");
    setPayFail("");
    document.getElementById("qconnect-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onFile = (f: File | undefined) => {
    setPayFail("");
    if (!f) { setShot(null); return; }
    if (!ALLOWED_TYPES.includes(f.type.toLowerCase())) {
      setPayFail("Screenshot must be JPG, PNG or WebP.");
      return;
    }
    if (f.size > MAX_FILE_BYTES || f.size <= 0) {
      setPayFail("Screenshot must be 5MB or smaller.");
      return;
    }
    setShot(f);
  };

  const submitRegistration = async () => {
    if (payBusy || !saved) return;
    setPayFail("");
    if (!shot) { setPayFail("Please upload your payment screenshot."); return; }
    if (!ticked) { setPayFail("Please tick “I have uploaded my payment screenshot” to continue."); return; }

    setPayBusy(true);
    try {
      const dataBase64 = await fileToBase64(shot);
      let res: Response;
      try {
        res = await fetch("/api/qconnect/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participant: p,
            uploadedConfirmed: true,
            screenshot: { fileName: shot.name, mimeType: shot.type, dataBase64 },
          }),
        });
      } catch {
        throw new Error("Cannot reach the server. Check your connection and try again.");
      }

      let data: Record<string, unknown>;
      const text = await res.text();
      try { data = text ? (JSON.parse(text) as Record<string, unknown>) : {}; }
      catch { throw new Error(`Server error (${res.status}). The registration API did not return JSON — if testing locally, run the API with "vercel dev".`); }
      if (!res.ok) throw new Error((data.error as string) || "Could not submit your registration.");

      const bookingId = data.bookingId as string;
      if (!bookingId) throw new Error("Invalid response from server. Please try again.");
      // Pass the fresh seat count so the success page shows the moved
      // counter instantly (no waiting for the next poll cycle).
      nav(`${QCONNECT.EVENT_PATH}/success?id=${bookingId}`, { state: { seats: data.seats ?? null } });
    } catch (e) {
      setPayFail((e as Error).message);
    } finally {
      setPayBusy(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="qconnect">
        <section className="relative overflow-hidden bg-[#04060f] py-12 text-white md:py-16">
          <QuantumBackdrop />
          <QuantumGrid />
          <QuantumParticles density={50} />

          <div className="container-site relative z-10 max-w-2xl">
            {/* Back */}
            <button type="button" onClick={() => nav(QCONNECT.EVENT_PATH)} className="qconnect-btn-ghost !px-5 !py-2.5 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to Event
            </button>

            {/* Header */}
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-cyan-200">
              <Ticket className="h-4 w-4" /> Q-CONNECT 2026 · SECURE REGISTRATION
            </p>
            <h1 className="qconnect-h mt-4 font-display font-extrabold tracking-tight">⚛️ Register for Q-Connect 2026</h1>
            <p className="mt-1.5 text-sm text-white/60">
              {QCONNECT.EVENT_DATE} · {QCONNECT.EVENT_TIME} · {QCONNECT.EVENT_VENUE}
            </p>
            {seats && (
              <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                <Ticket className="h-3.5 w-3.5" /> {seats.seatsLeft} seats left · {seats.registered}/{seats.capacity} registered
              </p>
            )}

            <div className="mt-8 grid gap-6">
              {/* ── Participant details ──────────────────────────────────── */}
              <div id="qconnect-form" className="qconnect-glass scroll-mt-28 p-5 md:p-6">
                <p className="qconnect-step flex items-center gap-2">
                  <UserRound className="h-4 w-4" /> Participant Details
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="fullName" className="qconnect-label">Full Name</label>
                    <input
                      id="fullName" autoComplete="name"
                      value={p.fullName}
                      onChange={(e) => setField("fullName", e.target.value)}
                      disabled={saved}
                      className={`qconnect-input ${errs.fullName ? "border-red-400/60" : ""}`}
                      placeholder="Aarav Sharma"
                    />
                    {errs.fullName && <p role="alert" className="mt-1.5 text-xs text-red-300">{errs.fullName}</p>}
                  </div>
                  <div>
                    <label htmlFor="regNo" className="qconnect-label">VIT Registration Number</label>
                    <input
                      id="regNo"
                      value={p.registrationNumber}
                      onChange={(e) => setField("registrationNumber", e.target.value.toUpperCase())}
                      disabled={saved}
                      className={`qconnect-input font-mono ${errs.registrationNumber ? "border-red-400/60" : ""}`}
                      placeholder="24BCE1234"
                    />
                    {errs.registrationNumber && <p role="alert" className="mt-1.5 text-xs text-red-300">{errs.registrationNumber}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="qconnect-label">Phone Number</label>
                    <input
                      id="phone" inputMode="numeric" autoComplete="tel"
                      value={p.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      disabled={saved}
                      className={`qconnect-input ${errs.phone ? "border-red-400/60" : ""}`}
                      placeholder="98765 43210"
                    />
                    {errs.phone && <p role="alert" className="mt-1.5 text-xs text-red-300">{errs.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="qconnect-label">Email Address</label>
                    <input
                      id="email" type="email" autoComplete="email"
                      value={p.email}
                      onChange={(e) => setField("email", e.target.value)}
                      disabled={saved}
                      className={`qconnect-input ${errs.email ? "border-red-400/60" : ""}`}
                      placeholder="name@vitap.ac.in"
                    />
                    {errs.email && <p role="alert" className="mt-1.5 text-xs text-red-300">{errs.email}</p>}
                  </div>
                </div>

                {fail && (
                  <p role="alert" className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {fail}
                  </p>
                )}

                {!saved ? (
                  <button
                    type="button"
                    onClick={submitDetails}
                    disabled={busy}
                    className="qconnect-btn-primary mt-5 w-full disabled:opacity-60 group"
                  >
                    {busy ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /><span>Saving Details…</span></>
                    ) : (
                      <><Zap className="h-4 w-4 transition-transform group-hover:scale-110" /><span>SAVE DETAILS &amp; CONTINUE</span></>
                    )}
                  </button>
                ) : (
                  <div className="mt-4 rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-3 text-sm">
                    <p className="flex items-center gap-1.5 font-semibold text-emerald-200">
                      <CheckCircle2 className="h-4 w-4" /> Details saved successfully
                      {leadId && <span className="font-mono text-xs text-emerald-200/70">· {leadId}</span>}
                    </p>
                    <button
                      type="button"
                      onClick={editDetails}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-200 underline-offset-4 hover:underline"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit details
                    </button>
                  </div>
                )}
              </div>

              {/* ── UPI payment + screenshot submit ─────────────────────────── */}
              <div id="qconnect-payment" className="qconnect-glass scroll-mt-28 p-6" aria-live="polite">
                {/* Amount card */}
                <div className="rounded-2xl border border-cyan-300/20 bg-black/30 p-5">
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span>Q-Connect 2026 · 1 Ticket</span>
                    <span className="font-mono">₹{QCONNECT.TICKET_PRICE}</span>
                  </div>
                  <div className="my-3 h-px bg-white/10" />
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-semibold text-white/80">Total</span>
                    <motion.span
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="font-display text-4xl font-extrabold bg-gradient-to-r from-cyan-200 via-sky-300 to-amber-200 bg-clip-text text-transparent"
                    >
                      ₹{QCONNECT.TICKET_PRICE}
                    </motion.span>
                  </div>
                </div>

                {/* UPI instructions + QR */}
                <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-black/30 p-5">
                  <p className="text-sm font-semibold text-white/80">Pay via UPI</p>
                  <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    {qrSrc ? (
                      <img src={qrSrc} alt="UPI payment QR code for ₹50" className="h-44 w-44 rounded-xl border border-white/10 bg-white p-2" />
                    ) : (
                      <div className="grid h-44 w-44 place-items-center rounded-xl border border-white/10 bg-white/5 text-xs text-white/40">
                        Loading QR…
                      </div>
                    )}
                    <div className="w-full flex-1 text-sm">
                      <p className="leading-relaxed text-white/60">
                        Scan the QR with any UPI app and pay exactly{" "}
                        <strong className="text-white">₹{QCONNECT.TICKET_PRICE}</strong> to:
                      </p>
                      <button
                        type="button"
                        onClick={copyUpi}
                        title="Copy UPI ID"
                        className="mt-2 inline-flex w-full items-center justify-between gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/5 px-3 py-2 font-mono text-sm text-cyan-100"
                      >
                        <span className="truncate">{QCONNECT.UPI_ID}</span>
                        {copied
                          ? <Check className="h-4 w-4 shrink-0 text-emerald-300" />
                          : <Copy className="h-4 w-4 shrink-0 text-cyan-300" />}
                      </button>
                      <p className="mt-2 text-xs leading-relaxed text-white/45">
                        Payee: {QCONNECT.UPI_PAYEE} · Note: {QCONNECT.UPI_NOTE} · Save your payment screenshot after paying.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment methods */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {["UPI"].map((m) => (
                    <span key={m} className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1 text-[11px] font-semibold text-cyan-200/80">
                      <CreditCard className="h-3 w-3" /> {m}
                    </span>
                  ))}
                </div>

                {/* What happens next */}
                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-xs">
                  <p className="flex items-center gap-1.5 font-semibold text-white/80">
                    <BadgeCheck className="h-4 w-4 text-cyan-300" /> What happens next
                  </p>
                  <p className="mt-1 leading-relaxed text-white/55">
                    {saved
                      ? "Upload your UPI payment screenshot below, tick the confirmation, and submit. Your status stays PENDING until we manually verify — the confirmation email from spaceresearch.club@vitap.ac.in is sent only after verification."
                      : "Save your details above first. After successful submission, the UPI payment step will open here."}
                  </p>
                </div>

                {/* Screenshot upload */}
                <div className="mt-4">
                  <label htmlFor="screenshot" className="qconnect-label">Payment Screenshot (JPG / PNG / WebP, max 5MB)</label>
                  <label
                    htmlFor="screenshot"
                    className={`mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-4 text-sm transition-colors ${!saved ? "cursor-not-allowed border-white/10 text-white/30" : "border-cyan-300/30 text-white/70 hover:border-cyan-300/60 hover:text-white"}`}
                  >
                    <Upload className="h-4 w-4 shrink-0" />
                    <span className="truncate">{shot ? `${shot.name} · ${(shot.size / 1024).toFixed(0)} KB` : "Choose screenshot file…"}</span>
                  </label>
                  <input
                    id="screenshot"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    disabled={!saved || payBusy}
                    onChange={(e) => onFile(e.target.files?.[0])}
                    className="sr-only"
                  />
                </div>

                {/* Tick confirmation */}
                <label className={`mt-3 flex cursor-pointer items-start gap-2.5 text-sm ${!saved ? "cursor-not-allowed opacity-50" : "text-white/75"}`}>
                  <input
                    type="checkbox"
                    checked={ticked}
                    disabled={!saved || payBusy}
                    onChange={(e) => setTicked(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-cyan-300"
                  />
                  <span>I have uploaded my payment screenshot</span>
                </label>

                {payFail && (
                  <p role="alert" className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {payFail}
                  </p>
                )}

                <button
                  type="button"
                  onClick={submitRegistration}
                  disabled={!saved || !shot || !ticked || payBusy}
                  title={!saved ? "Save your details first" : "Submit after uploading + ticking confirmation"}
                  className="qconnect-btn-primary mt-5 w-full disabled:opacity-60 group"
                >
                  {payBusy ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /><span>Submitting…</span></>
                  ) : (
                    <><Zap className="h-4 w-4 transition-transform group-hover:scale-110" /><span>SUBMIT REGISTRATION — ₹50</span></>
                  )}
                </button>

                <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-white/45">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
                  {saved
                    ? "Details saved ✓ · Status stays PENDING until manual verification · Email only after verification."
                    : "UPI manual verification · Confirmed only after we verify your screenshot."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
