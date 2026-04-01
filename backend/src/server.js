const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ─── Connect to MongoDB ──────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (Dev) ────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── Routes ──────────────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const recordRoutes = require("./routes/records.routes");
const accessRoutes = require("./routes/access.routes");
const aiRoutes = require("./routes/ai.routes");
const imagingRoutes = require("./routes/imaging.routes");

app.use("/api/auth", authRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/imaging", imagingRoutes);

// ─── Health Check ────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "MedChain AI Healthcare API",
    timestamp: new Date().toISOString(),
  });
});

// ─── Global Error Handler ────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("🔴 Unhandled Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ─── Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🏥 MedChain AI API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}\n`);
});

module.exports = app;
