"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSidebarStore } from "@/store/sidebarStore";

export function MobileOutline() {
  const params = useParams<{ subjectId: string }>();
  const { sections } = useSidebarStore();
  if (sections.length === 0) return null;

  return (
    <div className="border-b border-black/5 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
      <p className="label mb-2">Lessons</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.flatMap((s) =>
          s.videos.map((v) => (
            <Link
              key={v.id}
              href={`/learn/${params.subjectId}/video/${v.id}`}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                v.locked
                  ? "border-black/10 text-zinc-400"
                  : "border-black/10 text-black hover:bg-black/[0.04]"
              }`}
            >
              {v.title}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
