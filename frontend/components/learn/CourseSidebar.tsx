"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSidebarStore } from "@/store/sidebarStore";

function LockIcon({ locked }: { locked: boolean }) {
  if (!locked) {
    return (
      <span className="text-accent" title="Unlocked">
        ●
      </span>
    );
  }
  return (
    <span className="text-zinc-300" title="Locked">
      ●
    </span>
  );
}

export function CourseSidebar() {
  const params = useParams<{ subjectId: string }>();
  const subjectId = params.subjectId;
  const { subjectTitle, sections } = useSidebarStore();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-black/5 bg-white md:block">
      <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto px-3 py-5">
        <p className="label mb-1 px-2">Course</p>
        <h2 className="px-2 text-sm font-semibold text-black">{subjectTitle ?? "…"}</h2>
        <nav className="mt-5 space-y-5">
          {sections.map((section) => (
            <div key={section.id}>
              <p className="label mb-1 px-2 !normal-case !tracking-normal">{section.title}</p>
              <ul className="mt-1 space-y-0.5">
                {section.videos.map((v) => (
                  <li key={v.id}>
                    <Link
                      href={`/learn/${subjectId}/video/${v.id}`}
                      className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-black transition hover:bg-black/[0.04]"
                    >
                      <LockIcon locked={v.locked} />
                      <span className="flex-1 truncate">{v.title}</span>
                      {v.is_completed ? (
                        <span className="text-xs font-medium text-emerald-600">Done</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
