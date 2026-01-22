import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import adminRoutes from "./routes/admin";
import studentRoutes from "./routes/student";
import telemetryRoutes from "./routes/telemetry";
import examRoutes from "./routes/exam";
import writingRoutes from "./routes/writing";
import { requestIdMiddleware } from "./middleware/requestId";
import { requireAuth, requireAdmin } from "./middleware/auth";
import { rateLimit } from "./middleware/rateLimit";
import { logInfo, logError } from "./utils/logger";
import { ensureAdminUser } from "./services/adminSeed";

const app = express();
app.set("trust proxy", 1);

const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://aiforgood.nguyenhaan.id.vn";

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  exposedHeaders: ["x-request-id"],
}));
app.use(express.json({ limit: "2mb" }));
app.use(requestIdMiddleware);

const sessionSecret = process.env.SESSION_SECRET || "dev-session-secret";
if (!process.env.SESSION_SECRET) {
  logInfo("session_secret_missing", { warning: "Set SESSION_SECRET in production." });
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
app.listen(port, "0.0.0.0", () => {
  logInfo("api_listening", { port });
});

ensureAdminUser().catch((error) => {
  logError("admin_seed_failed", { message: error instanceof Error ? error.message : "unknown" });
});
