
export const THEME = {
    // Fundos
    bg: '#0A0F1C',
    surface: '#0D1425',
    card: '#111827',
    // Bordas
    border: '#1E2D45',
    // Cores primárias
    primary: '#22D3EE',
    primaryGlow: '#67E8F9',
    accent: '#A78BFA',
    // Textos
    text: '#F1F5F9',
    muted: '#64748B',
    // Feedback
    success: '#2ecc71',
    error: '#e74c3c',
    warning: '#f0a500',
    // Onda binaural (canvas)
    waveColor: '#22D3EE',
    waveColor2: '#0e7490',
} as const;

export type ThemeTokens = typeof THEME;

// ── Frequências binaurais ─────────────────────────────────────────
export type FreqKey = 'alpha' | 'theta' | 'beta' | 'gamma';

export interface FreqConfig {
    name: string;
    hz: number;
    desc: string;
}

export const FREQS: Record<FreqKey, FreqConfig> = {
    alpha: { name: 'Alpha', hz: 10, desc: 'Foco relaxado · fluxo' },
    theta: { name: 'Theta', hz: 7, desc: 'Meditação · intuição' },
    beta: { name: 'Beta', hz: 18, desc: 'Alerta cognitivo' },
    gamma: { name: 'Gamma', hz: 40, desc: 'Alta performance' },
};

// ── Sons ambiente ─────────────────────────────────────────────────
export type AmbientKey = 'rain' | 'cafe' | 'space' | 'forest' | 'white';

export interface AmbientConfig {
    name: string;
    emoji: string;
    filterType: BiquadFilterType;
    freq: number;
    Q: number;
}

export const AMBIENTS: Record<AmbientKey, AmbientConfig> = {
    rain: { name: 'Chuva', emoji: '🌧', filterType: 'bandpass', freq: 800, Q: 0.8 },
    cafe: { name: 'Café', emoji: '☕', filterType: 'lowpass', freq: 1200, Q: 1.0 },
    space: { name: 'Espaço', emoji: '🌌', filterType: 'lowpass', freq: 200, Q: 2.0 },
    forest: { name: 'Floresta', emoji: '🌿', filterType: 'bandpass', freq: 600, Q: 0.5 },
    white: { name: 'Branco', emoji: '💨', filterType: 'allpass', freq: 1000, Q: 1.0 },
};

// ── Constantes de áudio ───────────────────────────────────────────
export const CARRIER_HZ = 200; // Hz da portadora — mesma nos dois ouvidos

// ── Duração padrão do timer (segundos) ───────────────────────────
export const DEFAULT_SESSION_SECS = 25 * 60;