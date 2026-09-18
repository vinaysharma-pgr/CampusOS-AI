// src/features/facilities/components/FacilitySpecs.jsx
import { Users, Monitor, Layers, Ruler, Clock, Activity } from "lucide-react";

export default function FacilitySpecs({ facility }) {
  const { specs, live } = facility;

  const items = [
    { icon: Users, label: "Capacity", value: `${specs.seats} seats` },
    { icon: Monitor, label: "Systems", value: specs.systems ? `${specs.systems} units` : "—" },
    { icon: Layers, label: "Floors", value: specs.floors },
    { icon: Ruler, label: "Area", value: specs.area },
    { icon: Clock, label: "Operating hours", value: specs.hours },
    { icon: Activity, label: "Live occupancy", value: `${live.occupancy}%` },
  ];

  return (
    <div
      style={{
        padding: "1.5rem",
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
        Specifications
      </h3>
      <div
        className="grid grid-cols-2"
        style={{ marginTop: "1.25rem", columnGap: "1rem", rowGap: "1.25rem" }}
      >
        {items.map((it) => (
          <div key={it.label} className="flex flex-col" style={{ gap: "6px" }}>
            <div
              className="flex items-center"
              style={{ gap: "6px", color: "var(--color-text-tertiary)" }}
            >
              <it.icon size={11} strokeWidth={2} />
              <span
                className="font-mono"
                style={{
                  fontSize: "9.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                {it.label}
              </span>
            </div>
            <p
              className="font-mono font-semibold text-text-primary"
              style={{
                fontSize: "13px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {it.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}