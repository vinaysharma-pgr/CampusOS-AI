// src/features/ai-assistant/components/AIChatBubble.jsx
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export default function AIChatBubble({ open, onToggle, hasUnread }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      onClick={onToggle}
      aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      className="fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-fg shadow-[0_8px_32px_-6px_rgba(63,224,197,0.6)] transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_40px_-6px_rgba(63,224,197,0.8)]"
    >
      {hasUnread && !open && (
        <span className="absolute -right-1 -top-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
        </span>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.span
            key="x"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <X size={22} strokeWidth={2} />
          </motion.span>
        ) : (
          <motion.span
            key="sparkles"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <Sparkles size={22} strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}