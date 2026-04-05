import { create } from "zustand";

export type TreeVideo = {
  id: string;
  title: string;
  order: number;
  youtube_url: string;
  locked: boolean;
  is_completed: boolean;
  last_position_seconds: number;
};

export type TreeSection = {
  id: string;
  title: string;
  order: number;
  videos: TreeVideo[];
};

type SidebarState = {
  subjectId: string | null;
  subjectTitle: string | null;
  sections: TreeSection[];
  setTree: (payload: {
    subjectId: string;
    subjectTitle: string;
    sections: TreeSection[];
  }) => void;
  clear: () => void;
};

export const useSidebarStore = create<SidebarState>((set) => ({
  subjectId: null,
  subjectTitle: null,
  sections: [],
  setTree: ({ subjectId, subjectTitle, sections }) =>
    set({ subjectId, subjectTitle, sections }),
  clear: () => set({ subjectId: null, subjectTitle: null, sections: [] }),
}));
