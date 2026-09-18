// src/features/landing/components/CampusPreviewSection.jsx
import { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, ArrowUpRight, Activity } from "lucide-react";
import { CAMPUS_NODES, ROUTE_STATUS } from "../data/campusNodes";

const CONTAINER_STYLE = {
  width: "100%",
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

export default function CampusPreviewSection() {
  const [query, setQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [clock, setClock] = useState(() => new Date());
  const searchRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setSelectedNode(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filteredNodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CAMPUS_NODES;
    return CAMPUS_NODES.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.code.toLowerCase().includes(q) ||
        (n.tag ?? "").toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <section style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
      <div style={CONTAINER_STYLE}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between"
          style={{ marginBottom: "3.5rem" }}
        >
          <div style={{ maxWidth: "36rem" }}>
            <p
              className="font-mono text-primary"
              style={{
                fontSize: "10.5px",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
              }}
            >
              Live campus
            </p>
            <h2
              className="text-text-primary"
              style={{
                marginTop: "1rem",
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              See every corner of SRMS, in real time.
            </h2>
          </div>
          <Link
            to="/navigation"
            className="group inline-flex items-center gap-2 text-primary"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            Open full map
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl"
          style={{ padding: "6px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#0e1014" }}
        >
          <div
            className="relative overflow-hidden rounded-xl"
            style={{ border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#08090b" }}
          >
            <div
              className="relative flex w-full flex-col justify-between"
              style={{ minHeight: "520px", padding: "2rem" }}
            >
              <div className="relative z-10 flex w-full flex-wrap items-center justify-between gap-3">
                <div
                  className="flex items-center gap-2.5 rounded-lg"
                  style={{
                    padding: "8px 14px",
                    border: "1px solid rgba(255,255,255,0.13)",
                    backgroundColor: "#0e1014",
                  }}
                >
                  <Search size={14} className="text-primary" strokeWidth={2} />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search campus…"
                    className="bg-transparent text-text-primary outline-none"
                    style={{ width: "11rem", fontSize: "13px" }}
                  />
                  {query ? (
                    <button
                      onClick={() => setQuery("")}
                      className="font-mono text-text-tertiary hover:text-text-primary"
                      style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em" }}
                    >
                      Clear
                    </button>
                  ) : (
                    <kbd
                      className="hidden rounded border font-mono text-text-tertiary md:inline-block"
                      style={{
                        padding: "2px 6px",
                        fontSize: "9.5px",
                        borderColor: "rgba(255,255,255,0.13)",
                        backgroundColor: "#161a20",
                      }}
                    >
                      ⌘K
                    </kbd>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-2 rounded-lg"
                    style={{
                      padding: "8px 12px",
                      border: "1px solid rgba(74,222,128,0.25)",
                      backgroundColor: "rgba(74,222,128,0.06)",
                    }}
                  >
                    <Activity size={12} style={{ color: "#4ade80" }} />
                    <span
                      className="font-mono text-text-secondary"
                      style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}
                    >
                      Online
                    </span>
                  </div>
                  <div
                    className="hidden items-center gap-2 rounded-lg sm:flex"
                    style={{
                      padding: "8px 12px",
                      border: "1px solid rgba(255,255,255,0.13)",
                      backgroundColor: "#0e1014",
                    }}
                  >
                    <span
                      className="font-mono text-text-secondary"
                      style={{ fontSize: "10px", letterSpacing: "0.05em" }}
                    >
                      {clock.toLocaleTimeString([], { hour12: false })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 my-6 flex-1">
                <div className="relative h-full" style={{ minHeight: "380px" }}>
                  <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                    <defs>
                      <linearGradient id="line" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
                        <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[
                      [50, 88, 50, 68],
                      [50, 68, 50, 42],
                      [50, 42, 62, 22],
                      [50, 68, 25, 50],
                      [25, 50, 18, 30],
                      [50, 68, 75, 50],
                      [75, 50, 75, 30],
                      [50, 68, 40, 78],
                      [40, 78, 82, 68],
                      [50, 68, 15, 72],
                      [15, 72, 15, 88],
                    ].map(([x1, y1, x2, y2], i) => (
                      <motion.line
                        key={i}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke="url(#line)"
                        strokeWidth="1"
                        strokeDasharray="4 6"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.3 + i * 0.06 }}
                      />
                    ))}
                  </svg>

                  {filteredNodes.map((node, i) => (
                    <button
                      key={node.id}
                      onClick={() =>
                        setSelectedNode((p) => (p?.id === node.id ? null : node))
                      }
                      className="group absolute"
                      style={{
                        left: `${node.coords.x}%`,
                        top: `${node.coords.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      aria-label={node.name}
                    >
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 3 + (i % 4) * 0.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.2,
                        }}
                        className="relative flex items-center justify-center rounded-xl transition-all"
                        style={{
                          height: "44px",
                          width: "44px",
                          border:
                            selectedNode?.id === node.id
                              ? "1px solid var(--color-primary)"
                              : "1px solid rgba(255,255,255,0.13)",
                          backgroundColor:
                            selectedNode?.id === node.id
                              ? "rgba(63,224,197,0.2)"
                              : "#0e1014",
                          boxShadow:
                            selectedNode?.id === node.id
                              ? "0 0 30px -6px rgba(63,224,197,0.7)"
                              : "none",
                        }}
                      >
                        <span
                          className="font-mono font-semibold text-text-primary"
                          style={{ fontSize: "9.5px", letterSpacing: "0.02em" }}
                        >
                          {node.tag ?? node.code}
                        </span>
                        <span
                          className="absolute rounded-full ring-2"
                          style={{
                            top: "-2px",
                            right: "-2px",
                            height: "8px",
                            width: "8px",
                            backgroundColor:
                              node.status === "online"
                                ? "#4ade80"
                                : node.status === "warning"
                                ? "#f5a524"
                                : "#f0554d",
                            boxShadow: "0 0 0 2px #08090b",
                          }}
                        />
                      </motion.div>
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-5"
                style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="flex items-center gap-4 font-mono text-text-tertiary"
                  style={{
                    fontSize: "10.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                  }}
                >
                  <span>
                    Nodes {filteredNodes.length}/{CAMPUS_NODES.length}
                  </span>
                  <span style={{ height: "12px", width: "1px", backgroundColor: "rgba(255,255,255,0.13)" }} />
                  <span>{ROUTE_STATUS.route}</span>
                  <span style={{ height: "12px", width: "1px", backgroundColor: "rgba(255,255,255,0.13)" }} />
                  <span className="text-primary">ETA {ROUTE_STATUS.eta}</span>
                </div>
                <span
                  className="font-mono text-text-tertiary"
                  style={{
                    fontSize: "10.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                  }}
                >
                  0.4s response
                </span>
              </div>

              {selectedNode && (
                <div
                  className="absolute z-30 rounded-xl backdrop-blur-2xl"
                  style={{
                    bottom: "6rem",
                    right: "1.5rem",
                    width: "280px",
                    padding: "1.25rem",
                    border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
                    backgroundColor: "rgba(14,16,20,0.88)",
                    boxShadow: "0 0 60px -16px rgba(63,224,197,0.5)",
                  }}
                >
                  <p
                    className="font-mono text-primary"
                    style={{
                      fontSize: "9.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {selectedNode.tag ?? selectedNode.code}
                  </p>
                  <h4
                    className="font-semibold text-text-primary"
                    style={{ marginTop: "6px", fontSize: "15px" }}
                  >
                    {selectedNode.name}
                  </h4>
                  <p
                    className="text-text-secondary"
                    style={{ marginTop: "12px", fontSize: "12.5px", lineHeight: 1.6 }}
                  >
                    {selectedNode.description}
                  </p>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="font-mono text-text-tertiary hover:text-text-primary"
                    style={{
                      marginTop: "16px",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}