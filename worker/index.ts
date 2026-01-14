type GeminiGeneratePayload = {
  model: string;
  contents: Array<Record<string, unknown>>;
  generationConfig?: Record<string, unknown>;
  generation_config?: Record<string, unknown>;
  safetySettings?: Array<Record<string, unknown>>;
  systemInstruction?: unknown;
  systemPrompt?: string;
  system?: string;
};

type GeminiProxyResponse = {
  ok: boolean;
  text?: string;
  raw?: unknown;
  message?: string;
  error?: string;
  status?: number;
  upstream?: unknown;
  cfColo?: string;
  cfCountry?: string;
  origin?: string | null;
};

type Env = {
  GEMINI_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
  PROXY_UPSTREAM_URL?: string;
  USE_UPSTREAM_PROXY?: string;
  PROXY_TOKEN?: string;
};

const getAllowedOrigins = (env: Env): string[] => {
  const defaults = ["https://aiforgood.nguyenhaan.id.vn", "http://localhost:5173"];
  const configured = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

  return Array.from(new Set([...defaults, ...configured]));
};

const getAllowedOrigin = (request: Request, env: Env): string => {
  const origin = request.headers.get("Origin") || "";
  const allowList = getAllowedOrigins(env);

  if (origin && allowList.includes(origin)) {
    return origin;
  }

  return "";
};

const corsHeaders = (request: Request, env: Env): Headers => {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = getAllowedOrigin(request, env);

  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", allowOrigin);
  headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("Vary", "Origin");
  headers.set("Content-Type", "application/json; charset=utf-8");
  return headers;
};

const withCors = (response: Response, request: Request, env: Env): Response => {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(request, env);

  cors.forEach((value, key) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const jsonResponse = (body: GeminiProxyResponse, init: ResponseInit, request: Request, env: Env): Response => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  const response = new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
  return withCors(response, request, env);
};

const getCfDebug = (request: Request): { cfColo?: string; cfCountry?: string } => {
  const cf = request.cf as { colo?: string; country?: string } | undefined;
  return {
    cfColo: cf?.colo,
    cfCountry: cf?.country,
  };
};

const isTruthy = (value?: string): boolean => {
  if (!value) {
    return false;
  }
  return ["true", "1", "yes"].includes(value.toLowerCase());
};

const extractText = (data: any): string => {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part: { text?: string }) => part.text)
    .filter((text): text is string => Boolean(text))
    .join("");
};

const isValidContents = (contents: unknown): contents is Array<{ role: string; parts: Array<{ text?: string }> }> => {
  if (!Array.isArray(contents) || contents.length === 0) {
    return false;
  }

  return contents.every((content) => {
    if (!content || typeof content !== "object") {
      return false;
    }

    const record = content as { role?: unknown; parts?: unknown };
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

      const partRecord = part as { text?: unknown };
      return typeof partRecord.text === "string" && partRecord.text.length > 0;
    });
  });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      const allowedOrigin = getAllowedOrigin(request, env);
      if (!allowedOrigin) {
        return new Response(null, {
          status: 403,
          headers: corsHeaders(request, env),
        });
      }

      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env),
      });
    }

    const url = new URL(request.url);
    if (url.pathname === "/debug" && request.method === "GET") {
      return jsonResponse(
        {
          ok: true,
          ...getCfDebug(request),
          origin: request.headers.get("Origin"),
        },
        { status: 200 },
        request,
        env,
      );
    }

    if (url.pathname !== "/generate") {
      return withCors(new Response("Not Found", { status: 404 }), request, env);
    }

    if (request.method !== "POST") {
      return withCors(new Response("Method Not Allowed", { status: 405 }), request, env);
    }

    const allowedOrigin = getAllowedOrigin(request, env);
    if (!allowedOrigin) {
      return jsonResponse(
        { ok: false, error: "CORS origin not allowed" },
        { status: 403 },
        request,
        env,
      );
    }

    const cfDebug = getCfDebug(request);
    const useUpstreamProxy = env.PROXY_UPSTREAM_URL
      ? env.USE_UPSTREAM_PROXY === undefined
        ? true
        : isTruthy(env.USE_UPSTREAM_PROXY)
      : false;

    if (!useUpstreamProxy && !env.GEMINI_API_KEY) {
      return jsonResponse(
        {
          ok: false,
          error: "Missing GEMINI_API_KEY in worker environment.",
          ...cfDebug,
        },
        { status: 500 },
        request,
        env,
      );
    }

    let payload: GeminiGeneratePayload;
    try {
      payload = (await request.json()) as GeminiGeneratePayload;
    } catch (error) {
      return jsonResponse(
        { ok: false, error: "Invalid JSON payload.", ...cfDebug },
        { status: 400 },
        request,
        env,
      );
    }

    if (!payload?.model || !payload?.contents) {
      return jsonResponse(
        { ok: false, error: "Missing model or contents.", ...cfDebug },
        { status: 400 },
        request,
        env,
      );
    }

    if (!isValidContents(payload.contents)) {
      return jsonResponse(
        { ok: false, error: "Invalid contents format. Expected role and parts with text.", ...cfDebug },
        { status: 400 },
        request,
        env,
      );
    }

    const { model, contents, safetySettings } = payload;

    if (useUpstreamProxy) {
      if (!env.PROXY_UPSTREAM_URL) {
        return jsonResponse(
          { ok: false, error: "Missing PROXY_UPSTREAM_URL.", ...cfDebug },
          { status: 500 },
          request,
          env,
        );
      }

      let upstreamResponse: Response;
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (env.PROXY_TOKEN) {
          headers["X-Proxy-Token"] = env.PROXY_TOKEN;
        }
        upstreamResponse = await fetch(env.PROXY_UPSTREAM_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      } catch (error) {
        return jsonResponse(
          { ok: false, error: "Failed to reach upstream proxy.", ...cfDebug },
          { status: 502 },
          request,
          env,
        );
      }

      let upstreamData: any = null;
      try {
        upstreamData = await upstreamResponse.json();
      } catch (error) {
        return jsonResponse(
          { ok: false, error: "Upstream proxy returned invalid JSON.", ...cfDebug },
          { status: 502 },
          request,
          env,
        );
      }

      if (!upstreamResponse.ok || upstreamData?.ok === false) {
        const errorMessage =
          upstreamData?.error ||
          upstreamData?.message ||
          upstreamData?.upstream?.error?.message ||
          "Upstream proxy request failed.";
        return jsonResponse(
          {
            ...upstreamData,
            ok: false,
            status: upstreamResponse.status,
            error: errorMessage,
            ...cfDebug,
          },
          { status: upstreamResponse.status || 502 },
          request,
          env,
        );
      }

      return jsonResponse(
        {
          ...upstreamData,
          ...cfDebug,
        },
        { status: upstreamResponse.status || 200 },
        request,
        env,
      );
    }

    let sysText: string | null = null;
    if (typeof payload.systemInstruction === "string") {
      sysText = payload.systemInstruction;
    } else if (typeof payload.systemPrompt === "string") {
      sysText = payload.systemPrompt;
    } else if (typeof payload.system === "string") {
      sysText = payload.system;
    }

    const systemInstructionObj =
      sysText !== null
        ? { role: "system", parts: [{ text: sysText }] }
        : typeof payload.systemInstruction === "object" && payload.systemInstruction !== null
          ? payload.systemInstruction
          : undefined;

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
    const generationConfig = Object.fromEntries(
      Object.entries(gcIn).filter(([key]) => allowedGenKeys.has(key)),
    );
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          generationConfig: Object.keys(generationConfig).length ? generationConfig : undefined,
          safetySettings,
          systemInstruction: systemInstructionObj,
        }),
      });
    } catch (error) {
      return jsonResponse(
        { ok: false, error: "Failed to reach Gemini API.", ...cfDebug },
        { status: 502 },
        request,
        env,
      );
    }

    let data: any = null;
    try {
      data = await upstreamResponse.json();
    } catch (error) {
      return jsonResponse(
        { ok: false, error: "Gemini API returned invalid JSON.", ...cfDebug },
        { status: 502 },
        request,
        env,
      );
    }

    if (!upstreamResponse.ok) {
      const status = upstreamResponse.status || 502;
      return jsonResponse(
        {
          ok: false,
          status,
          upstream: data,
          error: data?.error?.message || "Gemini API request failed.",
          ...cfDebug,
        },
        { status },
        request,
        env,
      );
    }

    const text = extractText(data);
    return jsonResponse(
      {
        ok: true,
        text,
        raw: data,
        ...cfDebug,
      },
      { status: 200 },
      request,
      env,
    );
  },
};
