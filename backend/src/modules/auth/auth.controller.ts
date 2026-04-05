import type { Request, Response } from "express";
import { z } from "zod";
import {
  getRefreshCookieName,
  getRefreshCookieOptions,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from "./auth.service.js";

const registerSchema = z
  .object({
    email: z.string().trim().pipe(z.string().email()),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().max(120).optional(),
  })
  .transform((data) => ({
    email: data.email.toLowerCase(),
    password: data.password,
    name: data.name?.trim() ? data.name.trim() : undefined,
  }));

const loginSchema = z
  .object({
    email: z.string().trim().pipe(z.string().email()),
    password: z.string().min(1),
  })
  .transform((data) => ({
    email: data.email.toLowerCase(),
    password: data.password,
  }));

export async function register(req: Request, res: Response): Promise<void> {
  const body = registerSchema.parse(req.body);
  const { accessToken, refreshToken, userId, email } = await registerUser(
    body.email,
    body.password,
    body.name
  );
  res.cookie(getRefreshCookieName(), refreshToken, getRefreshCookieOptions());
  res.status(201).json({
    accessToken,
    user: { id: userId, email },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body);
  const { accessToken, refreshToken, userId, email } = await loginUser(body.email, body.password);
  res.cookie(getRefreshCookieName(), refreshToken, getRefreshCookieOptions());
  res.json({
    accessToken,
    user: { id: userId, email },
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const raw = req.cookies?.[getRefreshCookieName()] as string | undefined;
  const { accessToken, refreshToken, userId, email } = await refreshSession(raw);
  res.cookie(getRefreshCookieName(), refreshToken, getRefreshCookieOptions());
  res.json({
    accessToken,
    user: { id: userId, email },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const raw = req.cookies?.[getRefreshCookieName()] as string | undefined;
  await logoutUser(raw);
  res.clearCookie(getRefreshCookieName(), { path: "/" });
  res.status(204).send();
}
