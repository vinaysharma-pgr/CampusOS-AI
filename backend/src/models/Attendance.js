// src/models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, trim: true }, // "2026-09-18"
    dayOfWeek: { type: String, required: true, trim: true }, // "Thursday"

    // Class target
    groupCode: { type: String, required: true, trim: true, uppercase: true, index: true },
    department: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },

    courseCode: { type: String, required: true, trim: true },
    courseName: { type: String, default: "" },

    period: { type: Number, default: 0 }, // 1-7
    timeSlot: { type: String, default: "" }, // "08:30-09:30"

    facultyId: { type: mongoose.Schema.Types.Mixed, default: null },
    facultyName: { type: String, default: "" },

    present: { type: [mongoose.Schema.Types.Mixed], default: [] }, // user _ids
    absent: { type: [mongoose.Schema.Types.Mixed], default: [] },  // user _ids

    totalStudents: { type: Number, default: 0 },
    presentCount: { type: Number, default: 0 },
    absentCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One record per class per date
attendanceSchema.index({ date: 1, groupCode: 1, courseCode: 1, period: 1 }, { unique: true });
attendanceSchema.index({ facultyId: 1, date: -1 });
attendanceSchema.index({ groupCode: 1, courseCode: 1, date: -1 });

export default mongoose.model("Attendance", attendanceSchema);
