// src/features/landing/components/CampusNodeDetail.jsx
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Users, Zap, MapPin } from "lucide-react";

const STATUS = {
  online: { label: "Online", dot: "bg-green-500", text: "text-green-500" },
  warning: { label: "Warning", dot: "bg-amber-500", text: "text-amber-500" },
  offline: { label: "Offline", dot: "bg-red-500", text: "text-red-500" },
};

const TYPE_LABEL = {
  gate: "Entry Point",
  building: "Academic Building",
  lab: "Laboratory",
  facility: "Campus Facility",
  medical: "Medical",
};

export default function CampusNodeDetail({ node, onClose }) {
  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ opacity: 0, x: 24, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 24, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-4 top-20 z-30 w-[280px] rounded-xl border border-primary/30 bg-surface-overlay p-5 shadow-[0_0_60px_-16px_rgba(63,224,197,0.5)] backdrop-blur-2xl lg:w-[320px]"
          role="dialog"
          aria-label={`${node.name} details`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-primary">
                {TYPE_LABEL[node.type] ?? node.code}
              </p>
              <h4 className="mt-1.5 text-[15px] font-semibold leading-tight text-text-primary">
                {node.name}
              </h4>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary"
            >
              <X size={13} />
            </button>
          </div>

          {node.status && (
            <div className="mt-3 flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS[node.status].dot}`} />
              <span
                className={`font-mono text-[10px] uppercase tracking-wider ${STATUS[node.status].text}`}
              >
                {STATUS[node.status].label}
              </span>
            </div>
          )}

          <p className="mt-4 text-[12.5px] leading-relaxed text-text-secondary">
            {node.description}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {typeof node.occupancy === "number" && (
              <Stat icon={Users} label="Occ" value={`${node.occupancy}%`} />
            )}
            {typeof node.load === "number" && (
              <Stat icon={Activity} label="Load" value={`${node.load}%`} />
            )}
            <Stat icon={Zap} label="Latency" value="0.4s" />
            <Stat icon={MapPin} label="Tag" value={node.tag ?? "—"} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-md border border-border bg-surface p-2.5">
      <div className="flex items-center gap-1.5 text-text-tertiary">
        <Icon size={10} strokeWidth={2} />
        <span className="font-mono text-[9px] uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="mt-1 font-mono text-[12.5px] font-semibold text-text-primary">{value}</p>
    </div>
  );
}