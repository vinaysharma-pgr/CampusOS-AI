// src/components/ui/ThemeToggle.jsx
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative flex shrink-0 items-center justify-center rounded-lg transition-colors ${className}`}
      style={{
        height: "36px",
        width: "36px",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border-strong)",
        color: "var(--color-text-secondary)",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
          transition={{ duration: 0.2 }}
          className="absolute flex items-center justify-center"
        >
          {isDark ? (
            <Moon size={15} strokeWidth={1.75} />
          ) : (
            <Sun size={15} strokeWidth={1.75} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}