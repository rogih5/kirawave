import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PremiumState {
    isPremium: boolean;
    plan: 'monthly' | 'annual' | null;
    expiresAt: string | null;
    setPremium: (plan: 'monthly' | 'annual', expiresAt: string) => void;
    clearPremium: () => void;
    checkExpiry: () => void;
}

export const usePremiumStore = create<PremiumState>()(
    persist(
        (set, get) => ({
            isPremium: false,
            plan: null,
            expiresAt: null,

            setPremium: (plan, expiresAt) =>
                set({ isPremium: true, plan, expiresAt }),

            clearPremium: () =>
                set({ isPremium: false, plan: null, expiresAt: null }),

            checkExpiry: () => {
                const { expiresAt, isPremium } = get();
                if (isPremium && expiresAt && new Date(expiresAt) < new Date()) {
                    set({ isPremium: false, plan: null, expiresAt: null });
                }
            },
        }),
        {
            name: 'kirawave-premium',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
