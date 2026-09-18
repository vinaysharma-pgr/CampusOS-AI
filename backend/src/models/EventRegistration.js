// src/models/EventRegistration.js
import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    eventTitle: { type: String, default: "" },
    eventDate: { type: String, default: "" },
    eventTime: { type: String, default: "" },
    eventVenue: { type: String, default: "" },
    eventType: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "" },
    userDepartment: { type: String, default: "" },
    userSemester: { type: String, default: "" },
    userSection: { type: String, default: "" },
    status: { type: String, enum: ["registered"], default: "registered" },
    registeredAt: { type: Date, default: Date.now },
    // Payment (only used for paid events)
    paymentStatus: { type: String, enum: ["free", "pending", "paid", "failed"], default: "free" },
    amountPaid: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

eventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
eventRegistrationSchema.index({ userId: 1, createdAt: -1 });
eventRegistrationSchema.index({ eventId: 1, createdAt: -1 });

export default mongoose.model("EventRegistration", eventRegistrationSchema);
