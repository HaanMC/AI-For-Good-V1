type Env = {
  UPSTREAM_URL?: string;
  UPSTREAM_TOKEN?: string;
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
  const allowOrigin = getAllowedOrigin(request, env);
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", allowOrigin);
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("Vary", "Origin");
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

const jsonResponse = (
  body: Record<string, unknown>,
  init: ResponseInit,
  request: Request,
  env: Env,
): Response => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  const response = new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
  return withCors(response, request, env);
};

const getCfDebug = (request: Request): { colo?: string; country?: string } => {
  const cf = request.cf as { colo?: string; country?: string } | undefined;
  return {
    colo: cf?.colo,
    country: cf?.country,
  };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      if (url.pathname !== "/generate") {
        return withCors(new Response("Not Found", { status: 404 }), request, env);
      }

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

    if (url.pathname === "/debug" && request.method === "GET") {
      return jsonResponse(
        {
          ok: true,
          ...getCfDebug(request),
          hasUpstream: Boolean(env.UPSTREAM_URL),
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

    if (!env.UPSTREAM_URL) {
      return jsonResponse(
        { ok: false, error: "UPSTREAM_URL not set" },
        { status: 500 },
        request,
        env,
      );
    }

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(env.UPSTREAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Proxy-Token": env.UPSTREAM_TOKEN ?? "",
        },
        body: request.body,
      });
    } catch (error) {
      return jsonResponse(
        { ok: false, error: "Failed to reach upstream." },
        { status: 502 },
        request,
        env,
      );
    }

    return withCors(
      new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: upstreamResponse.headers,
      }),
      request,
      env,
    );
  },
};
