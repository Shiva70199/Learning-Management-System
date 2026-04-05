import { env } from "../../config/env.js";
import { AppError } from "../../middleware/error.middleware.js";

/** Legacy endpoint returns 410; HF router uses `/hf-inference/models/{model}`. */
const HF_MODEL = "distilbert-base-uncased-finetuned-sst-2-english";
const HF_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;

export async function analyzeSentiment(text: string): Promise<unknown> {
  if (!env.HUGGINGFACE_API_KEY) {
    throw new AppError(503, "AI service not configured (set HUGGINGFACE_API_KEY)");
  }
  const res = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text.slice(0, 2000) }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new AppError(502, `Hugging Face error: ${res.status} ${errText.slice(0, 280)}`);
  }
  return res.json() as Promise<unknown>;
}
