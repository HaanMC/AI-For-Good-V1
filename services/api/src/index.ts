import "dotenv/config";
import express from "express";
import cors from "cors";
import { initializeApp, cert } from "firebase-admin/app";
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

const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://aiforgood.nguyenhaan.id.vn";

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  exposedHeaders: ["x-request-id"],
}));
app.use(express.json({ limit: "2mb" }));
app.use(requestIdMiddleware);

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (serviceAccountJson) {
  initializeApp({
    credential: cert(JSON.parse(serviceAccountJson)),
  });
} else {
  initializeApp();
}

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
app.listen(port, () => {
  logInfo("api_listening", { port });
});
