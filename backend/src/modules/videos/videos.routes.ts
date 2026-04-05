import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getOne } from "./videos.controller.js";

const r = Router();

r.get("/:id", requireAuth, asyncHandler(getOne));

export const videosRouter = r;
