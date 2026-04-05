import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { me } from "./users.controller.js";

const r = Router();

r.get("/me", requireAuth, asyncHandler(me));

export const usersRouter = r;
