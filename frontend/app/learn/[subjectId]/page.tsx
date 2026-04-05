"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSidebarStore } from "@/store/sidebarStore";

export default function LearnSubjectHomePage() {
  const params = useParams<{ subjectId: string }>();
  const { sections, subjectTitle } = useSidebarStore();

  const firstVideoId = sections.flatMap((s) => s.videos).find((v) => !v.locked)?.id;

  return (
    <main className="px-4 py-8 md:px-8 md:py-10">
      <p className="label mb-2">Overview</p>
      <h1 className="text-2xl font-bold tracking-tight text-black">{subjectTitle ?? "Course"}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
        Lessons unlock in order. Your progress saves automatically while you watch.
      </p>
      {firstVideoId ? (
        <Link
          href={`/learn/${params.subjectId}/video/${firstVideoId}`}
          className="btn-primary mt-8 inline-flex"
        >
          Start learning
        </Link>
      ) : (
        <p className="mt-8 text-sm text-ink-muted">No videos available yet.</p>
      )}
    </main>
  );
}
