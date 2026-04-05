import type { Request, Response } from "express";
import { z } from "zod";
import { getProgress, upsertProgress } from "./progress.service.js";

const bodySchema = z
  .object({
    last_position_seconds: z.number().int().min(0).optional(),
    completed: z.boolean().optional(),
  })
  .refine((b) => b.last_position_seconds !== undefined || b.completed !== undefined, {
    message: "Provide last_position_seconds and/or completed",
  });

export async function getOne(req: Request, res: Response): Promise<void> {
  const data = await getProgress(req.params.id, req.userId!);
  res.json(data);
}

export async function save(req: Request, res: Response): Promise<void> {
  const body = bodySchema.parse(req.body);
  const data = await upsertProgress(req.params.id, req.userId!, {
    lastPositionSeconds: body.last_position_seconds,
    completed: body.completed,
  });
  res.json(data);
}
