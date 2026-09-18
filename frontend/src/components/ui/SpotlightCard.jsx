// src/components/ui/SpotlightCard.jsx
// Reusable card with a cursor-following radial spotlight.
// Sets CSS custom properties directly on the event target (no ref needed).
import { useCallback } from "react";

export default function SpotlightCard({
  as: Component = "div",
  className = "",
  spotlightColor = "var(--color-primary)",
  intensity = 0.14,
  radius = 320,
  lift = 2,
  children,
  style = {},
  onPointerMove,
  onPointerLeave,
  ...rest
}) {
  const handleMove = useCallback(
    (e) => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
      el.style.setProperty("--spot-opacity", "1");
      if (onPointerMove) onPointerMove(e);
    },
    [onPointerMove]
  );

  const handleLeave = useCallback(
    (e) => {
      e.currentTarget.style.setProperty("--spot-opacity", "0");
      if (onPointerLeave) onPointerLeave(e);
    },
    [onPointerLeave]
  );

  return (
    <Component
      {...rest}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={("spotlight-card " + className).trim()}
      style={{
        "--spot-color": spotlightColor,
        "--spot-intensity": intensity,
        "--spot-radius": radius + "px",
        "--spot-lift": lift + "px",
        ...style,
      }}
    >
      {children}
    </Component>
  );
}