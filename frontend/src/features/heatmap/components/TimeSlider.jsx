// src/features/heatmap/components/TimeSlider.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

export default function TimeSlider({ hours, value, onChange, playing, onPlayToggle }) {
  const currentHour = hours[value];
  const label = `${String(currentHour).padStart(2, "0")}:00`;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
            Time of day
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-text-primary">
            {label}
          </p>
        </div>
        <button
          onClick={onPlayToggle}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-strong bg-surface text-primary transition-all hover:border-primary/40 hover:bg-hover"
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
      </div>

      <div className="relative mt-5">
        <input
          type="range"
          min={0}
          max={hours.length - 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Time of day"
        />
        <div className="flex h-2 items-center gap-0.5">
          {hours.map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                i <= value ? "bg-primary" : "bg-surface-raised"
              }`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[9.5px] uppercase tracking-wider text-text-tertiary">
          <span>7 AM</span>
          <span>2 PM</span>
          <span>9 PM</span>
        </div>
      </div>
    </div>
  );
}