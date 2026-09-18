// src/models/Group.js
import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    label: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1, max: 5 },
    semester: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

groupSchema.index({ department: 1, year: 1, semester: 1 });

export default mongoose.model("Group", groupSchema);
