import type { Request, Response } from "express";
import { z } from "zod";
import { enrollUser, listEnrollments } from "./enrollments.service.js";

const enrollSchema = z.object({
  subjectId: z.string().uuid(),
});

export async function enroll(req: Request, res: Response): Promise<void> {
  const body = enrollSchema.parse(req.body);
  const userId = req.userId!;
  const result = await enrollUser(userId, body.subjectId);
  res.status(201).json(result);
}

export async function mine(req: Request, res: Response): Promise<void> {
  const rows = await listEnrollments(req.userId!);
  res.json({ enrollments: rows });
}
