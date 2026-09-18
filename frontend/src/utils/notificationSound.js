// src/utils/notificationSound.js
// Soft two-note chime via Web Audio API. No files, works everywhere.
let ctx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function playChime({ muted = false } = {}) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;

  // Resume if suspended (browsers auto-suspend until first user gesture)
  if (c.state === "suspended") c.resume().catch(() => {});

  const now = c.currentTime;

  // Two notes: 880 Hz (A5) then 1318.51 Hz (E6) — soft, bell-like
  const notes = [
    { freq: 880.00, start: 0.00, dur: 0.35, gain: 0.18 },
    { freq: 1318.51, start: 0.14, dur: 0.45, gain: 0.14 },
  ];

  for (const n of notes) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = n.freq;

    // Gentle attack + exponential decay for a natural chime
    gain.gain.setValueAtTime(0, now + n.start);
    gain.gain.linearRampToValueAtTime(n.gain, now + n.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);

    osc.connect(gain).connect(c.destination);
    osc.start(now + n.start);
    osc.stop(now + n.start + n.dur + 0.05);
  }
}
