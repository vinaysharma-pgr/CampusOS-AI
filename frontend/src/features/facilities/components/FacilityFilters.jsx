// src/features/facilities/components/FacilityFilters.jsx
import {
  LayoutGrid,
  FlaskConical,
  BookOpen,
  GraduationCap,
  Dumbbell,
  UtensilsCrossed,
  Mic2,
  Search,
  X,
} from "lucide-react";
import SpotlightCard from "../../../components/ui/SpotlightCard";

const ICONS = {
  LayoutGrid,
  FlaskConical,
  BookOpen,
  GraduationCap,
  Dumbbell,
  UtensilsCrossed,
  Mic2,
};

export default function FacilityFilters({
  types = [],
  activeType,
  onTypeChange,
  query,
  onQueryChange,
  resultCount,
}) {
  return (
    <div className="flex flex-col" style={{ gap: "1.25rem" }}>
      {/* Search + count row */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        style={{ gap: "12px" }}
      >
        <div
          className="flex items-center"
          style={{
            width: "100%",
            maxWidth: "26rem",
            padding: "10px 14px",
            gap: "10px",
            borderRadius: "0.75rem",
            border: "1px solid var(--color-border-strong)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <Search size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} strokeWidth={2} />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by name, code, or type"
            style={{
              width: "100%",
              minWidth: 0,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "13px",
              color: "var(--color-text-primary)",
            }}
            aria-label="Search facilities"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <p
          className="font-mono"
          style={{
            fontSize: "10.5px",
            color: "var(--color-text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            flexShrink: 0,
          }}
        >
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </p>
      </div>

      {/* Type pills */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        {types.map((t) => {
          const Icon = ICONS[t.icon] ?? LayoutGrid;
          const active = activeType === t.id;
          return (
            <SpotlightCard
              as="button"
              key={t.id}
              onClick={() => onTypeChange(t.id)}
              radius={140}
              intensity={active ? 0.22 : 0.14}
              lift={1}
              className="inline-flex items-center font-medium"
              style={{
                gap: "7px",
                padding: "8px 14px",
                borderRadius: "0.75rem",
                fontSize: "12.5px",
                border: active
                  ? "1px solid var(--color-primary)"
                  : "1px solid var(--color-border-strong)",
                backgroundColor: active
                  ? "color-mix(in srgb, var(--color-primary) 10%, transparent)"
                  : "var(--color-surface)",
                color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              <Icon size={13} strokeWidth={1.75} />
              {t.label}
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
}