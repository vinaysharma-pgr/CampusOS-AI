// src/features/dashboard/components/DeadlineCard.jsx
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const URGENCY = {
  high:   { color: "text-red-500",   bg: "bg-red-500/[0.08]",   border: "border-red-500/30" },
  medium: { color: "text-amber-500", bg: "bg-amber-500/[0.08]", border: "border-amber-500/30" },
  low:    { color: "text-primary",   bg: "bg-primary/[0.08]",   border: "border-primary/30" },
};

export default function DeadlineCard({ deadline, index = 0 }) {
  const u = URGENCY[deadline.urgency] ?? URGENCY.low;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`flex items-start gap-3 rounded-lg border ${u.border} ${u.bg} p-3.5`}
    >
      <AlertCircle size={15} className={`mt-0.5 shrink-0 ${u.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-text-primary">{deadline.title}</p>
        <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
          <span>{deadline.subject}</span>
          <span className="h-1 w-1 rounded-full bg-text-tertiary" />
          <span className={u.color}>{deadline.due}</span>
        </div>
      </div>
    </motion.div>
  );
}