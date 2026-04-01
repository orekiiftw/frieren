/**
 * Encryption Service
 * Handles AES-256-GCM encryption/decryption for medical records
 * before uploading to IPFS.
 */
const crypto = require("crypto");

const ALGORITHM = process.env.ENCRYPTION_ALGORITHM || "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

class EncryptionService {
  /**
   * Generate a random encryption key.
   * @returns {string} Hex-encoded 256-bit key
   */
  generateKey() {
    return crypto.randomBytes(KEY_LENGTH).toString("hex");
  }

  /**
   * Encrypt data using AES-256-GCM.
   * @param {string|Object} data - Data to encrypt (will be JSON-stringified if object)
   * @param {string} keyHex - Hex-encoded encryption key
   * @returns {Object} { ciphertext, iv, authTag } - All hex-encoded
   */
  encrypt(data, keyHex) {
    const plaintext = typeof data === "string" ? data : JSON.stringify(data);
    const key = Buffer.from(keyHex, "hex");
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    return {
      ciphertext: encrypted,
      iv: iv.toString("hex"),
      authTag,
    };
  }

  /**
   * Decrypt data using AES-256-GCM.
   * @param {Object} encryptedPayload - { ciphertext, iv, authTag } all hex-encoded
   * @param {string} keyHex - Hex-encoded encryption key
   * @returns {string} Decrypted plaintext
   */
  decrypt({ ciphertext, iv, authTag }, keyHex) {
    const key = Buffer.from(keyHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, "hex"));
    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Derive an encryption key from a password + salt using PBKDF2.
   * Useful for deriving keys from user credentials.
   * @param {string} password
   * @param {string} salt - Hex-encoded salt (or generate one)
   * @returns {{ key: string, salt: string }}
   */
  deriveKey(password, salt = null) {
    const saltBuffer = salt ? Buffer.from(salt, "hex") : crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, saltBuffer, 100000, KEY_LENGTH, "sha512");
    return {
      key: key.toString("hex"),
      salt: saltBuffer.toString("hex"),
    };
  }
}

module.exports = new EncryptionService();
