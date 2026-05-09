// src/store/usePresetsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PRESETS, PRESET_BY_NEURO } from '../features/presets/defaultPresets';
import { useAudioStore } from './useAudioStore';
import { useSessionStore } from './useSessionStore';
import type { Preset, NeuroType } from '../types';

interface PresetsStoreState {
    presets: Preset[];
    activePresetId: string | null;
    // Actions
    applyPreset: (id: string) => void;
    applyPresetForNeuroType: (neuroType: NeuroType) => void;
    setActivePreset: (id: string | null) => void;
}

export const usePresetsStore = create<PresetsStoreState>()(
    persist(
        (set, get) => ({
            presets: DEFAULT_PRESETS,
            activePresetId: null,

            applyPreset: (id) => {
                const preset = get().presets.find((p) => p.id === id);
                if (!preset) return;

                const audioStore = useAudioStore.getState();
                const sessionStore = useSessionStore.getState();

                audioStore.setFreq(preset.freqKey);
                audioStore.setAmb(preset.ambKey);
                audioStore.setBVol(preset.bVol);
                audioStore.setAVol(preset.aVol);
                sessionStore.setCustomDuration(preset.durationSecs);

                set({ activePresetId: id });
            },

            applyPresetForNeuroType: (neuroType) => {
                const presetId = PRESET_BY_NEURO[neuroType];
                if (presetId) get().applyPreset(presetId);
            },

            setActivePreset: (id) => set({ activePresetId: id }),
        }),
        {
            name: 'kirawave-presets',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s) => ({ activePresetId: s.activePresetId }),
        }
    )
);
