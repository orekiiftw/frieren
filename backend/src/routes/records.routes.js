const express = require("express");
const router = express.Router();
const { authMiddleware, authorize } = require("../middleware/auth.middleware");
const ipfsService = require("../services/ipfs.service");
const blockchainService = require("../services/blockchain.service");

/**
 * POST /api/records/upload
 * Upload an encrypted medical record to IPFS and register on-chain.
 * Only patients can upload their own records.
 */
router.post("/upload", authMiddleware, authorize("patient"), async (req, res, next) => {
  try {
    const { encryptedData, dataHash, encryptionKeyMeta } = req.body;

    if (!encryptedData || !dataHash) {
      return res.status(400).json({
        success: false,
        error: "encryptedData and dataHash are required.",
      });
    }

    // 1. Pin encrypted data to IPFS
    const ipfsHash = await ipfsService.pinJSON({
      encryptedPayload: encryptedData,
      uploadedAt: new Date().toISOString(),
    });

    // 2. Register the IPFS hash on-chain
    const txHash = await blockchainService.addRecord(
      req.user.walletAddress,
      ipfsHash,
      dataHash,
      encryptionKeyMeta || ""
    );

    res.status(201).json({
      success: true,
      data: {
        ipfsHash,
        transactionHash: txHash,
        message: "Record uploaded and registered on-chain.",
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

    // Verify access on-chain
    const hasAccess = await blockchainService.checkAccess(
      patientAddress,
      req.user.walletAddress
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to this patient's records.",
      });
    }

    // Fetch records from chain
    const records = await blockchainService.getRecords(patientAddress);

    res.json({
      success: true,
      data: { patientAddress, records },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/records/:patientAddress/:index/download
 * Fetch a specific encrypted record from IPFS.
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

    res.json({
      success: true,
      data: {
        record,
        encryptedPayload: ipfsData,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
