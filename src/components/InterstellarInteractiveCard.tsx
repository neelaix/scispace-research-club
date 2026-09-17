import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Play,
  ArrowRight,
  Image as ImageIcon,
  Maximize2,
} from "lucide-react";
import { CosmicCanvas } from "./CosmicCanvas";

/* ------------------------------------------------------------
   Gallery – 6 images using the real poster + simulated event
   photographs (picsum + unsplash fallbacks). Keeps lightbox
   premium without requiring local assets.
------------------------------------------------------------ */
export const INTERSTELLAR_GALLERY: { src: string; alt: string }[] = [
  { src: "/interstellar-poster.png", alt: "Poster" },
  { src: "/interstellar-highlights/IMG_7132.jpg", alt: "Photo 1" },
  { src: "/interstellar-highlights/IMG_7146.jpg", alt: "Photo 2" },
  { src: "/interstellar-highlights/IMG_7157.jpg", alt: "Photo 3" },
  { src: "/interstellar-highlights/IMG_7173.jpg", alt: "Photo 4" },
  { src: "/interstellar-highlights/whatsapp-1.jpeg", alt: "Photo 5" },
  { src: "/interstellar-highlights/whatsapp-2.jpeg", alt: "Photo 6" },
];

/* ------------------------------------------------------------
   Lightbox
------------------------------------------------------------ */
function GalleryLightbox({
  images,
  startIndex,
  onClose,
}: {
  images: typeof INTERSTELLAR_GALLERY;
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);
  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, next, prev]);

  // lock scroll
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-[8px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox — Interstellar event highlights"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        className="relative flex max-h-[92vh] max-w-[1060px] w-full items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[idx].src}
          alt={images[idx].alt}
          className="max-h-[84vh] w-auto max-w-full rounded-2xl object-contain shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="absolute -top-2 right-0 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white hover:text-black sm:-right-2 sm:-top-2"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={prev}
          aria-label="Previous image"
          className="absolute left-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white hover:text-black sm:left-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next image"
          className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white hover:text-black sm:right-2"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <div className="absolute inset-x-0 -bottom-1 flex justify-center sm:bottom-0">
          <span className="rounded-full bg-black/60 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 ring-1 ring-white/10 backdrop-blur">
            {idx + 1} / {images.length}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------
   Detail Modal — cinematic full experience
------------------------------------------------------------ */
function InterstellarDetailModal({ onClose }: { onClose: () => void }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [galleryPage, setGalleryPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(INTERSTELLAR_GALLERY.length / itemsPerPage);
  const visible = INTERSTELLAR_GALLERY.slice(galleryPage * itemsPerPage, (galleryPage + 1) * itemsPerPage);

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && lightboxIndex === null && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, lightboxIndex]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[70] bg-[#05070d]/85 backdrop-blur-[10px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: "spring", damping: 28, stiffness: 260, duration: 0.5 }}
        className="fixed inset-0 z-[71] overflow-y-auto p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Interstellar: A Journey Beyond Limits — detailed event view"
      >
        <div className="mx-auto flex min-h-full max-w-[1120px] items-start justify-center py-6">
          <div className="relative w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0a0f1f] shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(117,193,217,0.12)]">
            {/* cosmic header — WASM-driven starfield + soft gradients (C++ does per-frame math, Canvas draws) */}
            <CosmicCanvas className="pointer-events-none absolute inset-x-0 top-0 h-[420px] w-full opacity-[0.55]" density={900} opacity={0.95} interactive={false} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-60"
              style={{
                background:
                  "radial-gradient(780px 360px at 18% 0%, rgba(117,193,217,0.22), transparent 60%), radial-gradient(700px 320px at 88% 8%, rgba(253,128,44,0.18), transparent 60%), radial-gradient(900px 420px at 50% -10%, rgba(99,102,241,0.14), transparent 62%)",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />
            {/* close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close event details"
              className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white hover:text-[#0a0f1f] sm:right-5 sm:top-5"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative grid lg:grid-cols-[420px_1fr]">
              {/* Left — poster, sticky */}
              <div className="relative border-b border-white/10 bg-black/20 lg:border-b-0 lg:border-r">
                <div className="p-5 sm:p-6">
                  {/* poster — DO NOT crop/distort */}
                  <div className="group/poster relative overflow-hidden rounded-2xl border border-white/10 bg-[#070a14] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
                    <img
                      src="/interstellar-poster.png"
                      alt="Interstellar — A Journey Beyond Limits — Official Poster by SciSpace Research Club, VIT-AP University"
                      className="h-auto w-full object-contain object-top"
                      loading="eager"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
                    {/* subtle inner glow */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/poster:opacity-100"
                      style={{
                        background:
                          "radial-gradient(520px 260px at 50% 0%, rgba(117,193,217,0.18), transparent 60%)",
                      }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white ring-1 ring-white/10">
                      <Sparkles className="h-3.5 w-3.5 text-brand-blue" /> SciSpace · VIT-AP
                    </span>
                    <span className="font-mono text-xs tracking-widest text-white/40">AB-2 AUDITORIUM</span>
                  </div>
                </div>
              </div>

              {/* Right — details */}
              <div className="relative p-6 sm:p-8 lg:p-9">
                {/* eyebrow */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#75C1D9]/14 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-[#75C1D9] ring-1 ring-[#75C1D9]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#75C1D9] animate-pulse" />
                    EPISODE 01 · RESEARCH REELS
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-white/70 ring-1 ring-white/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Completed
                  </span>
                </div>

                <h2 className="mt-4 font-display text-[2rem] font-bold leading-[0.95] tracking-tight text-white sm:text-[2.45rem]">
                  Interstellar:
                  <br />
                  <span className="bg-gradient-to-r from-white via-white to-[#75C1D9] bg-clip-text text-transparent">
                    A Journey Beyond Limits
                  </span>
                </h2>
                <p className="mt-2 text-sm font-medium tracking-[0.18em] text-[#FD802C]">SPACE · RELATIVITY · EXPLORATION</p>

                {/* meta grid */}
                 <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Calendar, label: "DATE", value: "12 September 2026" },
                    { icon: Clock, label: "TIME", value: "2:00 PM – 5:30 PM" },
                    { icon: MapPin, label: "VENUE", value: "AB-2 Auditorium, VIT-AP University" },
                    { icon: Users, label: "ATTENDED", value: "510 Students" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="group/meta relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur transition hover:border-white/15 hover:bg-white/[0.09]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/10 transition group-hover/meta:bg-[#75C1D9] group-hover/meta:text-[#0a0f1f]">
                          <m.icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-white/45">{m.label}</p>
                          <p className="mt-1 text-sm font-semibold leading-tight text-white">{m.value}</p>
                        </div>
                      </div>
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/meta:opacity-100"
                        style={{
                          background: "radial-gradient(380px 120px at 80% 0%, rgba(117,193,217,0.16), transparent 60%)",
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-white/55">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
                    Organized by <span className="font-semibold text-white">SciSpace Research Club, VIT-AP</span>
                  </span>
                </div>

                {/* description — premium glass card */}
                <div className="mt-7 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-5 backdrop-blur sm:p-6">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 grid place-items-center rounded-lg bg-[#FD802C]/15 text-[#FD802C] ring-1 ring-[#FD802C]/20">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="font-display text-sm font-semibold tracking-wide text-white/90">ABOUT THE EVENT</h3>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/75">
                    “SciSpace Research Club, VIT-AP successfully organized ‘Interstellar: A Journey Beyond Limits’, a
                    research-oriented movie screening that brought together{" "}
                    <span className="font-semibold text-white">510 students</span> for an engaging experience of science,
                    curiosity, and exploration. Through <span className="font-semibold text-white">Interstellar</span>,
                    students explored fascinating concepts including{" "}
                    <span className="text-[#75C1D9]">space exploration, relativity, time dilation, black holes, gravity,</span>{" "}
                    and humanity’s pursuit of knowledge beyond Earth. The event aimed to spark scientific curiosity and
                    encourage students to explore the scientific ideas and research behind our understanding of the
                    universe.”
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Space Exploration", "Relativity", "Black Holes", "Time Dilation", "Gravity", "Research"].map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/75 ring-1 ring-white/10"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gallery */}
                <div className="mt-8">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/10">
                        <ImageIcon className="h-4 w-4 text-white/80" />
                      </span>
                      Event Gallery
                      <span className="hidden rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/60 ring-1 ring-white/10 sm:inline-flex">
                        {INTERSTELLAR_GALLERY.length} highlights
                      </span>
                    </h3>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setGalleryPage((p) => Math.max(0, p - 1))}
                          disabled={galleryPage === 0}
                          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/10 transition hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white"
                          aria-label="Previous gallery page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setGalleryPage((p) => Math.min(totalPages - 1, p + 1))}
                          disabled={galleryPage === totalPages - 1}
                          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/10 transition hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white"
                          aria-label="Next gallery page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((img, i) => {
                      const globalIdx = galleryPage * itemsPerPage + i;
                      return (
                        <button
                          key={img.src + i}
                          type="button"
                          onClick={() => setLightboxIndex(globalIdx)}
                          className="group/img relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black/30 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#75C1D9]"
                          aria-label={`Open image ${globalIdx + 1}: ${img.alt}`}
                        >
                          <img
                            src={img.src}
                            alt={img.alt}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-700 group-hover/img:scale-[1.06] group-hover/img:brightness-[1.08]"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
                          <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white/90 ring-1 ring-white/15 backdrop-blur">
                            #{globalIdx + 1}
                          </span>
                          <span className="pointer-events-none absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white opacity-0 ring-1 ring-white/15 backdrop-blur transition group-hover/img:opacity-100">
                            <Maximize2 className="h-4 w-4" />
                          </span>
                          <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/0 transition group-hover/img:ring-white/15" />
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs leading-relaxed text-white/45">
                      Click any image to open full-screen lightbox. Use ← → to navigate.
                    </p>
                    {INTERSTELLAR_GALLERY.length >= 6 && (
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(0)}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0a0f1f] shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition hover:bg-[#75C1D9] hover:text-white"
                      >
                        View All Highlights <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* footer bar inside modal */}
            <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.04] px-6 py-4 backdrop-blur sm:px-8">
              <p className="text-xs font-medium tracking-wide text-white/50">
                SciSpace Research Club · VIT-AP University · Research Reels — Episode 01
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#0a0f1f] transition hover:bg-white/90"
              >
                Close <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <GalleryLightbox images={INTERSTELLAR_GALLERY} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------
   Main interactive poster card
   DEFAULT → poster full-width
   HOVER (desktop) → poster compresses to 50% + cinematic panel
   CLICK → detail modal
   MOBILE → stacked with visible CTA
------------------------------------------------------------ */
export function InterstellarInteractiveCard() {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const openDetail = useCallback(() => setOpen(true), []);
  const closeDetail = useCallback(() => setOpen(false), []);

  // right-square photo preview — first 6 real photos (excluding poster) for the hover square
  const previewPhotos = INTERSTELLAR_GALLERY.slice(1, 7);

  return (
    <>
      {/* FIXED OUTER RECTANGLE — same dimension on hover, splits into two squares inside */}
      <div
        ref={cardRef}
        className="group/card relative mx-auto w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#070a14] shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)] aspect-[3/4] sm:aspect-[2/1]"
        tabIndex={0}
        role="region"
        aria-label="Interstellar — A Journey Beyond Limits — interactive poster"
      >
        {/* ambient glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-[380px] w-[380px] rounded-full opacity-[0.18] blur-3xl transition duration-700 group-hover/card:opacity-[0.28] group-focus-within/card:opacity-[0.28]"
          style={{ background: "radial-gradient(circle, rgba(117,193,217,0.9), transparent 70%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full opacity-[0.14] blur-3xl transition duration-700 group-hover/card:opacity-[0.22]"
          style={{ background: "radial-gradient(circle, rgba(253,128,44,0.95), transparent 70%)" }}
        />
        {/* WASM-accelerated cosmic field — C++ particle_system does O(N) per-frame */}
        <CosmicCanvas className="pointer-events-none absolute inset-0 opacity-[0.9]" density={1100} opacity={0.9} interactive />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* ——— INNER: two squares inside same fixed rectangle ——— */}
        <div className="absolute inset-0 flex">
          {/* LEFT SQUARE — poster (square, never distorted) */}
          <div className="relative flex h-full shrink-0 items-center justify-center overflow-hidden bg-[#04070f] transition-all duration-[620ms] ease-[cubic-bezier(0.22,1,0,1)] w-full sm:w-full group-hover/card:sm:w-1/2 group-focus-within/card:sm:w-1/2">
            {/* poster — exact artwork, object-contain inside square */}
            <img
              src="/interstellar-poster.png"
              alt="Interstellar — A Journey Beyond Limits — Official Poster by SciSpace Research Club, VIT-AP University"
              className="h-full w-full object-contain object-center p-3 sm:p-4 lg:p-5"
              loading="eager"
              decoding="async"
            />
            {/* divider line that appears on hover */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 sm:block"
            />
            <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold tracking-wide text-white ring-1 ring-white/15 backdrop-blur sm:hidden">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" /> Past Event
            </span>
          </div>

          {/* RIGHT SQUARE — highlights (square, hidden until hover, same outer dimension) */}
          <div className="relative hidden h-full shrink-0 overflow-hidden bg-[#0d1428] opacity-0 transition-all duration-[620ms] ease-[cubic-bezier(0.22,1,0,1)] sm:flex sm:w-0 group-hover/card:sm:w-1/2 group-hover/card:opacity-100 group-focus-within/card:sm:w-1/2 group-focus-within/card:opacity-100">
            <button
              type="button"
              onClick={openDetail}
              className="group/panel relative flex h-full w-full flex-col overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#75C1D9] focus-visible:ring-inset"
              aria-label="Open Interstellar highlights — Explore event"
            >
              {/* panel bg */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(640px 320px at 28% 0%, rgba(117,193,217,0.20), transparent 62%), radial-gradient(520px 280px at 92% 88%, rgba(253,128,44,0.16), transparent 60%), linear-gradient(180deg, #0d1428 0%, #0a1020 100%)",
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#75C1D9]/30 to-transparent" />

              <div className="relative flex h-full flex-col p-5 lg:p-6">
                {/* header */}
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/10">
                    <Play className="h-3.5 w-3.5 fill-white" />
                  </span>
                  <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-white/50">SCI-SPACE · 12 SEP 2026</span>
                </div>

                <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-[#75C1D9]/15 px-3 py-1 text-xs font-semibold tracking-wide text-[#75C1D9] ring-1 ring-[#75C1D9]/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#75C1D9] animate-pulse" /> 510 · AB-2 AUDITORIUM · COMPLETED
                </div>

                <h3 className="mt-3 font-display text-[1.35rem] font-bold leading-none tracking-tight text-white lg:text-[1.45rem]">
                  WATCH <span className="bg-gradient-to-r from-[#75C1D9] to-[#FD802C] bg-clip-text text-transparent">HIGHLIGHTS</span>
                </h3>
                <p className="font-display text-xs font-semibold tracking-[0.14em] text-white/45">EXPLORE EVENT →</p>

                {/* real photo grid — 6 photos from photos1 inside square */}
                <div className="mt-4 grid flex-1 grid-cols-3 gap-1.5 overflow-hidden rounded-xl">
                  {previewPhotos.slice(0, 6).map((p, i) => (
                    <div key={p.src + i} className="relative aspect-square overflow-hidden rounded-lg bg-black/30 ring-1 ring-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.src} alt={p.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover/panel:scale-[1.02]" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <span className="group/btn relative inline-flex w-full items-center justify-between gap-3 overflow-hidden rounded-full bg-white px-4 py-3 text-sm font-bold text-[#0a0f1f] shadow-[0_12px_32px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition duration-300 group-hover/panel:bg-[#75C1D9] group-hover/panel:text-white">
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#0a0f1f] text-white">
                        <Play className="h-3 w-3 fill-current" />
                      </span>
                      EXPLORE EVENT
                    </span>
                    <ArrowRight className="relative z-10 h-4 w-4" />
                  </span>
                  <p className="mt-2 text-center font-mono text-[10px] tracking-[0.14em] text-white/30">6 REAL HIGHLIGHTS · CLICK TO OPEN</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* MOBILE fallback — outer stays same rectangle, but hover not available → show tap CTA below poster on mobile */}
        <button
          type="button"
          onClick={openDetail}
          className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-4 text-left sm:hidden"
          aria-label="Open highlights"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0a0f1f]">
            WATCH HIGHLIGHTS <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white ring-1 ring-white/15 backdrop-blur">6 photos</span>
        </button>

        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-white/10" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 shadow-[0_0_0_1px_rgba(117,193,217,0.18),0_0_48px_rgba(117,193,217,0.18)] transition-opacity duration-500 group-hover/card:opacity-100"
        />
      </div>

      <AnimatePresence>{open && <InterstellarDetailModal onClose={closeDetail} />}</AnimatePresence>
    </>
  );
}
