import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/error.middleware.js";

export async function me(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!user) throw new AppError(404, "User not found");
  res.json({ user });
}
