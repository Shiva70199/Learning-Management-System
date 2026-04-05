import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { sentiment } from "./ai.controller.js";

const r = Router();

r.post("/sentiment", requireAuth, asyncHandler(sentiment));

export const aiRouter = r;
