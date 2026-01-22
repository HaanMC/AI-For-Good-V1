import type { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import type { RequestWithId } from "./requestId";

export type AuthenticatedRequest = RequestWithId & {
  user?: {
    uid: string;
    role?: string;
    email?: string;
    displayName?: string;
  };
};

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  const token = header.replace("Bearer ", "").trim();

  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      role: decoded.role as string | undefined,
      email: decoded.email,
      displayName: decoded.name,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid auth token" });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin role required" });
  }
  return next();
};
