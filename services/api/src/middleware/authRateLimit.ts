import type { Request, Response, NextFunction } from "express";
import { envInt } from "../utils/env.js";

const WINDOW_MS = envInt("AUTH_RATE_LIMIT_WINDOW_MS", 10 * 60 * 1000);
const MAX_ATTEMPTS = envInt("AUTH_RATE_LIMIT_MAX", 15);

const authStore = new Map<string, { count: number; resetAt: number }>();

export const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const key = req.ip;
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
