import { useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useReducedMotion } from "framer-motion";

/** Thin brand-gradient progress bar at the very top of the page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.008 && !enabled) setEnabled(true);
    if (v <= 0.008 && enabled) setEnabled(false);
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-brand-gradient"
      style={{ scaleX, opacity: enabled ? 1 : 0 }}
    />
  );
}