const mongoose = require("mongoose");

const recordKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ipfsHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    encryptionKey: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
    },
    mimeType: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

recordKeySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("RecordKey", recordKeySchema);
