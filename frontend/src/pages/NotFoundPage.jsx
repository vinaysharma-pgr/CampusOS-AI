// src/pages/NotFoundPage.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-20"
        style={{ maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent 75%)",
                 WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent 75%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative max-w-md text-center"
      >
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/30">
          <Compass size={32} strokeWidth={1.5} />
        </div>
        <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-primary">Error 404</p>
        <h1 className="text-[2.5rem] font-semibold tracking-tight text-text-primary">Off the map</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
          The page you're looking for doesn't exist — or has been relocated. Let's get you back on track.
        </p>
        <div className="mt-8 flex justify-center">
          <Button as={Link} to="/" variant="primary" size="lg" icon={ArrowLeft} iconPosition="left">
            Back home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}