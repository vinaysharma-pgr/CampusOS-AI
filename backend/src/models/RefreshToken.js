// src/models/RefreshToken.js
import mongoose from "mongoose";
import crypto from "node:crypto";

const refreshTokenSchema = new mongoose.Schema(
  {
    // The token is stored hashed — never plaintext
    tokenHash: { type: String, required: true, unique: true, index: true },

    // Owner
    userId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },

    // Device / session info
    userAgent: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    deviceLabel: { type: String, default: "" }, // parsed from UA: "Chrome on Windows"

    // Expiry
    expiresAt: { type: Date, required: true },

    // Rotation chain — points to the token this replaced (for detecting replay)
    replacedBy: { type: String, default: "" },

    // Status
    isRevoked: { type: Boolean, default: false, index: true },
    revokedAt: { type: Date, default: null },
    revokedReason: { type: String, default: "" }, // "logout" | "rotated" | "replay" | "admin"
  },
  { timestamps: true }
);

// Fast lookups
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL — auto-delete expired
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

// Static: hash a raw token before storing
refreshTokenSchema.statics.hashToken = function (rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
};

export default mongoose.model("RefreshToken", refreshTokenSchema);
