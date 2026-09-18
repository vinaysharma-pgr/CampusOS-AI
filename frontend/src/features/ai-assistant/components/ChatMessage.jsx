// src/features/ai-assistant/components/ChatMessage.jsx
import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Minimal markdown: **bold**, line breaks
function renderText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatMessage({ message }) {
  const navigate = useNavigate();
  const isUser = message.role === "user";

  const handleAction = (action) => {
    if (action.action === "open-sos") {
      window.dispatchEvent(new CustomEvent("campusos:open-sos"));
      return;
    }
    if (action.to) navigate(action.to);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? "bg-surface-raised text-text-secondary"
            : "bg-primary/15 text-primary ring-1 ring-primary/30"
        }`}
      >
        {isUser ? <User size={13} strokeWidth={2} /> : <Sparkles size={13} strokeWidth={2} />}
      </div>

      <div className={`flex max-w-[80%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
            isUser
              ? "bg-primary text-primary-fg"
              : "border border-border bg-surface text-text-secondary"
          }`}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {renderText(message.text)}
        </div>

        {!isUser && message.actions?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.actions.map((a, i) => (
              <button
                key={i}
                onClick={() => handleAction(a)}
                className="rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/15"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}