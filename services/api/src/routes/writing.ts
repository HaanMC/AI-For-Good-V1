import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { generateWithFallback } from "../services/geminiClient";
import { firestore } from "../services/firestore";

const router = Router();

router.post("/writing/feedback", async (req: AuthenticatedRequest, res) => {
  const startedAt = Date.now();
  const requestId = req.requestId;
  const uid = req.user?.uid || "unknown";

  try {
    const payload = req.body as Record<string, unknown>;
    const { text, raw } = await generateWithFallback(payload as Parameters<typeof generateWithFallback>[0]);

    await firestore.collection("usageLogs").add({
      uid,
      feature: "writing",
      status: "success",
      latencyMs: Date.now() - startedAt,
      createdAt: new Date(),
      requestId,
    });

    return res.json({ ok: true, text, raw, requestId });
  } catch (error) {
    await firestore.collection("usageLogs").add({
      uid,
      feature: "writing",
      status: "error",
      latencyMs: Date.now() - startedAt,
      createdAt: new Date(),
      requestId,
    });

    return res.status(500).json({ error: "Writing feedback failed", requestId });
  }
});

export default router;
