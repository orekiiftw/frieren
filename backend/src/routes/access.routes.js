const express = require("express");
const router = express.Router();
const { authMiddleware, authorize } = require("../middleware/auth.middleware");
const blockchainService = require("../services/blockchain.service");
const AccessGrant = require("../models/AccessGrant.model");
const User = require("../models/User.model");

/**
 * POST /api/access/grant
 * Grant a doctor access to the patient's records.
 */
router.post("/grant", authMiddleware, authorize("patient"), async (req, res, next) => {
  try {
    const { doctorAddress } = req.body;

    if (!doctorAddress) {
      return res.status(400).json({
        success: false,
        error: "doctorAddress is required.",
      });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(doctorAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Ethereum wallet address.",
      });
    }

    // Grant on blockchain
    const txHash = await blockchainService.grantAccess(
      req.user.walletAddress,
      doctorAddress
    );

    // Look up doctor name if registered
    const doctorUser = await User.findOne({ walletAddress: doctorAddress.toLowerCase() });

    // Upsert access grant in DB
    await AccessGrant.findOneAndUpdate(
      {
        patientWalletAddress: req.user.walletAddress.toLowerCase(),
        doctorWalletAddress: doctorAddress.toLowerCase(),
      },
      {
        patientId: req.user.id,
        patientWalletAddress: req.user.walletAddress.toLowerCase(),
        doctorWalletAddress: doctorAddress.toLowerCase(),
        doctorName: doctorUser?.name || "Unknown Doctor",
        isActive: true,
        transactionHash: txHash,
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        transactionHash: txHash,
        doctorName: doctorUser?.name || "Unknown Doctor",
        message: `Access granted to ${doctorAddress}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/access/revoke
 * Revoke a doctor's access to the patient's records.
 */
router.post("/revoke", authMiddleware, authorize("patient"), async (req, res, next) => {
  try {
    const { doctorAddress } = req.body;

    if (!doctorAddress) {
      return res.status(400).json({
        success: false,
        error: "doctorAddress is required.",
      });
    }

    // Revoke on blockchain
    const txHash = await blockchainService.revokeAccess(
      req.user.walletAddress,
      doctorAddress
    );

    // Update in DB
    await AccessGrant.findOneAndUpdate(
      {
        patientWalletAddress: req.user.walletAddress.toLowerCase(),
        doctorWalletAddress: doctorAddress.toLowerCase(),
      },
      { isActive: false, transactionHash: txHash },
      { new: true }
    );

    res.json({
      success: true,
      data: {
        transactionHash: txHash,
        message: `Access revoked for ${doctorAddress}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/access/doctors
 * List all doctors who have been granted access by the current patient.
 */
router.get("/doctors", authMiddleware, authorize("patient"), async (req, res, next) => {
  try {
    const grants = await AccessGrant.find({
      patientWalletAddress: req.user.walletAddress.toLowerCase(),
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { doctors: grants, total: grants.length },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/access/patients
 * List all patients who have granted access to the current doctor.
 */
router.get("/patients", authMiddleware, authorize("doctor"), async (req, res, next) => {
  try {
    const grants = await AccessGrant.find({
      doctorWalletAddress: req.user.walletAddress.toLowerCase(),
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { patients: grants, total: grants.length },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/access/check/:patientAddress
 * Check if the currently authenticated user has access to a patient's records.
 */
router.get("/check/:patientAddress", authMiddleware, async (req, res, next) => {
  try {
    const { patientAddress } = req.params;

    const hasAccess = await blockchainService.checkAccess(
      patientAddress,
      req.user.walletAddress
    );

    res.json({
      success: true,
      data: { patientAddress, hasAccess },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
