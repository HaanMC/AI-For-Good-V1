import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { firestore } from "../services/firestore.js";

const router = Router();

router.post("/telemetry/event", async (req: AuthenticatedRequest, res) => {
  const { examSessionId, type, detail } = req.body as {
    examSessionId?: string;
    type?: string;
    detail?: string;
  };

  if (!examSessionId || !type) {
    return res.status(400).json({ error: "examSessionId and type are required" });
  }

  const doc = await firestore.collection("proctoringEvents").add({
    uid: req.user?.uid,
    examSessionId,
    type,
    detail: detail ?? "",
    createdAt: new Date(),
  });

  return res.json({ id: doc.id });
});

export default router;
