// src/components/auth/OTPInput.jsx
import { useEffect, useRef, useState } from "react";

export default function OTPInput({ length = 6, value = "", onChange, disabled = false, error = false }) {
  const [digits, setDigits] = useState(() =>
    Array.from({ length }, (_, i) => value[i] || "")
  );
  const refs = useRef([]);

  useEffect(() => {
    onChange(digits.join(""));
  }, [digits]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (index, val) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // Paste handler — multiple digits
    if (clean.length > 1) {
      const next = [...digits];
      for (let i = 0; i < clean.length && index + i < length; i++) {
        next[index + i] = clean[i];
      }
      setDigits(next);
      const focusIndex = Math.min(index + clean.length, length - 1);
      refs.current[focusIndex]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1) refs.current[index + 1]?.focus();
  };

  return (
    <div
      className="flex justify-center"
      style={{ gap: "10px", width: "100%" }}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className="text-center font-mono font-semibold"
          style={{
            width: "52px",
            height: "64px",
            fontSize: "24px",
            color: "var(--color-text-primary)",
            backgroundColor: "var(--color-surface-raised)",
            border: error
              ? "1px solid #f0554d"
              : d
              ? "1px solid var(--color-primary)"
              : "1px solid var(--color-border-strong)",
            borderRadius: "12px",
            outline: "none",
            transition: "all 0.15s ease",
            caretColor: "var(--color-primary)",
          }}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
