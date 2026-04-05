import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type AccessPayload = { sub: string; email: string };

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload & jwt.JwtPayload;
  return { sub: decoded.sub, email: decoded.email };
}

export function signRefreshToken(payload: { sub: string; jti: string }): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.REFRESH_TOKEN_EXPIRES_DAYS}d`,
  } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): { sub: string; jti: string } {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
    sub: string;
    jti: string;
  } & jwt.JwtPayload;
  return { sub: decoded.sub, jti: decoded.jti };
}
