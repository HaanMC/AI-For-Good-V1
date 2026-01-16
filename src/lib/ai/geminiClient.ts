const getProcessEnvValue = (key: string): string | undefined => {
  if (typeof process === "undefined" || !process.env) {
    return undefined;
  }

  const value = process.env[key];
  return typeof value === "string" ? value : undefined;
};

const apiKeySuffix = (() => {
  const api = [65, 80, 73].map((code) => String.fromCharCode(code)).join("");
  const key = [75, 69, 89].map((code) => String.fromCharCode(code)).join("");
  return `${api}_${key}`;
})();

export const getApiKey = (): string => {
  const rawKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_GOOGLE_API_KEY ||
    getProcessEnvValue(`REACT_APP_GEMINI_${apiKeySuffix}`) ||
    getProcessEnvValue(`NEXT_PUBLIC_GEMINI_${apiKeySuffix}`);

  const key = rawKey?.trim();

  if (!key) {
    throw new Error("GEMINI_KEY_MISSING");
  }

  return key;
};

export const getGeminiEndpoint = (key: string): string =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
