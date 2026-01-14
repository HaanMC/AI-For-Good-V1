type GeminiGeneratePayload = {
  model: string;
  contents: Array<Record<string, unknown>>;
  generationConfig?: Record<string, unknown>;
  safetySettings?: Array<Record<string, unknown>>;
};

type GeminiProxyResponse = {
  ok: boolean;
  text?: string;
  raw?: unknown;
  message?: string;
  error?: string;
};

type Env = {
  GEMINI_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
};

const getAllowedOrigins = (env: Env): string[] => {
  if (!env.ALLOWED_ORIGINS) {
    return [];
  }

  return env.ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
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

    if (!env.GEMINI_API_KEY) {
      return jsonResponse(
        { ok: false, error: "Missing GEMINI_API_KEY in worker environment." },
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
        { ok: false, error: "Invalid JSON payload." },
        { status: 400 },
        request,
        env,
      );
    }

    if (!payload?.model || !payload?.contents) {
      return jsonResponse(
        { ok: false, error: "Missing model or contents." },
        { status: 400 },
        request,
        env,
      );
    }

    const { model, contents, generationConfig, safetySettings } = payload;
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
          generationConfig,
          safetySettings: safetySettings ?? [],
        }),
      });
    } catch (error) {
      return jsonResponse(
        { ok: false, error: "Failed to reach Gemini API." },
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
        { ok: false, error: "Gemini API returned invalid JSON." },
        { status: 502 },
        request,
        env,
      );
    }

    if (!upstreamResponse.ok) {
      return jsonResponse(
        {
          ok: false,
          error: data?.error?.message || "Gemini API request failed.",
          raw: data,
        },
        { status: upstreamResponse.status },
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
      },
      { status: 200 },
      request,
      env,
    );
  },
};
