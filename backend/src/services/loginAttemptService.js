// src/services/loginAttemptService.js
// Tracks failed login attempts per email in memory.
// In production, use Redis for distributed deployments.

const attempts = new Map(); // key: email → { count, lockedUntil, firstAttemptAt, lastAttemptAt }

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;   // 15 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;  // rolling 15-min window

function key(email) {
  return email.toLowerCase().trim();
}

function getRecord(email) {
  const k = key(email);
  let rec = attempts.get(k);
  const now = Date.now();

  // Reset if window expired and not locked
  if (rec && !rec.lockedUntil && now - rec.firstAttemptAt > ATTEMPT_WINDOW_MS) {
    attempts.delete(k);
    rec = null;
  }

  return { k, rec };
}

/**
 * Check if the account is currently locked.
 * Returns { locked: boolean, retryInMinutes?: number }
 */
export function checkLock(email) {
  const { rec } = getRecord(email);
  if (!rec) return { locked: false };

  if (rec.lockedUntil && Date.now() < rec.lockedUntil) {
    const retryInMs = rec.lockedUntil - Date.now();
    return {
      locked: true,
      retryInMinutes: Math.ceil(retryInMs / 60000),
    };
  }

  // Lock expired — clear
  if (rec.lockedUntil && Date.now() >= rec.lockedUntil) {
    attempts.delete(key(email));
    return { locked: false };
  }

  return { locked: false };
}

/**
 * Record a failed attempt. Returns { locked, remaining } info.
 */
export function recordFailure(email) {
  const k = key(email);
  const now = Date.now();
  let rec = attempts.get(k);

  if (!rec) {
    rec = { count: 0, lockedUntil: null, firstAttemptAt: now, lastAttemptAt: now };
  }

  rec.count++;
  rec.lastAttemptAt = now;

  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCK_DURATION_MS;
  }

  attempts.set(k, rec);

  return {
    count: rec.count,
    remaining: Math.max(0, MAX_ATTEMPTS - rec.count),
    locked: !!rec.lockedUntil && now < rec.lockedUntil,
  };
}

/**
 * Clear attempts on successful login.
 */
export function recordSuccess(email) {
  attempts.delete(key(email));
}

/**
 * Admin utility — manually unlock.
 */
export function unlock(email) {
  attempts.delete(key(email));
}

/**
 * Admin utility — list locked accounts.
 */
export function listLocked() {
  const now = Date.now();
  const out = [];
  for (const [email, rec] of attempts.entries()) {
    if (rec.lockedUntil && now < rec.lockedUntil) {
      out.push({
        email,
        attempts: rec.count,
        unlockAt: new Date(rec.lockedUntil).toISOString(),
        minutesRemaining: Math.ceil((rec.lockedUntil - now) / 60000),
      });
    }
  }
  return out;
}

// Auto-cleanup every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, rec] of attempts.entries()) {
    if (rec.lockedUntil && now >= rec.lockedUntil) attempts.delete(k);
    else if (!rec.lockedUntil && now - rec.firstAttemptAt > ATTEMPT_WINDOW_MS) attempts.delete(k);
  }
}, 5 * 60 * 1000);
