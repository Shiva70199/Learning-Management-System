import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/error.middleware.js";
import {
  buildOrderedVideoList,
  getNextVideo,
  getPreviousVideo,
  isLocked,
} from "../../utils/video-order.js";

export async function getVideoForUser(videoId: string, userId: string) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      section: {
        include: {
          subject: {
            include: {
              sections: { include: { videos: true } },
            },
          },
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
    where: {
      userId,
      videoId: { in: ordered.map((v) => v.id) },
    },
  });
  const completedSet = new Set(
    progressRows.filter((p) => p.completed).map((p) => p.videoId)
  );

  const locked = isLocked(videoId, ordered, completedSet);
  const previous_video_id = getPreviousVideo(videoId, ordered);
  const next_video_id = getNextVideo(videoId, ordered);

  return {
    id: video.id,
    title: video.title,
    description: video.description,
    youtube_url: video.youtubeUrl,
    subject_id: subjectId,
    previous_video_id,
    next_video_id,
    locked,
    duration_seconds: video.durationSeconds,
  };
}
