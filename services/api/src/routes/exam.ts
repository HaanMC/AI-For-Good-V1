import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { generateWithFallback } from "../services/geminiClient.js";
import { firestore } from "../services/firestore.js";
import { recordSubmission } from "../services/submissions.js";

const router = Router();

router.post("/exam/generate", async (req: AuthenticatedRequest, res) => {
  const startedAt = Date.now();
  const requestId = req.requestId;
  const uid = req.user?.uid || "unknown";

  try {
    const payload = req.body as Record<string, unknown>;
    const { text, raw } = await generateWithFallback(payload as Parameters<typeof generateWithFallback>[0]);

    if (req.user?.uid) {
      await recordSubmission({
        uid: req.user.uid,
        type: "exam",
        payload,
        feedback: text,
        score: typeof payload.score === "number" ? payload.score : null,
        weaknesses: Array.isArray(payload.weaknesses) ? payload.weaknesses.map(String) : [],
      });
    }

    await firestore.collection("usageLogs").add({
      uid,
      feature: "exam",
      status: "success",
      latencyMs: Date.now() - startedAt,
      createdAt: new Date(),
      requestId,
    });

    return res.json({ ok: true, text, raw, requestId });
  } catch (error: unknown) {
    if (req.user?.uid) {
      await recordSubmission({
        uid: req.user.uid,
        type: "exam",
        payload: req.body as Record<string, unknown>,
        feedback: "error",
        score: null,
        weaknesses: [],
      });
    }
    await firestore.collection("usageLogs").add({
      uid,
      feature: "exam",
      status: "error",
      latencyMs: Date.now() - startedAt,
      createdAt: new Date(),
      requestId,
    });

    return res.status(500).json({ error: "Exam generation failed", requestId });
  }
});

export default router;
