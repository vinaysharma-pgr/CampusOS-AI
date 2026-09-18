// src/hooks/useSOS.js
import { useEffect, useState } from "react";

export default function useSOS() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("campusos:open-sos", handler);
    return () => window.removeEventListener("campusos:open-sos", handler);
  }, []);

  return { open, setOpen };
}