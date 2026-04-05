import type { Section, Video } from "@prisma/client";

export type VideoWithSectionOrder = Video & { sectionOrder: number };

/** Flat list: sections by `order`, then videos by `order` within each section. */
export function buildOrderedVideoList(
  sections: (Section & { videos: Video[] })[]
): VideoWithSectionOrder[] {
  const sortedSections = [...sections].sort((a, b) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime());
  const out: VideoWithSectionOrder[] = [];
  for (const s of sortedSections) {
    const vids = [...s.videos].sort((a, b) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime());
    for (const v of vids) {
      out.push({ ...v, sectionOrder: s.order });
    }
  }
  return out;
}

export function getPreviousVideo(
  videoId: string,
  ordered: VideoWithSectionOrder[]
): string | null {
  const idx = ordered.findIndex((v) => v.id === videoId);
  if (idx <= 0) return null;
  return ordered[idx - 1]!.id;
}

export function getNextVideo(
  videoId: string,
  ordered: VideoWithSectionOrder[]
): string | null {
  const idx = ordered.findIndex((v) => v.id === videoId);
  if (idx < 0 || idx >= ordered.length - 1) return null;
  return ordered[idx + 1]!.id;
}

/** First video in course order is always unlocked; else previous must be completed. */
export function isLocked(
  videoId: string,
  ordered: VideoWithSectionOrder[],
  completedVideoIds: Set<string>
): boolean {
  if (ordered.length === 0) return true;
  const idx = ordered.findIndex((v) => v.id === videoId);
  if (idx < 0) return true;
  if (idx === 0) return false;
  const prevId = ordered[idx - 1]!.id;
  return !completedVideoIds.has(prevId);
}
