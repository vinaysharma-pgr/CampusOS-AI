// src/database/otpStore.js
// In-memory OTP store with expiration + attempt tracking.
// When MongoDB connects, swap this for a TTL collection.

const store = new Map(); // key: `${purpose}:${email}` → { otp, expiresAt, attempts }

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

function key(purpose, email) {
  return `${purpose}:${email.toLowerCase().trim()}`;
}

export const otpStore = {
  /**
   * Generate + store OTP. Returns the OTP string.
   * @param {string} purpose - "signup" | "login" | "reset"
   * @param {string} email
   */
  generate(purpose, email) {
    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
    store.set(key(purpose, email), {
      otp,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
      createdAt: Date.now(),
    });
    return otp;
  },

  /**
   * Verify OTP. Returns true/false. Deletes on success.
   */
  verify(purpose, email, submitted) {
    const k = key(purpose, email);
    const entry = store.get(k);
    if (!entry) return { ok: false, reason: "no_otp" };

    if (Date.now() > entry.expiresAt) {
      store.delete(k);
      return { ok: false, reason: "expired" };
    }

    if (entry.attempts >= MAX_ATTEMPTS) {
      store.delete(k);
      return { ok: false, reason: "too_many_attempts" };
    }

    if (entry.otp !== String(submitted).trim()) {
      entry.attempts++;
      return { ok: false, reason: "invalid", attemptsLeft: MAX_ATTEMPTS - entry.attempts };
    }

    // Success — delete OTP
    store.delete(k);
    return { ok: true };
  },

  /**
   * Check if there's an active OTP (used for rate limiting).
   */
  hasActive(purpose, email) {
    const entry = store.get(key(purpose, email));
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      store.delete(key(purpose, email));
      return false;
    }
    return true;
  },

  /**
   * Cleanup expired entries (called periodically)
   */
  cleanup() {
    const now = Date.now();
    for (const [k, v] of store.entries()) {
      if (now > v.expiresAt) store.delete(k);
    }
  },
};

// Auto-cleanup every 5 minutes
setInterval(() => otpStore.cleanup(), 5 * 60 * 1000);