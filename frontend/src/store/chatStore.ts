import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ChatState = {
  sessionId: string | null;
  setSessionId: (sessionId: string | null) => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      sessionId: null,
      setSessionId: (sessionId) => set({ sessionId }),
    }),
    {
      name: 'chat-session',
      partialize: (state) => ({ sessionId: state.sessionId }),
    },
  ),
);
