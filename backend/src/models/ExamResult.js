import mongoose from "mongoose";

const examResultSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    studentId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    studentName: { type: String, default: "" },
    studentRollNo: { type: String, default: "" },
    marksObtained: { type: Number, default: 0, min: 0 },
    isAbsent: { type: Boolean, default: false },
    remarks: { type: String, default: "" },
    enteredBy: { type: mongoose.Schema.Types.Mixed, default: null },
    enteredByName: { type: String, default: "" },
    publishedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });
examResultSchema.index({ studentId: 1, isActive: 1 });

export default mongoose.model("ExamResult", examResultSchema);
