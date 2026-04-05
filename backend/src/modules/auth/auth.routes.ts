import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { login, logout, refresh, register } from "./auth.controller.js";

const r = Router();

r.post("/register", asyncHandler(register));
r.post("/login", asyncHandler(login));
r.post("/refresh", asyncHandler(refresh));
r.post("/logout", requireAuth, asyncHandler(logout));

export const authRouter = r;
