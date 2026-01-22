import { Router } from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import type { SessionRequest } from "../middleware/auth";
import { firestore } from "../services/firestore";
import { authRateLimit } from "../middleware/authRateLimit";

const router = Router();

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

const normalizeUsername = (username: string) => username.trim().toLowerCase();

const buildProfileDefaults = (uid: string) => ({
  uid,
  weaknesses: {},
  scores: {
    history: [],
    average: null,
  },
  updatedAt: new Date(),
});

router.post("/auth/register", authRateLimit, async (req: SessionRequest, res) => {
  const { username, password, displayName } = req.body as {
    username?: string;
    password?: string;
    displayName?: string;
  };

  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  const normalized = normalizeUsername(username);
  if (!USERNAME_REGEX.test(normalized)) {
    return res.status(400).json({ error: "username must be 3-20 characters of lowercase letters, numbers, or _" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "password must be at least 8 characters" });
  }

  const existing = await firestore.collection("users").where("username", "==", normalized).limit(1).get();
  if (!existing.empty) {
    return res.status(409).json({ error: "username already exists" });
  }

  const uid = nanoid();
  const passwordHash = await bcrypt.hash(password, 10);
  const trimmedDisplayName = displayName?.trim() || normalized;
  const now = new Date();

  await firestore.collection("users").doc(uid).set({
    uid,
    username: normalized,
    passwordHash,
    role: "student",
    displayName: trimmedDisplayName,
    createdAt: now,
    lastLoginAt: now,
  });

  await firestore.collection("profiles").doc(uid).set(buildProfileDefaults(uid), { merge: true });

  req.session = { uid };
  return res.json({
    uid,
    username: normalized,
    role: "student",
    displayName: trimmedDisplayName,
  });
});

router.post("/auth/login", authRateLimit, async (req: SessionRequest, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  const normalized = normalizeUsername(username);
  const snapshot = await firestore.collection("users").where("username", "==", normalized).limit(1).get();
  if (snapshot.empty) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const doc = snapshot.docs[0];
  const data = doc.data() as {
    uid: string;
    passwordHash?: string;
    role?: "admin" | "student";
    displayName?: string;
    username?: string;
  };

  const passwordHash = data.passwordHash ?? "";
  const match = await bcrypt.compare(password, passwordHash);
  if (!match) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const now = new Date();
  await firestore.collection("users").doc(doc.id).set({ lastLoginAt: now }, { merge: true });

  req.session = { uid: data.uid };
  return res.json({
    uid: data.uid,
    username: data.username ?? normalized,
    role: data.role ?? "student",
    displayName: data.displayName ?? data.username ?? normalized,
  });
});

router.post("/auth/logout", (req: SessionRequest, res) => {
  req.session = null;
  return res.json({ ok: true });
});

router.get("/auth/me", async (req: SessionRequest, res) => {
  const uid = req.session?.uid;
  if (!uid) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const doc = await firestore.collection("users").doc(uid).get();
  if (!doc.exists) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const data = doc.data() as {
    uid: string;
    username: string;
    role?: "admin" | "student";
    displayName?: string;
  };

  return res.json({
    uid: data.uid,
    username: data.username,
    role: data.role ?? "student",
    displayName: data.displayName ?? data.username,
  });
});

export default router;
