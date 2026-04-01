const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authMiddleware } = require("../middleware/auth.middleware");
const geminiService = require("../services/gemini.service");
const AnalysisResult = require("../models/AnalysisResult.model");

// Configure multer for in-memory file handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/dicom",
      "application/dicom",
      "application/octet-stream",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and DICOM files are allowed."));
    }
  },
});

/**
 * POST /api/imaging/analyze
 * Upload a medical image for Gemini Vision analysis.
 */
router.post("/analyze", authMiddleware, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided.",
      });
    }

    const analysisType = req.body.analysisType || "xray";

    // Determine the MIME type (Gemini supports jpeg, png, webp)
    let mimeType = req.file.mimetype;
    if (mimeType === "application/octet-stream" || mimeType === "application/dicom") {
      // For DICOM files, we'll try sending as generic image
      mimeType = "image/png";
    }

    // Call Gemini Vision for medical image analysis
    const analysis = await geminiService.analyzeImage(
      req.file.buffer,
      mimeType,
      analysisType
    );

    // Build the response
    const resultData = {
      analysisType,
      filename: req.file.originalname,
      fileSize: req.file.size,
      ...analysis,
      modelUsed: "gemini-2.0-flash",
      processedAt: new Date().toISOString(),
    };

    // Save to MongoDB
    await AnalysisResult.create({
      userId: req.user.id,
      type: "imaging",
      subType: analysisType,
      input: {
        filename: req.file.originalname,
        fileSize: req.file.size,
      },
      result: resultData,
      modelUsed: "gemini-2.0-flash",
    });

    res.json({
      success: true,
      data: resultData,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/imaging/history
 * Get the patient's imaging analysis history from MongoDB.
 */
router.get("/history", authMiddleware, async (req, res, next) => {
  try {
    const analyses = await AnalysisResult.find({
      userId: req.user.id,
      type: "imaging",
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        analyses,
        total: analyses.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
