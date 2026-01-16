export const getApiKey = (): string => {
  const key = (import.meta as any).env?.VITE_GEMINI_API_KEY?.trim() ?? "";

  if (!key) {
    throw new Error("GEMINI_KEY_MISSING");
  }

  return key;
};

export const getGeminiEndpoint = (key: string): string =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
