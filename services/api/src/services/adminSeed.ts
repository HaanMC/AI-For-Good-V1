import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { firestore } from "./firestore.js";
import { logInfo, logError } from "../utils/logger.js";

const DEFAULT_ADMIN_USERNAME = "haanadmin";
const DEFAULT_ADMIN_PASSWORD = "Haan@2026!123";

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

  const adminUsername = (process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME).trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  if (!USERNAME_REGEX.test(adminUsername)) {
    logError("admin_seed_failed", { reason: "Invalid ADMIN_USERNAME format." });
    return;
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
    warning: "Change ADMIN_PASSWORD in production using environment variables.",
  });
};
