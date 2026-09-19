import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    courseCode: { type: String, required: true, trim: true, uppercase: true },
    courseName: { type: String, required: true, trim: true },
    examType: {
      type: String,
      required: true,
      enum: [
        "mid-sem",
        "end-sem",
        "class-test",
        "pre-university",
        "internal",
        "practical",
        "viva",
        "lab-viva",
        "quiz",
        "assignment-test",
        "other",
      ],
    },
    customType: { type: String, default: "", trim: true, maxlength: 80 },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    durationMinutes: { type: Number, default: 120 },
    room: { type: String, default: "" },
    department: { type: String, required: true, index: true },
    semester: { type: String, required: true },
    section: { type: String, default: "" },
    maxMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 40 },
    isPublished: { type: Boolean, default: false },
    showToStudents: { type: Boolean, default: true },
    countsTowardTotal: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.Mixed, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

examSchema.index({ department: 1, semester: 1, section: 1, date: 1 });
examSchema.index({ date: 1, isActive: 1 });

export default mongoose.model("Exam", examSchema);
