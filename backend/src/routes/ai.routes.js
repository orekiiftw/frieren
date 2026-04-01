const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const ragService = require("../services/rag.service");
const geminiService = require("../services/gemini.service");
const AnalysisResult = require("../models/AnalysisResult.model");

/**
 * POST /api/ai/chat
 * RAG-powered health assistant using Gemini 2.0 Flash.
 */
router.post("/chat", authMiddleware, async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "message is required.",
      });
    }

    const response = await ragService.chat({
      userMessage: message,
      walletAddress: req.user.walletAddress,
      role: req.user.role,
      conversationHistory: conversationHistory || [],
    });

    res.json({
      success: true,
      data: response,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/predict
 * Disease prediction using Gemini 2.0 Flash.
 * Supported types: "diabetes", "cardiovascular", "cancer_risk"
 */
router.post("/predict", authMiddleware, async (req, res, next) => {
  try {
    const { patientData, predictionType } = req.body;

    if (!patientData || !predictionType) {
      return res.status(400).json({
        success: false,
        error: "patientData and predictionType are required.",
      });
    }

    const validTypes = ["diabetes", "cardiovascular", "cancer_risk"];
    if (!validTypes.includes(predictionType)) {
      return res.status(400).json({
        success: false,
        error: `predictionType must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Call Gemini for disease prediction
    const prediction = await geminiService.predictDisease(patientData, predictionType);

    // Save result to MongoDB
    await AnalysisResult.create({
      userId: req.user.id,
      type: "prediction",
      subType: predictionType,
      input: { patientData },
      result: prediction,
      modelUsed: "gemini-2.0-flash",
    });

    res.json({
      success: true,
      data: prediction,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/ai/predictions
 * Get history of AI predictions for the current user.
 */
router.get("/predictions", authMiddleware, async (req, res, next) => {
  try {
    const predictions = await AnalysisResult.find({
      userId: req.user.id,
      type: "prediction",
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        predictions,
        total: predictions.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
