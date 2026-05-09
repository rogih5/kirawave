// src/store/useAudioStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FreqKey, AmbientKey } from '../types';

interface AudioStoreState {
    freqKey: FreqKey;
    ambKey: AmbientKey;
    bVol: number;
    aVol: number;
    audioOn: boolean;
    // Actions
    setFreq: (key: FreqKey) => void;
    setAmb: (key: AmbientKey) => void;
    setBVol: (vol: number) => void;
    setAVol: (vol: number) => void;
    setAudioOn: (on: boolean) => void;
}

export const useAudioStore = create<AudioStoreState>()(
    persist(
        (set) => ({
            freqKey: 'alpha',
            ambKey: 'rain',
            bVol: 70,
            aVol: 45,
            audioOn: false,

            setFreq: (freqKey) => set({ freqKey }),
            setAmb: (ambKey) => set({ ambKey }),
            setBVol: (bVol) => set({ bVol }),
            setAVol: (aVol) => set({ aVol }),
            setAudioOn: (audioOn) => set({ audioOn }),
        }),
        {
            name: 'kirawave-audio',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s) => ({
                freqKey: s.freqKey,
                ambKey: s.ambKey,
                bVol: s.bVol,
                aVol: s.aVol,
            }),
        }
    )
);
