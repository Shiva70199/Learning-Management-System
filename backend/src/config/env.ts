import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRES: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(30),
  /** Comma-separated list, e.g. `http://localhost:3000,http://127.0.0.1:3000` */
  CLIENT_ORIGIN: z
    .string()
    .min(1)
    .default("http://localhost:3000")
    .transform((raw) =>
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.string().url()).min(1)),
  HUGGINGFACE_API_KEY: z.string().optional().default(""),
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  /** Allowed browser origins for CORS (credentials). */
  clientOrigins: parsed.CLIENT_ORIGIN,
};
