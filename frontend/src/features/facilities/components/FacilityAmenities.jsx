// src/features/facilities/components/FacilityAmenities.jsx
import { Check } from "lucide-react";

export default function FacilityAmenities({ amenities = [] }) {
  if (!amenities.length) return null;
  return (
    <div
      style={{
        padding: "1.75rem",
        borderRadius: "1rem",
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      <h3
        className="font-mono"
        style={{
          fontSize: "10.5px",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--color-text-tertiary)",
        }}
      >
        Amenities & Services
      </h3>
      <ul
        className="flex flex-wrap"
        style={{ marginTop: "1.25rem", gap: "8px", padding: 0, listStyle: "none" }}
      >
        {amenities.map((a) => (
          <li
            key={a}
            className="inline-flex items-center"
            style={{
              gap: "6px",
              padding: "7px 12px",
              borderRadius: "8px",
              border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--color-primary) 6%, transparent)",
              fontSize: "12px",
              color: "var(--color-text-primary)",
            }}
          >
            <Check size={11} style={{ color: "var(--color-primary)" }} strokeWidth={2.5} />
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}