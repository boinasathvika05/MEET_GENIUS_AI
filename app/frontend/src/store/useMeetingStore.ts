import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APIResponse } from "@/types";

export interface SavedMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  processingTimeMs: number;
  rawTranscript: string;
  results: APIResponse;
  favorite: boolean;
  createdAt: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: number;
}

interface MeetingStore {
  meetings: SavedMeeting[];
  draftTranscript: string;
  activities: ActivityLog[];
  
  // Actions
  setDraft: (transcript: string) => void;
  saveMeeting: (meeting: Omit<SavedMeeting, "id" | "createdAt" | "favorite">) => void;
  deleteMeeting: (id: string) => void;
  toggleFavorite: (id: string) => void;
  renameMeeting: (id: string, newTitle: string) => void;
  clearHistory: () => void;
  logActivity: (action: string) => void;
}

export const useMeetingStore = create<MeetingStore>()(
  persist(
    (set) => ({
      meetings: [],
      draftTranscript: "",
      activities: [],

      setDraft: (transcript) => set({ draftTranscript: transcript }),

      saveMeeting: (meeting) => set((state) => {
        const newMeeting: SavedMeeting = {
          ...meeting,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          favorite: false,
        };
        const newActivity = {
          id: crypto.randomUUID(),
          action: `Saved meeting: ${meeting.title}`,
          timestamp: Date.now()
        };
        return { 
          meetings: [newMeeting, ...state.meetings],
          activities: [newActivity, ...state.activities].slice(0, 50)
        };
      }),

      deleteMeeting: (id) => set((state) => ({
        meetings: state.meetings.filter((m) => m.id !== id),
      })),

      toggleFavorite: (id) => set((state) => ({
        meetings: state.meetings.map((m) => 
          m.id === id ? { ...m, favorite: !m.favorite } : m
        ),
      })),

      renameMeeting: (id, newTitle) => set((state) => ({
        meetings: state.meetings.map((m) =>
          m.id === id ? { ...m, title: newTitle } : m
        ),
      })),

      clearHistory: () => set({ meetings: [], activities: [] }),
      
      logActivity: (action) => set((state) => ({
        activities: [{ id: crypto.randomUUID(), action, timestamp: Date.now() }, ...state.activities].slice(0, 50)
      }))
    }),
    {
      name: "meetgenius-storage",
    }
  )
);
