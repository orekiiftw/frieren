// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MedicalAccessControl {
    
    struct Record {
        string ipfsHash;      // URI pointing to the encrypted payload on IPFS
        uint256 timestamp;    // Time of upload
        string dataHash;      // Hash of the plain data for integrity verification
        string encryptionKeyMeta; // Metadata for decryption protocols
    }

    // Maps Patient Address -> Doctor Address -> Has Access?
    mapping(address => mapping(address => bool)) public doctorAccess;
    
    // Maps Patient Address -> Array of Records
    mapping(address => Record[]) public patientRecords;

    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);
    event RecordAdded(address indexed patient, string ipfsHash);

    // 1. Grant Access
    function grantAccess(address _doctor) external {
        doctorAccess[msg.sender][_doctor] = true;
        emit AccessGranted(msg.sender, _doctor);
    }

    // 2. Revoke Access
    function revokeAccess(address _doctor) external {
        doctorAccess[msg.sender][_doctor] = false;
        emit AccessRevoked(msg.sender, _doctor);
    }

    // 3. Check Access (Used by Doctors / Key Management Services)
    function checkAccess(address _patient, address _doctor) public view returns (bool) {
        // A patient always has access to their own records
        if (_patient == _doctor) return true;
        return doctorAccess[_patient][_doctor];
    }

    // 4. Add Record
    function addRecord(string calldata _ipfsHash, string calldata _dataHash, string calldata _keyMeta) external {
        patientRecords[msg.sender].push(Record({
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            dataHash: _dataHash,
            encryptionKeyMeta: _keyMeta
        }));
        emit RecordAdded(msg.sender, _ipfsHash);
    }

    // 5. Get Patient Records Count
    function getRecordsCount(address _patient) external view returns (uint256) {
        return patientRecords[_patient].length;
    }

    // 6. Get specific record
    function getRecord(address _patient, uint256 _index) external view returns (Record memory) {
        require(checkAccess(_patient, msg.sender), "Access denied");
        require(_index < patientRecords[_patient].length, "Index out of bounds");
        return patientRecords[_patient][_index];
    }
}
