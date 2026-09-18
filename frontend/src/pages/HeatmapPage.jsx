// src/pages/HeatmapPage.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { HOURS } from "../features/heatmap/data/heatmapData";
import HeatmapGrid from "../features/heatmap/components/HeatmapGrid";
import TimeSlider from "../features/heatmap/components/TimeSlider";
import HeatLegend from "../features/heatmap/components/HeatLegend";

const CONTAINER_STYLE = {
  width: "100%",
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

export default function HeatmapPage() {
  const [hourIndex, setHourIndex] = useState(9);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setHourIndex((prev) => (prev + 1) % HOURS.length);
    }, 1200);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <section style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
      <div style={CONTAINER_STYLE}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
          style={{ maxWidth: "42rem", marginLeft: "auto", marginRight: "auto", marginBottom: "3.5rem" }}
        >
          <span
            className="inline-flex items-center rounded-full backdrop-blur-xl"
            style={{
              gap: "10px",
              padding: "6px 16px 6px 8px",
              border: "1px solid rgba(255,255,255,0.13)",
              backgroundColor: "rgba(14,16,20,0.6)",
            }}
          >
            <span
              className="flex items-center rounded-full"
              style={{
                height: "24px",
                paddingLeft: "10px",
                paddingRight: "10px",
                backgroundColor: "var(--color-primary)",
              }}
            >
              <span
                className="font-mono font-semibold"
                style={{ fontSize: "10px", color: "var(--color-primary-fg)", letterSpacing: "0.14em" }}
              >
                LIVE
              </span>
            </span>
            <span className="font-medium text-text-secondary" style={{ fontSize: "12.5px" }}>
              Occupancy Heatmap
            </span>
          </span>

          <h1
            className="text-text-primary"
            style={{
              marginTop: "1.5rem",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            See how busy every facility is, hour by hour.
          </h1>

          <p
            className="text-text-secondary"
            style={{
              marginTop: "1.5rem",
              fontSize: "16px",
              lineHeight: 1.6,
            }}
          >
            Scrub through the day or press play to watch the campus breathe. Click any facility for details.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]" style={{ gap: "1.5rem" }}>
          <div className="flex flex-col" style={{ gap: "1.5rem" }}>
            <TimeSlider
              hours={HOURS}
              value={hourIndex}
              onChange={setHourIndex}
              playing={playing}
              onPlayToggle={() => setPlaying((p) => !p)}
            />
            <HeatmapGrid hourIndex={hourIndex} />
          </div>
          <aside className="flex flex-col" style={{ gap: "1.5rem" }}>
            <HeatLegend />
          </aside>
        </div>
      </div>
    </section>
  );
}