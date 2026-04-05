import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { randomTokenId, hashToken } from "../../utils/token-hash.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { AppError } from "../../middleware/error.middleware.js";

const COOKIE_NAME = "refresh_token";

export function getRefreshCookieName(): string {
  return COOKIE_NAME;
}

export function getRefreshCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  maxAge: number;
  path: string;
} {
  const maxAge = env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  };
}

export async function registerUser(email: string, password: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) throw new AppError(409, "Email already registered");
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name: name ?? null,
    },
  });
  return issueTokens(user.id, user.email);
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw new AppError(401, "Invalid email or password");
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new AppError(401, "Invalid email or password");
  return issueTokens(user.id, user.email);
}

async function issueTokens(userId: string, email: string) {
  const accessToken = signAccessToken({ sub: userId, email });
  const jti = randomTokenId();
  const refreshToken = signRefreshToken({ sub: userId, jti });
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);
  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });
  return { accessToken, refreshToken, userId, email };
}

export async function refreshSession(refreshTokenRaw: string | undefined) {
  if (!refreshTokenRaw) throw new AppError(401, "Missing refresh token");
  let payload: { sub: string; jti: string };
  try {
    payload = verifyRefreshToken(refreshTokenRaw);
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }
  const tokenHash = hashToken(refreshTokenRaw);
  const stored = await prisma.refreshToken.findFirst({
    where: {
      userId: payload.sub,
      tokenHash,
      expiresAt: { gt: new Date() },
    },
  });
  if (!stored) throw new AppError(401, "Refresh token revoked or expired");

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new AppError(401, "User not found");

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const jti = randomTokenId();
  const newRefresh = signRefreshToken({ sub: user.id, jti });
  const newHash = hashToken(newRefresh);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: newHash, expiresAt },
  });
  return { accessToken, refreshToken: newRefresh, userId: user.id, email: user.email };
}

export async function logoutUser(refreshTokenRaw: string | undefined) {
  if (!refreshTokenRaw) return;
  try {
    const payload = verifyRefreshToken(refreshTokenRaw);
    const tokenHash = hashToken(refreshTokenRaw);
    await prisma.refreshToken.deleteMany({
      where: { userId: payload.sub, tokenHash },
    });
  } catch {
    /* ignore invalid token on logout */
  }
}
