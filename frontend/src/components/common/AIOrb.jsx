// src/components/common/AIOrb.jsx
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function AIOrb({ size = 180, thinking = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, color-mix(in srgb, var(--color-primary) 40%, transparent) 0%, transparent 65%)",
          filter: "blur(20px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{
          duration: thinking ? 1.2 : 3.4,
          repeat: Infinity,
          ease: thinking ? "linear" : [0.37, 0, 0.63, 1],
        }}
        aria-hidden="true"
      />

      {/* Middle shell */}
      <motion.div
        className="relative flex h-2/3 w-2/3 items-center justify-center rounded-full border border-primary/50 bg-surface-overlay backdrop-blur-xl"
        style={{ boxShadow: "0 0 60px -12px rgba(63,224,197,0.6), inset 0 0 40px -12px color-mix(in srgb, var(--color-primary) 30%, transparent)" }}
        animate={{ scale: thinking ? [1, 0.97, 1] : [1, 1.05, 1] }}
        transition={{
          duration: thinking ? 1.2 : 3.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles className="text-primary" size={size * 0.22} strokeWidth={1.5} />

        {/* Scan line inside */}
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          aria-hidden="true"
        >
          <motion.div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
            animate={{ y: [0, size * 0.6, 0] }}
            transition={{ duration: thinking ? 1.2 : 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>

      {/* Orbital rings */}
      {[0, 1, 2].map((ring) => (
        <motion.span
          key={ring}
          className="absolute rounded-full border border-primary/25"
          style={{ inset: -ring * 16 }}
          animate={{ opacity: [0.6, 0.15, 0.6], rotate: 360 }}
          transition={{
            opacity: { duration: 3.4, delay: ring * 0.5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 22 + ring * 6, repeat: Infinity, ease: "linear" },
          }}
          aria-hidden="true"
        />
      ))}
    </motion.div>
  );
}