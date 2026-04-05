"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/store/authStore";
import { NavBar } from "@/components/NavBar";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ accessToken: string; user: { id: string; email: string } }>(
        "/api/auth/login",
        { email: email.trim(), password },
        { skipAuth: true }
      );
      setSession(res.data.accessToken, res.data.user);
      router.push("/subjects");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-md px-4 py-14">
        <div className="card !p-8">
          <p className="label mb-2">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight text-black">Log in</h1>
          <p className="mt-1 text-sm text-ink-muted">Access your enrolled courses.</p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label mb-1.5 block" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label mb-1.5 block" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Continue"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-muted">
            No account?{" "}
            <Link href="/register" className="link-brand">
              Register
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
