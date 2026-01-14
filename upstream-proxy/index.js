const express = require("express");

const app = express();
app.use(express.json({ limit: "2mb" }));

const requiredToken = process.env.PROXY_TOKEN;
const geminiApiKey = process.env.GEMINI_API_KEY;

const extractText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => part.text)
    .filter((text) => typeof text === "string" && text.length > 0)
    .join("");
};

const isValidContents = (contents) => {
  if (!Array.isArray(contents) || contents.length === 0) {
    return false;
  }

  return contents.every((content) => {
    if (!content || typeof content !== "object") {
      return false;
    }

    const record = content;
    if (typeof record.role !== "string") {
      return false;
    }

    if (!Array.isArray(record.parts) || record.parts.length === 0) {
      return false;
    }

    return record.parts.every((part) => {
      if (!part || typeof part !== "object") {
        return false;
      }

      return typeof part.text === "string" && part.text.length > 0;
    });
  });
};

const buildGenerationConfig = (payload) => {
  const allowedGenKeys = new Set([
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
  const gcIn = payload.generationConfig || payload.generation_config || {};
  const entries = Object.entries(gcIn).filter(([key]) => allowedGenKeys.has(key));
  return entries.length ? Object.fromEntries(entries) : undefined;
};

const buildSystemInstruction = (payload) => {
  if (typeof payload.systemInstruction === "string") {
    return { role: "system", parts: [{ text: payload.systemInstruction }] };
  }
  if (typeof payload.systemPrompt === "string") {
    return { role: "system", parts: [{ text: payload.systemPrompt }] };
  }
  if (typeof payload.system === "string") {
    return { role: "system", parts: [{ text: payload.system }] };
  }
  if (typeof payload.systemInstruction === "object" && payload.systemInstruction !== null) {
    return payload.systemInstruction;
  }
  return undefined;
};

app.post("/generate", async (req, res) => {
  if (requiredToken) {
    const token = req.header("X-Proxy-Token");
    if (token !== requiredToken) {
      return res.status(403).json({ ok: false, error: "Unauthorized." });
    }
  }

  if (!geminiApiKey) {
    return res.status(500).json({ ok: false, error: "Missing GEMINI_API_KEY." });
  }

  const payload = req.body || {};
  const { model, contents, safetySettings } = payload;

  if (!model || !contents) {
    return res.status(400).json({ ok: false, error: "Missing model or contents." });
  }

  if (!isValidContents(contents)) {
    return res
      .status(400)
      .json({ ok: false, error: "Invalid contents format. Expected role and parts with text." });
  }

  const generationConfig = buildGenerationConfig(payload);
  const systemInstruction = buildSystemInstruction(payload);
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${geminiApiKey}`;

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig,
        safetySettings,
        systemInstruction,
      }),
    });
  } catch (error) {
    return res.status(502).json({ ok: false, error: "Failed to reach Gemini API." });
  }

  let data;
  try {
    data = await upstreamResponse.json();
  } catch (error) {
    return res.status(502).json({ ok: false, error: "Gemini API returned invalid JSON." });
  }

  if (!upstreamResponse.ok) {
    return res.status(upstreamResponse.status).json({
      ok: false,
      upstream: data,
      error: data?.error?.message || "Gemini API request failed.",
    });
  }

  return res.status(200).json({
    ok: true,
    text: extractText(data),
    raw: data,
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Upstream proxy listening on ${port}`);
});
