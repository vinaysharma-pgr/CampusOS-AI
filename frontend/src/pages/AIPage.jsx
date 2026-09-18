// src/pages/AIPage.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Bot, MessageSquare, Zap, Brain, ArrowUpRight, Sparkles,
  Send, Mic, Paperclip, User, RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AIOrb from "../components/common/AIOrb";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getAIResponse } from "../features/ai-assistant/data/aiResponses";
import { chatWithAI } from "../api/ai.js";

const CONTAINER_STYLE = {
  width: "100%",
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  boxSizing: "border-box",
};

/* ─────────────────────────────────────────────
   INITIAL CONVERSATION — plays once, then user takes over
   ───────────────────────────────────────────── */
const SEED_CONVERSATION = [
  { role: "user", text: "Where is the AI & Robotics Lab?" },
  {
    role: "assistant",
    text: "The AI & Robotics Lab is in Block B, floor 2. From the Main Gate, walk 200m to the Academic Block, then turn right. It's the second door on your left.",
  },
];

const QUICK_PROMPTS = [
  "Is the library crowded?",
  "Next bus to Bareilly?",
  "Who teaches CS 301?",
  "Today's events?",
];

/* ─────────────────────────────────────────────
   INTERACTIVE CHAT
   ───────────────────────────────────────────── */
function InteractiveChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Play the seed conversation once on mount
  useEffect(() => {
    if (seeded) return;
    setSeeded(true);

    // Show first user message after 400ms
    const t1 = setTimeout(() => {
      setMessages([SEED_CONVERSATION[0]]);
    }, 400);

    // Show first assistant message after another 1200ms
    const t2 = setTimeout(() => {
      setThinking(true);
      setTimeout(() => {
        setThinking(false);
        setMessages(SEED_CONVERSATION);
      }, 900);
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [seeded]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  const send = async (text) => {
    const t = (text ?? input).trim();
    if (!t || thinking) return;

    setHasInteracted(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: t }]);
    setThinking(true);

    // Simulate AI thinking
    setTimeout(() => {
      const res = getAIResponse(t);
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.text, actions: res.actions },
      ]);
    }, 700 + Math.random() * 400);
  };

  const reset = () => {
    setMessages(SEED_CONVERSATION);
    setInput("");
    setHasInteracted(false);
  };

  const handleAction = (action) => {
    if (!action) return;
    if (action.action === "open-sos") {
      window.dispatchEvent(new CustomEvent("campusos:open-sos"));
      return;
    }
    if (action.to) navigate(action.to);
  };

  const renderText = (text) => {
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
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
        boxShadow: "0 32px 80px -24px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <div className="flex items-center" style={{ gap: "10px" }}>
          <span
            className="flex items-center justify-center rounded-lg"
            style={{
              height: "32px",
              width: "32px",
              backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
              color: "var(--color-primary)",
              border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
            }}
          >
            <Bot size={15} strokeWidth={1.75} />
          </span>
          <div>
            <p
              className="font-semibold text-text-primary"
              style={{ fontSize: "13px", letterSpacing: "-0.01em" }}
            >
              Campus Assistant
            </p>
            <div className="flex items-center" style={{ gap: "6px" }}>
              <span
                className="rounded-full"
                style={{
                  height: "6px",
                  width: "6px",
                  backgroundColor: "#4ade80",
                }}
              />
              <span
                className="font-mono"
                style={{
                  fontSize: "9.5px",
                  color: "var(--color-text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                online
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={reset}
          aria-label="Reset conversation"
          className="flex items-center justify-center rounded-md transition-colors"
          style={{
            height: "28px",
            width: "28px",
            color: "var(--color-text-tertiary)",
          }}
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex flex-col"
        style={{
          padding: "20px",
          gap: "16px",
          minHeight: "340px",
          maxHeight: "380px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-start ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
              style={{ gap: "10px" }}
            >
              <span
                className="flex shrink-0 items-center justify-center rounded-lg"
                style={{
                  height: "28px",
                  width: "28px",
                  backgroundColor:
                    msg.role === "user"
                      ? "var(--color-surface-raised)"
                      : "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                  color:
                    msg.role === "user"
                      ? "var(--color-text-secondary)"
                      : "var(--color-primary)",
                  border:
                    msg.role === "user"
                      ? "1px solid var(--color-border-strong)"
                      : "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
                }}
              >
                {msg.role === "user" ? (
                  <User size={13} strokeWidth={2} />
                ) : (
                  <Bot size={13} strokeWidth={1.75} />
                )}
              </span>
              <div
                className="flex flex-col"
                style={{
                  maxWidth: "78%",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px",
                    backgroundColor:
                      msg.role === "user"
                        ? "var(--color-surface-raised)"
                        : "var(--color-surface)",
                    border:
                      msg.role === "user"
                        ? "1px solid var(--color-border-strong)"
                        : "1px solid var(--color-border)",
                    fontSize: "12.5px",
                    lineHeight: 1.55,
                    color: "var(--color-text-primary)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {renderText(msg.text)}
                </div>

                {/* Action chips */}
                {msg.actions?.length > 0 && (
                  <div className="flex flex-wrap" style={{ gap: "6px" }}>
                    {msg.actions.map((a, ai) => (
                      <button
                        key={ai}
                        onClick={() => handleAction(a)}
                        className="rounded-md font-medium transition-colors"
                        style={{
                          padding: "5px 10px",
                          fontSize: "11px",
                          border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
                          backgroundColor: "color-mix(in srgb, var(--color-primary) 6%, transparent)",
                          color: "var(--color-primary)",
                        }}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start"
            style={{ gap: "10px" }}
          >
            <span
              className="flex shrink-0 items-center justify-center rounded-lg"
              style={{
                height: "28px",
                width: "28px",
                backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                color: "var(--color-primary)",
                border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
              }}
            >
              <Bot size={13} strokeWidth={1.75} />
            </span>
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                display: "flex",
                gap: "4px",
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="rounded-full"
                  style={{
                    height: "6px",
                    width: "6px",
                    backgroundColor: "var(--color-primary)",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick prompts (only before first user interaction) */}
      {!hasInteracted && messages.length >= 2 && (
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <p
            className="font-mono"
            style={{
              marginBottom: "8px",
              fontSize: "9.5px",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--color-text-tertiary)",
            }}
          >
            Try asking
          </p>
          <div className="flex flex-wrap" style={{ gap: "6px" }}>
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="rounded-md font-medium transition-all"
                style={{
                  padding: "6px 11px",
                  fontSize: "11.5px",
                  border: "1px solid var(--color-border-strong)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-primary) 40%, transparent)";
                  e.currentTarget.style.color = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border-strong)";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center"
        style={{
          padding: "12px 14px",
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
          gap: "10px",
        }}
      >
        <Paperclip size={14} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
        <Mic size={14} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your campus…"
          disabled={thinking}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "12.5px",
            color: "var(--color-text-primary)",
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || thinking}
          aria-label="Send message"
          className="flex items-center justify-center rounded-lg transition-all"
          style={{
            height: "30px",
            width: "30px",
            backgroundColor: input.trim() && !thinking
              ? "color-mix(in srgb, var(--color-primary) 15%, transparent)"
              : "transparent",
            color: input.trim() && !thinking ? "var(--color-primary)" : "var(--color-text-tertiary)",
            border: "1px solid",
            borderColor: input.trim() && !thinking
              ? "color-mix(in srgb, var(--color-primary) 40%, transparent)"
              : "var(--color-border-strong)",
            flexShrink: 0,
            opacity: thinking ? 0.5 : 1,
          }}
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────── */
export default function AIPage() {
  const { isAuthed } = useAuth();
  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <section
        className="relative overflow-hidden"
        style={{ paddingTop: "5rem", paddingBottom: "6rem" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 60%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0.4,
            backgroundImage:
              "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 75%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative text-center"
          style={CONTAINER_STYLE}
        >
          <span
            className="inline-flex items-center backdrop-blur-xl"
            style={{
              gap: "8px",
              padding: "6px 16px 6px 8px",
              borderRadius: "9999px",
              border: "1px solid var(--color-border-strong)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <span
              className="flex items-center justify-center rounded-full"
              style={{
                height: "22px",
                width: "22px",
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-fg)",
              }}
            >
              <Sparkles size={11} strokeWidth={2.5} />
            </span>
            <span
              className="font-mono font-medium"
              style={{
                fontSize: "10.5px",
                color: "var(--color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              Campus AI Assistant
            </span>
          </span>

          <h1
            className="text-text-primary"
            style={{
              marginTop: "1.5rem",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              maxWidth: "18ch",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Ask your campus{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom right, var(--color-primary), #7fedd8, var(--color-primary))",
              }}
            >
              anything
            </span>
            .
          </h1>

          <p
            className="text-text-secondary"
            style={{
              marginTop: "1.5rem",
              maxWidth: "36rem",
              marginLeft: "auto",
              marginRight: "auto",
              fontSize: "16px",
              lineHeight: 1.6,
            }}
          >
            Where's the nearest printer? When's the next bus? Who teaches CS 301? Real answers, grounded in live SRMS data.
          </p>

          <div
            className="flex flex-col items-center justify-center sm:flex-row"
            style={{ marginTop: "2rem", gap: "12px" }}
          >
            <Link
              to="/signup/otp"
              className="group inline-flex items-center justify-center rounded-full font-semibold transition-all hover:opacity-90"
              style={{
                height: "48px",
                paddingLeft: "26px",
                paddingRight: "26px",
                gap: "8px",
                backgroundColor: "var(--color-text-primary)",
                color: "var(--color-background)",
                fontSize: "14px",
                letterSpacing: "-0.015em",
              }}
            >
              Try it now
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center justify-center rounded-full font-medium transition-all"
              style={{
                height: "48px",
                paddingLeft: "26px",
                paddingRight: "26px",
                border: "1px solid var(--color-border-strong)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
                fontSize: "14px",
                letterSpacing: "-0.015em",
              }}
            >
              See all features
            </Link>
          </div>
        </motion.div>

        {/* LIVE CHAT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
          style={{
            ...CONTAINER_STYLE,
            maxWidth: "720px",
            marginTop: "4rem",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(63,224,197,0.2), transparent 70%)",
              filter: "blur(40px)",
              transform: "scale(1.1)",
            }}
          />
          <InteractiveChat />
        </motion.div>
      </section>

      {/* ═══════════ CAPABILITIES ═══════════ */}
      <section style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div style={CONTAINER_STYLE}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center"
            style={{
              maxWidth: "42rem",
              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: "3rem",
            }}
          >
            <p
              className="font-mono text-primary"
              style={{
                fontSize: "10.5px",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
              }}
            >
              What it can do
            </p>
            <h2
              className="text-text-primary"
              style={{
                marginTop: "1rem",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
              }}
            >
              Built for the way you actually use campus.
            </h2>
          </motion.div>

          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{ gap: "1.25rem" }}
          >
            {[
              {
                icon: MessageSquare,
                title: "Natural language",
                description:
                  "Ask in plain English. No commands, no menus, no codes. It understands intent.",
                accent: "var(--color-primary)",
              },
              {
                icon: Brain,
                title: "Context aware",
                description:
                  "Knows your role, your location, and your schedule — so answers are personalized, not generic.",
                accent: "#a855f7",
              },
              {
                icon: Zap,
                title: "Real-time data",
                description:
                  "Connected to live bus schedules, room occupancy, event calendars, and facility status.",
                accent: "#f59e0b",
              },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -4 }}
                className="relative overflow-hidden rounded-2xl"
                style={{
                  padding: "1.75rem",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  minHeight: "220px",
                }}
              >
                <div
                  className="pointer-events-none absolute"
                  style={{
                    top: "-4rem",
                    right: "-4rem",
                    height: "12rem",
                    width: "12rem",
                    borderRadius: "9999px",
                    backgroundColor: c.accent,
                    opacity: 0.06,
                    filter: "blur(40px)",
                  }}
                />
                <div
                  className="relative flex items-center justify-center rounded-xl"
                  style={{
                    height: "48px",
                    width: "48px",
                    backgroundColor: `${c.accent}15`,
                    color: c.accent,
                    border: `1px solid ${c.accent}40`,
                  }}
                >
                  <c.icon size={20} strokeWidth={1.75} />
                </div>
                <h3
                  className="relative text-text-primary"
                  style={{
                    marginTop: "1.5rem",
                    fontSize: "17px",
                    fontWeight: 600,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {c.title}
                </h3>
                <p
                  className="relative text-text-secondary"
                  style={{
                    marginTop: "10px",
                    fontSize: "13.5px",
                    lineHeight: 1.6,
                  }}
                >
                  {c.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SAMPLE QUESTIONS ═══════════ */}
      <section
        style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: "5rem",
          paddingBottom: "5rem",
        }}
      >
        <div style={CONTAINER_STYLE}>
          <div
            className="grid grid-cols-1 items-start lg:grid-cols-[1fr_1.2fr]"
            style={{ gap: "3rem" }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p
                className="font-mono text-primary"
                style={{
                  fontSize: "10.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                }}
              >
                Try asking
              </p>
              <h2
                className="text-text-primary"
                style={{
                  marginTop: "1rem",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 600,
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                }}
              >
                A few things students actually ask.
              </h2>
              <p
                className="text-text-secondary"
                style={{
                  marginTop: "1rem",
                  fontSize: "14.5px",
                  lineHeight: 1.6,
                }}
              >
                Every answer is grounded in your live campus data — not guesswork.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col"
              style={{ gap: "10px" }}
            >
              {[
                "Where is the nearest washroom?",
                "When's the next bus to Bareilly?",
                "Who teaches CS 301 and when?",
                "Is the library crowded right now?",
                "What events are happening today?",
                "How do I book the auditorium?",
              ].map((q, i) => (
                <motion.div
                  key={q}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between rounded-xl transition-all"
                  style={{
                    padding: "14px 18px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="text-text-primary"
                    style={{ fontSize: "13.5px" }}
                  >
                    {q}
                  </span>
                  <ArrowUpRight
                    size={14}
                    style={{
                      color: "var(--color-text-tertiary)",
                      flexShrink: 0,
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section
        className="relative overflow-hidden"
        style={{ paddingTop: "6rem", paddingBottom: "6rem" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 65%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex justify-center"
          style={CONTAINER_STYLE}
        >
          <AIOrb size={180} thinking={true} />
        </motion.div>
      </section>
    </>
  );
}