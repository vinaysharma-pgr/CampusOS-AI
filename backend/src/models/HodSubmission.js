// src/models/HodSubmission.js
import mongoose from "mongoose";

const hodSubmissionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 5000 },
    type: { type: String, enum: ["exam_paper", "report", "other", "note"], default: "exam_paper" },

    imageUrl: { type: String, default: "" }, // optional now

    department: { type: String, required: true, trim: true, index: true },
    facultyId: { type: mongoose.Schema.Types.Mixed, default: null },
    facultyName: { type: String, default: "" },

    status: { type: String, enum: ["pending", "reviewed", "approved", "rejected"], default: "pending" },
    hodNotes: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

hodSubmissionSchema.index({ department: 1, status: 1, createdAt: -1 });

export default mongoose.model("HodSubmission", hodSubmissionSchema);
