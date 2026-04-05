import crypto from "crypto";

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function randomTokenId(): string {
  return crypto.randomUUID();
}
