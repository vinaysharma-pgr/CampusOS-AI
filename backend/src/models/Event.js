import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    type: { type: String, required: true, enum: ["academic", "cultural", "sports", "placement", "workshop"] },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true, trim: true },
    speaker: { type: String, default: "" },
    description: { type: String, required: true, maxlength: 2000 },
    seats: { type: Number, default: 0 },
    registered: { type: Number, default: 0 },
    tag: { type: String, default: "" },
    banner: { type: String, default: "" },
    coordinatorIds: { type: [mongoose.Schema.Types.Mixed], default: [] },
    coordinatorNames: { type: [String], default: [] },
    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

eventSchema.index({ date: 1, type: 1 });

export default mongoose.model("Event", eventSchema);