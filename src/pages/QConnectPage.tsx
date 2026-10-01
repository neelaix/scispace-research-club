import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Atom, BadgeCheck, CalendarDays, Clock, Cpu,
  FlaskConical, MapPin, Sparkles, Ticket, Users,
} from "lucide-react";
import { Layout } from "../components/Layout";
import { Reveal } from "../components/Reveal";
import { QCONNECT } from "../config/qconnect";
import { QuantumBackdrop, QuantumGrid, QuantumParticles } from "../components/qconnect/QuantumBackdrop";
import { DecryptTitle } from "../components/qconnect/DecryptTitle";

const chips = [
  { icon: CalendarDays, label: QCONNECT.EVENT_DATE },
  { icon: Clock, label: QCONNECT.EVENT_TIME },
  { icon: MapPin, label: QCONNECT.EVENT_VENUE },
  { icon: Ticket, label: `₹${QCONNECT.TICKET_PRICE}/person` },
  { icon: Users, label: `${QCONNECT.MAX_PARTICIPANTS} seats` },
];

export function QConnectPage() {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);

  return (
    <Layout>
      <div className="qconnect">
        {/* HERO — reveal + poster beside about */}
        <section className="relative overflow-hidden bg-[#04060f] text-white">
          <QuantumBackdrop />
          <QuantumGrid />
          <QuantumParticles density={70} />
          <div className="container-site relative z-10 py-12 md:py-20">
            <button type="button" onClick={() => navigate("/events")} className="qconnect-btn-ghost !px-5 !py-2.5 text-xs">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Events
            </button>
            <div className="mt-6 grid items-start gap-6 md:gap-8 lg:grid-cols-2">
              {/* LEFT — poster + BOOK NOW anchored beneath, edges aligned */}
              <div className="grid content-start gap-5 lg:sticky lg:top-24">
                <Reveal delay={0.1}>
                  <figure className="qconnect-glass overflow-hidden p-4">
                    <img
                      src={QCONNECT.POSTER_PATH}
                      alt="Q-Connect 2026 event poster"
                      width={640}
                      height={800}
                      loading="eager"
                      className="aspect-[4/5] w-full rounded-xl object-contain bg-black/40"
                    />
                    <figcaption className="flex items-center justify-center gap-2 px-2 pb-2 pt-3 text-xs tracking-wide text-white/55">
                      <BadgeCheck className="h-4 w-4 text-cyan-300" /> Official Q-Connect 2026 artwork
                    </figcaption>
                  </figure>
                </Reveal>
                <motion.button
                  type="button"
                  onClick={() => navigate(`${QCONNECT.SECRET_PATH}/register`)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: revealed ? 1 : 0.45, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.99 }}
                  className="qconnect-btn-primary w-full !py-4 !text-base"
                >
                  BOOK NOW · ₹{QCONNECT.TICKET_PRICE} <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </motion.button>
                <p className="text-center text-xs text-white/45">180 seats · secure Razorpay checkout · instant ticket</p>
              </div>
              {/* RIGHT — reveal + about beside poster */}
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-cyan-200"
                >
                  <Atom className="h-4 w-4" /> SCISPACE RESEARCH CLUB · VIT-AP · EPISODE 02
                </motion.p>
                <div className="mt-4 flex items-center gap-3">
                  <motion.img
                    src={QCONNECT.LOGO_PATH}
                    alt="Q-Connect logo"
                    width={64}
                    height={64}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="h-12 w-12 rounded-2xl object-contain ring-1 ring-cyan-300/30 md:h-16 md:w-16"
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/90">
                    Classified transmission · Decrypted
                  </p>
                </div>
                <div className="mt-3">
                  <DecryptTitle onDone={() => setRevealed(true)} />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: revealed ? 1 : 0.35 }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="mt-2 font-display text-lg text-cyan-100/90">{QCONNECT.TAGLINE}</p>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/65">{QCONNECT.SUBTITLE}</p>
                </motion.div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {chips.map((c) => (
                    <span key={c.label} className="qconnect-chip">
                      <c.icon className="h-4 w-4 text-cyan-300" aria-hidden="true" /> {c.label}
                    </span>
                  ))}
                </div>
                <div className="qconnect-glass mt-5 p-5 md:p-6">
                  <h2 className="font-display text-xl font-bold md:text-2xl">About the event</h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/70">{QCONNECT.DESCRIPTION}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {QCONNECT.THEMES.map((t) => (
                      <span key={t} className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">{t}</span>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {QCONNECT.COORDINATORS.map((name) => (
                      <div key={name} className="flex items-center gap-3 rounded-xl border border-amber-200/20 bg-amber-200/5 px-4 py-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-200/15 text-sm font-bold text-amber-200">
                          {name.split(" ").map((w) => w[0]).join("")}
                        </span>
                        <span>
                          <span className="block text-[11px] uppercase tracking-widest text-amber-200/70">Student Coordinator</span>
                          <span className="block text-sm font-semibold">{name}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <dl className="mt-4 grid gap-2.5 text-sm">
                    {[
                      { icon: FlaskConical, t: "Organized by", v: `${QCONNECT.ORGANIZER}, ${QCONNECT.INSTITUTION}` },
                      { icon: MapPin, t: "Venue", v: QCONNECT.EVENT_VENUE },
                      { icon: Cpu, t: "Focus", v: "Reference Quantum Computer" },
                      { icon: Sparkles, t: "Participation", v: "Individual · multi-seat booking for friends" },
                    ].map((c) => (
                      <div key={c.t} className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-black/25 px-4 py-2.5">
                        <c.icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                        <p><span className="text-white/50">{c.t}: </span><span className="font-semibold">{c.v}</span></p>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
