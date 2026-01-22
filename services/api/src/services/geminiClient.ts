import { VertexAI } from "@google-cloud/vertexai";
import { logError } from "../utils/logger";

export type GeminiRequest = {
  model: string;
  contents: Array<Record<string, unknown>>;
  config?: Record<string, unknown>;
  safetySettings?: Array<Record<string, unknown>>;
  systemInstruction?: Record<string, unknown> | string;
};

export const generateWithVertex = async (request: GeminiRequest) => {
  const project = process.env.GCP_PROJECT_ID;
  const location = process.env.GCP_LOCATION || "us-central1";
  if (!project) {
    throw new Error("Missing GCP_PROJECT_ID for Vertex AI");
  }

  const vertexAI = new VertexAI({ project, location });
  const model = vertexAI.getGenerativeModel({ model: request.model });

  const response = await model.generateContent({
    contents: request.contents,
    generationConfig: request.config,
    safetySettings: request.safetySettings,
    systemInstruction: request.systemInstruction,
  });

  const text = response.response.candidates?.[0]?.content?.parts?.map((part) => ("text" in part ? part.text : "")).join("") ?? "";
  return { text, raw: response.response };
};

export const generateWithFallback = async (request: GeminiRequest) => {
  try {
    return await generateWithVertex(request);
  } catch (error) {
    logError("Vertex AI unavailable; configure GEMINI_API_KEY fallback in Secret Manager", {
      reason: error instanceof Error ? error.message : "unknown",
    });
    throw new Error("Vertex AI is not configured. Please set up Vertex AI or provide fallback.");
  }
};
