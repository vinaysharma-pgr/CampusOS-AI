// src/features/dashboard/components/TodayClassCard.jsx
import { motion } from "framer-motion";
import { Clock, MapPin, User, Check, X, Bell } from "lucide-react";

const STATUS_STYLE = {
  done: "border-border bg-surface opacity-70",
  next: "border-primary/50 bg-primary/[0.06] shadow-[0_0_40px_-16px_rgba(63,224,197,0.5)]",
  upcoming: "border-border bg-surface",
};

export default function TodayClassCard({ cls, index }) {
  const style = STATUS_STYLE[cls.status] ?? STATUS_STYLE.upcoming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex items-center gap-4 rounded-xl border p-4 ${style}`}
    >
      {cls.status === "next" && (
        <span className="absolute -top-2 left-4 flex items-center gap-1 rounded-full border border-primary bg-background px-2 py-0.5">
          <Bell size={9} className="text-primary" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-primary">Next</span>
        </span>
      )}

      <div className="flex w-16 shrink-0 flex-col items-start">
        <span className="font-mono text-[15px] font-semibold tracking-tight text-text-primary">
          {cls.start}
        </span>
        <span className="font-mono text-[10.5px] text-text-tertiary">{cls.end}</span>
      </div>

      <div className="h-10 w-px bg-border" />

      <div className="flex-1 min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
          {cls.code}
        </p>
        <p className="mt-0.5 truncate text-[14.5px] font-semibold text-text-primary">
          {cls.name}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-text-secondary">
          <span className="flex items-center gap-1">
            <User size={10} />
            {cls.professor}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            {cls.room}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        {cls.attendance === "present" && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/15 text-green-500 ring-1 ring-green-500/30">
            <Check size={13} strokeWidth={3} />
          </span>
        )}
        {cls.attendance === "absent" && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/15 text-red-500 ring-1 ring-red-500/30">
            <X size={13} strokeWidth={3} />
          </span>
        )}
        {!cls.attendance && cls.status !== "done" && (
          <div className="flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-raised px-2.5 py-1.5">
            <Clock size={11} className="text-text-tertiary" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
              Later
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}