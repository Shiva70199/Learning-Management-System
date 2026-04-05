import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/error.middleware.js";
import { buildOrderedVideoList, isLocked } from "../../utils/video-order.js";

export async function listSubjects() {
  return prisma.subject.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
    },
  });
}

export async function getSubjectTreeForUser(subjectId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_subjectId: { userId, subjectId } },
  });
  if (!enrollment) throw new AppError(403, "Not enrolled in this subject");

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      sections: {
        include: { videos: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
  });
  if (!subject) throw new AppError(404, "Subject not found");

  const ordered = buildOrderedVideoList(subject.sections);
  const videoIds = ordered.map((v) => v.id);
  const progressRows = await prisma.videoProgress.findMany({
    where: { userId, videoId: { in: videoIds } },
  });
  const completedSet = new Set(
    progressRows.filter((p) => p.completed).map((p) => p.videoId)
  );
  const progressByVideo = new Map(progressRows.map((p) => [p.videoId, p]));

  const sectionsOut = subject.sections
    .slice()
    .sort((a, b) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime())
    .map((section) => ({
      id: section.id,
      title: section.title,
      order: section.order,
      videos: section.videos
        .slice()
        .sort((a, b) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime())
        .map((video) => {
          const locked = isLocked(video.id, ordered, completedSet);
          const prog = progressByVideo.get(video.id);
          return {
            id: video.id,
            title: video.title,
            order: video.order,
            youtube_url: video.youtubeUrl,
            locked,
            is_completed: prog?.completed ?? false,
            last_position_seconds: prog?.lastPositionSeconds ?? 0,
          };
        }),
    }));

  return {
    subject: {
      id: subject.id,
      title: subject.title,
      description: subject.description,
    },
    sections: sectionsOut,
  };
}
