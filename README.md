# Decentralised Healthcare: AI-Driven Disease Prediction & Medical Imaging
### MedChain AI — Patient-Centric Healthcare Ecosystem

A full-stack decentralised healthcare platform combining **blockchain technology** with **artificial intelligence** to prioritize privacy, accessibility, and clinical excellence.

## 🏗️ Architecture

```
frieren/
├── blockchain/          # Ethereum Smart Contracts (Hardhat)
│   ├── contracts/       # Solidity smart contracts
│   ├── scripts/         # Deployment scripts
│   ├── test/            # Contract unit tests
│   └── hardhat.config.js
├── backend/             # Node.js REST API
│   └── src/
│       ├── server.js         # Express entry point
│       ├── middleware/       # Auth JWT middleware
│       ├── routes/           # API route handlers
│       └── services/         # Business logic services
│           ├── blockchain.service.js   # Smart contract interaction
│           ├── ipfs.service.js         # IPFS/Pinata integration
│           ├── rag.service.js          # RAG pipeline for AI chat
│           └── encryption.service.js   # AES-256-GCM encryption
└── frontend/            # React (Vite) UI
    └── src/
        ├── components/       # Reusable components
        │   └── ChatAssistant/    # RAG-powered health chat
        ├── pages/
        │   ├── Landing/      # Public landing page
        │   ├── Auth/         # Login & Register (Web2.5)
        │   ├── Patient/      # Patient Dashboard
        │   └── Doctor/       # Doctor Portal
        └── services/         # API client (Axios)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Blockchain (Hardhat)
```bash
cd blockchain
npx hardhat compile
npx hardhat test
npx hardhat node                    # Start local blockchain
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Backend
```bash
cd backend
cp .env.example .env               # Configure your environment
npm run dev                         # Starts on :5000
```

### 3. Frontend
```bash
cd frontend
npm run dev                         # Starts on :5173
```

## 🔑 Core Features

| Feature | Technology | Status |
|---------|-----------|--------|
| Web2-style Auth (Account Abstraction) | Web3Auth / Magic.link | Boilerplate |
| Smart Contract Access Control | Solidity / Hardhat | ✅ Complete |
| Encrypted IPFS Storage | Pinata / AES-256-GCM | Boilerplate |
| RAG Health Chat Assistant | LLM + Ephemeral Vector DB | Boilerplate |
| AI Disease Prediction | TensorFlow / Scikit-learn | Mock API |
| Medical Imaging (CNN) | ResNet / TF-CNN | Mock API |
| Patient Dashboard | React / Vite | ✅ Complete |
| Doctor Portal | React / Vite | ✅ Complete |

## 📜 License

ISC — Built for PROJECT BCS-753
