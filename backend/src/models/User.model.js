const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor"],
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
      unique: true,
    },
    // Private key encrypted with password-derived key (AES-256-GCM)
    walletEncrypted: {
      ciphertext: { type: String, required: true },
      iv: { type: String, required: true },
      authTag: { type: String, required: true },
      salt: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups
userSchema.index({ email: 1 });
userSchema.index({ walletAddress: 1 });

module.exports = mongoose.model("User", userSchema);
