import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { generateWithFallback } from "../services/geminiClient.js";
import { firestore } from "../services/firestore.js";

const router = Router();

router.post("/chat", async (req: AuthenticatedRequest, res) => {
  const startedAt = Date.now();
  const requestId = req.requestId;
  const uid = req.user?.uid || "unknown";

  try {
    const payload = req.body as Record<string, unknown>;
    const { text, raw } = await generateWithFallback(payload as Parameters<typeof generateWithFallback>[0]);

    await firestore.collection("usageLogs").add({
      uid,
      feature: "chat",
      status: "success",
      latencyMs: Date.now() - startedAt,
      createdAt: new Date(),
      requestId,
    });

    return res.json({ ok: true, text, raw, requestId });
  } catch (error: unknown) {
    await firestore.collection("usageLogs").add({
      uid,
      feature: "chat",
      status: "error",
      latencyMs: Date.now() - startedAt,
      createdAt: new Date(),
      requestId,
    });

    return res.status(500).json({ error: "LLM request failed", requestId });
  }
});

export default router;
