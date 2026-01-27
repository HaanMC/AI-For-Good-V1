import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { firestore } from "../services/firestore.js";

const router = Router();

router.post("/student/submissions", async (req: AuthenticatedRequest, res) => {
  const { assignmentId, content } = req.body as { assignmentId?: string; content?: string };
  if (!assignmentId || !content) {
    return res.status(400).json({ error: "assignmentId and content are required" });
  }

  const doc = await firestore.collection("submissions").add({
    assignmentId,
    uid: req.user?.uid,
    content,
    createdAt: new Date(),
  });

  return res.json({ id: doc.id });
});

router.post("/student/join", async (req: AuthenticatedRequest, res) => {
  const { code } = req.body as { code?: string };
  if (!code) {
    return res.status(400).json({ error: "code is required" });
  }

  const codeDoc = await firestore.collection("classCodes").doc(code).get();
  if (!codeDoc.exists) {
    return res.status(404).json({ error: "Invalid join code" });
  }

  const data = codeDoc.data();
  const expiresAt = data?.expiresAt?.toDate?.() ?? data?.expiresAt;
  if (expiresAt && new Date(expiresAt) < new Date()) {
    return res.status(400).json({ error: "Join code expired" });
  }

  const classId = data?.classId;
  if (!classId) {
    return res.status(400).json({ error: "Join code missing class" });
  }

  const memberId = `${classId}_${req.user?.uid}`;
  await firestore.collection("classMembers").doc(memberId).set({
    classId,
    uid: req.user?.uid,
    joinedAt: new Date(),
  });

  return res.json({ ok: true, classId });
});

export default router;
