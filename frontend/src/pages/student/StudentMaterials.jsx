import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Download, FileText, BookOpen, Search, ExternalLink, Filter } from "lucide-react";
import { listMaterials } from "../../api/materials.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useToast } from "../../contexts/ToastContext.jsx";

const CATEGORY_LABELS = {
  notes: "Notes",
  slides: "Slides",
  pyq: "Previous Year Q",
  reference: "Reference",
  other: "Other",
};

export default function StudentMaterials() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    listMaterials()
      .then(setItems)
      .catch((err) => showToast({ type: "error", title: "Failed to load", description: err.response?.data?.message || err.message }))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(items.map((m) => m.category));
    return ["all", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    let out = items;
    if (activeCategory !== "all") out = out.filter((m) => m.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((m) =>
        m.title.toLowerCase().includes(q) ||
        m.courseCode.toLowerCase().includes(q) ||
        (m.courseName || "").toLowerCase().includes(q)
      );
    }
    return out;
  }, [items, search, activeCategory]);

  // group by course code for nicer display
  const byCourse = useMemo(() => {
    const map = new Map();
    for (const m of filtered) {
      const k = m.courseCode;
      if (!map.has(k)) map.set(k, { courseCode: m.courseCode, courseName: m.courseName, items: [] });
      map.get(k).items.push(m);
    }
    return Array.from(map.values()).sort((a, b) => a.courseCode.localeCompare(b.courseCode));
  }, [filtered]);

  const groupLabel = user?.section && user?.semester
    ? user.section + " - Sem " + user.semester
    : null;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-text-tertiary)" }}>
          Study materials
        </p>
        <h1 className="text-text-primary" style={{ marginTop: "6px", fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Class notes & resources
        </h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {loading ? "Loading…" : `${items.length} material${items.length === 1 ? "" : "s"} for your group${groupLabel ? " — " + groupLabel : ""}`}
        </p>
      </motion.div>

      {!loading && items.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center" style={{ marginTop: "1.25rem", gap: "12px" }}>
          <div className="flex items-center"
            style={{ flex: 1, maxWidth: "360px", padding: "8px 12px", gap: "10px", borderRadius: "0.75rem", border: "1px solid var(--color-border-strong)", backgroundColor: "var(--color-surface)" }}>
            <Search size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or course…"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "13px", color: "var(--color-text-primary)", minWidth: 0 }} />
          </div>
          <div className="flex flex-wrap" style={{ gap: "6px" }}>
            <Filter size={13} style={{ color: "var(--color-text-tertiary)", alignSelf: "center", marginRight: "4px" }} />
            {categories.map((c) => {
              const active = activeCategory === c;
              return (
                <button key={c} onClick={() => setActiveCategory(c)}
                  className="font-mono"
                  style={{ padding: "6px 11px", fontSize: "10.5px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, border: active ? "1px solid var(--color-primary)" : "1px solid var(--color-border-strong)", backgroundColor: active ? "color-mix(in srgb, var(--color-primary) 10%, transparent)" : "var(--color-surface)", color: active ? "var(--color-primary)" : "var(--color-text-secondary)", cursor: "pointer" }}>
                  {c === "all" ? "All" : (CATEGORY_LABELS[c] || c)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "280px" }}>
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ marginTop: "1.5rem", padding: "3rem 1.5rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <BookOpen size={32} style={{ color: "var(--color-text-tertiary)" }} />
          <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "17px", fontWeight: 600 }}>No materials yet</h3>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px", maxWidth: "40ch" }}>
            When your faculty uploads notes for your courses, they'll appear here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center"
          style={{ marginTop: "1.5rem", minHeight: "200px", padding: "2rem", borderRadius: "1rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <p className="text-text-secondary" style={{ fontSize: "13.5px" }}>No materials match your search.</p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ marginTop: "1.5rem", gap: "1.5rem" }}>
          {byCourse.map((group) => (
            <div key={group.courseCode}>
              <div className="flex items-center" style={{ gap: "12px", marginBottom: "10px" }}>
                <span className="font-mono" style={{ padding: "3px 9px", borderRadius: "6px", fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                  {group.courseCode}
                </span>
                <p className="text-text-primary" style={{ fontSize: "13.5px", fontWeight: 600 }}>{group.courseName || "—"}</p>
                <span style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
                <span className="font-mono" style={{ fontSize: "10.5px", color: "var(--color-text-tertiary)" }}>{group.items.length} file{group.items.length === 1 ? "" : "s"}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "10px" }}>
                {group.items.map((m, i) => (
                  <motion.div key={m._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    style={{ padding: "1rem 1.15rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", display: "flex", gap: "12px" }}>
                    <span className="flex items-center justify-center shrink-0"
                      style={{ height: "40px", width: "40px", borderRadius: "9px", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border-strong)" }}>
                      <FileText size={17} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center" style={{ gap: "6px", marginBottom: "3px" }}>
                        <span className="font-mono" style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: "var(--color-primary)" }}>
                          {CATEGORY_LABELS[m.category] || m.category}
                        </span>
                        {m.section && <span className="font-mono" style={{ fontSize: "9px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>· Sec {m.section}</span>}
                      </div>
                      <p className="text-text-primary" style={{ fontSize: "13.5px", fontWeight: 600 }}>{m.title}</p>
                      {m.description && (
                        <p className="text-text-secondary" style={{ marginTop: "3px", fontSize: "12px", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {m.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between" style={{ marginTop: "8px", gap: "8px" }}>
                        <span className="font-mono" style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>
                          {m.facultyName || "Faculty"} · {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                        <div className="flex items-center" style={{ gap: "6px" }}>
                          <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" title="Open"
                            style={{ height: "26px", width: "26px", borderRadius: "6px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ExternalLink size={11} />
                          </a>
                          <a href={m.fileUrl} download={m.fileName} title="Download"
                            style={{ height: "26px", width: "26px", borderRadius: "6px", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)", backgroundColor: "color-mix(in srgb, var(--color-primary) 6%, transparent)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Download size={11} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
