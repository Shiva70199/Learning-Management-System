"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/store/authStore";
import { NavBar } from "@/components/NavBar";
import { isAuthReady } from "@/lib/auth-ready";

export default function AiLabPage() {
  const router = useRouter();
  const { user, hydrated, accessToken } = useAuthStore();
  const authReady = isAuthReady({ hydrated, user, accessToken });
  const [text, setText] = useState("I really enjoyed this lesson!");
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authReady && !user) router.replace("/login");
  }, [authReady, user, router]);

  async function run() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post<{ result: unknown }>("/api/ai/sentiment", { text });
      setResult(res.data.result);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (!authReady || !user) {
    return (
      <>
        <NavBar />
        <p className="p-6 text-sm text-ink-muted">Checking sign-in…</p>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="label mb-2">Optional</p>
        <h1 className="text-3xl font-bold tracking-tight text-black">AI sentiment</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Hugging Face inference. Configure{" "}
          <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">HUGGINGFACE_API_KEY</code> on
          the API.
        </p>
        <div className="card mt-8 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="input-field min-h-[120px] resize-y"
          />
          <button
            type="button"
            disabled={loading || !text.trim()}
            onClick={() => void run()}
            className="btn-primary"
          >
            {loading ? "Analyzing…" : "Analyze"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
        {result != null ? (
          <pre className="card mt-6 overflow-x-auto !bg-black !p-4 !text-zinc-100">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : null}
      </main>
    </>
  );
}
