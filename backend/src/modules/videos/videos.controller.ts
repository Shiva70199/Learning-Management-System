import type { Request, Response } from "express";
import { getVideoForUser } from "./videos.service.js";

export async function getOne(req: Request, res: Response): Promise<void> {
  const data = await getVideoForUser(req.params.id, req.userId!);
  res.json(data);
}
