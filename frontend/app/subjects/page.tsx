"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/store/authStore";
import { NavBar } from "@/components/NavBar";
import { isAuthReady } from "@/lib/auth-ready";

type Subject = {
  id: string;
  title: string;
  description: string | null;
};

const isDev = process.env.NODE_ENV === "development";

export default function SubjectsPage() {
  const router = useRouter();
  const { user, hydrated, accessToken } = useAuthStore();
  const authReady = isAuthReady({ hydrated, user, accessToken });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setMsg(null);

    (async () => {
      try {
        if (isDev) console.debug("[LMS] Fetching subjects + enrollments…");
        const [sRes, eRes] = await Promise.all([
          api.get<{ subjects: Subject[] }>("/api/subjects"),
          api.get<{ enrollments: { subjectId: string }[] }>("/api/enrollments/me"),
        ]);
        if (cancelled) return;
        if (isDev) {
          console.debug("[LMS] Subjects response:", sRes.data);
          console.debug("[LMS] Enrollments response:", eRes.data);
        }
        const list = Array.isArray(sRes.data?.subjects) ? sRes.data.subjects : [];
        setSubjects(list);
        setEnrolled(new Set((eRes.data?.enrollments ?? []).map((e) => e.subjectId)));
        if (list.length === 0 && isDev) {
          console.warn("[LMS] Subjects list is empty — run `npx prisma db seed` on the backend if you expect courses.");
        }
      } catch (err) {
        if (!cancelled) {
          const message = getApiErrorMessage(err);
          setMsg(message);
          if (isDev) console.error("[LMS] Subjects fetch failed:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, user, router]);

  async function enroll(subjectId: string) {
    setMsg(null);
    try {
      await api.post("/api/enrollments", { subjectId });
      setEnrolled((prev) => new Set(prev).add(subjectId));
    } catch (err) {
      setMsg(getApiErrorMessage(err));
    }
  }

  if (!authReady) {
    return (
      <>
        <NavBar />
        <p className="p-6 text-sm text-ink-muted">Checking sign-in…</p>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <NavBar />
        <p className="p-6 text-sm text-ink-muted">Redirecting to login…</p>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="label mb-2">Catalog</p>
        <h1 className="text-3xl font-bold tracking-tight text-black">Subjects</h1>
        <p className="mt-2 text-sm text-ink-muted">Enroll to unlock the structured lesson path.</p>
        {msg ? (
          <div className="card mt-4 border-red-200/80 bg-red-50/90 !p-4">
            <p className="text-sm font-medium text-red-800">Could not load catalog</p>
            <p className="mt-1 text-sm text-red-700">{msg}</p>
          </div>
        ) : null}
        {loading ? (
          <p className="mt-8 text-sm text-ink-muted">Loading catalog…</p>
        ) : msg ? null : subjects.length === 0 ? (
          <div className="card mt-8 !p-6">
            <p className="text-sm font-medium text-black">No subjects yet</p>
            <p className="mt-2 text-sm text-ink-muted">
              Seed the database from the backend:{" "}
              <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">npx prisma db seed</code>
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {subjects.map((s) => {
              const isEnrolled = enrolled.has(s.id);
              return (
                <li key={s.id} className="card !p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-black">{s.title}</h2>
                      {s.description ? (
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{s.description}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {isEnrolled ? (
                        <Link href={`/learn/${s.id}`} className="btn-primary !px-5 !py-2">
                          Open course
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void enroll(s.id)}
                          className="btn-secondary !px-5 !py-2"
                        >
                          Enroll
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
