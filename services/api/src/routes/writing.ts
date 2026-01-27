import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { generateWithFallback } from "../services/geminiClient.js";
import { firestore } from "../services/firestore.js";
import { recordSubmission } from "../services/submissions.js";

const router = Router();

router.post("/writing/feedback", async (req: AuthenticatedRequest, res) => {
  const startedAt = Date.now();
  const requestId = req.requestId;
  const uid = req.user?.uid || "unknown";

  try {
    const payload = req.body as Record<string, unknown>;
    const { text, raw } = await generateWithFallback(payload as Parameters<typeof generateWithFallback>[0]);

    let score: number | null = null;
    const weaknesses: string[] = [];
    if (text) {
      try {
        const parsed = JSON.parse(text) as {
          rubric?: {
            logicScore?: number;
            vocabularyScore?: number;
            creativityScore?: number;
            knowledgeScore?: number;
          };
        };
        const rubric = parsed.rubric;
        if (rubric) {
          const scores = [
            rubric.logicScore,
            rubric.vocabularyScore,
            rubric.creativityScore,
            rubric.knowledgeScore,
          ].filter((value): value is number => typeof value === "number");
          if (scores.length) {
            score = Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 10) / 10;
          }
          if ((rubric.logicScore ?? 10) < 6) weaknesses.push("logic");
          if ((rubric.vocabularyScore ?? 10) < 6) weaknesses.push("vocabulary");
          if ((rubric.creativityScore ?? 10) < 6) weaknesses.push("creativity");
          if ((rubric.knowledgeScore ?? 10) < 6) weaknesses.push("knowledge");
        }
      } catch (error: unknown) {
        // ignore parse errors
      }
    }

    if (req.user?.uid) {
      await recordSubmission({
        uid: req.user.uid,
        type: "writing",
        payload,
        feedback: text,
        score,
        weaknesses,
      });
    }

    await firestore.collection("usageLogs").add({
      uid,
      feature: "writing",
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
        type: "writing",
        payload: req.body as Record<string, unknown>,
        feedback: "error",
        score: null,
        weaknesses: [],
      });
    }
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
