// src/features/facilities/components/FacilityGallery.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FacilityGallery({ images = [] }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;

  const go = (dir) => {
    setActive((prev) => (prev + dir + images.length) % images.length);
  };

  return (
    <div className="flex flex-col" style={{ gap: "12px" }}>
      {/* Main image */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "16 / 10",
          width: "100%",
          borderRadius: "0.75rem",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={active}
            src={images[active]}
            alt={`Gallery ${active + 1}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              inset: 0,
              height: "100%",
              width: "100%",
              objectFit: "cover",
            }}
          />
        </AnimatePresence>

        {/* Bottom gradient */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)",
          }}
        />

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute flex items-center justify-center rounded-full transition-all"
              style={{
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                height: "36px",
                width: "36px",
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute flex items-center justify-center rounded-full transition-all"
              style={{
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                height: "36px",
                width: "36px",
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <ChevronRight size={16} />
            </button>
            <div
              className="absolute"
              style={{
                bottom: "12px",
                right: "12px",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.9)",
                  letterSpacing: "0.05em",
                }}
              >
                {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8" style={{ gap: "8px" }}>
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="relative overflow-hidden transition-all"
              style={{
                aspectRatio: "1",
                borderRadius: "0.5rem",
                border:
                  active === i
                    ? "1px solid var(--color-primary)"
                    : "1px solid var(--color-border)",
                opacity: active === i ? 1 : 0.55,
              }}
              aria-label={`Show image ${i + 1}`}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                style={{ height: "100%", width: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}