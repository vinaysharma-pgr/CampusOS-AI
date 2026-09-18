// src/pages/faculty/FacultyAttendance.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Users, Check, X, Loader2, Save, Plus, History,
  AlertTriangle, ChevronRight, Trash2,
} from "lucide-react";
import { listStudentsInGroup, markAttendance, listAttendance, deleteAttendance } from "../../api/attendance.js";
import { listGroups } from "../../api/groups.js";
import { getMyTimetable } from "../../api/timetables.js";
import { useToast } from "../../contexts/ToastContext.jsx";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function todayISO() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function todayName() {
  return DAYS[new Date().getDay()];
}

export default function FacultyAttendance() {
  const [tab, setTab] = useState("mark"); // mark | history
  const [groups, setGroups] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([listGroups(), getMyTimetable()])
      .then(([g, tt]) => {
        setGroups(g);
        setTimetable(tt.classes || []);
      })
      .catch((err) => showToast({ type: "error", title: "Load failed", description: err.message }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Attendance
        </h1>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
          Mark attendance for your classes and review past records.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ gap: "8px", marginBottom: "1.5rem" }}>
        {[{ id: "mark", label: "Mark Attendance", icon: Plus }, { id: "history", label: "History", icon: History }].map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="inline-flex items-center rounded-lg font-medium"
              style={{ padding: "10px 16px", gap: "8px", fontSize: "13px",
                border: active ? "1px solid var(--color-primary)" : "1px solid var(--color-border-strong)",
                backgroundColor: active ? "color-mix(in srgb, var(--color-primary) 10%, transparent)" : "var(--color-surface)",
                color: active ? "var(--color-primary)" : "var(--color-text-secondary)", cursor: "pointer" }}>
              <t.icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "mark" && <MarkTab groups={groups} timetable={timetable} loading={loading} />}
      {tab === "history" && <HistoryTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════
//  MARK TAB
// ═══════════════════════════════════════════════
function MarkTab({ groups, timetable, loading }) {
  const { showToast } = useToast();
  const [date, setDate] = useState(todayISO());
  const [groupCode, setGroupCode] = useState(groups[0]?.code || "");
  const [selectedClass, setSelectedClass] = useState(null); // { courseCode, courseName, startTime, endTime, period, room }
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({}); // id -> "present" | "absent"
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const day = DAYS[new Date(date).getDay()];
  const dayClasses = timetable.filter((c) => c.dayOfWeek === day);

  // Reset class when date changes
  useEffect(() => { setSelectedClass(null); }, [date]);

  // Load students when group or class changes
  useEffect(() => {
    if (!groupCode || !selectedClass) { setStudents([]); return; }
    const g = groups.find((x) => x.code === groupCode);
    if (!g) return;
    setLoadingStudents(true);
    listStudentsInGroup({ department: g.department, semester: g.semester, section: g.section })
      .then((list) => {
        setStudents(list);
        const initial = {};
        list.forEach((s) => { initial[s._id] = "present"; });
        setStatuses(initial);
      })
      .catch((err) => showToast({ type: "error", title: "Failed to load students", description: err.message }))
      .finally(() => setLoadingStudents(false));
  }, [groupCode, selectedClass, groups]);

  const toggle = (id) => setStatuses((s) => ({ ...s, [id]: s[id] === "present" ? "absent" : "present" }));
  const markAll = (val) => { const next = {}; students.forEach((s) => { next[s._id] = val; }); setStatuses(next); };

  const presentCount = Object.values(statuses).filter((v) => v === "present").length;
  const absentCount = Object.values(statuses).filter((v) => v === "absent").length;

  const save = async () => {
    if (!selectedClass) return showToast({ type: "error", title: "Select a class first" });
    if (!students.length) return showToast({ type: "error", title: "No students in this group" });
    const g = groups.find((x) => x.code === groupCode);

    setSaving(true);
    try {
      const present = students.filter((s) => statuses[s._id] === "present").map((s) => s._id);
      const absent = students.filter((s) => statuses[s._id] === "absent").map((s) => s._id);

      await markAttendance({
        date,
        dayOfWeek: day,
        groupCode,
        department: g.department,
        semester: g.semester,
        section: g.section,
        courseCode: selectedClass.courseCode,
        courseName: selectedClass.courseName,
        period: selectedClass.period || 0,
        timeSlot: (selectedClass.startTime || "") + "-" + (selectedClass.endTime || ""),
        present,
        absent,
      });
      showToast({ type: "success", title: "Attendance saved", description: presentCount + " present, " + absentCount + " absent" });
    } catch (err) {
      showToast({ type: "error", title: "Save failed", description: err.response?.data?.message || err.message });
    } finally { setSaving(false); }
  };

  const inputStyle = { padding: "10px 12px", fontSize: "13.5px", color: "var(--color-text-primary)", backgroundColor: "var(--color-surface-raised)", border: "1px solid var(--color-border-strong)", borderRadius: "8px", outline: "none", fontFamily: "inherit" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr]" style={{ gap: "1.25rem", alignItems: "start" }}>
      {/* LEFT: pick class */}
      <div style={{ padding: "1.25rem", border: "1px solid var(--color-border)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
        <h2 className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)", marginBottom: "1rem" }}>
          Pick a class
        </h2>

        <div style={{ marginBottom: "12px" }}>
          <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
          <p className="font-mono" style={{ marginTop: "4px", fontSize: "10.5px", color: "var(--color-text-tertiary)" }}>{day}</p>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Group</label>
          <select value={groupCode} onChange={(e) => { setGroupCode(e.target.value); setSelectedClass(null); }} style={{ ...inputStyle, width: "100%" }}>
            {groups.map((g) => <option key={g.code} value={g.code}>{g.code} - {g.department} Y{g.year}</option>)}
          </select>
        </div>

        <div>
          <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>Class</label>
          {loading ? (
            <Loader2 size={16} className="animate-spin" style={{ color: "var(--color-primary)" }} />
          ) : dayClasses.length === 0 ? (
            <p className="text-text-tertiary" style={{ fontSize: "12.5px" }}>No classes on {day}</p>
          ) : (
            <div className="flex flex-col" style={{ gap: "6px" }}>
              {dayClasses.map((c, i) => {
                const active = selectedClass === c;
                return (
                  <button key={i} onClick={() => setSelectedClass(c)}
                    className="w-full text-left"
                    style={{ padding: "10px 12px", borderRadius: "8px",
                      border: active ? "1px solid var(--color-primary)" : "1px solid var(--color-border-strong)",
                      backgroundColor: active ? "color-mix(in srgb, var(--color-primary) 8%, transparent)" : "var(--color-surface-raised)",
                      cursor: "pointer" }}>
                    <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: active ? "var(--color-primary)" : "var(--color-text-tertiary)" }}>
                      {c.courseCode} · {c.startTime}
                    </p>
                    <p className="text-text-primary" style={{ marginTop: "3px", fontSize: "13px", fontWeight: 500 }}>
                      {c.courseName}
                    </p>
                    <p className="text-text-tertiary" style={{ marginTop: "2px", fontSize: "11px" }}>
                      {c.room}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: student grid */}
      <div style={{ padding: "1.25rem", border: "1px solid var(--color-border)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "1rem", gap: "10px", flexWrap: "wrap" }}>
          <h2 className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)" }}>
            Students {students.length > 0 && "(" + presentCount + "P / " + absentCount + "A / " + students.length + "T)"}
          </h2>
          {students.length > 0 && (
            <div className="flex" style={{ gap: "6px" }}>
              <button onClick={() => markAll("present")} className="rounded-md font-medium"
                style={{ padding: "6px 12px", fontSize: "11.5px", border: "1px solid rgba(34,197,94,0.3)", backgroundColor: "rgba(34,197,94,0.08)", color: "#16a34a", cursor: "pointer" }}>
                All present
              </button>
              <button onClick={() => markAll("absent")} className="rounded-md font-medium"
                style={{ padding: "6px 12px", fontSize: "11.5px", border: "1px solid rgba(240,85,77,0.3)", backgroundColor: "rgba(240,85,77,0.08)", color: "#f0554d", cursor: "pointer" }}>
                All absent
              </button>
            </div>
          )}
        </div>

        {loadingStudents ? (
          <div className="flex items-center justify-center" style={{ padding: "2rem" }}>
            <Loader2 size={20} className="animate-spin" style={{ color: "var(--color-primary)" }} />
          </div>
        ) : !selectedClass ? (
          <p className="text-text-tertiary" style={{ padding: "2rem 0", textAlign: "center", fontSize: "13px" }}>
            Pick a class on the left to start marking
          </p>
        ) : students.length === 0 ? (
          <p className="text-text-tertiary" style={{ padding: "2rem 0", textAlign: "center", fontSize: "13px" }}>
            No students enrolled in this group
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "8px" }}>
              {students.map((s) => {
                const isPresent = statuses[s._id] === "present";
                return (
                  <button key={s._id} onClick={() => toggle(s._id)}
                    className="flex items-center justify-between w-full"
                    style={{ padding: "10px 12px", borderRadius: "8px",
                      border: isPresent ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(240,85,77,0.35)",
                      backgroundColor: isPresent ? "rgba(34,197,94,0.06)" : "rgba(240,85,77,0.06)",
                      cursor: "pointer" }}>
                    <div style={{ minWidth: 0, textAlign: "left" }}>
                      <p className="text-text-primary" style={{ fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</p>
                      <p className="font-mono" style={{ marginTop: "2px", fontSize: "10.5px", color: "var(--color-text-tertiary)" }}>{s.email}</p>
                    </div>
                    <span className="flex items-center justify-center shrink-0"
                      style={{ height: "24px", width: "24px", borderRadius: "6px",
                        backgroundColor: isPresent ? "rgba(34,197,94,0.15)" : "rgba(240,85,77,0.15)",
                        color: isPresent ? "#16a34a" : "#f0554d" }}>
                      {isPresent ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>

            <button onClick={save} disabled={saving}
              className="w-full inline-flex items-center justify-center rounded-lg font-semibold"
              style={{ marginTop: "1rem", height: "44px", gap: "8px", fontSize: "13.5px",
                backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)",
                border: "none", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Attendance</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  HISTORY TAB
// ═══════════════════════════════════════════════
function HistoryTab() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    listAttendance({ limit: 100 })
      .then(setItems)
      .catch((err) => showToast({ type: "error", title: "Load failed", description: err.message }))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    try {
      await deleteAttendance(id);
      showToast({ type: "success", title: "Deleted" });
      setConfirmDelete(null);
      load();
    } catch (err) {
      showToast({ type: "error", title: "Delete failed", description: err.message });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "200px" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center text-center"
        style={{ minHeight: "240px", padding: "2rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
        <History size={26} style={{ color: "var(--color-text-tertiary)" }} />
        <p className="text-text-primary" style={{ marginTop: "1rem", fontSize: "15px", fontWeight: 600 }}>No attendance records yet</p>
        <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>Mark your first class to see records here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: "10px" }}>
      {items.map((a, i) => (
        <motion.div key={a._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          className="flex items-center justify-between flex-wrap"
          style={{ padding: "12px 14px", border: "1px solid var(--color-border)", borderRadius: "0.75rem", backgroundColor: "var(--color-surface)", gap: "12px" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="flex items-center" style={{ gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
              <span className="font-mono" style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                {a.courseCode}
              </span>
              <span className="font-mono" style={{ fontSize: "10px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {a.groupCode} · {a.date}
              </span>
            </div>
            <p className="text-text-primary" style={{ fontSize: "13.5px", fontWeight: 600 }}>{a.courseName}</p>
            <div className="flex items-center" style={{ marginTop: "4px", gap: "12px", fontSize: "11.5px" }}>
              <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ {a.presentCount} present</span>
              <span style={{ color: "#f0554d", fontWeight: 600 }}>✗ {a.absentCount} absent</span>
            </div>
          </div>
          <button onClick={() => setConfirmDelete(a)} aria-label="Delete"
            style={{ height: "32px", width: "32px", borderRadius: "8px", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)", background: "transparent", cursor: "pointer", flexShrink: 0 }}>
            <Trash2 size={13} />
          </button>
        </motion.div>
      ))}

      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.75)", padding: "1.5rem", backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "400px", width: "100%", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(240,85,77,0.3)", backgroundColor: "var(--color-surface)" }}>
              <div className="flex items-start" style={{ gap: "14px" }}>
                <span style={{ height: "40px", width: "40px", flexShrink: 0, backgroundColor: "rgba(240,85,77,0.1)", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={18} />
                </span>
                <div>
                  <p className="text-text-primary" style={{ fontSize: "15px", fontWeight: 600 }}>Delete this record?</p>
                  <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px" }}>{confirmDelete.courseName} · {confirmDelete.date}</p>
                </div>
              </div>
              <div className="flex" style={{ marginTop: "1.5rem", gap: "10px" }}>
                <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-lg font-medium" style={{ padding: "10px 0", fontSize: "13px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)", background: "transparent", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => handleDelete(confirmDelete._id)} className="flex-1 rounded-lg font-semibold" style={{ padding: "10px 0", fontSize: "13px", backgroundColor: "#f0554d", color: "#fff", border: "none", cursor: "pointer" }}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
