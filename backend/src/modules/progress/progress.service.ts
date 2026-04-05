import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/error.middleware.js";
import { buildOrderedVideoList, isLocked } from "../../utils/video-order.js";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export async function getProgress(videoId: string, userId: string) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: { section: true },
  });
  if (!video) throw new AppError(404, "Video not found");
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_subjectId: { userId, subjectId: video.section.subjectId },
    },
  });
  if (!enrollment) throw new AppError(403, "Not enrolled in this course");

  const row = await prisma.videoProgress.findUnique({
    where: { userId_videoId: { userId, videoId } },
  });
  return {
    video_id: videoId,
    last_position_seconds: row?.lastPositionSeconds ?? 0,
    completed: row?.completed ?? false,
  };
}

export async function upsertProgress(
  videoId: string,
  userId: string,
  input: { lastPositionSeconds?: number; completed?: boolean }
) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      section: {
        include: {
          subject: { include: { sections: { include: { videos: true } } } },
        },
      },
    },
  });
  if (!video) throw new AppError(404, "Video not found");

  const subjectId = video.section.subject.id;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_subjectId: { userId, subjectId } },
  });
  if (!enrollment) throw new AppError(403, "Not enrolled in this course");

  const ordered = buildOrderedVideoList(video.section.subject.sections);
  const progressRows = await prisma.videoProgress.findMany({
    where: { userId, videoId: { in: ordered.map((v) => v.id) } },
  });
  const completedSet = new Set(
    progressRows.filter((p) => p.completed).map((p) => p.videoId)
  );

  if (isLocked(videoId, ordered, completedSet)) {
    throw new AppError(403, "Video is locked until previous lessons are completed");
  }

  const maxPos =
    video.durationSeconds != null && video.durationSeconds > 0
      ? video.durationSeconds
      : 86_400;

  const existing = await prisma.videoProgress.findUnique({
    where: { userId_videoId: { userId, videoId } },
  });

  let completed = existing?.completed ?? false;
  let lastPositionSeconds = existing?.lastPositionSeconds ?? 0;

  if (input.completed === true) {
    completed = true;
    lastPositionSeconds = maxPos;
  } else if (input.completed === false) {
    completed = false;
  }

  if (input.lastPositionSeconds !== undefined) {
    const raw = Math.floor(Number(input.lastPositionSeconds));
    if (!Number.isFinite(raw) || raw < 0) {
      throw new AppError(400, "Invalid last_position_seconds");
    }
    lastPositionSeconds = clamp(raw, 0, maxPos);
    if (completed) {
      lastPositionSeconds = maxPos;
    }
  }

  const row = await prisma.videoProgress.upsert({
    where: { userId_videoId: { userId, videoId } },
    create: {
      userId,
      videoId,
      lastPositionSeconds,
      completed,
    },
    update: {
      lastPositionSeconds,
      completed,
    },
  });

  return {
    video_id: row.videoId,
    last_position_seconds: row.lastPositionSeconds,
    completed: row.completed,
  };
}
