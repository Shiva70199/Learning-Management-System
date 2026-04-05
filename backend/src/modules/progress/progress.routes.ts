import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getOne, save } from "./progress.controller.js";

const r = Router();

r.get("/videos/:id", requireAuth, asyncHandler(getOne));
r.post("/videos/:id", requireAuth, asyncHandler(save));

export const progressRouter = r;
