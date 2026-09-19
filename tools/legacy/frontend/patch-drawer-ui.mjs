import fs from "node:fs";

const path = "src/features/ai-assistant/components/AIChatDrawer.jsx";

const FILE = `// src/features/ai-assistant/components/AIChatDrawer.jsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, RefreshCw } from "lucide-react";
import { QUICK_PROMPTS, getAIResponse } from "../data/aiResponses";
import { chatWithAI } from "../../../api/ai.js";
import ChatMessage from "./ChatMessage";

const WELCOME = {
  role: "assistant",
  text: "Hi! I'm **CampusOS AI**. Ask me anything about SRMS CET — classes, buses, buildings, events, or emergencies.",
  actions: [],
};

export default function AIChatDrawer({ open, onClose }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (text) => {
    const t = (text ?? input).trim();
    if (!t || thinking) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: t }]);
    setThinking(true);

    try {
      const res = await chatWithAI(t);
      setMessages((prev) => [...prev, { role: "assistant", text: res.text, actions: res.actions || [] }]);
    } catch (err) {
      console.error("Gemini failed:", err.response?.status, err.response?.data?.message || err.message);
      const fallback = getAIResponse(t);
      setMessages((prev) => [...prev, { role: "assistant", text: fallback.text, actions: fallback.actions }]);
    } finally {
      setThinking(false);
    }
  };

  const reset = () => {
    setMessages([WELCOME]);
    setInput("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[85] bg-black/40 backdrop-blur-[2px] lg:hidden"
          />

          <motion.aside
            initial={{ opacity: 0, x: 40, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, y: 20, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[86] flex flex-col overflow-hidden"
            style={{
              bottom: "1.5rem",
              right: "1.5rem",
              width: "min(440px, calc(100vw - 3rem))",
              height: "min(640px, calc(100vh - 3rem))",
              borderRadius: "20px",
              border: "1px solid var(--color-border-strong)",
              backgroundColor: "var(--color-surface)",
              boxShadow: "0 32px 96px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(63,224,197,0.08)",
            }}
            role="dialog"
            aria-label="AI assistant"
          >
            {/* Header */}
            <div
              className="relative flex items-center justify-between shrink-0"
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--color-border)",
                background: "linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 6%, var(--color-surface-raised)) 0%, var(--color-surface-raised) 100%)",
              }}
            >
              <div className="flex items-center" style={{ gap: "12px" }}>
                <div
                  className="relative flex items-center justify-center shrink-0"
                  style={{
                    height: "38px",
                    width: "38px",
                    borderRadius: "11px",
                    background: "linear-gradient(135deg, #3fe0c5 0%, #22b89f 100%)",
                    boxShadow: "0 0 24px -4px rgba(63,224,197,0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                >
                  <Sparkles size={18} strokeWidth={2.2} color="#04150f" />
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--color-text-primary)" }}>
                    CampusOS AI
                  </p>
                  <div className="flex items-center" style={{ gap: "6px", marginTop: "2px" }}>
                    <span className="relative flex" style={{ height: "6px", width: "6px" }}>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                      <span className="relative inline-flex rounded-full" style={{ height: "6px", width: "6px", backgroundColor: "#4ade80" }} />
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4ade80" }}>
                      Online
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center" style={{ gap: "6px" }}>
                <button
                  onClick={reset}
                  aria-label="Reset conversation"
                  className="flex items-center justify-center transition-colors"
                  style={{
                    height: "32px",
                    width: "32px",
                    borderRadius: "8px",
                    color: "var(--color-text-tertiary)",
                    background: "transparent",
                    border: "1px solid var(--color-border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--color-text-primary)";
                    e.currentTarget.style.borderColor = "var(--color-border-strong)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--color-text-tertiary)";
                    e.currentTarget.style.borderColor = "var(--color-border)";
                  }}
                >
                  <RefreshCw size={13} />
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="flex items-center justify-center transition-colors"
                  style={{
                    height: "32px",
                    width: "32px",
                    borderRadius: "8px",
                    color: "var(--color-text-tertiary)",
                    background: "transparent",
                    border: "1px solid var(--color-border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--color-text-primary)";
                    e.currentTarget.style.borderColor = "var(--color-border-strong)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--color-text-tertiary)";
                    e.currentTarget.style.borderColor = "var(--color-border)";
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto"
              style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {messages.map((m, i) => (
                <ChatMessage key={i} message={m} />
              ))}

              {thinking && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start"
                  style={{ gap: "10px" }}
                >
                  <div
                    className="flex shrink-0 items-center justify-center"
                    style={{
                      height: "30px",
                      width: "30px",
                      borderRadius: "9px",
                      background: "linear-gradient(135deg, #3fe0c5 0%, #22b89f 100%)",
                      boxShadow: "0 0 16px -3px rgba(63,224,197,0.5)",
                    }}
                  >
                    <Sparkles size={14} strokeWidth={2.2} color="#04150f" />
                  </div>
                  <div
                    className="flex items-center"
                    style={{
                      gap: "8px",
                      padding: "11px 14px",
                      borderRadius: "14px 14px 14px 4px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-surface-raised)",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="rounded-full"
                        style={{ height: "6px", width: "6px", backgroundColor: "#3fe0c5" }}
                        animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                      />
                    ))}
                    <span style={{ fontSize: "11.5px", color: "var(--color-text-tertiary)", marginLeft: "2px" }}>
                      CampusOS is thinking
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick prompts */}
            {messages.length === 1 && (
              <div
                className="shrink-0"
                style={{ padding: "14px 18px 8px", borderTop: "1px solid var(--color-border)" }}
              >
                <p
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "var(--color-text-tertiary)",
                    marginBottom: "10px",
                  }}
                >
                  Try asking
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {QUICK_PROMPTS.slice(0, 4).map((p) => (
                    <button
                      key={p.label}
                      onClick={() => send(p.text)}
                      className="transition-all"
                      style={{
                        padding: "7px 12px",
                        fontSize: "11.5px",
                        fontWeight: 500,
                        borderRadius: "9999px",
                        border: "1px solid var(--color-border-strong)",
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-text-secondary)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(63,224,197,0.5)";
                        e.currentTarget.style.color = "#3fe0c5";
                        e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--color-primary) 6%, transparent)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-border-strong)";
                        e.currentTarget.style.color = "var(--color-text-secondary)";
                        e.currentTarget.style.backgroundColor = "var(--color-surface)";
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center shrink-0"
              style={{
                padding: "12px 14px",
                gap: "8px",
                borderTop: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface-raised)",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about classes, buses, buildings…"
                disabled={thinking}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "11px 14px",
                  fontSize: "13px",
                  color: "var(--color-text-primary)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-strong)",
                  borderRadius: "10px",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(63,224,197,0.5)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border-strong)"; }}
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                aria-label="Send message"
                className="flex shrink-0 items-center justify-center transition-all"
                style={{
                  height: "40px",
                  width: "40px",
                  borderRadius: "10px",
                  background: input.trim() && !thinking
                    ? "linear-gradient(135deg, #3fe0c5 0%, #22b89f 100%)"
                    : "var(--color-surface-raised)",
                  color: input.trim() && !thinking ? "#04150f" : "var(--color-text-tertiary)",
                  border: "1px solid " + (input.trim() && !thinking ? "transparent" : "var(--color-border)"),
                  cursor: !input.trim() || thinking ? "not-allowed" : "pointer",
                  opacity: thinking ? 0.5 : 1,
                  boxShadow: input.trim() && !thinking ? "0 0 20px -4px rgba(63,224,197,0.5)" : "none",
                }}
              >
                {thinking ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={15} strokeWidth={2.2} />
                )}
              </button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
`;

fs.writeFileSync(path, FILE, "utf8");
console.log("AIChatDrawer.jsx rewritten with polished UI");