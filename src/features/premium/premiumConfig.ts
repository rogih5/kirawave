import type { FreqKey, AmbientKey } from '../../types';

export const FREE_FREQS: FreqKey[] = ['alpha'];
export const FREE_AMBIENTS: AmbientKey[] = ['rain'];
// All presets require premium (they use premium freqs/ambients)
export const FREE_SESSION_HISTORY_LIMIT = 3;

export const PREMIUM_PLANS = {
    monthly: {
        id: 'monthly' as const,
        label: 'Mensal',
        price: 'R$ 19,90',
        period: '/mês',
        priceNumber: 19.90,
        description: 'Cancele quando quiser',
    },
    annual: {
        id: 'annual' as const,
        label: 'Anual',
        price: 'R$ 149,90',
        period: '/ano',
        priceNumber: 149.90,
        description: 'Economize 37% — apenas R$12,49/mês',
        badge: 'MELHOR VALOR',
    },
} as const;

export const PREMIUM_FEATURES = [
    { icon: '🔊', label: 'Todas as frequências: Beta, Theta e Gamma' },
    { icon: '🌿', label: 'Sons ambiente: Café, Floresta, Espaço, Ruído Branco' },
    { icon: '⚡', label: '5 Presets otimizados por perfil neural' },
    { icon: '🧠', label: 'Modo Zen — imersão total sem distrações' },
    { icon: '📊', label: 'Histórico completo de sessões de foco' },
    { icon: '🚫', label: 'Sempre sem anúncios, para sempre' },
];
