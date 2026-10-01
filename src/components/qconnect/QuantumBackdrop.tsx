import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/** Lightweight glowing quantum particle canvas. Pauses off-screen. Capped for 60fps. */
export function QuantumParticles({ density = 60 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    type Pt = { x: number; y: number; vx: number; vy: number; r: number; hue: number; a: number };
    let pts: Pt[] = [];
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 2,
        hue: Math.random() < 0.7 ? 190 : 45,
        a: 0.35 + Math.random() * 0.45,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const col = p.hue > 100 ? `34,211,238` : `212,175,55`;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(${col},${p.a})`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      io.disconnect();
    };
  }, [density, reduce]);

  if (reduce) return null;
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}

export function QuantumGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.09]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(148,197,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(148,197,255,0.7) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(ellipse 90% 80% at 50% 20%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 20%, black 40%, transparent 100%)",
      }}
    />
  );
}

export function QuantumBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 420px at 12% 0%, rgba(34,211,238,0.20), transparent 60%), radial-gradient(760px 420px at 88% 12%, rgba(59,130,246,0.22), transparent 60%), radial-gradient(700px 380px at 85% 100%, rgba(212,175,55,0.12), transparent 60%), linear-gradient(180deg,#04060f,#080f2c 55%,#100a2c)",
        }}
      />
    </div>
  );
}
