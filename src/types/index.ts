// src/types/index.ts
// ── Tipos globais do KiraWave ─────────────────────────────────────

export type FreqKey = 'alpha' | 'theta' | 'beta' | 'gamma';
export type AmbientKey = 'rain' | 'cafe' | 'space' | 'forest' | 'white';
export type NeuroType =
    | 'adhd'
    | 'creative'
    | 'student'
    | 'professional'
    | 'evening';

export interface SessionRecord {
    id: string;
    duration: number;        // segundos
    freqKey: FreqKey;
    ambKey: AmbientKey;
    startedAt: string;       // ISO string
    completedAt?: string;
}

export interface Preset {
    id: string;
    name: string;
    description: string;
    icon: string;
    freqKey: FreqKey;
    ambKey: AmbientKey;
    bVol: number;            // 0–100
    aVol: number;            // 0–100
    durationSecs: number;
    neuroType?: NeuroType;
}

export interface UserPreferences {
    neuroType: NeuroType | null;
    onboardingDone: boolean;
    activePresetId: string | null;
    lastFreqKey: FreqKey;
    lastAmbKey: AmbientKey;
}

export interface OnboardingAnswer {
    questionId: string;
    value: string;
}
