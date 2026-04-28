/**
 * Gemini AI Service
 * Central service for all AI operations using Google Gemini 3 Flash Preview.
 * Handles: RAG chat, medical imaging vision analysis, disease prediction.
 */
const { GoogleGenAI } = require("@google/genai");

class GeminiService {
  constructor() {
    this._client = null;
  }

  _getClient() {
    if (!this._client) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set.");
      }
      this._client = new GoogleGenAI({ apiKey });
    }
    return this._client;
  }

  /**
   * Generate a text response for RAG chat.
   * @param {string} systemPrompt - System instructions with medical context
   * @param {string} userMessage - The user's question
   * @param {Array} conversationHistory - Previous messages [{role, content}]
   * @returns {string} AI response text
   */
  async chat(systemPrompt, userMessage, conversationHistory = []) {
    const client = this._getClient();

    // Build contents array for multi-turn conversation
    const contents = [];

    // Add conversation history
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    // Add the current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    return response.text;
  }

  /**
   * Stream a text response for RAG chat.
   * @param {string} systemPrompt - System instructions with medical context
   * @param {string} userMessage - The user's question
   * @param {Array} conversationHistory - Previous messages [{role, content}]
   * @yields {string} AI response text chunks
   */
  async *chatStream(systemPrompt, userMessage, conversationHistory = []) {
    const client = this._getClient();

    const contents = [];
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const stream = await client.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    for await (const chunk of stream) {
      yield chunk.text || "";
    }
  }

  /**
   * Analyze a medical image using Gemini's vision capabilities.
   * @param {Buffer} imageBuffer - The image file buffer
   * @param {string} mimeType - MIME type (image/jpeg, image/png, etc.)
   * @param {string} analysisType - Type of analysis (xray, mri, ct_scan)
   * @returns {Object} Structured analysis result
   */
  async analyzeImage(imageBuffer, mimeType, analysisType = "xray") {
    const client = this._getClient();

    const imageBase64 = imageBuffer.toString("base64");

    const analysisPrompt = `You are an expert medical imaging AI assistant. Analyze this ${analysisType.toUpperCase()} medical image and provide a structured clinical assessment.

IMPORTANT DISCLAIMERS:
- This is an AI-assisted analysis and should NOT replace professional radiologist interpretation.
- Always recommend verification by a qualified healthcare professional.

Provide your analysis in the following JSON format (respond ONLY with valid JSON):
{
  "findings": [
    {
      "condition": "Name of condition or observation",
      "probability": 0.0 to 1.0,
      "severity": "negligible" | "low" | "moderate" | "high" | "critical",
      "region": "Anatomical region where finding is observed",
      "description": "Brief clinical description"
    }
  ],
  "overallAssessment": "Summary of the overall image assessment",
  "recommendations": "Clinical recommendations based on findings",
  "imageQuality": "good" | "fair" | "poor",
  "limitations": "Any limitations in the analysis"
}`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64,
              },
            },
            { text: analysisPrompt },
          ],
        },
      ],
      config: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const responseText = response.text;

    // Parse the JSON response, stripping markdown code fences if present
    try {
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      // If JSON parsing fails, return a structured fallback
      return {
        findings: [],
        overallAssessment: responseText,
        recommendations: "Please consult a radiologist for detailed interpretation.",
        imageQuality: "unknown",
        limitations: "AI was unable to structure the response as expected.",
      };
    }
  }

  /**
   * Predict disease risk using patient data.
   * @param {Object} patientData - Patient health metrics
   * @param {string} predictionType - "diabetes" | "cardiovascular" | "cancer_risk"
   * @returns {Object} Structured prediction result
   */
  async predictDisease(patientData, predictionType) {
    const client = this._getClient();

    const predictionPrompt = `You are a clinical AI assistant specializing in ${predictionType} risk assessment.

Analyze the following patient data and provide a structured risk assessment.

PATIENT DATA:
${JSON.stringify(patientData, null, 2)}

PREDICTION TYPE: ${predictionType}

IMPORTANT:
- This is a screening tool, NOT a diagnosis.
- Always recommend professional medical consultation.

Respond ONLY with valid JSON in this format:
{
  "predictionType": "${predictionType}",
  "riskScore": 0.0 to 1.0,
  "riskLevel": "low" | "moderate" | "high" | "very_high",
  "confidence": 0.0 to 1.0,
  "factors": [
    {
      "name": "Factor name",
      "impact": "low" | "moderate" | "high",
      "value": "Patient's value",
      "normalRange": "Normal reference range",
      "interpretation": "Brief interpretation"
    }
  ],
  "recommendation": "Personalized recommendation based on the analysis",
  "lifestyle": ["List of lifestyle modification suggestions"],
  "followUp": "Recommended follow-up actions"
}`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: predictionPrompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const responseText = response.text;

    try {
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        predictionType,
        riskScore: 0,
        riskLevel: "unknown",
        confidence: 0,
        factors: [],
        recommendation: responseText,
        lifestyle: [],
        followUp: "Consult your healthcare provider.",
      };
    }
  }
}

module.exports = new GeminiService();
