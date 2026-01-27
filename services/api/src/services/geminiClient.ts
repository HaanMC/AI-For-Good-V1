import { VertexAI } from "@google-cloud/vertexai";
import type { Content, SafetySetting } from "@google-cloud/vertexai";
import { logError } from "../utils/logger.js";

export type GeminiRequest = {
  model: string;
  contents: Content[];
  config?: Record<string, unknown>;
  safetySettings?: SafetySetting[];
  systemInstruction?: Content | string;
};

const normalizeSystemInstruction = (instruction?: Content | string): Content | undefined => {
  if (!instruction) return undefined;
  if (typeof instruction === "string") {
    return { role: "system", parts: [{ text: instruction }] };
  }
  return instruction;
};

export const generateWithVertex = async (request: GeminiRequest) => {
  const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID;
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
    systemInstruction: normalizeSystemInstruction(request.systemInstruction),
  });

  const text = response.response.candidates?.[0]?.content?.parts?.map((part) => ("text" in part ? part.text : "")).join("") ?? "";
  return { text, raw: response.response };
};

export const generateWithFallback = async (request: GeminiRequest) => {
  try {
    return await generateWithVertex(request);
  } catch (error: unknown) {
    logError("Vertex AI unavailable; configure GEMINI_API_KEY fallback in Secret Manager", {
      reason: error instanceof Error ? error.message : "unknown",
    });
    throw new Error("Vertex AI is not configured. Please set up Vertex AI or provide fallback.");
  }
};
