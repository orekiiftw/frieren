# 🌐 MedChain AI — Decentralized Healthcare Platform

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Status](https://img.shields.io/badge/status-Active-success.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-%5E19.2.4-blue)

A full-stack, patient-centric decentralized healthcare platform combining **blockchain technology** for immutable access control, **IPFS** for encrypted file storage, and **Artificial Intelligence (Google Gemini)** for advanced health assistance, disease prediction, and medical imaging analysis.

## 🏗️ Complete Architecture

MedChain AI leverages a robust three-tier architecture ensuring rigorous data privacy, seamless interoperability, and AI integration:

### 1. Frontend (Web UI)
Modern, responsive Web2.5 frontend designed to interact seamlessly with traditional REST APIs and Web3 wallets.
* **Framework:** React 19 + Vite
* **State Management:** Zustand
* **Routing:** React Router v7
* **Styling & UI:** Tailwind/Vanilla CSS + Lucide Icons
* **API Communication:** Axios with global JWT interceptors

### 2. Backend (REST API Server)
A Node.js middle-layer handling secure communication between the frontend, blockchain network, IPFS nodes, and AI providers.
* **Framework:** Node.js + Express.js
* **Database:** MongoDB (via Mongoose)
* **Authentication:** JWT (JSON Web Tokens) & bcryptjs
* **Blockchain Interaction:** Ethers.js
* **AI Provider:** Google GenAI SDK (`@google/genai`)
* **Decentralized Storage:** Pinata SDK (`pinata-web3`) + IPFS + AES-256-GCM Encryption
* **File Uploads:** Multer

### 3. Blockchain (Smart Contracts)
Ethereum-compatible smart contracts serving as an immutable ledger for patient data access control and identity management.
* **Environment:** Hardhat
* **Language:** Solidity
* **Functions:** Patient-Doctor access control rules (Grant/Revoke), metadata logging.

---

## 🚀 Setup & Installation Guide

Follow these steps to run MedChain AI locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) Daemon running locally or a MongoDB Atlas URI
- API Keys: 
  - [Google Gemini API Key](https://aistudio.google.com/)
  - [Pinata JWT Key](https://pinata.cloud/)

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/frieren.git
cd frieren
```

### Step 2: Blockchain Local Network Setup
We use Hardhat to spin up a local development blockchain and deploy the access control contracts.

```bash
cd blockchain
# 1. Install dependencies
npm install

# 2. Compile contracts
npx hardhat compile

# 3. Start a local Ethereum network (Leave this running in terminal 1)
npx hardhat node

# 4. In a new terminal, deploy the smart contract to the local node
npx hardhat run scripts/deploy.js --network localhost
```
> **⚠️ Important:** After deployment, note the **Contract Address** printed in the console. You will need it for the Backend `.env`.

### Step 3: Backend Setup
The Node.js API connects everything together.

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Clone the example environment variables file
cp .env.example .env
```

**Configure `backend/.env`:**
Open `.env` and configure the following essential variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare_dapp  # Or your Atlas URI
JWT_SECRET=your-secure-development-secret

# Blockchain configuration
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x... # Paste the contract address from Step 2
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 # Hardhat Account #0 (Account to act as relayer/admin)

# 3rd Party APIs
GEMINI_API_KEY=your_google_gemini_api_key
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY=your_gateway.mypinata.cloud

ENCRYPTION_ALGORITHM=aes-256-gcm
```

**Start the Backend Server:**
```bash
# Start backend (Available at http://localhost:5000)
npm run dev
```

### Step 4: Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create environment variables config
echo "VITE_API_URL=http://localhost:5000/api" > .env

# 3. Start the Vite development server
npm run dev
```
Navigate to **`http://localhost:5173`** in your browser.

---

## 🔑 Core Features & Project Layout

| Directory / Module | Description | Status |
|--------------------|-------------|--------|
| `frontend/src/pages/Auth/` | Web2-style account abstraction & Login | Active |
| `frontend/src/components/ChatAssistant/` | RAG-powered Gemini AI Health Chat | Active |
| `backend/src/routes/imaging.routes.js` | Medical Imaging analysis routing | Active |
| `backend/src/routes/access.routes.js` | Blockchain patient-doctor access rules | Active |
| `backend/src/routes/records.routes.js` | Encrypted patient records stored on IPFS | Active |
| `blockchain/contracts/` | Access control logic in Solidity | Active |

## 📜 License
ISC — Built for Educational / Production prototyping
