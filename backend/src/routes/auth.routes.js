const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { ethers } = require("ethers");
const User = require("../models/User.model");
const encryptionService = require("../services/encryption.service");

/**
 * POST /api/auth/register
 * Register a new user (patient or doctor).
 * Generates an Ethereum wallet automatically.
 */
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        error: "Please provide email, password, name, and role.",
      });
    }

    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Role must be 'patient' or 'doctor'.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate an Ethereum wallet for the user
    const wallet = ethers.Wallet.createRandom();

    // Encrypt the private key with a password-derived key
    const derivedKey = encryptionService.deriveKey(password);
    const encryptedWallet = encryptionService.encrypt(
      wallet.privateKey,
      derivedKey.key
    );

    // Save user to MongoDB
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      walletAddress: wallet.address,
      walletEncrypted: {
        ciphertext: encryptedWallet.ciphertext,
        iv: encryptedWallet.iv,
        authTag: encryptedWallet.authTag,
        salt: derivedKey.salt,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
      },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    console.log(`✅ User registered: ${email} | Wallet: ${wallet.address}`);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Authenticate a user with email/password.
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password.",
      });
    }

    // Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
      },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Get the authenticated user's profile.
 */
router.get(
  "/me",
  require("../middleware/auth.middleware").authMiddleware,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("-passwordHash -walletEncrypted");
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found.",
        });
      }

      res.json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress,
          createdAt: user.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
