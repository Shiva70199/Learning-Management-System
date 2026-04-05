import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { list, tree } from "./subjects.controller.js";

const r = Router();

r.get("/", requireAuth, asyncHandler(list));
r.get("/:id/tree", requireAuth, asyncHandler(tree));

export const subjectsRouter = r;
