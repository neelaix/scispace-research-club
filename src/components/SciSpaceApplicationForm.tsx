import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Github,
  GraduationCap,
  Linkedin,
  Loader2,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
import { GOOGLE_APPS_SCRIPT_URL } from "../config/config";
import { teams } from "../data/teams";
import { SectionHeading } from "./SectionHeading";
import { Magnetic } from "./Magnetic";

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

/** Name of the hidden iframe that captures the Apps Script response. */
const IFRAME_NAME = "scispace-apps-script-responder";

/** Fallback: if Apps Script does not answer within this time, treat the
 *  submission as sent (the POST has already been initiated). */
const SUBMISSION_TIMEOUT_MS = 25000;

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type Values = {
  fullName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  skills: string;
  linkedin: string;
  github: string;
  teamId: string;
};

const EMPTY_VALUES: Values = {
  fullName: "",
  registrationNumber: "",
  email: "",
  phone: "",
  skills: "",
  linkedin: "",
  github: "",
  teamId: "",
};

type Errors = Partial<Record<keyof Values, string>>;

const STEPS = [
  { index: 0, key: "AboutYou", short: "About You", title: "About You", blurb: "A few quick details so we know who you are." },
  { index: 1, key: "Skills", short: "Your Skills", title: "Your Skills", blurb: "What you bring — writing, coding, designing, organizing and more." },
  { index: 2, key: "Team", short: "Find Your Team", title: "Find Your Team", blurb: "Pick the domain you'd love to start in." },
  { index: 3, key: "Review", short: "Ready to Join?", title: "Ready to Join?", blurb: "Give everything one last look before applying." },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9()\s-]{6,20}$/;

const inputBase =
  "w-full rounded-xl border border-brand-dark/12 bg-white/95 px-4 py-3 text-base text-brand-dark shadow-sm outline-none transition-all duration-200 placeholder:text-brand-dark/35 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/20";

const errorText = "text-sm font-medium text-red-600";

/* ------------------------------------------------------------------ */
/*  Validation helpers                                                 */
/* ------------------------------------------------------------------ */

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const IP_RE =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;

function isValidHttpUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname;
  if (!host || host === "localhost") return false;
  if (/\s/.test(host)) return false;
  if (IP_RE.test(host)) return false;
  // Require a real domain-ish hostname ("domain.tld"), so things like
  // "https://!" or "https://a" are rejected.
  return host.includes(".") && !host.startsWith(".") && !host.endsWith(".");
}

function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function validateField(name: keyof Values, value: string): string {
  switch (name) {
    case "fullName":
      if (!value.trim() || value.trim().length < 2) return "Please enter your full name.";
      return "";
    case "registrationNumber":
      if (!value.trim()) return "Please enter your registration number.";
      return "";
    case "email":
      if (!value.trim()) return "Please enter your university email.";
      if (!EMAIL_RE.test(value.trim())) return "Please enter a valid email address.";
      return "";
    case "phone":
      if (!value.trim()) return "Please enter your phone number.";
      if (!PHONE_RE.test(value.trim())) return "Please enter a valid phone number.";
      if (digitsOnly(value).length < 7) return "Please enter a valid phone number.";
      return "";
    case "skills":
      if (!value.trim()) return "Please tell us about your skills.";
      if (value.trim().length < 5) return "A little more detail helps us place you.";
      return "";
    case "linkedin":
      if (!value.trim()) return "";
      if (!isValidHttpUrl(normalizeUrl(value))) return "Please enter a valid LinkedIn URL.";
      return "";
    case "github":
      if (!value.trim()) return "";
      if (!isValidHttpUrl(normalizeUrl(value))) return "Please enter a valid GitHub URL.";
      return "";
    case "teamId":
      if (!value.trim()) return "Please select a team you'd like to join.";
      return "";
    default:
      return "";
  }
}

/* ------------------------------------------------------------------ */
/*  Small UI atoms                                                     */
/* ------------------------------------------------------------------ */

type TextFieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url";
  inputMode?: "text" | "email" | "tel" | "url";
  autoComplete?: string;
  icon?: ReactNode;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

const iconPrefixCls =
  "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-blue-dark/70";

function TextField({
  id,
  label,
  optional,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  icon,
  onKeyDown,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-1.5 text-sm font-semibold text-brand-dark">
        {label}
        {optional ? (
          <span className="text-xs font-medium normal-case tracking-normal text-brand-dark/40">(optional)</span>
        ) : (
          <span className="text-brand-orange" aria-hidden="true">*</span>
        )}
      </label>
      <div className="relative">
        {icon && <span className={iconPrefixCls}>{icon}</span>}
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputBase} ${icon ? "pl-11" : ""} ${
            error ? "border-brand-orange/60 focus:border-brand-orange focus:ring-brand-orange/15" : ""
          }`}
        />
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className={`mt-1.5 ${errorText}`}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function SciSpaceApplicationForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const [phase, setPhase] = useState<"idle" | "submitting" | "success">("idle");

  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);
  const submittedAtRef = useRef(0);
  const stepRef = useRef(0);

  const reduce = useReducedMotion();

  const onEnterNext = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (stepRef.current < 3) {
      goNext();
    } else if (phase === "idle") {
      formRef.current?.requestSubmit();
    }
  };

  const setField = (name: keyof Values) => (value: string) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      const message = validateField(name, value);
      setErrors((prevErrors) => {
        if (prevErrors[name] && !message) {
          const cleaned = { ...prevErrors };
          delete cleaned[name];
          return cleaned;
        }
        return prevErrors;
      });
      return next;
    });
  };

  const blurField = (name: keyof Values) => () => {
    const message = validateField(name, values[name]);
    setErrors((prev) => ({ ...prev, [name]: message || undefined }));
  };

  const stepErrors = (index: number): Errors => {
    const names: (keyof Values)[] =
      index === 0
        ? ["fullName", "registrationNumber", "email", "phone"]
        : index === 1
          ? ["skills", "linkedin", "github"]
          : index === 2
            ? ["teamId"]
            : ["fullName", "registrationNumber", "email", "phone", "skills", "linkedin", "github", "teamId"];
    const next: Errors = {};
    for (const name of names) {
      const message = validateField(name, values[name]);
      if (message) next[name] = message;
    }
    return next;
  };

  const focusFirstField = () => {
    window.setTimeout(() => {
      if (stepRef.current === 2) {
        const el = document.querySelector<HTMLElement>('[role="radiogroup"] [role="radio"]');
        el?.focus({ preventScroll: false });
        return;
      }
      const ids: Record<number, string> = {
        0: "field-fullName",
        1: "field-skills",
        3: "field-submit",
      };
      const el = document.getElementById(ids[stepRef.current] ?? "field-submit");
      el?.focus({ preventScroll: false });
    }, 140);
  };

  const focusErrorField = (first: keyof Values | undefined) => {
    if (!first) return;
    if (first === "teamId") {
      document.querySelector<HTMLElement>('[role="radiogroup"] [role="radio"]')?.focus();
      return;
    }
    document.getElementById(`field-${first}`)?.focus({ preventScroll: false });
  };

  const goNext = () => {
    if (phase === "submitting" || stepRef.current === 3) return;
    const errs = stepErrors(stepRef.current);
    if (Object.values(errs).some(Boolean)) {
      setErrors(errs);
      focusErrorField(Object.keys(errs)[0] as keyof Values | undefined);
      return;
    }
    setErrors({});
    setStep((s) => {
      stepRef.current = s + 1;
      return s + 1;
    });
    focusFirstField();
  };

  const goBack = () => {
    if (phase === "submitting" || stepRef.current === 0) return;
    setErrors({});
    setStep((s) => {
      stepRef.current = s - 1;
      return s - 1;
    });
    focusFirstField();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (phase !== "idle") return;

    // Safety net: if an implicit submission ever happens before the final
    // step, treat it as "Next" instead of submitting early.
    if (stepRef.current < STEPS.length - 1) {
      goNext();
      return;
    }

    const errs = stepErrors(stepRef.current);
    if (Object.values(errs).some(Boolean)) {
      setErrors(errs);
      focusErrorField(Object.keys(errs)[0] as keyof Values | undefined);
      return;
    }
    setErrors({});
    setPhase("submitting");
  };

  /* Native HTML POST to the Apps Script Web App, targeted at a hidden
     iframe. Native submission (not fetch) is the most reliable browser
     method for Apps Script: it avoids CORS preflight and lets Apps
     Script's redirect behave inside the iframe without moving the page.
     Make sure fields are named exactly as the backend expects:
     fullName, registrationNumber, email, phone, skills, linkedin, github. */
  useEffect(() => {
    if (phase !== "submitting") return;
    const submitTimer = window.setTimeout(() => {
      submittedRef.current = true;
      submittedAtRef.current = Date.now();
      formRef.current?.submit();
    }, 100);
    const fallbackTimer = window.setTimeout(() => {
      submittedRef.current = false;
      setPhase("success");
    }, SUBMISSION_TIMEOUT_MS);
    return () => {
      window.clearTimeout(submitTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [phase]);

  const onFrameLoad = () => {
    if (!submittedRef.current) return;
    // Ignore the iframe's initial about:blank load racing the POST —
    // only a load well after the submit call is the Apps Script response.
    if (Date.now() - submittedAtRef.current < 250) return;
    submittedRef.current = false;
    setPhase("success");
  };

  const selectedTeam = teams.find((t) => t.id === values.teamId);

  const reviewBasic = [
    ["Full Name", values.fullName],
    ["Registration Number", values.registrationNumber],
    ["University Email", values.email],
    ["Phone Number", values.phone],
  ] as const;

  return (
    <section
      id="apply"
      className="relative overflow-hidden bg-gradient-to-b from-white via-brand-canvas to-brand-mist py-20 md:py-28"
    >
      {/* Decorative scientific backdrop */}
      <div aria-hidden="true" className="absolute inset-0 bg-brand-soft opacity-70" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(rgba(42,42,52,0.9) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div aria-hidden="true" className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-brand-orange/15 blur-3xl" />

      <div className="container-site relative z-10 flex flex-col items-center">
        <SectionHeading
          eyebrow={
            <>
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Applications open
            </>
          }
          title={
            <>
              Join <span className="text-gradient-brand">SciSpace Research Club</span>
            </>
          }
          subtitle="Your journey into research, innovation and technology starts here."
        />

        <div className="mt-12 w-full max-w-3xl">
          <AnimatePresence mode="wait">
            {phase === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-3xl border border-brand-blue/25 bg-white/85 p-10 text-center shadow-card-hover backdrop-blur-xl sm:p-14"
              >
                <div aria-hidden="true" className="absolute inset-0 bg-brand-soft opacity-80" />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(42,42,52,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,52,0.8) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                  }}
                />
                <div className="relative z-10 flex flex-col items-center">
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
                    className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white shadow-glow"
                  >
                    <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
                  </motion.span>
                  <h3 className="mt-6 font-display text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                    Application Submitted Successfully! 🎉
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-dark/70">
                    Thank you for applying to SciSpace Research Club. Your application has been received.
                    We will contact you regarding the next steps.
                  </p>
                  <p className="mt-6 font-display text-lg font-semibold tracking-wide">
                    <span className="text-brand-blue-dark">Explore.</span>{" "}
                    <span className="text-brand-dark">Research.</span>{" "}
                    <span className="text-brand-orange">Innovate.</span>{" "}
                    <span className="text-brand-dark">Impact.</span>
                  </p>
                  <Magnetic className="mt-9">
                    <Link to="/" className="btn-primary px-9 py-3.5 text-base">
                      Back to SciSpace
                    </Link>
                  </Magnetic>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-3xl border border-brand-dark/8 bg-white/80 p-6 shadow-card-hover backdrop-blur-xl sm:p-10"
              >
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue via-brand-blue-dark to-brand-orange" />

                {/* Progress indicator */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest2 text-brand-dark/45">
                      Step {step + 1} of {STEPS.length}
                    </p>
                    <p className="font-display text-sm font-semibold text-brand-blue-dark">
                      {STEPS[step].short}
                    </p>
                  </div>
                  <div
                    className="mt-3 flex items-center gap-2"
                    role="progressbar"
                    aria-valuemin={1}
                    aria-valuemax={STEPS.length}
                    aria-valuenow={step + 1}
                    aria-label="Application progress"
                  >
                    {STEPS.map((s, i) => (
                      <div key={s.key} className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-dark/10">
                        <motion.div
                          initial={false}
                          animate={{ width: i <= step ? "100%" : "0%" }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className={
                            i < step
                              ? "h-full rounded-full bg-brand-blue-dark"
                              : i === step
                                ? "h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-orange"
                                : "h-full rounded-full bg-transparent"
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <form
                  ref={formRef}
                  noValidate
                  action={GOOGLE_APPS_SCRIPT_URL}
                  method="POST"
                  encType="application/x-www-form-urlencoded"
                  target={IFRAME_NAME}
                  onSubmit={handleSubmit}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={STEPS[step].key}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, x: -40 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <h3 className="font-display text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
                        {STEPS[step].title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-brand-dark/60">
                        {STEPS[step].blurb}
                      </p>

                      {/* ---------------- STEP 1 · ABOUT YOU ---------------- */}
                      {step === 0 && (
                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                          <TextField
                            id="field-fullName"
                            
                            label="Full Name"
                            value={values.fullName}
                            onChange={setField("fullName")}
                            onBlur={blurField("fullName")}
                            error={errors.fullName}
                            placeholder="e.g. Aditya Sharma"
                            autoComplete="name"
                            icon={<User />}
                            onKeyDown={onEnterNext}
                          />
                          <TextField
                            id="field-registrationNumber"
                            
                            label="Registration Number"
                            value={values.registrationNumber}
                            onChange={setField("registrationNumber")}
                            onBlur={blurField("registrationNumber")}
                            error={errors.registrationNumber}
                            placeholder="e.g. 23BEC1234"
                            autoComplete="off"
                            icon={<GraduationCap />}
                            onKeyDown={onEnterNext}
                          />
                          <TextField
                            id="field-email"
                            
                            label="University Email"
                            value={values.email}
                            onChange={setField("email")}
                            onBlur={blurField("email")}
                            error={errors.email}
                            placeholder="you@vitapstudent.ac.in"
                            type="email"
                            autoComplete="email"
                            icon={<Mail />}
                            onKeyDown={onEnterNext}
                          />
                          <TextField
                            id="field-phone"
                            
                            label="Phone Number"
                            value={values.phone}
                            onChange={setField("phone")}
                            onBlur={blurField("phone")}
                            error={errors.phone}
                            placeholder="+91 90000 00000"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            icon={<Phone />}
                            onKeyDown={onEnterNext}
                          />
                        </div>
                      )}

                      {/* ---------------- STEP 2 · YOUR SKILLS ---------------- */}
                      {step === 1 && (
                        <div className="mt-6 grid gap-5">
                          <div>
                            <label htmlFor="field-skills" className="mb-1.5 flex items-baseline gap-1.5 text-sm font-semibold text-brand-dark">
                              Skills
                              <span className="text-brand-orange" aria-hidden="true">*</span>
                            </label>
                            <textarea
                              id="field-skills"
                              
                              rows={6}
                              value={values.skills}
                              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setField("skills")(e.target.value)}
                              onBlur={blurField("skills")}
                              className={`${inputBase} resize-y ${errors.skills ? "border-brand-orange/60 focus:border-brand-orange focus:ring-brand-orange/15" : ""}`}
                              placeholder="Tell us about your technical, research, creative or organizational skills..."
                              aria-invalid={errors.skills ? true : undefined}
                              aria-describedby={errors.skills ? "field-skills-error" : "field-skills-hint"}
                            />
                            <p id="field-skills-hint" className="mt-1.5 text-xs text-brand-dark/45">
                              Anything counts — coding, writing, designing, organizing events or volunteering.
                            </p>
                            {errors.skills && (
                              <p id="field-skills-error" role="alert" className={`mt-1.5 ${errorText}`}>
                                {errors.skills}
                              </p>
                            )}
                          </div>
                          <TextField
                            id="field-linkedin"
                            
                            label="LinkedIn Profile"
                            optional
                            value={values.linkedin}
                            onChange={setField("linkedin")}
                            onBlur={blurField("linkedin")}
                            error={errors.linkedin}
                            placeholder="https://www.linkedin.com/in/your-name"
                            type="url"
                            inputMode="url"
                            autoComplete="off"
                            icon={<Linkedin />}
                            onKeyDown={onEnterNext}
                          />
                          <TextField
                            id="field-github"
                            
                            label="GitHub Profile"
                            optional
                            value={values.github}
                            onChange={setField("github")}
                            onBlur={blurField("github")}
                            error={errors.github}
                            placeholder="https://github.com/your-username"
                            type="url"
                            inputMode="url"
                            autoComplete="off"
                            icon={<Github />}
                            onKeyDown={onEnterNext}
                          />
                        </div>
                      )}

                      {/* ---------------- STEP 3 · FIND YOUR TEAM ---------------- */}
                      {step === 2 && (
                        <div className="mt-6">
                          <label htmlFor="field-teamId" className="mb-2 block text-sm font-semibold text-brand-dark">
                            Which team would you like to join?{" "}
                            <span className="font-medium text-brand-dark/55">(choose one)</span>
                          </label>
                          {errors.teamId && (
                            <p id="field-team-error" role="alert" className={`mb-3 ${errorText}`}>
                              {errors.teamId}
                            </p>
                          )}
                          <div className="relative">
                            <select
                              id="field-teamId"
                              value={values.teamId}
                              onChange={(e) => {
                                const id = e.target.value;
                                setValues((prev) => ({ ...prev, teamId: id }));
                                setErrors((prev) => {
                                  if (!prev.teamId) return prev;
                                  const cleaned = { ...prev };
                                  delete cleaned.teamId;
                                  return cleaned;
                                });
                              }}
                              aria-invalid={Boolean(errors.teamId)}
                              aria-describedby={errors.teamId ? "field-team-error" : "field-team-label"}
                              className={`${inputBase} appearance-none pr-12 ${
                                values.teamId ? "" : "text-brand-dark/45"
                              }`}
                            >
                              <option value="" disabled>
                                Select your preferred domain…
                              </option>
                              {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                  {team.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40"
                              aria-hidden="true"
                            />
                          </div>
                          {selectedTeam && (
                            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3">
                              <selectedTeam.icon
                                className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue-dark"
                                aria-hidden="true"
                              />
                              <p className="text-xs font-medium leading-relaxed text-brand-dark/65">
                                {selectedTeam.short}
                              </p>
                            </div>
                          )}
                          <p id="field-team-label" className="mt-3 text-xs text-brand-dark/45">
                            Your primary domain. If you end up loving another team later, you can always switch.
                          </p>
                        </div>
                      )}

                      {/* ---------------- STEP 4 · REVIEW & SUBMIT ---------------- */}
                      {step === 3 && (
                        <div className="mt-6">
                          <div className="overflow-hidden rounded-2xl border border-brand-dark/10 bg-brand-mist/60">
                            {reviewBasic.map(([label, value]) => (
                              <div
                                key={label}
                                className="flex items-start justify-between gap-4 border-b border-white/70 px-5 py-3.5 last:border-b-0"
                              >
                                <span className="text-sm font-medium text-brand-dark/55">{label}</span>
                                <span className="max-w-[65%] break-words text-right text-sm font-semibold text-brand-dark">
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 overflow-hidden rounded-2xl border border-brand-dark/10 bg-brand-mist/60">
                            <div className="px-5 py-3.5">
                              <p className="text-sm font-medium text-brand-dark/55">Skills</p>
                              <p className="mt-1 text-sm leading-relaxed text-brand-dark">{values.skills}</p>
                            </div>
                            <div className="flex flex-col gap-2 border-t border-white/70 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-sm font-medium text-brand-dark/55">Team preference</span>
                              {selectedTeam ? (
                                <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-sm font-semibold text-brand-blue-dark ring-1 ring-brand-blue/30">
                                  <selectedTeam.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                  <span className="truncate">{selectedTeam.name}</span>
                                </span>
                              ) : (
                                <span className="text-sm font-semibold text-brand-orange-dark">
                                  Not chosen yet — go back to Step 3
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-white/70 px-5 py-3.5">
                              {(
                                [
                                  ["LinkedIn", values.linkedin],
                                  ["GitHub", values.github],
                                ] as const
                              ).map(([label, value]) => (
                                <span key={label} className="flex items-center gap-2 text-sm">
                                  <span className="font-medium text-brand-dark/55">{label}:</span>
                                  {value.trim() ? (
                                    <span className="font-semibold text-brand-dark">{normalizeUrl(value)}</span>
                                  ) : (
                                    <span className="text-brand-dark/40">Not provided</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Nav row */}
                      <div className="mt-8 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={goBack}
                          disabled={step === 0 || phase === "submitting"}
                          className="btn-ghost px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                          Back
                        </button>
                        {step < 3 ? (
                          <button
                            type="button"
                            onClick={goNext}
                            className="btn-primary px-7 py-3 text-sm"
                          >
                            Next
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </button>
                        ) : (
                          <button
                            id="field-submit"
                            type="submit"
                            disabled={phase === "submitting"}
                            className="btn-accent px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {phase === "submitting" ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                Submitting your application...
                              </>
                            ) : (
                              <>
                                Submit Application
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {phase === "submitting" && (
                        <p role="status" className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-brand-blue-dark">
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Submitting your application...
                        </p>
                      )}

                      <p className="mt-6 flex items-start justify-center gap-2 text-xs leading-relaxed text-brand-dark/45">
                        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-blue-dark/60" aria-hidden="true" />
                        Your details are used only to process your application to SciSpace Research Club and are never sold or shared with anyone else.
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Hidden payload controls. Always present so the native
                      POST carries every field regardless of which step is
                      currently mounted (steps unmount their visible inputs).
                      `domain` is the applicant's chosen team, sent as the
                      team name. Application ID is generated server-side by
                      Apps Script and is never collected from the user. */}
                  <input type="hidden" name="fullName" value={values.fullName} />
                  <input type="hidden" name="registrationNumber" value={values.registrationNumber} />
                  <input type="hidden" name="email" value={values.email} />
                  <input type="hidden" name="phone" value={values.phone} />
                  <input type="hidden" name="domain" value={teams.find((t) => t.id === values.teamId)?.name ?? ""} />
                  <input type="hidden" name="skills" value={values.skills} />
                  <input type="hidden" name="linkedin" value={values.linkedin} />
                  <input type="hidden" name="github" value={values.github} />

                  {phase === "submitting" && (
                    <iframe
                      name={IFRAME_NAME}
                      onLoad={onFrameLoad}
                      title="Hidden submission frame"
                      tabIndex={-1}
                      aria-hidden="true"
                      className="pointer-events-none absolute h-px w-px opacity-0"
                    />
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}