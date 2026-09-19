import mongoose from "mongoose";

const noticeReadSchema = new mongoose.Schema(
  {
    noticeId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    userId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    userRole: { type: String, default: "" },
    readAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

noticeReadSchema.index({ noticeId: 1, userId: 1 }, { unique: true });
noticeReadSchema.index({ userId: 1, readAt: -1 });

export default mongoose.model("NoticeRead", noticeReadSchema);
