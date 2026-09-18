// src/pages/student/StudentAssignments.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Loader2, Calendar, User, Image as ImageIcon, Download, X, Maximize2 } from "lucide-react";
import { listAssignments } from "../../api/assignments.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function StudentAssignments() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // url

  useEffect(() => {
    listAssignments()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const groupLabel = user?.section && user?.semester
    ? user.section + " - Year " + Math.ceil(Number(user.semester) / 2)
    : null;

  const download = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "assignment.jpg";
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-text-tertiary)" }}>
          Your assignments
        </p>
        <h1 className="text-text-primary" style={{ marginTop: "6px", fontSize: "26px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Assignments
        </h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          {loading ? "Loading..." : items.length + " " + (items.length === 1 ? "assignment" : "assignments") + (groupLabel ? " - " + groupLabel : "")}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "280px" }}>
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ marginTop: "1.5rem", minHeight: "280px", padding: "2rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
          <BookOpen size={32} style={{ color: "var(--color-text-tertiary)" }} />
          <h3 className="text-text-primary" style={{ marginTop: "1rem", fontSize: "17px", fontWeight: 600 }}>No assignments yet</h3>
          <p className="text-text-secondary" style={{ marginTop: "6px", maxWidth: "40ch", fontSize: "13px", lineHeight: 1.5 }}>
            When your faculty posts assignments, they will appear here. Write your answers in the college assignment book.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ marginTop: "1.5rem", gap: "14px" }}>
          {items.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
              style={{ padding: "1.25rem", border: "1px solid var(--color-border)", borderRadius: "1rem", backgroundColor: "var(--color-surface)", display: "flex", flexDirection: "column" }}>
              <div className="flex items-center" style={{ gap: "8px", marginBottom: "8px" }}>
                <span className="font-mono" style={{ fontSize: "9.5px", padding: "3px 8px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                  {a.type}
                </span>
                {a.courseCode && (
                  <span className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-tertiary)" }}>
                    {a.courseCode}
                  </span>
                )}
              </div>

              <h3 className="text-text-primary" style={{ fontSize: "15.5px", fontWeight: 600, lineHeight: 1.3 }}>{a.title}</h3>

              <p className="text-text-secondary" style={{ marginTop: "10px", fontSize: "13px", lineHeight: 1.55, flex: 1 }}>
                {a.description}
              </p>

              {a.imageUrl && (
                <div style={{ marginTop: "12px" }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: "6px" }}>
                    <div className="flex items-center" style={{ gap: "5px", fontSize: "10.5px", color: "var(--color-text-tertiary)" }}>
                      <ImageIcon size={10} />
                      <span className="font-mono" style={{ textTransform: "uppercase", letterSpacing: "0.14em" }}>Attached</span>
                    </div>
                    <div className="flex items-center" style={{ gap: "6px" }}>
                      <button onClick={() => setLightbox(a.imageUrl)} title="Full screen"
                        className="flex items-center justify-center"
                        style={{ height: "26px", width: "26px", borderRadius: "6px", border: "1px solid var(--color-border-strong)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                        <Maximize2 size={11} />
                      </button>
                      <button onClick={() => download(a.imageUrl, "assignment-" + (a._id || "img") + ".jpg")} title="Download"
                        className="flex items-center justify-center"
                        style={{ height: "26px", width: "26px", borderRadius: "6px", border: "1px solid var(--color-border-strong)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                        <Download size={11} />
                      </button>
                    </div>
                  </div>
                  <img src={a.imageUrl} alt="Assignment"
                    onClick={() => setLightbox(a.imageUrl)}
                    style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--color-border)", cursor: "zoom-in" }} />
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap" style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--color-divider)", gap: "10px" }}>
                <div className="flex items-center" style={{ gap: "14px", fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                  {a.facultyName && (
                    <span className="flex items-center" style={{ gap: "4px" }}>
                      <User size={10} /> {a.facultyName}
                    </span>
                  )}
                  {a.dueDate && (
                    <span className="flex items-center" style={{ gap: "4px" }}>
                      <Calendar size={10} /> Due {a.dueDate}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.92)", padding: "1.5rem", backdropFilter: "blur(8px)" }}>
            <div className="absolute flex items-center" style={{ top: "1.5rem", right: "1.5rem", gap: "8px" }}>
              <button onClick={(e) => { e.stopPropagation(); download(lightbox, "assignment.jpg"); }}
                className="flex items-center justify-center"
                style={{ height: "36px", paddingLeft: "12px", paddingRight: "12px", gap: "6px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "rgba(0,0,0,0.5)", color: "#fff", cursor: "pointer", fontSize: "12.5px" }}>
                <Download size={13} /> Download
              </button>
              <button onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
                className="flex items-center justify-center"
                style={{ height: "36px", width: "36px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "rgba(0,0,0,0.5)", color: "#fff", cursor: "pointer" }}>
                <X size={15} />
              </button>
            </div>
            <motion.img src={lightbox} alt="Full"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "95vw", maxHeight: "92vh", objectFit: "contain", borderRadius: "8px", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
