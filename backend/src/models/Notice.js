// src/models/Notice.js
import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 5000 },
    category: {
      type: String,
      enum: ["Academic", "Exam", "Cultural", "Sports", "Placement", "Facility", "General"],
      default: "General",
    },
    priority: {
      type: String,
      enum: ["normal", "urgent"],
      default: "normal",
    },
    targetAudience: {
      type: String,
      enum: ["all", "students", "faculty", "department"],
      default: "all",
    },
    targetDepartment: { type: String, default: null },
    author: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      role: String,
    },
    attachments: { type: [String], default: [] },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

noticeSchema.index({ createdAt: -1 });
noticeSchema.index({ targetDepartment: 1, targetAudience: 1 });

export default mongoose.model("Notice", noticeSchema);