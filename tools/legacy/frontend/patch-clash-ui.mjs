import fs from "node:fs";

const path = "src/pages/admin/AdminTimetable.jsx";
let c = fs.readFileSync(path, "utf8");

// 1. Add imports
if (!c.includes("ClashModal")) {
  c = c.replace(
    'import WeeklyGrid from "../../features/timetable/components/WeeklyGrid";',
    'import WeeklyGrid from "../../features/timetable/components/WeeklyGrid";\nimport ClashModal from "../../components/timetable/ClashModal.jsx";\nimport { checkClashes } from "../../api/timetables.js";'
  );
}

// 2. Add clash state in TimetableEditor
if (!c.includes("clashOpen")) {
  c = c.replace(
    'function TimetableEditor({ initial, isEdit, onCancel, onSaved }) {',
    'function TimetableEditor({ initial, isEdit, onCancel, onSaved }) {\n  const [clashOpen, setClashOpen] = useState(false);\n  const [clashes, setClashes] = useState([]);'
  );
}

// 3. Replace the submit function with a clash-aware version
const oldSubmit = `  const submit = async (e) => {
    e.preventDefault();
    if (!form.classes.length) {
      return showToast({ type: "error", title: "Add at least one class" });
    }
    for (const c of form.classes) {
      if (!c.courseCode || !c.courseName || !c.room) {
        return showToast({ type: "error", title: "Each class needs a code, name, and room" });
      }
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateTimetable(initial._id, form);
        showToast({ type: "success", title: "Timetable updated" });
      } else {
        await createTimetable(form);
        showToast({ type: "success", title: "Timetable created" });
      }
      onSaved?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      const detail = err.response?.data?.errors?.[0]?.message;
      showToast({ type: "error", title: msg, description: detail });
    } finally {
      setSaving(false);
    }
  };`;

const newSubmit = `  const doSave = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await updateTimetable(initial._id, form);
        showToast({ type: "success", title: "Timetable updated" });
      } else {
        await createTimetable(form);
        showToast({ type: "success", title: "Timetable created" });
      }
      onSaved?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      const detail = err.response?.data?.errors?.[0]?.message;
      showToast({ type: "error", title: msg, description: detail });
    } finally {
      setSaving(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.classes.length) {
      return showToast({ type: "error", title: "Add at least one class" });
    }
    for (const c of form.classes) {
      if (!c.courseCode || !c.courseName || !c.room) {
        return showToast({ type: "error", title: "Each class needs a code, name, and room" });
      }
    }

    // Check for clashes first
    setSaving(true);
    try {
      const result = await checkClashes({
        classes: form.classes,
        department: form.department,
        semester: form.semester,
        section: form.section,
        academicYear: form.academicYear,
        excludeTimetableId: isEdit ? initial._id : null,
      });

      if (result.clashes && result.clashes.length > 0) {
        setClashes(result.clashes);
        setClashOpen(true);
        setSaving(false);
        return;
      }

      // No clashes → save directly
      await doSave();
    } catch (err) {
      showToast({ type: "error", title: "Clash check failed", description: err.response?.data?.message || err.message });
      setSaving(false);
    }
  };

  const handleOverride = async () => {
    setClashOpen(false);
    await doSave();
  };`;

if (c.includes(oldSubmit)) {
  c = c.replace(oldSubmit, newSubmit);
} else {
  console.log("⚠ Could not find exact submit function. You'll need to patch manually.");
}

// 4. Add ClashModal to the JSX (before the closing </motion.div> of TimetableEditor)
if (!c.includes("<ClashModal")) {
  c = c.replace(
    '    </motion.div>\n  );\n}\n\nfunction Section({ title, children }) {',
    '      <ClashModal\n        open={clashOpen}\n        clashes={clashes}\n        onCancel={() => { setClashOpen(false); setClashes([]); }}\n        onOverride={handleOverride}\n        saving={saving}\n      />\n    </motion.div>\n  );\n}\n\nfunction Section({ title, children }) {'
  );
}

fs.writeFileSync(path, c, "utf8");
console.log("✓ AdminTimetable.jsx patched — clash modal wired");