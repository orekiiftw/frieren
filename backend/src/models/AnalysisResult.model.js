const mongoose = require("mongoose");

const analysisResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["imaging", "prediction"],
      required: true,
    },
    // For imaging: analysis type (xray, mri, ct_scan)
    // For prediction: prediction type (diabetes, cardiovascular, cancer_risk)
    subType: {
      type: String,
      required: true,
    },
    // Input metadata
    input: {
      filename: String,
      fileSize: Number,
      ipfsHash: String,
      patientData: mongoose.Schema.Types.Mixed,
    },
    // Gemini AI response
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    modelUsed: {
      type: String,
      default: "gemini-2.0-flash",
    },
  },
  {
    timestamps: true,
  }
);

analysisResultSchema.index({ userId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model("AnalysisResult", analysisResultSchema);
