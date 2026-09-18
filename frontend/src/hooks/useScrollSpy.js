// src/hooks/useScrollSpy.js
import { useEffect, useState } from "react";

/**
 * Tracks which section is currently in view based on scroll position.
 * @param {string[]} sectionIds - Ordered array of section IDs to track.
 * @param {object} options - { offset: number }
 * @returns {string|null} - ID of the currently active section.
 */
export default function useScrollSpy(sectionIds, { offset = 120 } = {}) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      let current = sectionIds[0] ?? null;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.offsetTop - offset;
        if (scrollY >= top) current = id;
        else break;
      }
      setActiveId(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [sectionIds, offset]);

  return activeId;
}