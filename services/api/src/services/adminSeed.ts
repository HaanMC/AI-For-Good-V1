import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { firestore } from "./firestore.js";
import { logInfo } from "../utils/logger.js";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

const buildProfileDefaults = (uid: string) => ({
  uid,
  weaknesses: {},
  scores: {
    history: [],
    average: null,
  },
  updatedAt: new Date(),
});

export const ensureAdminUser = async () => {
  const snapshot = await firestore.collection("users").where("role", "==", "admin").limit(1).get();
  if (!snapshot.empty) {
    return;
  }

  const rawAdminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!rawAdminUsername || !adminPassword) {
    throw new Error("Missing ADMIN_USERNAME or ADMIN_PASSWORD env vars for admin bootstrap.");
  }

  const adminUsername = rawAdminUsername.trim().toLowerCase();
  if (!adminUsername) {
    throw new Error("ADMIN_USERNAME cannot be empty.");
  }

  if (!USERNAME_REGEX.test(adminUsername)) {
    throw new Error("Invalid ADMIN_USERNAME format.");
  }

  const uid = nanoid();
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const now = new Date();

  await firestore.collection("users").doc(uid).set({
    uid,
    username: adminUsername,
    passwordHash,
    role: "admin",
    displayName: "Admin",
    createdAt: now,
    lastLoginAt: now,
  });

  await firestore.collection("profiles").doc(uid).set(buildProfileDefaults(uid), { merge: true });

  logInfo("admin_seeded", {
    username: adminUsername,
  });
};
