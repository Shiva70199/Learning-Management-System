"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import type { VideoDetail } from "@/store/videoStore";
import { useVideoStore } from "@/store/videoStore";
import { VideoPlayerPanel } from "@/components/learn/VideoPlayerPanel";

type ProgressRes = {
  video_id: string;
  last_position_seconds: number;
  completed: boolean;
};

export default function VideoLessonPage() {
  const params = useParams<{ subjectId: string; videoId: string }>();
  const router = useRouter();
  const setCurrent = useVideoStore((s) => s.setCurrent);
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [progress, setProgress] = useState<ProgressRes | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [vRes, pRes] = await Promise.all([
          api.get<VideoDetail>(`/api/videos/${params.videoId}`),
          api.get<ProgressRes>(`/api/progress/videos/${params.videoId}`),
        ]);
        if (cancelled) return;
        if (vRes.data.subject_id !== params.subjectId) {
          router.replace(`/learn/${vRes.data.subject_id}/video/${params.videoId}`);
          return;
        }
        setVideo(vRes.data);
        setProgress(pRes.data);
        setCurrent(vRes.data);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
      setCurrent(null);
    };
  }, [params.videoId, params.subjectId, router, setCurrent]);

  if (error) {
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="card max-w-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  if (!video || !progress) {
    return (
      <main className="px-4 py-8 md:px-8">
        <p className="text-sm text-ink-muted">Loading lesson…</p>
      </main>
    );
  }

  return (
    <main className="px-4 py-8 md:px-8">
      <p className="label mb-2">Lesson</p>
      <h1 className="text-2xl font-bold tracking-tight text-black">{video.title}</h1>
      {video.description ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{video.description}</p>
      ) : null}
      <div className="mt-8 max-w-4xl">
        <VideoPlayerPanel video={video} initialProgress={progress} />
      </div>
    </main>
  );
}
