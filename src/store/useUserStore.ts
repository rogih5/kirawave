// src/store/useUserStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NeuroType, UserPreferences } from '../types';

interface UserStoreState {
    uid: string | null;
    email: string | null;
    displayName: string | null;
    loading: boolean;
    // Computed
    onboardingDone: boolean;
    neuroType: NeuroType | null;
    syncCount: number;
    // Actions
    setUser: (user: { uid: string; email: string | null; displayName: string | null } | null) => void;
    setLoading: (loading: boolean) => void;
    completeOnboarding: (neuroType: NeuroType) => void;
    resetOnboarding: () => void;
    tickSyncCount: () => void;
    logout: () => void;
}

export const useUserStore = create<UserStoreState>()(
    persist(
        (set) => ({
            uid: null,
            email: null,
            displayName: null,
            loading: false,
            onboardingDone: false,
            neuroType: null,
            syncCount: 2847,

            setUser: (user) =>
                set(
                    user
                        ? { uid: user.uid, email: user.email, displayName: user.displayName, loading: false }
                        : { uid: null, email: null, displayName: null, loading: false }
                ),

            setLoading: (loading) => set({ loading }),

            completeOnboarding: (neuroType) =>
                set({ onboardingDone: true, neuroType }),

            resetOnboarding: () =>
                set({ onboardingDone: false, neuroType: null }),

            tickSyncCount: () =>
                set((s) => ({
                    syncCount: Math.max(2400, Math.min(3500, s.syncCount + Math.floor(Math.random() * 7) - 3)),
                })),

            logout: () =>
                set({ uid: null, email: null, displayName: null }),
        }),
        {
            name: 'kirawave-user',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s) => ({
                uid: s.uid,
                email: s.email,
                displayName: s.displayName,
                onboardingDone: s.onboardingDone,
                neuroType: s.neuroType,
            }),
        }
    )
);
