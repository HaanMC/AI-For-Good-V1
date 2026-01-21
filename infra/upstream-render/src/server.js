const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const PROXY_TOKEN = process.env.PROXY_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const allowedGenerationConfigKeys = new Set([
  "temperature",
  "topP",
  "topK",
  "maxOutputTokens",
  "stopSequences",
  "responseMimeType",
  "responseSchema",
  "candidateCount",
  "presencePenalty",
  "frequencyPenalty",
]);

app.use(express.json({ limit: "2mb" }));

app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError) {
    res.status(400).json({ ok: false, error: "Invalid JSON" });
    return;
  }
  next(err);
});

const logRequest = (path) => {
  console.log(`[${new Date().toISOString()}] ${path}`);
};

const logUpstreamStatus = (status) => {
  console.log(`[${new Date().toISOString()}] upstream status ${status}`);
};

const ensureAuthorized = (req, res) => {
  const token = req.get("X-Proxy-Token");
  if (!token || !PROXY_TOKEN || token !== PROXY_TOKEN) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return false;
  }
  return true;
};

const normalizeSystemInstruction = (systemInstruction) => {
  if (!systemInstruction) {
    return undefined;
  }

  if (typeof systemInstruction === "string") {
    return {
      role: "system",
      parts: [{ text: systemInstruction }],
    };
  }

  if (typeof systemInstruction === "object") {
    return systemInstruction;
  }

  return undefined;
};

const sanitizeGenerationConfig = (generationConfig) => {
  if (!generationConfig || typeof generationConfig !== "object") {
    return undefined;
  }

  const sanitized = {};
  Object.entries(generationConfig).forEach(([key, value]) => {
    if (allowedGenerationConfigKeys.has(key)) {
      sanitized[key] = value;
    }
  });

  return Object.keys(sanitized).length ? sanitized : undefined;
};

const extractText = (payload) => {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }
  return parts.map((part) => part?.text ?? "").join("");
};

app.get("/health", (_req, res) => {
  logRequest("GET /health");
  res.json({ ok: true });
});

app.post("/generate", async (req, res) => {
  logRequest("POST /generate");
  if (!ensureAuthorized(req, res)) {
    return;
  }

  if (!GEMINI_API_KEY) {
    res.status(500).json({ ok: false, error: "GEMINI_API_KEY not set" });
    return;
  }

  const body = req.body || {};
  const model = body.model || "models/gemini-2.0-flash";
  const contents = body.contents;
  const generationConfig = sanitizeGenerationConfig(body.generationConfig);
  const safetySettings = Array.isArray(body.safetySettings)
    ? body.safetySettings
    : undefined;
  const tools = Array.isArray(body.tools) ? body.tools : undefined;
  const systemInstruction = normalizeSystemInstruction(body.systemInstruction);

  if (!Array.isArray(contents)) {
    res.status(400).json({ ok: false, error: "contents must be an array" });
    return;
  }

  const upstreamBody = {
    contents,
    generationConfig,
    safetySettings,
    systemInstruction,
    tools,
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(upstreamBody),
      },
    );

    logUpstreamStatus(response.status);

    const contentType = response.headers.get("Content-Type") || "";
    const isJson = contentType.includes("application/json");
    const responsePayload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      res
        .status(response.status === 400 ? 400 : 502)
        .json({
          ok: false,
          status: response.status,
          upstream: responsePayload,
          error: "Gemini upstream error",
        });
      return;
    }

    res.json({
      ok: true,
      text: extractText(responsePayload),
      raw: responsePayload,
    });
  } catch (error) {
    res.status(502).json({ ok: false, error: "Gemini upstream error" });
  }
});

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] server listening on ${PORT}`);
});
