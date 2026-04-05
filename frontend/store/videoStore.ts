import { create } from "zustand";

export type VideoDetail = {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  subject_id: string;
  previous_video_id: string | null;
  next_video_id: string | null;
  locked: boolean;
  duration_seconds: number | null;
};

type VideoState = {
  current: VideoDetail | null;
  setCurrent: (v: VideoDetail | null) => void;
};

export const useVideoStore = create<VideoState>((set) => ({
  current: null,
  setCurrent: (v) => set({ current: v }),
}));
