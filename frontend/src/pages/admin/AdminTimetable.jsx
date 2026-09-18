// src/pages/admin/AdminTimetable.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Calendar, Loader2, AlertTriangle, X, Save, ArrowLeft } from "lucide-react";
import {
  listTimetables, createTimetable, updateTimetable, deleteTimetable,
} from "../../api/timetables.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import WeeklyGrid from "../../features/timetable/components/WeeklyGrid";
import ClashModal from "../../components/timetable/ClashModal.jsx";
import { checkClashes } from "../../api/timetables.js";

const DEPARTMENTS = ["CSE", "IT", "ECE", "ME", "CE", "MBA", "MCA", "Pharmacy"];
const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const SECTIONS = ["A", "B", "C"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TYPES = ["lecture", "lab", "tutorial", "exam"];

const EMPTY_CLASS = {
  dayOfWeek: "Monday",
  startTime: "09:00",
  endTime: "10:00",
  courseCode: "",
  courseName: "",
  room: "",
  facultyName: "",
  type: "lecture",
};

const EMPTY_TT = {
  department: "CSE",
  semester: "5",
  section: "A",
  academicYear: "2025-26",
  effectiveFrom: "",
  classes: [{ ...EMPTY_CLASS }],
};

export default function AdminTimetable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" | "edit"
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await listTimetables();
      setItems(data);
    } catch (err) {
      showToast({ type: "error", title: "Failed to load", description: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteTimetable(id);
      showToast({ type: "success", title: "Timetable deleted" });
      setConfirmDelete(null);
      await load();
    } catch (err) {
      showToast({ type: "error", title: "Delete failed", description: err.response?.data?.message || err.message });
    } finally {
      setDeleting(false);
    }
  };

  if (view === "edit") {
    return (
      <TimetableEditor
        initial={editing || EMPTY_TT}
        isEdit={Boolean(editing?._id)}
        onCancel={() => { setView("list"); setEditing(null); }}
        onSaved={async () => { setView("list"); setEditing(null); await load(); }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: "1.5rem", gap: "12px" }}>
        <div>
          <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            Timetables
          </h1>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
            {loading ? "Loading…" : `${items.length} ${items.length === 1 ? "timetable" : "timetables"} published`}
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setView("edit"); }}
          className="inline-flex items-center justify-center rounded-lg font-semibold transition-all hover:opacity-90"
          style={{ height: "40px", paddingLeft: "16px", paddingRight: "16px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13px" }}
        >
          <Plus size={15} strokeWidth={2.5} />
          New Timetable
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "200px" }}>
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState onCreate={() => { setEditing(null); setView("edit"); }} />
      ) : (
        <div className="flex flex-col" style={{ gap: "12px" }}>
          {items.map((tt, i) => (
            <motion.div
              key={tt._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                padding: "1.25rem",
                border: "1px solid var(--color-border)",
                borderRadius: "1rem",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div className="flex flex-wrap items-center justify-between" style={{ gap: "12px" }}>
                <div className="flex items-center" style={{ gap: "12px" }}>
                  <span
                    className="flex items-center justify-center rounded-lg"
                    style={{ height: "42px", width: "42px", backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)" }}
                  >
                    <Calendar size={17} />
                  </span>
                  <div>
                    <p className="text-text-primary" style={{ fontSize: "15px", fontWeight: 600 }}>
                      {tt.department} · Sem {tt.semester} · Section {tt.section}
                    </p>
                    <p className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "3px" }}>
                      {tt.academicYear} · {tt.classes?.length || 0} classes
                      {tt.effectiveFrom ? ` · from ${tt.effectiveFrom}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center" style={{ gap: "6px" }}>
                  <button
                    onClick={() => { setEditing(tt); setView("edit"); }}
                    className="flex items-center justify-center rounded-md"
                    style={{ height: "32px", width: "32px", color: "var(--color-text-secondary)", border: "1px solid var(--color-border-strong)" }}
                    aria-label="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(tt)}
                    className="flex items-center justify-center rounded-md"
                    style={{ height: "32px", width: "32px", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)" }}
                    aria-label="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !deleting && setConfirmDelete(null)}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", padding: "1.5rem", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "420px", width: "100%", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(240,85,77,0.3)", backgroundColor: "var(--color-surface)" }}
            >
              <div className="flex items-start" style={{ gap: "14px" }}>
                <span className="flex items-center justify-center" style={{ height: "40px", width: "40px", flexShrink: 0, backgroundColor: "rgba(240,85,77,0.1)", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)", borderRadius: "10px" }}>
                  <AlertTriangle size={18} />
                </span>
                <div>
                  <p className="text-text-primary" style={{ fontSize: "15px", fontWeight: 600 }}>
                    Delete this timetable?
                  </p>
                  <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.5 }}>
                    {confirmDelete.department} · Sem {confirmDelete.semester} · Section {confirmDelete.section}. Students will stop seeing these classes.
                  </p>
                </div>
              </div>
              <div className="flex" style={{ marginTop: "1.5rem", gap: "10px" }}>
                <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="flex-1 rounded-lg font-medium" style={{ padding: "10px 0", fontSize: "13px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)" }}>Cancel</button>
                <button onClick={() => handleDelete(confirmDelete._id)} disabled={deleting} className="flex-1 inline-flex items-center justify-center rounded-lg font-semibold" style={{ padding: "10px 0", gap: "8px", fontSize: "13px", backgroundColor: "#f0554d", color: "#fff", opacity: deleting ? 0.6 : 1 }}>
                  {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  EDITOR
// ═══════════════════════════════════════════════
function TimetableEditor({ initial, isEdit, onCancel, onSaved }) {
  const [clashOpen, setClashOpen] = useState(false);
  const [clashes, setClashes] = useState([]);
  const { showToast } = useToast();
  const [form, setForm] = useState(() => ({
    ...initial,
    classes: (initial.classes || []).map((c) => ({ ...EMPTY_CLASS, ...c })),
  }));
  const [saving, setSaving] = useState(false);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const updateClass = (idx, k, v) => {
    setForm((f) => {
      const next = { ...f, classes: f.classes.map((c, i) => (i === idx ? { ...c, [k]: v } : c)) };
      return next;
    });
  };

  const addClass = () => setForm((f) => ({ ...f, classes: [...f.classes, { ...EMPTY_CLASS }] }));
  const removeClass = (idx) => setForm((f) => ({ ...f, classes: f.classes.filter((_, i) => i !== idx) }));

  const doSave = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await updateTimetable(initial._id, form);
        showToast({ type: "success", title: "Timetable updated" });
      } else {
        await createTimetable(form);
        showToast({ type: "success", title: "Timetable created" });
      }
      onSaved?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      const detail = err.response?.data?.errors?.[0]?.message;
      showToast({ type: "error", title: msg, description: detail });
    } finally {
      setSaving(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.classes.length) {
      return showToast({ type: "error", title: "Add at least one class" });
    }
    for (const c of form.classes) {
      if (!c.courseCode || !c.courseName || !c.room) {
        return showToast({ type: "error", title: "Each class needs a code, name, and room" });
      }
    }

    // Check for clashes first
    setSaving(true);
    try {
      const result = await checkClashes({
        classes: form.classes,
        department: form.department,
        semester: form.semester,
        section: form.section,
        academicYear: form.academicYear,
        excludeTimetableId: isEdit ? initial._id : null,
      });

      if (result.clashes && result.clashes.length > 0) {
        setClashes(result.clashes);
        setClashOpen(true);
        setSaving(false);
        return;
      }

      // No clashes → save directly
      await doSave();
    } catch (err) {
      showToast({ type: "error", title: "Clash check failed", description: err.response?.data?.message || err.message });
      setSaving(false);
    }
  };

  const handleOverride = async () => {
    setClashOpen(false);
    await doSave();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <button
        onClick={onCancel}
        className="inline-flex items-center"
        style={{ gap: "8px", fontSize: "12.5px", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}
      >
        <ArrowLeft size={13} />
        Back to timetables
      </button>

      <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
        {isEdit ? "Edit timetable" : "New timetable"}
      </h1>
      <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
        One timetable per department + semester + section per academic year.
      </p>

      <form onSubmit={submit} style={{ marginTop: "2rem" }}>
        <Section title="Target">
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: "1rem" }}>
            <Field label="Department" required>
              <select value={form.department} onChange={(e) => setField("department", e.target.value)} style={inputStyle} disabled={isEdit}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Semester" required>
              <select value={form.semester} onChange={(e) => setField("semester", e.target.value)} style={inputStyle} disabled={isEdit}>
                {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Section" required>
              <select value={form.section} onChange={(e) => setField("section", e.target.value)} style={inputStyle} disabled={isEdit}>
                {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Academic year" required>
              <input value={form.academicYear} onChange={(e) => setField("academicYear", e.target.value)} placeholder="2025-26" style={inputStyle} disabled={isEdit} />
            </Field>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <Field label="Effective from" hint="Optional — YYYY-MM-DD">
              <input value={form.effectiveFrom} onChange={(e) => setField("effectiveFrom", e.target.value)} placeholder="2026-01-15" style={inputStyle} />
            </Field>
          </div>
        </Section>

        <Section title={`Classes (${form.classes.length})`}>
          <div className="flex flex-col" style={{ gap: "12px" }}>
            {form.classes.map((c, idx) => (
              <div
                key={idx}
                style={{
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface-raised)",
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
                  <p className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)" }}>
                    Class {idx + 1}
                  </p>
                  {form.classes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeClass(idx)}
                      className="flex items-center justify-center rounded-md"
                      style={{ height: "26px", width: "26px", color: "#f0554d", border: "1px solid rgba(240,85,77,0.3)" }}
                      aria-label="Remove"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "10px" }}>
                  <Field label="Day">
                    <select value={c.dayOfWeek} onChange={(e) => updateClass(idx, "dayOfWeek", e.target.value)} style={inputStyle}>
                      {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Field>
                  <Field label="Type">
                    <select value={c.type} onChange={(e) => updateClass(idx, "type", e.target.value)} style={inputStyle}>
                      {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Start" required>
                    <input type="time" value={c.startTime} onChange={(e) => updateClass(idx, "startTime", e.target.value)} style={inputStyle} />
                  </Field>
                  <Field label="End" required>
                    <input type="time" value={c.endTime} onChange={(e) => updateClass(idx, "endTime", e.target.value)} style={inputStyle} />
                  </Field>
                  <Field label="Course code" required>
                    <input value={c.courseCode} onChange={(e) => updateClass(idx, "courseCode", e.target.value.toUpperCase())} placeholder="CS 302" style={inputStyle} />
                  </Field>
                  <Field label="Room" required>
                    <input value={c.room} onChange={(e) => updateClass(idx, "room", e.target.value)} placeholder="B-204" style={inputStyle} />
                  </Field>
                </div>

                <div style={{ marginTop: "10px" }}>
                  <Field label="Course name" required>
                    <input value={c.courseName} onChange={(e) => updateClass(idx, "courseName", e.target.value)} placeholder="Operating Systems" style={inputStyle} />
                  </Field>
                </div>
                <div style={{ marginTop: "10px" }}>
                  <Field label="Faculty name" hint="Optional">
                    <input value={c.facultyName} onChange={(e) => updateClass(idx, "facultyName", e.target.value)} placeholder="Dr. Meera Rao" style={inputStyle} />
                  </Field>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addClass}
            className="inline-flex items-center justify-center rounded-lg font-medium"
            style={{ marginTop: "12px", height: "38px", paddingLeft: "16px", paddingRight: "16px", gap: "8px", border: "1px dashed var(--color-border-strong)", color: "var(--color-text-primary)", fontSize: "13px", width: "100%" }}
          >
            <Plus size={14} />
            Add another class
          </button>
        </Section>

        <div className="flex flex-col sm:flex-row" style={{ gap: "10px", marginTop: "1.5rem" }}>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-60"
            style={{ height: "44px", paddingLeft: "24px", paddingRight: "24px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13.5px" }}
          >
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> {isEdit ? "Save changes" : "Publish timetable"}</>}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-lg font-medium"
            style={{ height: "44px", paddingLeft: "24px", paddingRight: "24px", border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)", fontSize: "13.5px" }}
          >
            Cancel
          </button>
        </div>
      </form>
      <ClashModal
        open={clashOpen}
        clashes={clashes}
        onCancel={() => { setClashOpen(false); setClashes([]); }}
        onOverride={handleOverride}
        saving={saving}
      />
    </motion.div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ padding: "1.5rem", marginBottom: "1rem", border: "1px solid var(--color-border)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
      <h2 className="font-mono text-text-tertiary" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "1rem" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children, required, hint }) {
  return (
    <div>
      <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>
        {label} {required && <span style={{ color: "#f0554d" }}>*</span>}
      </label>
      {children}
      {hint && <p className="text-text-tertiary" style={{ marginTop: "4px", fontSize: "11px" }}>{hint}</p>}
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "320px", padding: "2rem", border: "1px dashed var(--color-border-strong)", borderRadius: "1rem", backgroundColor: "var(--color-surface)" }}>
      <span className="flex items-center justify-center rounded-xl" style={{ height: "56px", width: "56px", backgroundColor: "rgba(63,224,197,0.1)", color: "var(--color-primary)", border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)" }}>
        <Calendar size={24} strokeWidth={1.75} />
      </span>
      <h2 className="text-text-primary" style={{ marginTop: "1.25rem", fontSize: "18px", fontWeight: 600 }}>No timetables yet</h2>
      <p className="text-text-secondary" style={{ marginTop: "8px", maxWidth: "36ch", fontSize: "13.5px", lineHeight: 1.6 }}>
        Publish your first timetable — students see it instantly.
      </p>
      <button onClick={onCreate} className="inline-flex items-center justify-center rounded-lg font-semibold" style={{ marginTop: "1.5rem", height: "42px", paddingLeft: "22px", paddingRight: "22px", gap: "8px", backgroundColor: "var(--color-primary)", color: "var(--color-primary-fg)", fontSize: "13px" }}>
        <Plus size={15} strokeWidth={2.5} />
        New Timetable
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px", fontSize: "13.5px",
  color: "var(--color-text-primary)", backgroundColor: "var(--color-surface-raised)",
  border: "1px solid var(--color-border-strong)", borderRadius: "8px",
  outline: "none", fontFamily: "inherit",
};
