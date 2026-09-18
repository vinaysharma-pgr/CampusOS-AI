import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { createFacility, updateFacility, getFacility } from "../../api/facilities.js";
import { useToast } from "../../contexts/ToastContext.jsx";

const TYPES = ["lab", "library", "classroom", "sports", "cafeteria", "auditorium", "facility"];

const EMPTY = {
  id: "",
  code: "",
  name: "",
  type: "lab",
  tagline: "",
  description: "",
  image: "",
  specs: { seats: 0, systems: 0, floors: 1, area: "", hours: "" },
  amenities: [],
  live: { occupancy: 0, seatsAvailable: 0, systemsAvailable: 0, status: "open" },
  location: { building: "", floor: "", x: 50, y: 50 },
};

export default function AdminFacilityForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [amenitiesInput, setAmenitiesInput] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getFacility(id)
      .then((f) => {
        setForm(f);
        setAmenitiesInput((f.amenities || []).join(", "));
      })
      .catch((err) => {
        showToast({ type: "error", title: "Not found", description: err.response?.data?.message || err.message });
        navigate("/admin/facilities");
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate, showToast]);

  const update = (path, value) => {
    setForm((f) => {
      const next = { ...f };
      const parts = path.split(".");
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = { ...cur[parts[i]] };
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        amenities: amenitiesInput.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (isEdit) {
        await updateFacility(id, payload);
        showToast({ type: "success", title: "Updated", description: `${payload.name} saved` });
      } else {
        await createFacility(payload);
        showToast({ type: "success", title: "Created", description: `${payload.name} is now live` });
      }
      navigate("/admin/facilities");
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
        to="/admin/facilities"
        className="inline-flex items-center"
        style={{ gap: "8px", fontSize: "12.5px", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}
      >
        <ArrowLeft size={13} />
        Back to facilities
      </Link>

      <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
        {isEdit ? `Edit ${form.name || "facility"}` : "Add new facility"}
      </h1>
      <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
        {isEdit ? "Update details and save." : "Fill the details below — it goes live instantly."}
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: "2rem", maxWidth: "800px" }}>
        <Section title="Basic information">
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "1rem" }}>
            <Field label="Facility name" required>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Central Library"
                style={inputStyle}
              />
            </Field>
            <Field label="Code" required>
              <input
                required
                value={form.code}
                onChange={(e) => update("code", e.target.value.toUpperCase())}
                placeholder="LIB_01"
                style={inputStyle}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "1rem", marginTop: "1rem" }}>
            <Field label="URL slug (id)" required hint="lowercase, hyphens only">
              <input
                required
                disabled={isEdit}
                value={form.id}
                onChange={(e) => update("id", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="central-library"
                style={{ ...inputStyle, opacity: isEdit ? 0.6 : 1 }}
              />
            </Field>
            <Field label="Type" required>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                style={inputStyle}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <Field label="Tagline" required hint="Short, one-line summary">
              <input
                required
                value={form.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="Four floors of silence, study, and stack access"
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
                placeholder="Full description of this facility…"
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
            </Field>
          </div>
        </Section>

        <Section title="Image">
          <Field label="Image URL" hint="Paste a Cloudinary / Unsplash / any URL">
            <div className="flex items-center" style={{ gap: "8px" }}>
              <ImageIcon size={15} style={{ color: "var(--color-text-tertiary)" }} />
              <input
                value={form.image}
                onChange={(e) => update("image", e.target.value)}
                placeholder="https://images.unsplash.com/..."
                style={inputStyle}
              />
            </div>
          </Field>
          {form.image && (
            <div style={{ marginTop: "0.75rem" }}>
              <img
                src={form.image}
                alt="Preview"
                style={{
                  width: "100%",
                  maxWidth: "320px",
                  aspectRatio: "16/10",
                  objectFit: "cover",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--color-border)",
                }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}
        </Section>

        <Section title="Specifications">
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: "1rem" }}>
            <Field label="Seats">
              <input type="number" value={form.specs.seats} onChange={(e) => update("specs.seats", Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label="Systems">
              <input type="number" value={form.specs.systems} onChange={(e) => update("specs.systems", Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label="Floors">
              <input type="number" value={form.specs.floors} onChange={(e) => update("specs.floors", Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label="Area">
              <input value={form.specs.area} onChange={(e) => update("specs.area", e.target.value)} placeholder="4,800 sq ft" style={inputStyle} />
            </Field>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <Field label="Operating hours">
              <input value={form.specs.hours} onChange={(e) => update("specs.hours", e.target.value)} placeholder="8am–11pm" style={inputStyle} />
            </Field>
          </div>
        </Section>

        <Section title="Amenities">
          <Field label="Amenities" hint="Comma-separated">
            <input
              value={amenitiesInput}
              onChange={(e) => setAmenitiesInput(e.target.value)}
              placeholder="Wi-Fi 6E, Silent Zones, Group Study Rooms"
              style={inputStyle}
            />
          </Field>
        </Section>

        <Section title="Location">
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: "1rem" }}>
            <Field label="Building">
              <input value={form.location.building} onChange={(e) => update("location.building", e.target.value)} placeholder="Block A" style={inputStyle} />
            </Field>
            <Field label="Floor">
              <input value={form.location.floor} onChange={(e) => update("location.floor", e.target.value)} placeholder="G–3" style={inputStyle} />
            </Field>
            <Field label="Map X (%)">
              <input type="number" min="0" max="100" value={form.location.x} onChange={(e) => update("location.x", Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label="Map Y (%)">
              <input type="number" min="0" max="100" value={form.location.y} onChange={(e) => update("location.y", Number(e.target.value))} style={inputStyle} />
            </Field>
          </div>
        </Section>

        <Section title="Live status">
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: "1rem" }}>
            <Field label="Occupancy %">
              <input type="number" min="0" max="100" value={form.live.occupancy} onChange={(e) => update("live.occupancy", Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label="Seats free">
              <input type="number" value={form.live.seatsAvailable} onChange={(e) => update("live.seatsAvailable", Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label="Systems free">
              <input type="number" value={form.live.systemsAvailable} onChange={(e) => update("live.systemsAvailable", Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label="Status">
              <select value={form.live.status} onChange={(e) => update("live.status", e.target.value)} style={inputStyle}>
                <option value="open">Open</option>
                <option value="busy">Busy</option>
                <option value="available">Available</option>
                <option value="closed">Closed</option>
              </select>
            </Field>
          </div>
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
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-fg)",
              fontSize: "13.5px",
            }}
          >
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> {isEdit ? "Save changes" : "Create facility"}</>}
          </button>
          <Link
            to="/admin/facilities"
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