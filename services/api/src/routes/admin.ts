import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { firestore } from "../services/firestore.js";
import { nanoid } from "nanoid";

const router = Router();
type AnyDoc = Record<string, any>;

router.post("/admin/setRole", async (req: AuthenticatedRequest, res) => {
  const { uid, role } = req.body as { uid?: string; role?: string };
  if (!uid || !role) {
    return res.status(400).json({ error: "uid and role are required" });
  }

  if (role !== "admin" && role !== "student") {
    return res.status(400).json({ error: "role must be admin or student" });
  }

  await firestore.collection("users").doc(uid).set(
    {
      role,
      updatedAt: new Date(),
    },
    { merge: true }
  );

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
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as AnyDoc) }));
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
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as AnyDoc) }));
  return res.json({ data });
});

router.get("/admin/submissions", async (_req, res) => {
  const snapshot = await firestore.collection("submissions").orderBy("createdAt", "desc").get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as AnyDoc) }));
  return res.json({ data });
});

router.get("/admin/usage", async (req, res) => {
  const { uid, feature } = req.query as { uid?: string; feature?: string };
  let query: FirebaseFirestore.Query = firestore.collection("usageLogs");
  if (uid) query = query.where("uid", "==", uid);
  if (feature) query = query.where("feature", "==", feature);
  const snapshot = await query.orderBy("createdAt", "desc").limit(100).get();
  const logs = snapshot.docs.map((doc) => {
    const data = doc.data() as AnyDoc;
    return { id: doc.id, ...data };
  });
  const summary = logs.reduce(
    (acc, log) => {
      const featureKey = String(log.feature || "unknown");
      const statusKey = String(log.status || "unknown");
      acc.total += 1;
      acc.byFeature[featureKey] = (acc.byFeature[featureKey] || 0) + 1;
      acc.byStatus[statusKey] = (acc.byStatus[statusKey] || 0) + 1;
      return acc;
    },
    { total: 0, byFeature: {} as Record<string, number>, byStatus: {} as Record<string, number> }
  );
  return res.json({ summary, logs });
});

router.get("/admin/users", async (req, res) => {
  const { search } = req.query as { search?: string };
  const snapshot = await firestore.collection("users").orderBy("createdAt", "desc").limit(100).get();
  let data = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as AnyDoc) }));
  if (search) {
    const lower = search.toLowerCase();
    data = data.filter((user) =>
      String(user.username || "").toLowerCase().includes(lower) ||
      String(user.displayName || "").toLowerCase().includes(lower)
    );
  }
  return res.json({ data });
});

router.get("/admin/user/:uid", async (req, res) => {
  const { uid } = req.params;
  const userDoc = await firestore.collection("users").doc(uid).get();
  if (!userDoc.exists) {
    return res.status(404).json({ error: "User not found" });
  }

  const profileDoc = await firestore.collection("profiles").doc(uid).get();
  const submissionsSnapshot = await firestore
    .collection("submissions")
    .where("uid", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(10)
    .get();

  const submissions = submissionsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as AnyDoc),
  }));

  return res.json({
    user: { id: userDoc.id, ...(userDoc.data() as AnyDoc) },
    profile: profileDoc.exists ? { id: profileDoc.id, ...(profileDoc.data() as AnyDoc) } : null,
    submissions,
  });
});

export default router;
