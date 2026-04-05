import type { Request, Response } from "express";
import { z } from "zod";
import { analyzeSentiment } from "./ai.service.js";

const schema = z.object({
  text: z.string().min(1).max(5000),
});

export async function sentiment(req: Request, res: Response): Promise<void> {
  const { text } = schema.parse(req.body);
  const result = await analyzeSentiment(text);
  res.json({ result });
}
