import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Users, Activity, Monitor, Loader2 } from "lucide-react";
import { getFacility } from "../api/facilities.js";
import FacilityHero from "../features/facilities/components/FacilityHero";
import FacilityGallery from "../features/facilities/components/FacilityGallery";
import FacilitySpecs from "../features/facilities/components/FacilitySpecs";
import FacilityAmenities from "../features/facilities/components/FacilityAmenities";

const CONTAINER_STYLE = {
  width: "100%",
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  boxSizing: "border-box",
};

export default function FacilityDetailPage() {
  const { id } = useParams();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFacility(id)
      .then(setFacility)
      .catch(() => setFacility(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <Loader2 size={26} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!facility) {
    return (
      <section className="flex flex-col items-center justify-center text-center" style={{ ...CONTAINER_STYLE, minHeight: "60vh" }}>
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{
            height: "64px",
            width: "64px",
            backgroundColor: "rgba(63,224,197,0.1)",
            color: "var(--color-primary)",
            border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
          }}
        >
          <MapPin size={26} strokeWidth={1.5} />
        </div>
        <h1 className="text-text-primary" style={{ marginTop: "1.5rem", fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Facility not found
        </h1>
        <p className="text-text-secondary" style={{ marginTop: "12px", fontSize: "14px" }}>
          The facility you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/facilities"
          className="inline-flex items-center rounded-full font-semibold transition-all"
          style={{
            marginTop: "2rem",
            height: "44px",
            paddingLeft: "22px",
            paddingRight: "22px",
            gap: "8px",
            backgroundColor: "var(--color-text-primary)",
            color: "var(--color-background)",
            fontSize: "13.5px",
          }}
        >
          <ArrowLeft size={14} />
          Back to facilities
        </Link>
      </section>
    );
  }

  return (
    <section style={{ paddingTop: "4rem", paddingBottom: "5rem" }}>
      <div style={CONTAINER_STYLE}>
        <FacilityHero facility={facility} />
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr]" style={{ marginTop: "3rem", gap: "2rem" }}>
          <div className="flex flex-col" style={{ gap: "2rem", minWidth: 0 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <h2 className="font-mono text-text-tertiary" style={{ marginBottom: "1rem", fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                Gallery
              </h2>
              <FacilityGallery images={facility.gallery || [facility.image].filter(Boolean)} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{
                padding: "1.75rem",
                borderRadius: "1rem",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <h2 className="font-mono text-text-tertiary" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                About this facility
              </h2>
              <p className="text-text-secondary" style={{ marginTop: "1rem", fontSize: "14px", lineHeight: 1.7 }}>
                {facility.description}
              </p>
            </motion.div>

            <FacilityAmenities amenities={facility.amenities || []} />
          </div>

          <aside className="flex flex-col lg:sticky" style={{ gap: "1rem", top: "5rem", alignSelf: "flex-start", minWidth: 0 }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                padding: "1.5rem",
                borderRadius: "1rem",
                border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--color-primary) 4%, transparent)",
              }}
            >
              <div className="flex items-center" style={{ gap: "8px" }}>
                <span className="rounded-full animate-pulse" style={{ height: "8px", width: "8px", backgroundColor: "#4ade80" }} />
                <h3 className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-primary)" }}>
                  Live Status
                </h3>
              </div>
              <div className="flex flex-col" style={{ marginTop: "1.25rem", gap: "1rem" }}>
                <LiveBar label="Occupancy" value={facility.live?.occupancy || 0} icon={Activity} />
                <LiveBar label="Seats available" value={`${facility.live?.seatsAvailable || 0}`} icon={Users} raw />
                <LiveBar label="Systems available" value={`${facility.live?.systemsAvailable || 0}`} icon={Monitor} raw />
              </div>
            </motion.div>

            <FacilitySpecs facility={facility} />

            <div style={{ padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
              <h3 className="font-mono text-text-tertiary" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                Location
              </h3>
              <div className="flex flex-col" style={{ marginTop: "1rem", gap: "10px" }}>
                <Row label="Building" value={facility.location?.building || "—"} />
                <Row label="Floor" value={facility.location?.floor || "—"} />
                <Row label="Code" value={facility.code} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function LiveBar({ label, value, icon: Icon, raw = false }) {
  const pct = typeof value === "number" ? value : 0;
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: "6px" }}>
        <div className="flex items-center" style={{ gap: "6px", color: "var(--color-text-tertiary)" }}>
          <Icon size={11} strokeWidth={2} />
          <span className="font-mono" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.14em" }}>{label}</span>
        </div>
        <span className="font-mono font-semibold text-text-primary" style={{ fontSize: "13px" }}>
          {raw ? value : `${value}%`}
        </span>
      </div>
      {!raw && (
        <div style={{ height: "6px", width: "100%", borderRadius: "9999px", backgroundColor: "var(--color-surface-raised)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: "100%",
              borderRadius: "9999px",
              backgroundColor: pct > 80 ? "#ef4444" : pct > 60 ? "#f59e0b" : "var(--color-primary)",
            }}
          />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-tertiary" style={{ fontSize: "13px" }}>{label}</span>
      <span className="font-mono text-text-primary" style={{ fontSize: "13px" }}>{value}</span>
    </div>
  );
}