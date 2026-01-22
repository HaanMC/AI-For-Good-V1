import { nanoid } from "nanoid";
import type { Request, Response, NextFunction } from "express";

export type RequestWithId = Request & { requestId?: string };

export const requestIdMiddleware = (req: RequestWithId, res: Response, next: NextFunction) => {
  const requestId = req.header("x-request-id") || nanoid();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
};
