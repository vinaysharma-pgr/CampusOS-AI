import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ok = (m) => console.log("  [OK]   " + m);
const fail = (m) => console.log("  [FAIL] " + m);
const info = (m) => console.log("  [INFO] " + m);

function writeIfMissing(rel, content) {
  const full = path.join(ROOT, rel);
  if (fs.existsSync(full)) { info(rel + " already exists - skipping"); return; }
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  ok("created " + rel);
}

function patch(rel, from, to) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) { fail(rel + " missing"); return; }
  let raw = fs.readFileSync(full, "utf8");
  const usesCRLF = raw.includes("\r\n");
  let src = usesCRLF ? raw.replace(/\r\n/g, "\n") : raw;

  if (src.includes(to)) { info(rel + " already patched"); return; }
  if (!src.includes(from)) { fail(rel + " anchor not found"); return; }

  src = src.replace(from, to);
  const out = usesCRLF ? src.replace(/\n/g, "\r\n") : src;
  fs.writeFileSync(full, out, "utf8");
  ok("patched " + rel);
}

console.log("");
console.log("PHASE 21 - Attendance Predictor");
console.log("");

// ---------- 1. SafeSkipCard component ----------
writeIfMissing("frontend/src/features/attendance/components/SafeSkipCard.jsx", `import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle } from "lucide-react";

const THRESHOLD = 75;

/**
 * Compute skip/recovery for one subject.
 * Returns { canSkip, needToAttend, status }
 *   status: "safe" (>=75) or "risk" (<75)
 */
function predict(subject) {
  const { present = 0, totalClasses = 0 } = subject;
  const total = Number(totalClasses) || 0;
  const p = Number(present) || 0;

  if (total === 0) {
    return { canSkip: 0, needToAttend: 0, status: "safe" };
  }

  const currentPct = (p / total) * 100;

  if (currentPct >= THRESHOLD) {
    // Max future classes that can be missed while staying >= 75%
    // Need (present) / (total + x) >= 0.75
    // present >= 0.75 * total + 0.75x
    // x <= (present - 0.75*total) / 0.75
    const skips = Math.floor((p - 0.75 * total) / 0.75);
    return { canSkip: Math.max(0, skips), needToAttend: 0, status: "safe" };
  }

  // Need (present + x) / (total + x) >= 0.75
  // present + x >= 0.75*total + 0.75x
  // 0.25x >= 0.75*total - present
  // x >= (0.75*total - present) / 0.25
  const attend = Math.ceil((0.75 * total - p) / 0.25);
  return { canSkip: 0, needToAttend: Math.max(1, attend), status: "risk" };
}

export default function SafeSkipCard({ subjects = [] }) {
  if (!subjects.length) return null;

  const rows = subjects.map((s) => ({
    courseCode: s.courseCode,
    courseName: s.courseName || s.courseCode,
    percentage: s.percentage,
    present: s.present,
    total: s.totalClasses,
    ...predict(s),
  }));

  const safe = rows.filter((r) => r.status === "safe");
  const risk = rows.filter((r) => r.status === "risk");

  return (
    <div style={{ marginTop: "1.75rem" }}>
      <div className="flex items-center" style={{ gap: "10px", marginBottom: "12px" }}>
        <h2 className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)" }}>
          Safe to skip
        </h2>
        <span style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
        <span className="font-mono" style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>
          75% threshold
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "10px" }}>
        {[...risk, ...safe].map((r, i) => {
          const isRisk = r.status === "risk";
          const accent = isRisk ? "#f0554d" : "#4ade80";
          return (
            <motion.div key={r.courseCode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                padding: "1rem 1.1rem",
                borderRadius: "0.75rem",
                border: "1px solid " + (isRisk ? "rgba(240,85,77,0.3)" : "rgba(74,222,128,0.25)"),
                backgroundColor: isRisk ? "rgba(240,85,77,0.04)" : "rgba(74,222,128,0.04)",
              }}>
              <div className="flex items-center justify-between" style={{ gap: "8px", marginBottom: "8px" }}>
                <span className="font-mono" style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "5px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                  {r.courseCode}
                </span>
                <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: accent }}>
                  {r.percentage}%
                </span>
              </div>

              <p className="text-text-primary" style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.3, marginBottom: "8px" }}>
                {r.courseName}
              </p>

              <div className="flex items-start" style={{ gap: "8px" }}>
                <span className="flex items-center justify-center shrink-0"
                  style={{ height: "26px", width: "26px", borderRadius: "7px", backgroundColor: isRisk ? "rgba(240,85,77,0.12)" : "rgba(74,222,128,0.12)", color: accent }}>
                  {isRisk ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                </span>
                <div>
                  {isRisk ? (
                    <>
                      <p className="text-text-primary" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                        Attend <span style={{ color: accent }}>{r.needToAttend}</span> in a row
                      </p>
                      <p className="text-text-tertiary" style={{ marginTop: "2px", fontSize: "11px" }}>
                        to reach 75% · currently {r.present}/{r.total}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-text-primary" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                        {r.canSkip > 0 ? (
                          <>You can skip <span style={{ color: accent }}>{r.canSkip}</span> more class{r.canSkip === 1 ? "" : "es"}</>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle2 size={12} style={{ color: accent }} /> On track — don't skip any
                          </span>
                        )}
                      </p>
                      <p className="text-text-tertiary" style={{ marginTop: "2px", fontSize: "11px" }}>
                        {r.present}/{r.total} attended · 75% safe zone
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {risk.length > 0 && (
        <div className="flex items-start"
          style={{ marginTop: "12px", padding: "10px 12px", gap: "10px", borderRadius: "0.75rem", border: "1px solid rgba(240,85,77,0.25)", backgroundColor: "rgba(240,85,77,0.04)" }}>
          <AlertTriangle size={14} style={{ color: "#f0554d", marginTop: "2px", flexShrink: 0 }} />
          <p className="text-text-secondary" style={{ fontSize: "12px", lineHeight: 1.5 }}>
            {risk.length} subject{risk.length === 1 ? " is" : "s are"} below 75%. Attend the recommended classes to avoid detention.
          </p>
        </div>
      )}
    </div>
  );
}
`);

// ---------- 2. Wire into StudentAttendance ----------
patch(
  "frontend/src/pages/student/StudentAttendance.jsx",
  'import { getMyAttendanceStats } from "../../api/attendance.js";',
  'import { getMyAttendanceStats } from "../../api/attendance.js";\nimport SafeSkipCard from "../../features/attendance/components/SafeSkipCard.jsx";'
);

// Insert SafeSkipCard after the subject list section (before the final `</div>` of the component)
patch(
  "frontend/src/pages/student/StudentAttendance.jsx",
  '          </div>\n        )}\n      </div>\n    </div>\n  );\n}\n\nfunction StatCard',
  '          </div>\n        )}\n      </div>\n\n      {subjects.length > 0 && <SafeSkipCard subjects={subjects} />}\n    </div>\n  );\n}\n\nfunction StatCard'
);

console.log("");
console.log("Done.");