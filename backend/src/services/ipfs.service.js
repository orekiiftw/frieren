/**
 * IPFS Service
 * Handles pinning and fetching encrypted medical data from IPFS via Pinata Web3 SDK.
 */
const { PinataSDK } = require("pinata-web3");

class IPFSService {
  constructor() {
    this._pinata = null;
  }

  _getClient() {
    if (!this._pinata) {
      const jwt = process.env.PINATA_JWT;
      const gateway = process.env.PINATA_GATEWAY;

      if (!jwt || !gateway) {
        console.warn("⚠️  PINATA_JWT or PINATA_GATEWAY not set. IPFS operations will fail.");
        return null;
      }

      this._pinata = new PinataSDK({
        pinataJwt: jwt,
        pinataGateway: gateway,
      });
    }
    return this._pinata;
  }

  /**
   * Pin JSON data to IPFS via Pinata.
   * @param {Object} jsonData - The data to pin (should already be encrypted)
   * @returns {string} IPFS CID hash
   */
  async pinJSON(jsonData) {
    const pinata = this._getClient();

    if (!pinata) {
      // Fallback mock for development without Pinata keys
      const mockCID = "Qm" + Buffer.from(JSON.stringify(jsonData)).toString("hex").slice(0, 44);
      console.log(`📌 [IPFS-MOCK] Pinned data with CID: ${mockCID}`);
      return mockCID;
    }

    try {
      const jsonString = JSON.stringify(jsonData);
      const blob = new Blob([jsonString], { type: "application/json" });
      const file = new File([blob], `medical-record-${Date.now()}.json`, {
        type: "application/json",
      });

      const upload = await pinata.upload.file(file);
      console.log(`📌 [IPFS] Pinned data with CID: ${upload.IpfsHash}`);
      return upload.IpfsHash;
    } catch (error) {
      console.error("IPFS pinJSON error:", error);
      throw new Error("Failed to pin data to IPFS.");
    }
  }

  /**
   * Fetch data from IPFS by CID.
   * @param {string} cid - The IPFS content identifier
   * @returns {Object} The retrieved data
   */
  async fetchFromIPFS(cid) {
    const pinata = this._getClient();

    if (!pinata) {
      console.log(`📥 [IPFS-MOCK] Fetching data for CID: ${cid}`);
      return {
        encryptedPayload: "mock-encrypted-data-base64",
        uploadedAt: new Date().toISOString(),
      };
    }

    try {
      const gateway = process.env.PINATA_GATEWAY;
      const response = await fetch(`https://${gateway}/ipfs/${cid}`);

      if (!response.ok) {
        throw new Error(`IPFS fetch failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log(`📥 [IPFS] Fetched data for CID: ${cid}`);
      return data;
    } catch (error) {
      console.error("IPFS fetch error:", error);
      throw new Error("Failed to fetch data from IPFS.");
    }
  }

  /**
   * Pin a file (e.g., medical image) to IPFS.
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} fileName - Original file name
   * @param {string} mimeType - MIME type of the file
   * @returns {string} IPFS CID hash
   */
  async pinFile(fileBuffer, fileName, mimeType = "application/octet-stream") {
    const pinata = this._getClient();

    if (!pinata) {
      const mockCID = "QmFile" + Date.now().toString(36);
      console.log(`📌 [IPFS-MOCK] Pinned file "${fileName}" with CID: ${mockCID}`);
      return mockCID;
    }

    try {
      const blob = new Blob([fileBuffer], { type: mimeType });
      const file = new File([blob], fileName, { type: mimeType });

      const upload = await pinata.upload.file(file);
      console.log(`📌 [IPFS] Pinned file "${fileName}" with CID: ${upload.IpfsHash}`);
      return upload.IpfsHash;
    } catch (error) {
      console.error("IPFS pinFile error:", error);
      throw new Error("Failed to pin file to IPFS.");
    }
  }
}

module.exports = new IPFSService();
