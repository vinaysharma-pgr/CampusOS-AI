import mongoose from "mongoose";

const facilitySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^[a-z0-9-]+$/, "ID must be lowercase letters, numbers, and hyphens"] },
    code: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["lab", "library", "classroom", "sports", "cafeteria", "auditorium", "facility"] },
    tagline: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    image: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    specs: {
      seats: { type: Number, default: 0 },
      systems: { type: Number, default: 0 },
      floors: { type: Number, default: 1 },
      area: { type: String, default: "" },
      hours: { type: String, default: "" },
    },
    amenities: { type: [String], default: [] },
    live: {
      occupancy: { type: Number, default: 0, min: 0, max: 100 },
      seatsAvailable: { type: Number, default: 0 },
      systemsAvailable: { type: Number, default: 0 },
      status: { type: String, enum: ["open", "busy", "closed", "available"], default: "open" },
    },
    location: {
      building: { type: String, default: "" },
      floor: { type: String, default: "" },
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

facilitySchema.index({ name: "text", tagline: "text", description: "text" });

export default mongoose.model("Facility", facilitySchema);