const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicalAccessControl", function () {
  let contract;
  let patient, doctor, unauthorized;

  beforeEach(async function () {
    [patient, doctor, unauthorized] = await ethers.getSigners();

    const MedicalAccessControl = await ethers.getContractFactory("MedicalAccessControl");
    contract = await MedicalAccessControl.deploy();
    await contract.waitForDeployment();
  });

  describe("Access Control", function () {
    it("should allow a patient to grant access to a doctor", async function () {
      await expect(contract.connect(patient).grantAccess(doctor.address))
        .to.emit(contract, "AccessGranted")
        .withArgs(patient.address, doctor.address);

      expect(await contract.checkAccess(patient.address, doctor.address)).to.be.true;
    });

    it("should allow a patient to revoke access from a doctor", async function () {
      await contract.connect(patient).grantAccess(doctor.address);
      await expect(contract.connect(patient).revokeAccess(doctor.address))
        .to.emit(contract, "AccessRevoked")
        .withArgs(patient.address, doctor.address);

      expect(await contract.checkAccess(patient.address, doctor.address)).to.be.false;
    });

    it("should always allow a patient to access their own records", async function () {
      expect(await contract.checkAccess(patient.address, patient.address)).to.be.true;
    });

    it("should deny access to unauthorized addresses", async function () {
      expect(await contract.checkAccess(patient.address, unauthorized.address)).to.be.false;
    });
  });

  describe("Record Management", function () {
    const mockIpfsHash = "QmTestHash123456789abcdefg";
    const mockDataHash = "0xabc123";
    const mockKeyMeta = "lit-condition-v1:xyz";

    it("should allow a patient to add a medical record", async function () {
      await expect(contract.connect(patient).addRecord(mockIpfsHash, mockDataHash, mockKeyMeta))
        .to.emit(contract, "RecordAdded")
        .withArgs(patient.address, mockIpfsHash);

      expect(await contract.getRecordsCount(patient.address)).to.equal(1);
    });

    it("should allow an authorized doctor to read a patient record", async function () {
      await contract.connect(patient).addRecord(mockIpfsHash, mockDataHash, mockKeyMeta);
      await contract.connect(patient).grantAccess(doctor.address);

      const record = await contract.connect(doctor).getRecord(patient.address, 0);
      expect(record.ipfsHash).to.equal(mockIpfsHash);
      expect(record.dataHash).to.equal(mockDataHash);
    });

    it("should deny an unauthorized address from reading a patient record", async function () {
      await contract.connect(patient).addRecord(mockIpfsHash, mockDataHash, mockKeyMeta);

      await expect(
        contract.connect(unauthorized).getRecord(patient.address, 0)
      ).to.be.revertedWith("Access denied");
    });

    it("should revert when accessing an out-of-bounds record index", async function () {
      await contract.connect(patient).addRecord(mockIpfsHash, mockDataHash, mockKeyMeta);

      await expect(
        contract.connect(patient).getRecord(patient.address, 5)
      ).to.be.revertedWith("Index out of bounds");
    });

    it("should store multiple records for the same patient", async function () {
      await contract.connect(patient).addRecord("QmHash1", "0xaa", "key1");
      await contract.connect(patient).addRecord("QmHash2", "0xbb", "key2");
      await contract.connect(patient).addRecord("QmHash3", "0xcc", "key3");

      expect(await contract.getRecordsCount(patient.address)).to.equal(3);
    });
  });
});
