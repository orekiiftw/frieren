/**
 * RAG Service (Retrieval-Augmented Generation)
 *
 * Orchestrates the pipeline:
 *   1. Fetch patient's encrypted records from IPFS
 *   2. Decrypt in secure memory
 *   3. Build context from records
 *   4. Retrieve relevant context for the user's query
 *   5. Generate response via Gemini 2.0 Flash
 *   6. Wipe ephemeral data after session
 */

const blockchainService = require("./blockchain.service");
const ipfsService = require("./ipfs.service");
const geminiService = require("./gemini.service");

class RAGService {
  constructor() {
    // Session-scoped context stores (ephemeral per-user)
    this.sessions = new Map();
  }

  /**
   * Main chat handler for the AI Health Assistant.
   */
  async chat({ userMessage, walletAddress, role, conversationHistory }) {
    try {
      // 1. Retrieve patient context (if not already cached in session)
      const context = await this._getOrBuildContext(walletAddress);

      // 2. Retrieve relevant chunks based on the query
      const relevantChunks = this._retrieveRelevantChunks(context, userMessage);

      // 3. Build the prompt with medical context
      const systemPrompt = this._buildSystemPrompt(role, relevantChunks);

      // 4. Call Gemini via the gemini service
      const aiResponse = await geminiService.chat(
        systemPrompt,
        userMessage,
        conversationHistory
      );

      return {
        message: aiResponse,
        contextUsed: relevantChunks.length,
        sessionActive: true,
      };
    } catch (error) {
      console.error("RAG chat error:", error);
      throw new Error("Failed to generate AI response: " + error.message);
    }
  }

  /**
   * Fetch and decrypt patient records, build an in-memory context.
   */
  async _getOrBuildContext(walletAddress) {
    if (this.sessions.has(walletAddress)) {
      return this.sessions.get(walletAddress);
    }

    // Fetch records from blockchain
    const records = await blockchainService.getRecords(walletAddress);

    // Fetch and 'decrypt' each record from IPFS
    const decryptedRecords = [];
    for (const record of records) {
      try {
        const ipfsData = await ipfsService.fetchFromIPFS(record.ipfsHash);
        // TODO: Decrypt the payload using the encryption key when
        // full encryption flow is wired end-to-end
        decryptedRecords.push({
          ...record,
          content: ipfsData,
        });
      } catch (err) {
        console.warn(`Failed to fetch record ${record.ipfsHash}:`, err.message);
      }
    }

    // Chunk and store in session
    const chunks = this._chunkDocuments(decryptedRecords);
    this.sessions.set(walletAddress, chunks);

    return chunks;
  }

  /**
   * Chunk documents for retrieval.
   */
  _chunkDocuments(records) {
    const chunks = [];
    for (const record of records) {
      const content = JSON.stringify(record.content);
      const chunkSize = 500;
      for (let i = 0; i < content.length; i += chunkSize) {
        chunks.push({
          text: content.slice(i, i + chunkSize),
          metadata: {
            ipfsHash: record.ipfsHash,
            timestamp: record.timestamp,
          },
        });
      }
    }
    return chunks;
  }

  /**
   * Keyword-based retrieval (for production, replace with vector similarity).
   */
  _retrieveRelevantChunks(chunks, query) {
    if (!chunks || chunks.length === 0) return [];

    const queryTerms = query.toLowerCase().split(/\s+/);
    const scored = chunks.map((chunk) => {
      const text = chunk.text.toLowerCase();
      const score = queryTerms.reduce((acc, term) => {
        return acc + (text.includes(term) ? 1 : 0);
      }, 0);
      return { ...chunk, score };
    });

    return scored
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  /**
   * Build the system prompt with medical context.
   */
  _buildSystemPrompt(role, relevantChunks) {
    const contextStr = relevantChunks.map((c) => c.text).join("\n---\n");

    return `You are HealthAI, a compassionate and knowledgeable medical AI assistant integrated into a decentralized healthcare platform called MedChain AI.

ROLE CONTEXT:
- You are speaking with a ${role}.
- Always be empathetic, clear, and use simple language when speaking with patients.
- Never provide definitive diagnoses. Always recommend consulting a healthcare professional.
- If speaking with a doctor, you may use clinical terminology.

PATIENT MEDICAL CONTEXT:
${contextStr || "No medical records available for this patient yet."}

GUIDELINES:
1. Use the patient's medical context to provide personalized, relevant information.
2. Explain medical terms in simple language for patients.
3. Always include appropriate disclaimers about seeking professional medical advice.
4. If asked about medication, always recommend consulting their physician.
5. Be transparent about what you know and don't know from the records.
6. Format your responses with markdown for better readability (bold, bullet points, etc.).`;
  }

  /**
   * Destroy a patient's session (wipe ephemeral data).
   */
  destroySession(walletAddress) {
    this.sessions.delete(walletAddress);
    console.log(`🧹 Session destroyed for wallet: ${walletAddress}`);
  }
}

module.exports = new RAGService();
