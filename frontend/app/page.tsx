import Link from "next/link";
import { NavBar } from "@/components/NavBar";

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-12">
          <div>
            <p className="label mb-3">Learning paths</p>
            <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-ink md:text-[2.65rem]">
              Build skills in a fixed order—so every lesson has a clear prerequisite.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted">
              Courses, sections, and videos unlock in sequence. Progress and resume positions sync to your account;
              refresh tokens stay in an HTTP-only cookie.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/subjects" className="btn-primary">
                Open catalog
              </Link>
              <Link href="/register" className="btn-secondary">
                Create an account
              </Link>
            </div>
          </div>
          <div
            className="hidden h-full min-h-[200px] w-1 rounded-full bg-gradient-to-b from-accent-light via-accent to-teal-900/40 md:block"
            aria-hidden
          />
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-5 md:grid-cols-3">
          {[
            {
              k: "Ordered curriculum",
              t: "You complete videos in a defined sequence—no skipping ahead until the prior lesson is done.",
            },
            {
              k: "Resume playback",
              t: "Pick up from your last timestamp; completion is stored when you finish a video.",
            },
            {
              k: "Quiet interface",
              t: "Neutral canvas and typography so attention stays on the lesson, not the chrome.",
            },
          ].map((f) => (
            <div key={f.k} className="card !p-5 text-left">
              <p className="mb-2 text-sm font-bold text-ink">{f.k}</p>
              <p className="text-sm leading-relaxed text-ink-muted">{f.t}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
