"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import YouTube, { type YouTubeProps } from "react-youtube";
import { api } from "@/lib/api";
import { extractYoutubeId } from "@/lib/youtube";
import type { VideoDetail } from "@/store/videoStore";

type ProgressState = {
  last_position_seconds: number;
  completed: boolean;
};

export function VideoPlayerPanel({
  video,
  initialProgress,
}: {
  video: VideoDetail;
  initialProgress: ProgressState;
}) {
  const router = useRouter();
  const [player, setPlayer] = useState<{
    getCurrentTime: () => number;
    seekTo: (s: number, allowSeekAhead?: boolean) => void;
  } | null>(null);
  const lastSentRef = useRef(initialProgress.last_position_seconds);
  const playingRef = useRef(false);
  const videoId = extractYoutubeId(video.youtube_url);

  const savePosition = useCallback(
    async (seconds: number) => {
      if (video.locked) return;
      const t = Math.max(0, Math.floor(seconds));
      try {
        await api.post(`/api/progress/videos/${video.id}`, {
          last_position_seconds: t,
        });
        lastSentRef.current = t;
      } catch {
        /* network failure — will retry on next tick */
      }
    },
    [video.id, video.locked]
  );

  const markComplete = useCallback(async () => {
    if (video.locked) return;
    try {
      await api.post(`/api/progress/videos/${video.id}`, { completed: true });
    } catch {
      /* ignore */
    }
  }, [video.id, video.locked]);

  const onReady: YouTubeProps["onReady"] = (e) => {
    const p = e.target as {
      getCurrentTime: () => number;
      seekTo: (s: number, allowSeekAhead?: boolean) => void;
    };
    setPlayer(p);
    const start = initialProgress.completed
      ? 0
      : Math.min(
          initialProgress.last_position_seconds,
          (video.duration_seconds ?? 1_000_000) - 1
        );
    if (start > 0 && !initialProgress.completed) {
      p.seekTo(start, true);
    }
  };

  const onStateChange: YouTubeProps["onStateChange"] = (e) => {
    playingRef.current = e.data === 1;
  };

  useEffect(() => {
    if (!player || video.locked) return;
    const id = window.setInterval(() => {
      if (!playingRef.current) return;
      const t = player.getCurrentTime();
      if (!Number.isFinite(t)) return;
      const sec = Math.floor(t);
      if (Math.abs(sec - lastSentRef.current) < 2) return;
      void savePosition(sec);
    }, 5000);
    return () => window.clearInterval(id);
  }, [player, savePosition, video.locked]);

  useEffect(() => {
    return () => {
      if (video.locked || !player) return;
      try {
        const t = Math.floor(player.getCurrentTime());
        if (Number.isFinite(t) && t > 0) {
          void savePosition(t);
        }
      } catch {
        /* player may be destroyed */
      }
    };
  }, [player, savePosition, video.locked]);

  async function onEnd() {
    await markComplete();
    if (video.next_video_id) {
      router.push(`/learn/${video.subject_id}/video/${video.next_video_id}`);
    }
  }

  if (!videoId) {
    return (
      <div className="card border-amber-200/60 bg-amber-50/80 text-sm text-amber-950">
        This lesson has an invalid YouTube URL. Please contact support.
      </div>
    );
  }

  if (video.locked) {
    return (
      <div className="card text-sm leading-relaxed text-ink-muted">
        This lesson is locked. Complete the previous video to unlock it.
      </div>
    );
  }

  const opts: YouTubeProps["opts"] = {
    width: "100%",
    height: "100%",
    playerVars: {
      rel: 0,
      modestbranding: 1,
    },
  };

  return (
    <div className="space-y-5">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-black shadow-soft">
        <YouTube
          videoId={videoId}
          opts={opts}
          className="absolute inset-0 h-full w-full"
          iframeClassName="h-full w-full"
          onReady={onReady}
          onStateChange={onStateChange}
          onEnd={() => void onEnd()}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {video.previous_video_id ? (
          <button
            type="button"
            className="btn-secondary !px-4 !py-2 !text-sm"
            onClick={() =>
              router.push(`/learn/${video.subject_id}/video/${video.previous_video_id}`)
            }
          >
            Previous
          </button>
        ) : null}
        {video.next_video_id ? (
          <button
            type="button"
            className="btn-secondary !px-4 !py-2 !text-sm"
            onClick={() =>
              router.push(`/learn/${video.subject_id}/video/${video.next_video_id}`)
            }
          >
            Next
          </button>
        ) : null}
      </div>
    </div>
  );
}
