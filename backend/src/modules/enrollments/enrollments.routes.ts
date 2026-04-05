import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { enroll, mine } from "./enrollments.controller.js";

const r = Router();

r.post("/", requireAuth, asyncHandler(enroll));
r.get("/me", requireAuth, asyncHandler(mine));

export const enrollmentsRouter = r;
