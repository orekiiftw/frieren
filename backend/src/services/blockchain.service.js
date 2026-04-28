/**
 * Blockchain Service
 * Interacts with the MedicalAccessControl smart contract on Ethereum.
 */
const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

class BlockchainService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.signer = null;
    this._initialized = false;
  }

  /**
   * Lazy-initialize the provider, signer, and contract instance.
   */
  async _init() {
    if (this._initialized) return;

    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Use the deployer private key for backend transactions
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    }

    // Load the contract ABI from the Hardhat compilation artifacts
    const abiPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "blockchain",
      "artifacts",
      "contracts",
      "MedicalAccessControl.sol",
      "MedicalAccessControl.json"
    );

    let abi;
    if (fs.existsSync(abiPath)) {
      const artifact = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
      abi = artifact.abi;
    } else {
      // Minimal ABI fallback for development
      console.warn("⚠️  Contract artifact not found. Using minimal ABI.");
      abi = [
        "function grantAccess(address _doctor) external",
        "function revokeAccess(address _doctor) external",
        "function checkAccess(address _patient, address _doctor) external view returns (bool)",
        "function addRecord(string _ipfsHash, string _dataHash, string _keyMeta) external",
        "function getRecordsCount(address _patient) external view returns (uint256)",
        "function getRecord(address _patient, uint256 _index) external view returns (tuple(string ipfsHash, uint256 timestamp, string dataHash, string encryptionKeyMeta))",
        "event AccessGranted(address indexed patient, address indexed doctor)",
        "event AccessRevoked(address indexed patient, address indexed doctor)",
        "event RecordAdded(address indexed patient, string ipfsHash)",
      ];
    }

    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (contractAddress && this.signer) {
      this.contract = new ethers.Contract(contractAddress, abi, this.signer);
      console.log(`[Blockchain] Connected to contract at ${contractAddress}`);
      console.log(`[Blockchain] Signer address: ${this.signer.address}`);
    } else {
      console.warn("⚠️  Contract address or signer not available. Blockchain operations will return mock data.");
    }

    this._initialized = true;
  }

  /**
   * Grant a doctor access to a patient's records (via owner relay).
   */
  async grantAccess(patientAddress, doctorAddress) {
    await this._init();
    console.log(`🔓 Granting ${doctorAddress} access to ${patientAddress}'s records`);

    if (!this.contract) {
      console.warn("⚠️  Contract not initialized. Returning mock tx hash.");
      return "0xmock_grant_tx_" + Date.now().toString(16);
    }

    const tx = await this.contract.grantAccessOnBehalf(patientAddress, doctorAddress);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Revoke a doctor's access to a patient's records (via owner relay).
   */
  async revokeAccess(patientAddress, doctorAddress) {
    await this._init();
    console.log(`🔒 Revoking ${doctorAddress}'s access to ${patientAddress}'s records`);

    if (!this.contract) {
      return "0xmock_revoke_tx_" + Date.now().toString(16);
    }

    const tx = await this.contract.revokeAccessOnBehalf(patientAddress, doctorAddress);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Check if a doctor has access to a patient's records.
   */
  async checkAccess(patientAddress, doctorAddress) {
    await this._init();
    if (!this.contract) {
      console.warn("⚠️  Contract not initialized. Returning mock access: true");
      return true;
    }
    try {
      const result = await this.contract.checkAccess(patientAddress, doctorAddress);
      console.log(`[Blockchain] checkAccess(${patientAddress.slice(0, 8)}..., ${doctorAddress.slice(0, 8)}...) = ${result}`);
      return result;
    } catch (err) {
      console.error(`[Blockchain] checkAccess failed:`, err.message);
      throw err;
    }
  }

  /**
   * Add a medical record on-chain on behalf of a patient (backend relayer).
   */
  async addRecord(patientAddress, ipfsHash, dataHash, keyMeta) {
    await this._init();
    console.log(`📝 Adding record for ${patientAddress}: ${ipfsHash}`);

    if (!this.contract) {
      return "0xmock_add_record_tx_" + Date.now().toString(16);
    }

    const tx = await this.contract.addRecordOnBehalf(patientAddress, ipfsHash, dataHash, keyMeta);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Get records count for a patient.
   */
  async getRecordsCount(patientAddress) {
    await this._init();
    if (!this.contract) return 0;
    const count = await this.contract.getRecordsCount(patientAddress);
    return Number(count);
  }

  /**
   * Get a specific record by index.
   */
  async getRecord(patientAddress, index) {
    await this._init();
    if (!this.contract) {
      return {
        ipfsHash: "QmMockHash",
        timestamp: Date.now(),
        dataHash: "0xmock",
        encryptionKeyMeta: "mock-key",
      };
    }
    try {
      const record = await this.contract.getRecord(patientAddress, index);
      // Convert BigInt timestamp to Number for JSON serialization
      return {
        ipfsHash: record.ipfsHash,
        timestamp: Number(record.timestamp),
        dataHash: record.dataHash,
        encryptionKeyMeta: record.encryptionKeyMeta,
      };
    } catch (err) {
      console.error(`[Blockchain] getRecord(${patientAddress.slice(0, 8)}..., ${index}) failed:`, err.message);
      throw err;
    }
  }

  /**
   * Get all records for a patient.
   */
  async getRecords(patientAddress) {
    await this._init();
    const count = await this.getRecordsCount(patientAddress);
    console.log(`[Blockchain] Patient ${patientAddress.slice(0, 8)}... has ${count} record(s)`);
    const records = [];
    for (let i = 0; i < count; i++) {
      try {
        const record = await this.getRecord(patientAddress, i);
        records.push({
          index: i,
          ipfsHash: record.ipfsHash,
          timestamp: Number(record.timestamp),
          dataHash: record.dataHash,
          encryptionKeyMeta: record.encryptionKeyMeta,
        });
      } catch (err) {
        console.error(`[Blockchain] Failed to get record ${i} for ${patientAddress.slice(0, 8)}...:`, err.message);
      }
    }
    return records;
  }
}

module.exports = new BlockchainService();
