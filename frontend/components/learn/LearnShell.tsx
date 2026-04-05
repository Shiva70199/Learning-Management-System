"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/store/authStore";
import { useSidebarStore, type TreeSection } from "@/store/sidebarStore";
import { NavBar } from "@/components/NavBar";
import { isAuthReady } from "@/lib/auth-ready";
import { CourseSidebar } from "./CourseSidebar";
import { MobileOutline } from "./MobileOutline";

type TreeResponse = {
  subject: { id: string; title: string; description: string | null };
  sections: TreeSection[];
};

export function LearnShell({
  subjectId,
  children,
}: {
  subjectId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, hydrated, accessToken } = useAuthStore();
  const authReady = isAuthReady({ hydrated, user, accessToken });
  const setTree = useSidebarStore((s) => s.setTree);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<TreeResponse>(`/api/subjects/${subjectId}/tree`);
        if (cancelled) return;
        setTree({
          subjectId: res.data.subject.id,
          subjectTitle: res.data.subject.title,
          sections: res.data.sections,
        });
        setError(null);
      } catch (e: unknown) {
        if (cancelled) return;
        const status = (e as { response?: { status?: number } }).response?.status;
        if (status === 403) {
          setError("You are not enrolled in this subject.");
        } else if (status === 404) {
          setError("Subject not found.");
        } else {
          setError(getApiErrorMessage(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, user, subjectId, router, setTree]);

  if (!authReady) {
    return (
      <>
        <NavBar />
        <div className="p-6 text-sm text-ink-muted">Checking sign-in…</div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <>
        <NavBar />
        <main className="mx-auto max-w-lg px-4 py-10">
          <div className="card">
            <p className="text-sm text-red-600">{error}</p>
            <button type="button" className="btn-secondary mt-4 !text-sm" onClick={() => router.push("/subjects")}>
              Back to catalog
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <MobileOutline />
      <div className="mx-auto flex max-w-6xl">
        <CourseSidebar />
        <div className="min-w-0 flex-1 bg-cream/30">{children}</div>
      </div>
    </>
  );
}
