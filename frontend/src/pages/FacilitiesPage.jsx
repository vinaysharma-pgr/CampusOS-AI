import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Loader2 } from "lucide-react";
import { FACILITY_TYPES } from "../features/facilities/data/facilities";
import FacilityCard from "../features/facilities/components/FacilityCard";
import FacilityFilters from "../features/facilities/components/FacilityFilters";
import { listFacilities } from "../api/facilities.js";

const CONTAINER_STYLE = {
  width: "100%",
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  boxSizing: "border-box",
};

export default function FacilitiesPage() {
  const [activeType, setActiveType] = useState("all");
  const [query, setQuery] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      listFacilities({ type: activeType, q: query })
        .then(setFacilities)
        .catch(() => setFacilities([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [activeType, query]);

  return (
    <section className="relative" style={{ paddingTop: "4rem", paddingBottom: "5rem", width: "100%", maxWidth: "100vw" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 40% at 50% 20%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative text-center"
        style={{ ...CONTAINER_STYLE, maxWidth: "780px", marginBottom: "3rem" }}
      >
        <span
          className="inline-flex items-center"
          style={{
            gap: "8px",
            padding: "6px 14px 6px 8px",
            borderRadius: "9999px",
            border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--color-primary) 5%, transparent)",
          }}
        >
          <span
            className="flex items-center justify-center rounded-full"
            style={{ height: "22px", width: "22px", backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)", color: "var(--color-primary)" }}
          >
            <Building2 size={11} strokeWidth={2} />
          </span>
          <span
            className="font-mono font-medium"
            style={{
              fontSize: "10.5px",
              color: "var(--color-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            Facility Explorer
          </span>
        </span>

        <h1
          className="text-text-primary"
          style={{
            marginTop: "1.5rem",
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
          }}
        >
          Every room, lab, and hall on campus
        </h1>

        <p
          className="text-text-secondary"
          style={{
            marginTop: "1rem",
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "38rem",
            fontSize: "15px",
            lineHeight: 1.6,
          }}
        >
          Live status, capacity, systems, and amenities — all in one place. Click any facility for full details.
        </p>
      </motion.div>

      <div style={{ ...CONTAINER_STYLE, marginBottom: "2rem" }}>
        <FacilityFilters
          types={FACILITY_TYPES}
          activeType={activeType}
          onTypeChange={setActiveType}
          query={query}
          onQueryChange={setQuery}
          resultCount={facilities.length}
        />
      </div>

      <div style={CONTAINER_STYLE}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ minHeight: "300px" }}>
            <Loader2 size={26} className="animate-spin text-primary" />
          </div>
        ) : facilities.length === 0 ? (
          <div
            className="flex items-center justify-center"
            style={{
              minHeight: "260px",
              borderRadius: "1rem",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <div className="text-center">
              <p
                className="font-mono"
                style={{
                  fontSize: "11.5px",
                  color: "var(--color-text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                No facilities match
              </p>
              <p className="text-text-primary" style={{ marginTop: "8px", fontSize: "13.5px" }}>
                Try a different type or search term.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "1.25rem" }}>
            {facilities.map((f, i) => (
              <FacilityCard key={f.id} facility={f} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}