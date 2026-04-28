const express = require("express");
const router = express.Router();
const multer = require("multer");
const crypto = require("crypto");
const { authMiddleware, authorize } = require("../middleware/auth.middleware");
const ipfsService = require("../services/ipfs.service");
const blockchainService = require("../services/blockchain.service");
const encryptionService = require("../services/encryption.service");
const geminiService = require("../services/gemini.service");
const ragService = require("../services/rag.service");
const RecordKey = require("../models/RecordKey.model");

// Configure multer for in-memory file handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (_req, file, cb) => {
    // Allow any file type for medical records
    cb(null, true);
  },
});

/**
 * POST /api/records/upload
 * Upload an encrypted medical record to IPFS and register on-chain.
 * Only patients can upload their own records.
 */
router.post("/upload", authMiddleware, authorize("patient"), upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file provided.",
      });
    }

    const isImage = req.file.mimetype.startsWith("image/");
    let analysisResult = null;
    let analysisIpfsHash = null;

    // If it's an image, auto-analyze with Gemini Vision
    if (isImage) {
      try {
        console.log(`[Records] Auto-analyzing image: ${req.file.originalname}`);
        const analysis = await geminiService.analyzeImage(
          req.file.buffer,
          req.file.mimetype,
          "medical_imaging"
        );
        analysisResult = analysis;

        // Save analysis text as a separate text record
        const analysisKey = encryptionService.generateKey();
        const analysisText = JSON.stringify(analysis, null, 2);
        const analysisEncrypted = encryptionService.encrypt(analysisText, analysisKey);
        const analysisHash = crypto.createHash("sha256").update(analysisText).digest("hex");

        analysisIpfsHash = await ipfsService.pinJSON({
          encryptedPayload: analysisEncrypted,
          fileName: `${req.file.originalname}-analysis.json`,
          mimeType: "application/json",
          isAutoAnalysis: true,
          parentFile: req.file.originalname,
          uploadedAt: new Date().toISOString(),
        });

        await blockchainService.addRecord(
          req.user.walletAddress,
          analysisIpfsHash,
          analysisHash,
          ""
        );

        await RecordKey.create({
          userId: req.user.id,
          ipfsHash: analysisIpfsHash,
          encryptionKey: analysisKey,
          fileName: `${req.file.originalname}-analysis.json`,
          mimeType: "application/json",
        });

        console.log(`[Records] Analysis saved to IPFS: ${analysisIpfsHash}`);
      } catch (analysisErr) {
        console.warn("[Records] Image analysis failed:", analysisErr.message);
        // Continue uploading the original image even if analysis fails
      }
    }

    // 1. Generate a random encryption key for the original file
    const key = encryptionService.generateKey();

    // 2. Encrypt the file content (base64-encoded buffer)
    const fileBase64 = req.file.buffer.toString("base64");
    const encryptedPayload = encryptionService.encrypt(fileBase64, key);

    // 3. Compute SHA-256 hash of original file for integrity
    const dataHash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");

    // 4. Pin encrypted data to IPFS
    const ipfsHash = await ipfsService.pinJSON({
      encryptedPayload,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
    });

    // 5. Register the IPFS hash on-chain
    const txHash = await blockchainService.addRecord(
      req.user.walletAddress,
      ipfsHash,
      dataHash,
      ""
    );

    // 6. Save encryption key to database for RAG retrieval
    await RecordKey.create({
      userId: req.user.id,
      ipfsHash,
      encryptionKey: key,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
    });

    // 7. Clear RAG cache so AI immediately sees the new record(s)
    ragService.destroySession(req.user.walletAddress);

    res.status(201).json({
      success: true,
      data: {
        ipfsHash,
        transactionHash: txHash,
        fileName: req.file.originalname,
        encryptionKey: key,
        analysis: analysisResult
          ? {
              ipfsHash: analysisIpfsHash,
              findings: analysisResult.findings?.length || 0,
              overallAssessment: analysisResult.overallAssessment,
            }
          : null,
        message: isImage
          ? "Image uploaded, encrypted, and AI analysis saved as a text record."
          : "Record uploaded, encrypted, and registered on-chain.",
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/records/:patientAddress
 * Fetch all record metadata for a patient (authorized access only).
 */
router.get("/:patientAddress", authMiddleware, async (req, res, next) => {
  try {
    const { patientAddress } = req.params;
    const doctorAddress = req.user.walletAddress;

    console.log(`[Records] Doctor ${doctorAddress.slice(0, 8)}... requesting records for patient ${patientAddress.slice(0, 8)}...`);

    // Verify access on-chain
    const hasAccess = await blockchainService.checkAccess(patientAddress, doctorAddress);
    console.log(`[Records] checkAccess result: ${hasAccess}`);

    if (!hasAccess) {
      console.warn(`[Records] Access DENIED for doctor ${doctorAddress} to patient ${patientAddress}`);
      return res.status(403).json({
        success: false,
        error: "You do not have access to this patient's records.",
      });
    }

    // Fetch records from chain
    const records = await blockchainService.getRecords(patientAddress);
    console.log(`[Records] Found ${records.length} record(s) for patient ${patientAddress.slice(0, 8)}...`);

    res.json({
      success: true,
      data: { patientAddress, records },
    });
  } catch (err) {
    console.error("[Records] Error fetching records:", err.message);
    next(err);
  }
});

/**
 * GET /api/records/:patientAddress/:index/download
 * Fetch and decrypt a specific record from IPFS for authorized doctors/patients.
 */
router.get("/:patientAddress/:index/download", authMiddleware, async (req, res, next) => {
  try {
    const { patientAddress, index } = req.params;

    const hasAccess = await blockchainService.checkAccess(
      patientAddress,
      req.user.walletAddress
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: "Access denied.",
      });
    }

    const record = await blockchainService.getRecord(patientAddress, parseInt(index));
    const ipfsData = await ipfsService.fetchFromIPFS(record.ipfsHash);

    if (!ipfsData.encryptedPayload) {
      return res.status(400).json({
        success: false,
        error: "Record does not contain encrypted payload.",
      });
    }

    // Look up the encryption key
    const keyDoc = await RecordKey.findOne({ ipfsHash: record.ipfsHash });
    if (!keyDoc) {
      return res.status(404).json({
        success: false,
        error: "Encryption key not found for this record.",
      });
    }

    // Decrypt
    const decryptedText = encryptionService.decrypt(
      ipfsData.encryptedPayload,
      keyDoc.encryptionKey
    );

    // Determine content type
    const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(decryptedText) && decryptedText.length > 100;
    let contentType = "text";
    let content = decryptedText;
    let mimeType = keyDoc.mimeType || "application/octet-stream";
    let fileName = keyDoc.fileName || "record";

    if (isBase64) {
      // Original file upload: base64-encoded buffer
      content = decryptedText; // keep as base64 for frontend
      contentType = mimeType.startsWith("image/") ? "image" : "file";
    } else {
      // Plain text / JSON
      try {
        content = JSON.parse(decryptedText);
        contentType = "json";
      } catch {
        content = decryptedText;
        contentType = "text";
      }
    }

    res.json({
      success: true,
      data: {
        record,
        fileName,
        mimeType,
        contentType, // "image" | "json" | "text" | "file"
        content,
      },
    });
  } catch (err) {
    console.error("[Records] Download/decrypt error:", err.message);
    next(err);
  }
});

module.exports = router;
