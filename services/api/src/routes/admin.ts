import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { firestore } from "../services/firestore";
import { getAuth } from "firebase-admin/auth";
import { nanoid } from "nanoid";

const router = Router();

router.post("/admin/setRole", async (req: AuthenticatedRequest, res) => {
  const { uid, role } = req.body as { uid?: string; role?: string };
  if (!uid || !role) {
    return res.status(400).json({ error: "uid and role are required" });
  }

  await getAuth().setCustomUserClaims(uid, { role });
  await firestore.collection("users").doc(uid).set({
    role,
    updatedAt: new Date(),
  }, { merge: true });

  return res.json({ ok: true });
});

router.post("/admin/classes", async (req: AuthenticatedRequest, res) => {
  const { name, grade } = req.body as { name?: string; grade?: string };
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  const doc = await firestore.collection("classes").add({
    name,
    grade: grade ?? "",
    createdAt: new Date(),
    createdByUid: req.user?.uid,
  });

  return res.json({ id: doc.id });
});

router.post("/admin/classes/:classId/join-code", async (req: AuthenticatedRequest, res) => {
  const { classId } = req.params;
  const code = nanoid(6).toUpperCase();
  const createdAt = new Date();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await firestore.collection("classCodes").doc(code).set({
    classId,
    createdAt,
    expiresAt,
  });

  return res.json({ code, expiresAt });
});

router.get("/admin/classes", async (_req, res) => {
  const snapshot = await firestore.collection("classes").orderBy("createdAt", "desc").get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return res.json({ data });
});

router.post("/admin/assignments", async (req: AuthenticatedRequest, res) => {
  const { classId, type, rubricId, dueAt } = req.body as Record<string, unknown>;
  if (!classId || !type) {
    return res.status(400).json({ error: "classId and type are required" });
  }

  const doc = await firestore.collection("assignments").add({
    classId,
    type,
    rubricId: rubricId ?? null,
    dueAt: dueAt ? new Date(String(dueAt)) : null,
    createdByUid: req.user?.uid,
    createdAt: new Date(),
  });

  return res.json({ id: doc.id });
});

router.get("/admin/assignments", async (_req, res) => {
  const snapshot = await firestore.collection("assignments").orderBy("createdAt", "desc").get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return res.json({ data });
});

router.get("/admin/submissions", async (_req, res) => {
  const snapshot = await firestore.collection("submissions").orderBy("createdAt", "desc").get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return res.json({ data });
});

router.get("/admin/usage", async (req, res) => {
  const { uid, feature } = req.query as { uid?: string; feature?: string };
  let query: FirebaseFirestore.Query = firestore.collection("usageLogs");
  if (uid) query = query.where("uid", "==", uid);
  if (feature) query = query.where("feature", "==", feature);
  const snapshot = await query.orderBy("createdAt", "desc").limit(100).get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return res.json({ data });
});

router.get("/admin/users", async (req, res) => {
  const { search } = req.query as { search?: string };
  const snapshot = await firestore.collection("users").orderBy("createdAt", "desc").limit(100).get();
  let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  if (search) {
    const lower = search.toLowerCase();
    data = data.filter((user) =>
      String(user.email || "").toLowerCase().includes(lower) ||
      String(user.displayName || "").toLowerCase().includes(lower)
    );
  }
  return res.json({ data });
});

export default router;
