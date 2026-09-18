// src/components/common/GridBackground.jsx
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: 1 + ((i * 3) % 2),
  top: (i * 47) % 100,
  left: (i * 61) % 100,
  delay: (i % 9) * 0.5,
  duration: 8 + (i % 6),
}));

export default function GridBackground({ children, className = "" }) {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const gridX = useTransform(springX, [-0.5, 0.5], [-16, 16]);
  const gridY = useTransform(springY, [-0.5, 0.5], [-16, 16]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onMove = (e) => {
      const r = node.getBoundingClientRect();
      mouseX.set((e.clientX - r.left) / r.width - 0.5);
      mouseY.set((e.clientY - r.top) / r.height - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mouseX, mouseY]);

  return (
    <div ref={ref} className={`relative overflow-hidden bg-background ${className}`}>
      {/* Static grid, very subtle */}
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden="true" />

      {/* Parallax grid */}
      <motion.div
        className="blueprint-grid-fine pointer-events-none absolute -inset-8 opacity-[0.5]"
        style={{ x: gridX, y: gridY }}
        aria-hidden="true"
      />

      {/* Radial mask glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 55% at 50% 40%, rgba(63,224,197,0.09), transparent 65%)",
        }}
        aria-hidden="true"
      />

      {/* Particles */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: "radial-gradient(ellipse 65% 55% at 50% 40%, black 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 40%, black 10%, transparent 70%)",
        }}
      >
        {PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-primary/40"
            style={{
              top: `${p.top}%`, left: `${p.left}%`,
              width: p.size, height: p.size,
            }}
            animate={{ y: [0, -28, 0], opacity: [0.15, 0.7, 0.15] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="relative">{children}</div>
    </div>
  );
}