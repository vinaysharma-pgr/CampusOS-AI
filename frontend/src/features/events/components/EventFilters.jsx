// src/features/events/components/EventFilters.jsx
export default function EventFilters({ types, active, onChange, count }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      style={{ gap: "16px" }}
    >
      <div className="flex flex-wrap" style={{ gap: "8px" }}>
        {types.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="rounded-lg font-medium transition-all"
              style={{
                padding: "8px 14px",
                fontSize: "12.5px",
                border: isActive
                  ? "1px solid var(--color-primary)"
                  : "1px solid var(--color-border-strong)",
                backgroundColor: isActive
                  ? "rgba(13,148,136,0.08)"
                  : "var(--color-surface)",
                color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <p
        className="font-mono"
        style={{
          fontSize: "10.5px",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--color-text-tertiary)",
        }}
      >
        {count} {count === 1 ? "event" : "events"}
      </p>
    </div>
  );
}