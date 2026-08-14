import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  label?: string;
  labelX: number;
  labelY: number;
};

const LABELS = ["Research", "AI", "Ideas", "Collaboration", "Innovation"];
const COLORS = {
  blue: "117, 193, 217",
  orange: "253, 128, 44",
  dark: "42, 42, 52",
};

/**
 * Canvas network background: slowly drifting nodes connected by faint
 * lines. Pure canvas, pauses when the tab is hidden, and collapses to a
 * static frame under prefers-reduced-motion.
 */
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    let nodes: Node[] = [];
    const dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeNodes();
    };

    const makeNodes = () => {
      const count = Math.min(34, Math.max(14, Math.floor((width * height) / 26000)));
      nodes = [];
      for (let i = 0; i < count; i++) {
        const label = i < LABELS.length ? LABELS[i] : undefined;
        const pad = label ? 70 : 20;
        nodes.push({
          x: pad + Math.random() * (width - pad * 2),
          y: pad + Math.random() * (height - pad * 2),
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: label ? 5.5 : 2.5 + Math.random() * 2,
          label,
          labelX: 0,
          labelY: 0,
        });
      }
    };

    const linkDistance = 150;

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }

      // connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDistance) {
            const alpha = (1 - dist / linkDistance) * 0.55;
            ctx.strokeStyle = a.label || b.label ? `rgba(${COLORS.blue}, ${alpha})` : `rgba(${COLORS.dark}, ${alpha * 0.5})`;
            ctx.lineWidth = a.label || b.label ? 1.1 : 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        const isLabeled = Boolean(n.label);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        if (isLabeled) {
          const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 1200 + n.x);
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3.4);
          grad.addColorStop(0, `rgba(${COLORS.blue}, ${0.4 + pulse * 0.3})`);
          grad.addColorStop(1, `rgba(${COLORS.blue}, 0)`);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = n.x > width * 0.72 && n.y > height * 0.6 ? `rgba(${COLORS.orange}, 0.95)` : `rgba(${COLORS.blue}, 0.95)`;
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(${COLORS.dark}, 0.32)`;
          ctx.fill();
        }
      }

      // labels
      ctx.fillStyle = `rgba(42, 42, 52, 0.62)`;
      ctx.font = "500 11px 'Space Grotesk Variable', Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.strokeStyle = `rgba(255,255,255,0.85)`;
      ctx.lineWidth = 3;
      for (const n of nodes) {
        if (!n.label) continue;
        const tx = n.x;
        const ty = n.y + n.r + 14;
        ctx.strokeText(n.label, tx, ty);
        ctx.fillText(n.label, tx, ty);
      }
    };

    const tick = () => {
      if (!running) return;
      drawFrame();
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running && raf === 0) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      // keep canvas stationary relative to its section; nothing to do
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });

    if (reduce) {
      drawFrame(); // static frame only
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}