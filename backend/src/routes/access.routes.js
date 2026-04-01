const express = require("express");
const router = express.Router();
const { authMiddleware, authorize } = require("../middleware/auth.middleware");
const blockchainService = require("../services/blockchain.service");

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

    const txHash = await blockchainService.grantAccess(
      req.user.walletAddress,
      doctorAddress
    );

    res.json({
      success: true,
      data: {
        transactionHash: txHash,
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

    const txHash = await blockchainService.revokeAccess(
      req.user.walletAddress,
      doctorAddress
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
