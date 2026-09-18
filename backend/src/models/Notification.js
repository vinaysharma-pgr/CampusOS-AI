// src/models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    type: {
      type: String,
      enum: ["assignment", "submission", "notice", "signup", "review", "system"],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, default: "", maxlength: 500 },
    url: { type: String, default: "/" },
    icon: { type: String, default: "" }, // emoji or short text
    read: { type: Boolean, default: false, index: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
