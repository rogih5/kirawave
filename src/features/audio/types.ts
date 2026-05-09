// src/features/audio/types.ts
import type { AmbientKey, FreqKey } from '../../types';
import type { AmbientConfig } from '../../../services/themes/tokens';

export interface IAudioEngine {
    boot(): void;
    suspend(): void;
    resume(): void;
    dispose(): void;
    setBinauralFreq(hz: number): void;
    setBinauralVolume(vol: number): void;
    setAmbient(amb: AmbientConfig, vol: number): void;
    setAmbientVolume(vol: number): void;
    getFFTData(): Float32Array | null;
    isRunning(): boolean;
}

export type MusicLayer = 'lofi' | 'ambient' | 'nature' | 'silence';

export interface AudioState {
    freqKey: FreqKey;
    ambKey: AmbientKey;
    bVol: number;
    aVol: number;
    audioOn: boolean;
}
