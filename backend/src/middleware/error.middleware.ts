import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const hint = first
      ? `${first.path.join(".")}: ${first.message}`
      : "Invalid input";
    res.status(400).json({
      error: "Validation failed",
      message: hint,
      details: err.flatten().fieldErrors,
    });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = err.meta?.target;
      const fieldStr = Array.isArray(fields) ? fields.join(", ") : String(fields ?? "");
      const msg = fieldStr.includes("email")
        ? "Email already registered"
        : "A record with this value already exists";
      res.status(409).json({ error: msg });
      return;
    }
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
