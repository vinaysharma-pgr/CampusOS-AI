// src/models/Timetable.js
import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    required: true,
  },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "10:00"
  courseCode: { type: String, required: true, uppercase: true }, // "CS 302"
  courseName: { type: String, required: true },
  room: { type: String, required: true },
  facultyName: { type: String, default: "" },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  type: {
    type: String,
    enum: ["lecture", "lab", "tutorial", "exam"],
    default: "lecture",
  },
});

const timetableSchema = new mongoose.Schema(
  {
    // Target: which students this timetable belongs to
    department: { type: String, required: true, index: true }, // "CSE", "IT"
    semester: { type: String, required: true },                 // "5", "6"
    section: { type: String, default: "A" },                    // "A", "B"
    academicYear: { type: String, required: true },             // "2025-26"
    effectiveFrom: { type: String, default: "" },               // "2026-01-15"

    classes: { type: [classSchema], default: [] },

    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

timetableSchema.index({ department: 1, semester: 1, section: 1, academicYear: 1 }, { unique: true });

export default mongoose.model("Timetable", timetableSchema);
