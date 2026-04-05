import type { Request, Response } from "express";
import { getSubjectTreeForUser, listSubjects } from "./subjects.service.js";

export async function list(_req: Request, res: Response): Promise<void> {
  const subjects = await listSubjects();
  res.json({ subjects });
}

export async function tree(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { id } = req.params;
  const data = await getSubjectTreeForUser(id, userId);
  res.json(data);
}
