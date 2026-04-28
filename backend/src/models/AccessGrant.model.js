const mongoose = require("mongoose");

const accessGrantSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    patientWalletAddress: {
      type: String,
      required: true,
      index: true,
    },
    doctorWalletAddress: {
      type: String,
      required: true,
      index: true,
    },
    doctorName: {
      type: String,
      default: "Unknown Doctor",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    transactionHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

accessGrantSchema.index({ patientWalletAddress: 1, doctorWalletAddress: 1 }, { unique: true });
accessGrantSchema.index({ doctorWalletAddress: 1, isActive: 1 });

module.exports = mongoose.model("AccessGrant", accessGrantSchema);
