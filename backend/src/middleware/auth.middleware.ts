import type { NextFunction, Request, Response } from "express";
import { AppError } from "./error.middleware.js";
import { verifyAccessToken } from "../utils/jwt.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "Missing or invalid authorization header"));
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    next(new AppError(401, "Missing access token"));
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.user = { id: payload.sub, email: payload.email, name: null };
    next();
  } catch {
    next(new AppError(401, "Invalid or expired access token"));
  }
}
