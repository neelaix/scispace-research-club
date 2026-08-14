import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { config } from "../config/config";
import { openExternal } from "../lib/open";
import { navLinks } from "../data/nav";
import { scrollToId } from "../lib/scroll";
import { Magnetic } from "./Magnetic";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNav = (to: string, hash?: string) => {
    setOpen(false);
    if (hash) {
      if (location.pathname === "/") {
        scrollToId(hash);
      } else {
        navigate(`/#${hash}`);
      }
      return;
    }
    if (location.pathname === to && !hash) {
      scrollToId("top");
      return;
    }
    navigate(to);
  };

  const goJoin = () => {
    setOpen(false);
    openExternal(config.GOOGLE_FORM_URL, "Join form not yet available. Update GOOGLE_FORM_URL in config.ts.");
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/75 shadow-[0_1px_0_rgba(42,42,52,0.06),0_8px_30px_-12px_rgba(42,42,52,0.12)] backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="container-site flex h-[68px] items-center justify-between gap-4">
          {/* Brand */}
          <Link
            to="/"
            onClick={() => handleNav("/")}
            className="group flex items-center gap-3"
            aria-label="SciSpace Research Club — home"
          >
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-brand-dark/10">
              <img
                src={config.LOGO_PATH}
                alt="SciSpace logo"
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold tracking-[0.08em] text-brand-dark">
                SCISPACE
              </span>
              <span className="text-[10px] font-medium tracking-[0.26em] text-brand-orange">
                RESEARCH CLUB
              </span>
            </span>
          </Link>

          {/* Desktop links */}
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNav(link.to, link.hash)}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-brand-dark/70 transition-colors hover:text-brand-blue-dark hover:bg-brand-blue/10"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-2">
            <Magnetic className="hidden lg:block">
              <button
                type="button"
                onClick={goJoin}
                className="btn-accent px-5 py-2.5 text-sm"
              >
                Join SciSpace <ArrowRight className="h-4 w-4" />
              </button>
            </Magnetic>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-full border border-brand-dark/10 bg-white/70 text-brand-dark lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col bg-white/[0.97] pt-24 backdrop-blur-2xl lg:hidden"
          >
            <nav aria-label="Mobile" className="container-site flex flex-1 flex-col gap-1 overflow-y-auto pb-8">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.label}
                  type="button"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                  onClick={() => handleNav(link.to, link.hash)}
                  className="flex items-center justify-between border-b border-brand-dark/5 py-4 text-left font-display text-2xl font-semibold text-brand-dark"
                >
                  {link.label}
                  <ArrowRight className="h-5 w-5 text-brand-blue" />
                </motion.button>
              ))}
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                onClick={goJoin}
                className="btn-accent mt-6 w-full py-4 text-base"
              >
                Join SciSpace <ArrowRight className="h-5 w-5" />
              </motion.button>
            </nav>
            <div className="border-t border-brand-dark/5 py-5 text-center">
              <p className="text-xs uppercase tracking-widest2 text-brand-dark/50">
                {config.INSTITUTION}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}