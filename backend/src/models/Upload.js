// src/models/Upload.js
import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, unique: true, index: true },
    originalName: { type: String, default: "" },
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
    ownerId: { type: mongoose.Schema.Types.Mixed, default: null, index: true },
    ownerName: { type: String, default: "" },
    ownerRole: { type: String, default: "" },
    purpose: { type: String, default: "generic" }, // hod-submission | assignment | facility | event
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Upload", uploadSchema);
