const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/healthcare_dapp";

  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("🔴 MongoDB connection error:", error.message);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error("🔴 MongoDB runtime error:", err.message);
  });
}

module.exports = connectDB;
