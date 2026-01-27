import type { Request, Response, NextFunction } from "express";
import type { RequestWithId } from "./requestId.js";
import { firestore } from "../services/firestore.js";

export type AuthenticatedRequest = RequestWithId & {
  user?: {
    uid: string;
    role: "admin" | "student";
    username: string;
    displayName?: string;
  };
};

export type SessionRequest = AuthenticatedRequest & {
  session?: {
    uid?: string;
  } | null;
};

export const requireAuth = async (req: SessionRequest, res: Response, next: NextFunction) => {
  const uid = req.session?.uid;
  if (!uid) {
    return res.status(401).json({ error: "Missing auth session" });
  }

  const doc = await firestore.collection("users").doc(uid).get();
  if (!doc.exists) {
    return res.status(401).json({ error: "Invalid auth session" });
  }

  const data = doc.data() as {
    uid: string;
    role?: "admin" | "student";
    username?: string;
    displayName?: string;
  };

  if (!data?.uid || !data?.username) {
    return res.status(401).json({ error: "Invalid auth session" });
  }

  req.user = {
    uid: data.uid,
    role: data.role ?? "student",
    username: data.username,
    displayName: data.displayName,
  };

  return next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin role required" });
  }
  return next();
};
