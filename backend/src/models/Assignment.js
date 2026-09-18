// src/models/Assignment.js
import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    dueDate: { type: String, default: "" },
    type: { type: String, enum: ["assignment", "tutorial"], default: "assignment" },

    // Target audience (denormalized for fast filtering)
    groupCode: { type: String, required: true, trim: true, uppercase: true, index: true },
    department: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    semester: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },

    courseCode: { type: String, default: "", trim: true },
    courseName: { type: String, default: "", trim: true },

    facultyId: { type: mongoose.Schema.Types.Mixed, default: null },
    facultyName: { type: String, default: "" },

    imageUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

assignmentSchema.index({ groupCode: 1, createdAt: -1 });

export default mongoose.model("Assignment", assignmentSchema);
