import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Scramble decrypt: CLASSIFIED → Q-CONNECT 2026. Skipped on reduced motion. */
export function DecryptTitle({ onDone }: { onDone?: () => void }) {
  const reduce = useReducedMotion();
  const final = "Q-CONNECT 2026";
  const [text, setText] = useState("CLASSIFIED ▓▓▓▓");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduce) {
      setText(final);
      setDone(true);
      onDone?.();
      return;
    }
    const glyphs = "█▓▒░<>/\\|01";
    let frame = 0;
    const total = 34;
    const id = window.setInterval(() => {
      frame += 1;
      const reveal = Math.floor((frame / total) * final.length);
      let out = final.slice(0, reveal);
      for (let i = reveal; i < final.length; i += 1) {
        out += final[i] === " " || final[i] === "-" ? final[i] : glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      setText(out);
      if (frame >= total) {
        window.clearInterval(id);
        setText(final);
        setDone(true);
        onDone?.();
      }
    }, 42);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.h1
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      className="qconnect-h-display font-display font-extrabold tracking-tight text-white"
      aria-label="Q-Connect 2026"
    >
      {text}
      {!done && (
        <motion.span
          aria-hidden="true"
          className="ml-2 inline-block h-[0.9em] w-[0.55em] translate-y-[0.12em] rounded-sm bg-cyan-300"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.7, repeat: Infinity }}
        />
      )}
    </motion.h1>
  );
}
