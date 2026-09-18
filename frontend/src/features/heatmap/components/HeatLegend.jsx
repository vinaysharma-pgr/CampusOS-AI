// src/features/heatmap/components/HeatLegend.jsx

const STEPS = [
  { label: "Empty", color: "bg-green-500" },
  { label: "Light", color: "bg-lime-500" },
  { label: "Moderate", color: "bg-yellow-500" },
  { label: "Busy", color: "bg-amber-500" },
  { label: "Very busy", color: "bg-orange-500" },
  { label: "Packed", color: "bg-red-500" },
];

export default function HeatLegend() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
        Legend
      </p>
      <ul className="mt-4 space-y-2.5">
        {STEPS.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5 text-[12px]">
            <span className={`h-2.5 w-6 rounded-sm ${s.color}`} />
            <span className="text-text-secondary">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}