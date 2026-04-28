const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const ragService = require("../services/rag.service");
const geminiService = require("../services/gemini.service");
const blockchainService = require("../services/blockchain.service");
const AnalysisResult = require("../models/AnalysisResult.model");

/**
 * POST /api/ai/chat
 * RAG-powered health assistant using Gemini 3 Flash Preview.
 * Doctors can pass patientAddress to query a specific patient's records.
 */
router.post("/chat", authMiddleware, async (req, res, next) => {
  try {
    const { message, conversationHistory, patientAddress } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "message is required.",
      });
    }

    // Determine which wallet address to use for RAG context
    let targetWalletAddress = req.user.walletAddress;
    let targetRole = req.user.role;

    // If doctor provides a patientAddress, verify access and use patient's records
    if (patientAddress && req.user.role === "doctor") {
      const hasAccess = await blockchainService.checkAccess(patientAddress, req.user.walletAddress);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: "You do not have access to this patient's records.",
        });
      }
      targetWalletAddress = patientAddress;
      targetRole = "patient"; // Speak as if addressing the patient
      console.log(`[AI] Doctor ${req.user.walletAddress.slice(0, 8)}... querying patient ${patientAddress.slice(0, 8)}... records`);
    }

    const response = await ragService.chat({
      userMessage: message,
      walletAddress: targetWalletAddress,
      role: targetRole,
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
 * POST /api/ai/chat/stream
 * Streamed RAG-powered health assistant.
 * Doctors can pass patientAddress to query a specific patient's records.
 */
router.post("/chat/stream", authMiddleware, async (req, res, next) => {
  try {
    const { message, conversationHistory, patientAddress } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "message is required.",
      });
    }

    // Determine which wallet address to use for RAG context
    let targetWalletAddress = req.user.walletAddress;
    let targetRole = req.user.role;

    // If doctor provides a patientAddress, verify access and use patient's records
    if (patientAddress && req.user.role === "doctor") {
      const hasAccess = await blockchainService.checkAccess(patientAddress, req.user.walletAddress);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: "You do not have access to this patient's records.",
        });
      }
      targetWalletAddress = patientAddress;
      targetRole = "patient";
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.status(200);

    const stream = ragService.chatStream({
      userMessage: message,
      walletAddress: targetWalletAddress,
      role: targetRole,
      conversationHistory: conversationHistory || [],
    });

    for await (const chunk of stream) {
      if (chunk) res.write(chunk);
    }

    res.end();
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/predict
 * Disease prediction using Gemini 3 Flash Preview.
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
      modelUsed: "gemini-3-flash-preview",
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
