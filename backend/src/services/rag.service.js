/**
 * RAG Service (Retrieval-Augmented Generation)
 *
 * Orchestrates the pipeline:
 *   1. Fetch patient's encrypted records from IPFS
 *   2. Decrypt in secure memory using stored keys
 *   3. Build context from records
 *   4. Retrieve relevant context for the user's query
 *   5. Generate response via Gemini 3 Flash Preview
 *   6. Wipe ephemeral data after session
 */

const blockchainService = require("./blockchain.service");
const ipfsService = require("./ipfs.service");
const geminiService = require("./gemini.service");
const encryptionService = require("./encryption.service");
const RecordKey = require("../models/RecordKey.model");

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
      const { chunks, summary } = await this._getOrBuildContext(walletAddress);

      // 2. Retrieve relevant chunks based on the query
      const relevantChunks = this._retrieveRelevantChunks(chunks, userMessage);

      // 3. Build the prompt with medical context
      const systemPrompt = this._buildSystemPrompt(role, summary, relevantChunks);

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
   * Streamed chat handler for the AI Health Assistant.
   */
  async *chatStream({ userMessage, walletAddress, role, conversationHistory }) {
    try {
      const { chunks, summary } = await this._getOrBuildContext(walletAddress);
      const relevantChunks = this._retrieveRelevantChunks(chunks, userMessage);
      const systemPrompt = this._buildSystemPrompt(role, summary, relevantChunks);
      yield* geminiService.chatStream(systemPrompt, userMessage, conversationHistory);
    } catch (error) {
      console.error("RAG chat stream error:", error);
      throw new Error("Failed to generate AI response: " + error.message);
    }
  }

  /**
   * Fetch and decrypt patient records, build an in-memory context.
   * Refreshes from blockchain every time (no stale cache).
   */
  async _getOrBuildContext(walletAddress) {
    const cached = this.sessions.get(walletAddress);
    if (cached && cached.chunks && cached.summary) {
      return cached;
    }

    // Always fetch fresh from blockchain
    const records = await blockchainService.getRecords(walletAddress);
    console.log(`[RAG] Fetched ${records.length} record(s) for wallet ${walletAddress.slice(0, 8)}...`);

    const decryptedRecords = [];
    for (const record of records) {
      try {
        const ipfsData = await ipfsService.fetchFromIPFS(record.ipfsHash);
        const keyDoc = await RecordKey.findOne({ ipfsHash: record.ipfsHash });
        let decryptedContent = ipfsData;

        if (keyDoc && ipfsData.encryptedPayload) {
          try {
            const decryptedText = encryptionService.decrypt(
              ipfsData.encryptedPayload,
              keyDoc.encryptionKey
            );

            // Check if decrypted content is valid base64 (file upload) or plain text (JSON/analysis)
            const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(decryptedText) && decryptedText.length > 100;

            if (isBase64) {
              // File upload: decrypt → base64 string → original file buffer
              const decodedBuffer = Buffer.from(decryptedText, "base64");
              const textContent = decodedBuffer.toString("utf8");
              const printableChars = textContent.match(/[\x20-\x7E\s]/g) || [];
              const isReadableText = printableChars.length / textContent.length > 0.9 && textContent.length > 0;

              if (isReadableText) {
                try {
                  decryptedContent = JSON.parse(textContent);
                } catch {
                  decryptedContent = textContent;
                }
                console.log(`[RAG] Decrypted text file ${record.ipfsHash.slice(0, 16)}... (${textContent.length} chars)`);
              } else {
                decryptedContent = {
                  fileName: ipfsData.fileName || "unknown",
                  mimeType: ipfsData.mimeType || "application/octet-stream",
                  sizeBytes: decodedBuffer.length,
                  description: `Binary medical file uploaded by patient.`,
                };
                console.log(`[RAG] Decrypted binary file ${record.ipfsHash.slice(0, 16)}... (${decodedBuffer.length} bytes)`);
              }
            } else {
              // Plain text/JSON upload (like auto-analysis): use directly
              try {
                decryptedContent = JSON.parse(decryptedText);
                console.log(`[RAG] Decrypted JSON record ${record.ipfsHash.slice(0, 16)}... (${decryptedText.length} chars)`);
              } catch {
                decryptedContent = decryptedText;
                console.log(`[RAG] Decrypted text record ${record.ipfsHash.slice(0, 16)}... (${decryptedText.length} chars)`);
              }
            }
          } catch (decryptErr) {
            console.warn(`[RAG] Failed to decrypt record ${record.ipfsHash}:`, decryptErr.message);
            decryptedContent = { ...ipfsData, _decryptError: true };
          }
        } else {
          console.warn(`[RAG] No encryption key found for record ${record.ipfsHash}`);
        }

        decryptedRecords.push({ ...record, content: decryptedContent });
      } catch (err) {
        console.warn(`[RAG] Failed to fetch record ${record.ipfsHash} from IPFS:`, err.message);
      }
    }

    const summary = this._buildRecordSummary(decryptedRecords);
    const chunks = this._chunkDocuments(decryptedRecords);
    this.sessions.set(walletAddress, { chunks, summary });
    console.log(`[RAG] Built ${chunks.length} chunk(s) from ${decryptedRecords.length} record(s)`);

    return { chunks, summary };
  }

  /**
   * Build a human-readable summary of all records.
   * For text-readable records, includes the actual content preview.
   * For analysis JSON, extracts key medical findings prominently.
   */
  _buildRecordSummary(records) {
    if (!records || records.length === 0) {
      return "No medical records available for this patient yet.";
    }

    const textRecords = [];
    const binaryRecords = [];

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const date = r.timestamp
        ? new Date(r.timestamp * 1000).toLocaleDateString()
        : "Unknown date";

      // Check if binary metadata object
      const isBinaryMeta = r.content && typeof r.content === "object" &&
        r.content.fileName && r.content.mimeType && r.content.sizeBytes !== undefined;

      if (isBinaryMeta) {
        const fileName = r.content.fileName;
        const size = `(${Math.round(r.content.sizeBytes / 1024)} KB)`;
        binaryRecords.push(`- Image/File: "${fileName}" ${size} (${date})`);
        continue;
      }

      // Try to extract text content
      let textContent = "";
      let isAnalysis = false;

      if (typeof r.content === "string" && r.content.trim().length > 0) {
        textContent = r.content;
      } else if (r.content && typeof r.content === "object") {
        // Check if it's a medical analysis result
        if (r.content.findings || r.content.overallAssessment || r.content.predictionType) {
          isAnalysis = true;
          // Build rich summary from analysis JSON
          const parts = [];
          if (r.content.overallAssessment) parts.push(`Assessment: ${r.content.overallAssessment}`);
          if (r.content.findings && Array.isArray(r.content.findings)) {
            r.content.findings.forEach(f => {
              const sev = f.severity ? `[${f.severity}]` : "";
              const prob = f.probability ? `${Math.round(f.probability * 100)}%` : "";
              parts.push(`Finding ${sev} ${prob}: ${f.condition || ""} — ${f.description || ""}`);
            });
          }
          if (r.content.recommendations) parts.push(`Recommendations: ${r.content.recommendations}`);
          if (r.content.recommendation) parts.push(`Recommendation: ${r.content.recommendation}`);
          if (r.content.riskLevel) parts.push(`Risk Level: ${r.content.riskLevel}`);
          if (r.content.predictionType) parts.push(`Prediction Type: ${r.content.predictionType}`);
          textContent = parts.join(". ");
        } else {
          // Generic object — extract all text
          const extractText = (obj) => {
            if (typeof obj === "string") return obj;
            if (Array.isArray(obj)) return obj.map(extractText).join(". ");
            if (obj && typeof obj === "object") {
              const skipKeys = ["encryptedPayload", "_decryptError", "uploadedAt", "ipfsHash"];
              return Object.entries(obj)
                .filter(([k]) => !skipKeys.includes(k))
                .map(([, v]) => extractText(v))
                .filter(Boolean)
                .join(". ");
            }
            return "";
          };
          textContent = extractText(r.content);
        }
      }

      if (textContent.trim().length > 0) {
        const preview = textContent.slice(0, 500);
        const label = isAnalysis ? "MEDICAL ANALYSIS" : "TEXT RECORD";
        textRecords.push(`- ${label} (${date}): "${preview}${textContent.length > 500 ? "..." : ""}"`);
      } else {
        binaryRecords.push(`- Record ${i + 1}: Unreadable file (${date})`);
      }
    }

    const parts = [];
    if (textRecords.length > 0) {
      parts.push(`READABLE MEDICAL RECORDS (${textRecords.length}):\n${textRecords.join("\n")}`);
    }
    if (binaryRecords.length > 0) {
      parts.push(`BINARY FILES (images/scans — ${binaryRecords.length}):\n${binaryRecords.join("\n")}`);
    }

    return parts.join("\n\n");
  }

  /**
   * Chunk documents for retrieval.
   * Uses word-boundary-aware chunking to avoid breaking mid-word.
   * Marks chunks with isTextContent so retrieval knows they're readable.
   */
  _chunkDocuments(records) {
    const chunks = [];
    const MAX_CHUNK_SIZE = 800;
    const OVERLAP = 100;

    for (const record of records) {
      let content = "";
      let isTextContent = false;

      if (typeof record.content === "string") {
        content = record.content;
        isTextContent = true;
      } else if (record.content && typeof record.content === "object") {
        // Check if it's a binary metadata object (has fileName + mimeType + sizeBytes)
        const isBinaryMeta = record.content.fileName &&
          record.content.mimeType &&
          record.content.sizeBytes !== undefined;

        if (!isBinaryMeta) {
          // It's a parsed object with actual data — extract text
          isTextContent = true;
          const extractText = (obj) => {
            if (typeof obj === "string") return obj;
            if (Array.isArray(obj)) return obj.map(extractText).join(". ");
            if (obj && typeof obj === "object") {
              const skipKeys = ["encryptedPayload", "_decryptError", "uploadedAt", "ipfsHash"];
              return Object.entries(obj)
                .filter(([k]) => !skipKeys.includes(k))
                .map(([, v]) => extractText(v))
                .filter(Boolean)
                .join(". ");
            }
            return "";
          };
          content = extractText(record.content);
        }
      }

      if (!content.trim()) continue;

      // Split into sentences first for better boundaries
      const sentences = content.match(/[^.!?]+[.!?]+|\S+/g) || [content];
      let currentChunk = "";

      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (!trimmed) continue;

        if (currentChunk.length + trimmed.length + 1 <= MAX_CHUNK_SIZE) {
          currentChunk += (currentChunk ? " " : "") + trimmed;
        } else {
          // Store the completed chunk
          if (currentChunk) {
            chunks.push({
              text: currentChunk,
              isTextContent,
              metadata: {
                ipfsHash: record.ipfsHash,
                timestamp: record.timestamp,
              },
            });
          }
          // Start new chunk with overlap from the end of previous chunk
          const overlapText = currentChunk.slice(-OVERLAP);
          currentChunk = overlapText + " " + trimmed;
          // If still too long, just use the sentence
          if (currentChunk.length > MAX_CHUNK_SIZE * 1.5) {
            currentChunk = trimmed;
          }
        }
      }

      // Don't forget the last chunk
      if (currentChunk) {
        chunks.push({
          text: currentChunk,
          isTextContent,
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
   * Keyword-based retrieval that ALWAYS includes text-readable chunks.
   * Binary chunks are only included if keywords match.
   */
  _retrieveRelevantChunks(chunks, query) {
    if (!chunks || chunks.length === 0) return [];

    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    // Score all chunks
    const scored = chunks.map((chunk) => {
      const text = chunk.text.toLowerCase();
      const score = queryTerms.reduce((acc, term) => {
        return acc + (text.includes(term) ? 1 : 0);
      }, 0);
      return { ...chunk, score };
    });

    // ALWAYS include text content chunks (they have actual readable medical data)
    // For binary metadata chunks, only include if keywords matched
    const filtered = scored.filter((c) => c.isTextContent || c.score > 0);

    // Sort: keyword-matched first, then remaining text chunks
    const sorted = filtered.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.isTextContent !== a.isTextContent) return b.isTextContent ? 1 : -1;
      return b.text.length - a.text.length;
    });

    // Limit total context to ~4000 chars to leave room for the response
    let totalChars = 0;
    const selected = [];
    for (const chunk of sorted) {
      if (totalChars + chunk.text.length > 4000) break;
      selected.push(chunk);
      totalChars += chunk.text.length;
    }

    const textCount = selected.filter(c => c.isTextContent).length;
    console.log(`[RAG] Selected ${selected.length}/${chunks.length} chunks (${textCount} text, ${totalChars} chars) for query`);
    return selected;
  }

  /**
   * Build the system prompt with medical context.
   */
  _buildSystemPrompt(role, summary, relevantChunks) {
    let detailStr = "";
    if (relevantChunks && relevantChunks.length > 0) {
      detailStr = "\n\nDETAILED RECORD EXCERPTS:\n" +
        relevantChunks.map((c, i) => `[Excerpt ${i + 1}]\n${c.text}`).join("\n\n");
    }

    return `You are HealthAI, a compassionate medical AI assistant on MedChain AI.

ROLE:
- Speaking with a ${role}.
- Be empathetic, clear, and use simple language.
- Never give definitive diagnoses. Always recommend consulting a doctor.

YOUR PATIENT'S MEDICAL RECORDS:
${summary}${detailStr}

ABSOLUTE RULES — FOLLOW THESE EXACTLY:
1. The section above labeled "READABLE MEDICAL RECORDS" contains ACTUAL TEXT CONTENT from the patient's files. This is NOT metadata — it is the real findings, assessments, and medical data extracted from their records.
2. You MUST read and use the quoted text above to answer the patient's question. If the text mentions a "Concussion", "lesion", "fracture", or any other condition, STATE THAT DIRECTLY in your answer.
3. It is FORBIDDEN to say "I cannot see your records", "I don't have access", "the files are images I can't read", or any variation of that when READABLE MEDICAL RECORDS are shown above. Doing so would be factually incorrect.
4. If the records contain an AI analysis of a scan (marked MEDICAL ANALYSIS), treat that analysis as the patient's medical data and reference it fully.
5. Only mention that you cannot read images if there are ZERO readable records above AND the user asks specifically about image contents.
6. Explain medical terms simply. Include disclaimers. Use markdown formatting.`;
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
