import "dotenv/config";
import express from "express";
import cookieSession from "cookie-session";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import adminRoutes from "./routes/admin.js";
import studentRoutes from "./routes/student.js";
import telemetryRoutes from "./routes/telemetry.js";
import examRoutes from "./routes/exam.js";
import writingRoutes from "./routes/writing.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { requireAuth, requireAdmin } from "./middleware/auth.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { logInfo, logError } from "./utils/logger.js";
import { ensureAdminUser } from "./services/adminSeed.js";

const app = express();
app.set("trust proxy", 1);

const parseOrigins = (origins?: string) =>
  (origins || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://aiforgood.nguyenhaan.id.vn",
  ...parseOrigins(process.env.ALLOWED_ORIGINS),
  ...parseOrigins(process.env.ALLOWED_ORIGIN),
]);
const allowedMethods = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const allowedHeaders = "Content-Type, Authorization";
app.use(express.json({ limit: "2mb" }));
app.use(requestIdMiddleware);

app.use("/api", (req, res, next) => {
  const origin = req.header("Origin");
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", allowedMethods);
    res.setHeader("Access-Control-Allow-Headers", allowedHeaders);
    res.vary("Origin");
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

const sessionSecret = process.env.SESSION_SECRET || process.env.COOKIE_SECRET || "dev-session-secret";
if (!process.env.SESSION_SECRET && !process.env.COOKIE_SECRET) {
  logInfo("session_secret_missing", { warning: "Set SESSION_SECRET or COOKIE_SECRET in production." });
}

app.use(
  cookieSession({
    name: "aiforgood_session",
    keys: [sessionSecret],
    httpOnly: true,
    sameSite: "none",
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : true,
    path: "/",
  })
);

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    logInfo("request_complete", {
      requestId: req.header("x-request-id"),
      route: req.path,
      method: req.method,
      status: res.statusCode,
      latencyMs: Date.now() - startedAt,
    });
  });
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "api", timestamp: new Date().toISOString() });
});

app.use("/api", authRoutes);
app.use("/api", requireAuth, rateLimit, chatRoutes);
app.use("/api", requireAuth, rateLimit, examRoutes);
app.use("/api", requireAuth, rateLimit, writingRoutes);
app.use("/api", requireAuth, rateLimit, telemetryRoutes);
app.use("/api", requireAuth, rateLimit, studentRoutes);
app.use("/api", requireAuth, rateLimit, requireAdmin, adminRoutes);

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logError("unhandled_error", { message: error.message });
  res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT || 8080);

const startServer = async () => {
  await ensureAdminUser();
  app.listen(port, "0.0.0.0", () => {
    logInfo("api_listening", { port });
  });
};

startServer().catch((error: unknown) => {
  logError("admin_seed_failed", { message: error instanceof Error ? error.message : "unknown" });
  process.exit(1);
});
