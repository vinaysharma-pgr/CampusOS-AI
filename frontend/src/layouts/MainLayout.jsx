// src/layouts/MainLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AIChatBubble from "../features/ai-assistant/components/AIChatBubble";
import AIChatDrawer from "../features/ai-assistant/components/AIChatDrawer";
import SOSModal from "../features/sos/components/SOSModal";
import useSOS from "../hooks/useSOS";

export default function MainLayout() {
  const { pathname } = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const { open: sosOpen, setOpen: setSosOpen } = useSOS();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-text-primary antialiased">
      <Navbar onOpenSOS={() => setSosOpen(true)} />
      <main style={{ paddingTop: "64px" }}>
        <Outlet />
      </main>
      <Footer />

      <AIChatBubble
        open={chatOpen}
        onToggle={() => setChatOpen((o) => !o)}
        hasUnread={!chatOpen}
      />
      <AIChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  );
}