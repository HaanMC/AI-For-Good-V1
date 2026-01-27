import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.js";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;
const DAILY_MS = 24 * 60 * 60 * 1000;
const DAILY_QUOTA_DEFAULT = 500;

const windowStore = new Map<string, { count: number; resetAt: number }>();
const dailyStore = new Map<string, { count: number; resetAt: number }>();

const getKey = (req: AuthenticatedRequest) => req.user?.uid || req.ip;

const checkLimit = (
  store: Map<string, { count: number; resetAt: number }>,
  key: string,
  windowMs: number,
  max: number
) => {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }
  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
};

export const rateLimit = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const key = getKey(req);
  const windowLimit = checkLimit(windowStore, key, WINDOW_MS, MAX_REQUESTS_PER_WINDOW);
  if (!windowLimit.allowed) {
    return res.status(429).json({
      error: "Too many requests. Please slow down.",
      retryAt: windowLimit.resetAt,
    });
  }

  const dailyQuota = Number(process.env.DAILY_QUOTA || DAILY_QUOTA_DEFAULT);
  const dailyLimit = checkLimit(dailyStore, key, DAILY_MS, dailyQuota);
  if (!dailyLimit.allowed) {
    return res.status(429).json({
      error: "Daily quota exceeded. Please try again tomorrow.",
      retryAt: dailyLimit.resetAt,
    });
  }

  res.setHeader("x-rate-limit-remaining", String(windowLimit.remaining));
  return next();
};
