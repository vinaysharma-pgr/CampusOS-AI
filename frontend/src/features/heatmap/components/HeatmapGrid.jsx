// src/features/heatmap/components/HeatmapGrid.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { heatColor, heatLabel, HEATMAP_DATA } from "../data/heatmapData";
import { FACILITIES } from "../../facilities/data/facilities";

export default function HeatmapGrid({ hourIndex }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
          Facility occupancy
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
          Live · {hourIndex + 7}:00
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {FACILITIES.map((facility) => {
          const series = HEATMAP_DATA[facility.id];
          if (!series) return null;
          const value = series[hourIndex];
          return (
            <Link
              key={facility.id}
              to={`/facilities/${facility.id}`}
              className="group flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-3 py-2.5 transition-all hover:border-primary/40"
            >
              <span className="w-40 truncate text-[12.5px] font-medium text-text-primary">
                {facility.name}
              </span>
              <div className="flex-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-6 rounded-md ${heatColor(value)}`}
                />
              </div>
              <span className="w-24 text-right font-mono text-[11px] uppercase tracking-wider text-text-tertiary group-hover:text-text-primary">
                {heatLabel(value)}
              </span>
              <span className="w-10 text-right font-mono text-[12px] font-semibold text-text-primary">
                {value}%
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}