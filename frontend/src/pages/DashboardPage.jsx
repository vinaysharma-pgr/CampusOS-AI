// src/pages/DashboardPage.jsx
import { motion } from "framer-motion";
import { Calendar, TrendingUp, GraduationCap, Clock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { TODAY_CLASSES, DEADLINES, SUBJECT_ATTENDANCE } from "../features/dashboard/data/timetable";
import TodayClassCard from "../features/dashboard/components/TodayClassCard";
import DeadlineCard from "../features/dashboard/components/DeadlineCard";
import AttendanceRing from "../features/dashboard/components/AttendanceRing";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-text-tertiary">
          Not signed in
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-text-primary">
          Please sign in to view your dashboard
        </h1>
      </section>
    );
  }

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const doneCount = TODAY_CLASSES.filter((c) => c.attendance === "present").length;
  const totalDone = TODAY_CLASSES.filter((c) => c.attendance).length;

  return (
    <section className="relative mx-auto w-full max-w-[1440px] px-6 pb-20 pt-24 lg:px-10 lg:pt-32">
      <div
        className="pointer-events-none absolute inset-0 blueprint-grid opacity-20"
        style={{
          maskImage: "radial-gradient(ellipse 60% 55% at 50% 30%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 30%, black, transparent 75%)",
        }}
      />

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-10"
      >
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-tertiary">
          {today}
        </p>
        <h1 className="mt-2 text-[2rem] font-semibold leading-tight tracking-tight text-text-primary lg:text-[2.75rem]">
          Good morning, <span className="text-primary">{user.name.split(" ")[0]}</span>.
        </h1>
        <p className="mt-2 text-[14.5px] text-text-secondary">
          You have {TODAY_CLASSES.length} classes today · {doneCount}/{totalDone} attended so far.
        </p>
      </motion.div>

      {/* Quick stats */}
      <div className="relative mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <QuickStat icon={GraduationCap} label="Roll no." value={user.rollNo} />
        <QuickStat icon={Calendar} label="Semester" value={`Sem ${user.semester}`} />
        <QuickStat icon={TrendingUp} label="Overall attendance" value={`${user.attendance}%`} accent />
        <QuickStat icon={Clock} label="Next class" value="2:00 PM" />
      </div>

      {/* Main grid */}
      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Today's classes */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-tertiary">
              Today's schedule
            </h2>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-primary">
              {TODAY_CLASSES.length} classes
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {TODAY_CLASSES.map((cls, i) => (
              <TodayClassCard key={cls.id} cls={cls} index={i} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          {/* Deadlines */}
          <div className="flex flex-col gap-3">
            <h2 className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-tertiary">
              Deadlines
            </h2>
            <div className="flex flex-col gap-2.5">
              {DEADLINES.map((d, i) => (
                <DeadlineCard key={d.id} deadline={d} index={i} />
              ))}
            </div>
          </div>

          {/* Attendance breakdown */}
          <div className="flex flex-col gap-3">
            <h2 className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-tertiary">
              Attendance by subject
            </h2>
            <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-4">
              {SUBJECT_ATTENDANCE.map((s) => (
                <div key={s.subject} className="flex items-center gap-3">
                  <AttendanceRing percent={s.percent} alert={s.alert} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[13px] font-medium text-text-primary">
                      {s.subject}
                    </p>
                    <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wider text-text-tertiary">
                      {s.attended}/{s.total} classes
                      {s.alert && <span className="ml-2 text-red-500">Below 75%</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function QuickStat({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-1.5 text-text-tertiary">
        <Icon size={11} strokeWidth={2} />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className={`mt-2 font-mono text-[18px] font-semibold tracking-tight ${accent ? "text-primary" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}