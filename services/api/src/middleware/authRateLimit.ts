import type { Request, Response, NextFunction } from "express";
const WINDOW_MS = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? "60000");
const MAX_ATTEMPTS = Number(process.env.AUTH_RATE_LIMIT_MAX ?? "10");

const authStore = new Map<string, { count: number; resetAt: number }>();

export const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const key: string =
    (typeof req.ip === "string" && req.ip) ||
    (typeof req.socket?.remoteAddress === "string" && req.socket.remoteAddress) ||
    "unknown";
  const now = Date.now();
  const entry = authStore.get(key);

  if (!entry || entry.resetAt <= now) {
    authStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return res.status(429).json({ error: "Too many auth attempts. Please try later." });
  }

  entry.count += 1;
  return next();
};
