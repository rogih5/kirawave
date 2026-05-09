// src/store/useSessionStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SESSION_SECS } from '../../services/themes/tokens';
import type { SessionRecord, FreqKey, AmbientKey } from '../types';

interface SessionState {
    rem: number;
    running: boolean;
    elapsed: number;
    done: boolean;
    sessions: SessionRecord[];
    customDuration: number;
    // Actions
    tick: () => void;
    start: () => void;
    pause: () => void;
    reset: () => void;
    skip: () => void;
    addSession: (s: SessionRecord) => void;
    setCustomDuration: (secs: number) => void;
    clearSessions: () => void;
}

export const useSessionStore = create<SessionState>()(
    persist(
        (set, get) => ({
            rem: DEFAULT_SESSION_SECS,
            running: false,
            elapsed: 0,
            done: false,
            sessions: [],
            customDuration: DEFAULT_SESSION_SECS,

            tick: () =>
                set((s) => {
                    if (s.rem <= 1) return { rem: 0, running: false, done: true, elapsed: s.elapsed + 1 };
                    return { rem: s.rem - 1, elapsed: s.elapsed + 1 };
                }),

            start: () => {
                const { rem, reset } = get();
                if (rem === 0) reset();
                set({ running: true });
            },

            pause: () => set({ running: false }),

            reset: () =>
                set((s) => ({
                    rem: s.customDuration,
                    running: false,
                    elapsed: 0,
                    done: false,
                })),

            skip: () =>
                set((s) => ({
                    elapsed: s.rem,
                    rem: 0,
                    running: false,
                    done: true,
                })),

            addSession: (s) =>
                set((state) => ({
                    sessions: [s, ...state.sessions].slice(0, 10),
                })),

            setCustomDuration: (secs) =>
                set({ customDuration: secs, rem: secs, elapsed: 0, done: false }),

            clearSessions: () => set({ sessions: [] }),
        }),
        {
            name: 'kirawave-session',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s) => ({ sessions: s.sessions, customDuration: s.customDuration }),
        }
    )
);
