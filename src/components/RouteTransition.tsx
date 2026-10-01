import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

const DARK_BG = "#04060f";
const LIGHT_BG = "#F6F8FA";

/**
 * Flash-free navigation: body/html backdrop is painted to match the
 * incoming route BEFORE the fade runs, so no white (or dark) frame
 * ever shows through. No exit gap — instant swap + elegant enter.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const isDark = pathname.startsWith("/transmission");

  useEffect(() => {
    const bg = isDark ? DARK_BG : LIGHT_BG;
    document.body.style.background = bg;
    document.documentElement.style.background = bg;
    return () => {
      document.body.style.background = "";
      document.documentElement.style.background = "";
    };
  }, [isDark]);

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0.08 : 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{ minHeight: "100vh", background: isDark ? DARK_BG : "transparent" }}
    >
      {children}
    </motion.div>
  );
}
