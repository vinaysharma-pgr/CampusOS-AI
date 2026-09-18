import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Calendar } from "lucide-react";
import { createEvent, updateEvent, getEvent } from "../../api/events.js";
import ImagePicker from "../../components/ui/ImagePicker.jsx";
import { useToast } from "../../contexts/ToastContext.jsx";

const TYPES = ["academic", "cultural", "sports", "placement", "workshop"];

const EMPTY = {
  title: "",
  type: "academic",
  date: "",
  time: "",
  venue: "",
  speaker: "",
  description: "",
  seats: 0,
  registered: 0,
  tag: "",
  banner: "",
  isPaid: false,
  price: 0,
  currency: "INR",
};

export default function AdminEventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getEvent(id)
      .then((e) => setForm(e))
      .catch((err) => {
        showToast({ type: "error", title: "Not found", description: err.response?.data?.message || err.message });
        navigate("/admin/events");
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate, showToast]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateEvent(id, form);
        showToast({ type: "success", title: "Updated", description: `${form.title} saved` });
      } else {
        await createEvent(form);
        showToast({ type: "success", title: "Created", description: `${form.title} is now live` });
      }
      navigate("/admin/events");
    } catch (err) {
      showToast({
        type: "error",
        title: isEdit ? "Update failed" : "Create failed",
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "300px" }}>
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Link
        to="/admin/events"
        className="inline-flex items-center"
        style={{ gap: "8px", fontSize: "12.5px", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}
      >
        <ArrowLeft size={13} />
        Back to events
      </Link>

      <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
        {isEdit ? `Edit ${form.title || "event"}` : "Publish new event"}
      </h1>
      <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
        {isEdit ? "Update event details and save." : "Fill the details below — it appears on the calendar instantly."}
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: "2rem", maxWidth: "800px" }}>
        <Section title="Basic information">
          <Field label="Event title" required>
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="AI in Healthcare — Guest Lecture"
              style={inputStyle}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "1rem", marginTop: "1rem" }}>
            <Field label="Type" required>
              <select value={form.type} onChange={(e) => update("type", e.target.value)} style={inputStyle}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Tag (optional)" hint="e.g., TODAY, FEATURED">
              <input
                value={form.tag}
                onChange={(e) => update("tag", e.target.value.toUpperCase())}
                placeholder="FEATURED"
                style={inputStyle}
              />
            </Field>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <Field label="Description" required>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Detailed description of the event…"
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
            </Field>
          </div>
        </Section>

        <Section title="When and where">
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "1rem" }}>
            <Field label="Date" required hint="YYYY-MM-DD format">
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Time" required hint="e.g., 10:00 AM – 12:00 PM">
              <input
                required
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
                placeholder="10:00 AM – 12:00 PM"
                style={inputStyle}
              />
            </Field>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <Field label="Venue" required>
              <input
                required
                value={form.venue}
                onChange={(e) => update("venue", e.target.value)}
                placeholder="Auditorium, Block C"
                style={inputStyle}
              />
            </Field>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <Field label="Speaker / Host" hint="Optional">
              <input
                value={form.speaker}
                onChange={(e) => update("speaker", e.target.value)}
                placeholder="Dr. R. K. Mishra, AIIMS Delhi"
                style={inputStyle}
              />
            </Field>
          </div>
        </Section>

        <Section title="Pricing">
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "1rem" }}>
            <Field label="Event type">
              <div className="flex" style={{ gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => update("isPaid", false)}
                  className="flex-1 rounded-lg font-medium"
                  style={{
                    padding: "11px 0", fontSize: "13px",
                    border: !form.isPaid ? "1px solid #3fe0c5" : "1px solid var(--color-border-strong)",
                    backgroundColor: !form.isPaid ? "rgba(63,224,197,0.08)" : "transparent",
                    color: !form.isPaid ? "#3fe0c5" : "var(--color-text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => update("isPaid", true)}
                  className="flex-1 rounded-lg font-medium"
                  style={{
                    padding: "11px 0", fontSize: "13px",
                    border: form.isPaid ? "1px solid #f5a524" : "1px solid var(--color-border-strong)",
                    backgroundColor: form.isPaid ? "rgba(245,165,36,0.08)" : "transparent",
                    color: form.isPaid ? "#f5a524" : "var(--color-text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  Paid
                </button>
              </div>
            </Field>
            {form.isPaid && (
              <Field label="Price (₹)" required>
                <input
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(e) => update("price", Number(e.target.value))}
                  placeholder="499"
                  style={inputStyle}
                />
              </Field>
            )}
          </div>
          {form.isPaid && (
            <p className="text-text-tertiary" style={{ marginTop: "8px", fontSize: "11.5px" }}>
              Students will pay ₹{form.price || 0} via Razorpay to register for this event.
            </p>
          )}
        </Section>

        <Section title="Registration">
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "1rem" }}>
            <Field label="Total seats">
              <input
                type="number"
                min="0"
                value={form.seats}
                onChange={(e) => update("seats", Number(e.target.value))}
                style={inputStyle}
              />
            </Field>
            <Field label="Registered so far">
              <input
                type="number"
                min="0"
                value={form.registered}
                onChange={(e) => update("registered", Number(e.target.value))}
                style={inputStyle}
              />
            </Field>
          </div>
        </Section>

        <Section title="Event banner">
          <ImagePicker
            label="Banner image (optional)"
            value={form.banner}
            onChange={(url) => update("banner", url)}
          />
          <p className="text-text-tertiary" style={{ marginTop: "8px", fontSize: "11.5px" }}>
            Upload from your gallery or take a photo with your camera. Recommended 16:9 ratio.
          </p>
        </Section>

        <div className="flex flex-col sm:flex-row" style={{ gap: "10px", marginTop: "2rem" }}>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-60"
            style={{
              height: "44px",
              paddingLeft: "24px",
              paddingRight: "24px",
              gap: "8px",
              backgroundColor: "#a855f7",
              color: "#ffffff",
              fontSize: "13.5px",
            }}
          >
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> {isEdit ? "Save changes" : "Publish event"}</>}
          </button>
          <Link
            to="/admin/events"
            className="inline-flex items-center justify-center rounded-lg font-medium"
            style={{
              height: "44px",
              paddingLeft: "24px",
              paddingRight: "24px",
              border: "1px solid var(--color-border-strong)",
              color: "var(--color-text-primary)",
              fontSize: "13.5px",
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </motion.div>
  );
}

function Section({ title, children }) {
  return (
    <div
      style={{
        padding: "1.5rem",
        marginBottom: "1rem",
        border: "1px solid var(--color-border)",
        borderRadius: "1rem",
        backgroundColor: "var(--color-surface)",
      }}
    >
      <h2
        className="font-mono text-text-tertiary"
        style={{
          fontSize: "10.5px",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          marginBottom: "1rem",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children, required, hint }) {
  return (
    <div>
      <label
        className="text-text-secondary"
        style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}
      >
        {label} {required && <span style={{ color: "#f0554d" }}>*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-text-tertiary" style={{ marginTop: "4px", fontSize: "11px" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "13.5px",
  color: "var(--color-text-primary)",
  backgroundColor: "var(--color-surface-raised)",
  border: "1px solid var(--color-border-strong)",
  borderRadius: "8px",
  outline: "none",
  fontFamily: "inherit",
};
