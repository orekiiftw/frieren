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
    }

    this._initialized = true;
  }

  /**
   * Grant a doctor access to a patient's records.
   */
  async grantAccess(patientAddress, doctorAddress) {
    await this._init();
    // NOTE: In production, the patient signs this tx from their own wallet.
    // The backend would relay a signed transaction or use account abstraction.
    console.log(`🔓 Granting ${doctorAddress} access to ${patientAddress}'s records`);

    if (!this.contract) {
      console.warn("⚠️  Contract not initialized. Returning mock tx hash.");
      return "0xmock_grant_tx_" + Date.now().toString(16);
    }

    const tx = await this.contract.grantAccess(doctorAddress);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Revoke a doctor's access to a patient's records.
   */
  async revokeAccess(patientAddress, doctorAddress) {
    await this._init();
    console.log(`🔒 Revoking ${doctorAddress}'s access to ${patientAddress}'s records`);

    if (!this.contract) {
      return "0xmock_revoke_tx_" + Date.now().toString(16);
    }

    const tx = await this.contract.revokeAccess(doctorAddress);
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
    return await this.contract.checkAccess(patientAddress, doctorAddress);
  }

  /**
   * Add a medical record on-chain.
   */
  async addRecord(patientAddress, ipfsHash, dataHash, keyMeta) {
    await this._init();
    console.log(`📝 Adding record for ${patientAddress}: ${ipfsHash}`);

    if (!this.contract) {
      return "0xmock_add_record_tx_" + Date.now().toString(16);
    }

    const tx = await this.contract.addRecord(ipfsHash, dataHash, keyMeta);
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
    return await this.contract.getRecord(patientAddress, index);
  }

  /**
   * Get all records for a patient.
   */
  async getRecords(patientAddress) {
    await this._init();
    const count = await this.getRecordsCount(patientAddress);
    const records = [];
    for (let i = 0; i < count; i++) {
      const record = await this.getRecord(patientAddress, i);
      records.push({
        index: i,
        ipfsHash: record.ipfsHash,
        timestamp: Number(record.timestamp),
        dataHash: record.dataHash,
        encryptionKeyMeta: record.encryptionKeyMeta,
      });
    }
    return records;
  }
}

module.exports = new BlockchainService();
