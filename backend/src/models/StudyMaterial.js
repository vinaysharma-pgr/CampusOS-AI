import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 2000 },
    category: {
      type: String,
      enum: ["notes", "slides", "pyq", "reference", "other"],
      default: "notes",
    },
    courseCode: { type: String, required: true, trim: true, uppercase: true, index: true },
    courseName: { type: String, default: "" },
    department: { type: String, required: true, index: true },
    semester: { type: String, required: true },
    section: { type: String, default: "" }, // empty = applies to all sections
    facultyId: { type: mongoose.Schema.Types.Mixed, default: null },
    facultyName: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

studyMaterialSchema.index({ department: 1, semester: 1, section: 1, courseCode: 1 });
studyMaterialSchema.index({ facultyId: 1, createdAt: -1 });
studyMaterialSchema.index({ createdAt: -1 });

export default mongoose.model("StudyMaterial", studyMaterialSchema);
