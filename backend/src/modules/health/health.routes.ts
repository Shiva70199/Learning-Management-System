import { Router } from "express";
import { prisma } from "../../config/database.js";
import { asyncHandler } from "../../utils/async-handler.js";

const r = Router();

r.get(
  "/",
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  })
);

export const healthRouter = r;
