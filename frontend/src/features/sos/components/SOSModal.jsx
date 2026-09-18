// src/features/sos/components/SOSModal.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, Shield, MapPin, X, Loader2, CheckCircle2 } from "lucide-react";

const CONTACTS = [
  { label: "Campus Security", number: "+91-XXXX-111-222", icon: Shield },
  { label: "Medical Emergency", number: "+91-XXXX-333-444", icon: AlertTriangle },
  { label: "Women's Helpline", number: "1090", icon: Phone },
  { label: "Police", number: "100", icon: Phone },
];

export default function SOSModal({ open, onClose }) {
  const [stage, setStage] = useState("idle"); // idle | sending | sent
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!open) {
      setTimeout(() => setStage("idle"), 300);
    }
  }, [open]);

  const handleSend = () => {
    setStage("sending");
    // Fake send — wire to backend tomorrow
    setTimeout(() => {
      setStage("sent");
      // try to fetch location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => setLocation(null)
        );
      }
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/30 bg-surface shadow-[0_0_80px_-8px_rgba(240,85,77,0.4)]"
          >
            {/* Top red bar */}
            <div className="h-1 w-full bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary"
            >
              <X size={16} />
            </button>

            <div className="p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-500 ring-1 ring-red-500/30">
                  <AlertTriangle size={22} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-red-500">
                    Emergency SOS
                  </p>
                  <h2 className="mt-1 text-[20px] font-semibold leading-tight tracking-tight text-text-primary">
                    {stage === "idle" && "Trigger campus alert?"}
                    {stage === "sending" && "Alerting security…"}
                    {stage === "sent" && "Alert received"}
                  </h2>
                  <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                    {stage === "idle" && "This will immediately notify SRMS campus security with your registered details and (if permitted) your live location."}
                    {stage === "sending" && "Hold on — we're routing your alert to the nearest security post and medical center."}
                    {stage === "sent" && "Security has been notified. Help is on the way. Stay where you are if it's safe."}
                  </p>
                </div>
              </div>

              {stage === "sent" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/[0.06] p-3.5"
                >
                  <CheckCircle2 size={16} className="text-green-500" />
                  <div className="flex-1">
                    <p className="text-[12.5px] font-medium text-text-primary">
                      Alert ID: SOS-{Date.now().toString(36).toUpperCase().slice(-6)}
                    </p>
                    <p className="mt-0.5 font-mono text-[10.5px] text-text-tertiary">
                      {location
                        ? `Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                        : "Location: Main Campus · Block A"}
                    </p>
                  </div>
                </motion.div>
              )}

              {stage === "idle" && (
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    onClick={handleSend}
                    className="group flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-red-600 hover:shadow-[0_0_40px_-6px_rgba(240,85,77,0.6)]"
                  >
                    <AlertTriangle size={15} strokeWidth={2.5} />
                    Send SOS alert
                  </button>
                  <p className="text-center font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                    Only use in a real emergency
                  </p>
                </div>
              )}

              {stage === "sending" && (
                <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/[0.06] py-3.5">
                  <Loader2 size={15} className="animate-spin text-red-500" />
                  <span className="text-[13px] font-medium text-text-primary">
                    Connecting to security…
                  </span>
                </div>
              )}

              {/* Direct contacts */}
              <div className="mt-7 border-t border-border pt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
                  Direct lines
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {CONTACTS.map((c) => (
                    <a
                      key={c.label}
                      href={`tel:${c.number.replace(/\D/g, "")}`}
                      className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-raised p-3 transition-all hover:border-primary/40 hover:bg-hover"
                    >
                      <c.icon size={13} className="mt-0.5 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate text-[11.5px] font-medium text-text-primary">
                          {c.label}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-[10.5px] text-text-tertiary">
                          {c.number}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Location note */}
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-border bg-surface-raised p-3">
                <MapPin size={12} className="mt-0.5 shrink-0 text-text-tertiary" />
                <p className="text-[11.5px] leading-relaxed text-text-tertiary">
                  Your approximate location (Main Campus · Block A) is attached automatically. Enable GPS for precision.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}