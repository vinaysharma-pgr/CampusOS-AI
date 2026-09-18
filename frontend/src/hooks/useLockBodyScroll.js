// src/hooks/useLockBodyScroll.js
import { useEffect } from "react";

/**
 * Locks body scroll while `locked` is true. Restores prior overflow on cleanup.
 */
export default function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}