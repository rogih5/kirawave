// src/app/onboarding.tsx
// Questionário de neurotipo — 5 perguntas → recomenda preset
import { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { THEME } from '../../services/themes/tokens';
import { useUserStore } from '../store/useUserStore';
import { usePresetsStore } from '../store/usePresetsStore';
import type { NeuroType } from '../types';

interface Question {
    id: string;
    text: string;
    options: { label: string; value: string; emoji: string }[];
}

const QUESTIONS: Question[] = [
    {
        id: 'focus_style',
        text: 'Como você se sente quando tenta focar?',
        options: [
            { label: 'Minha mente dispara para mil lugares', value: 'adhd', emoji: '⚡' },
            { label: 'Consigo entrar em fluxo com facilidade', value: 'professional', emoji: '🎯' },
            { label: 'Preciso de estímulo criativo', value: 'creative', emoji: '🎨' },
            { label: 'Fico com sono ou desmotivado', value: 'student', emoji: '📚' },
        ],
    },
    {
        id: 'main_activity',
        text: 'Para o que você vai usar o KiraWave?',
        options: [
            { label: 'Trabalho / Produtividade', value: 'professional', emoji: '💼' },
            { label: 'Estudos / Aprendizado', value: 'student', emoji: '🎓' },
            { label: 'Criação / Arte / Escrita', value: 'creative', emoji: '✍️' },
            { label: 'Relaxar / Descansar', value: 'evening', emoji: '🌙' },
        ],
    },
    {
        id: 'challenge',
        text: 'Qual é sua maior dificuldade?',
        options: [
            { label: 'Distração e impulsividade', value: 'adhd', emoji: '🌀' },
            { label: 'Procrastinação', value: 'student', emoji: '⏳' },
            { label: 'Falta de inspiração', value: 'creative', emoji: '💡' },
            { label: 'Cansaço e estresse', value: 'evening', emoji: '😮‍💨' },
        ],
    },
    {
        id: 'neuro',
        text: 'Você se identifica com neurodivergência?',
        options: [
            { label: 'Sim, tenho TDAH diagnosticado', value: 'adhd', emoji: '🧠' },
            { label: 'Tenho suspeita / não diagnosticado', value: 'adhd', emoji: '🤔' },
            { label: 'Não, mas quero mais foco', value: 'professional', emoji: '🚀' },
            { label: 'Não sei / prefiro não dizer', value: 'student', emoji: '🙂' },
        ],
    },
    {
        id: 'session_time',
        text: 'Quanto tempo você costuma focar de uma vez?',
        options: [
            { label: 'Menos de 20 minutos', value: 'adhd', emoji: '⚡' },
            { label: '25-30 minutos (Pomodoro)', value: 'professional', emoji: '🍅' },
            { label: '45-60 minutos', value: 'student', emoji: '⏱️' },
            { label: 'Mais de 60 minutos', value: 'creative', emoji: '🏔️' },
        ],
    },
];

function resolveNeuroType(answers: string[]): NeuroType {
    const counts: Record<string, number> = {};
    answers.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
    return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'professional') as NeuroType;
}

const PRESET_LABELS: Record<NeuroType, { name: string; desc: string; icon: string }> = {
    adhd: { name: 'ADHD Deep Work', icon: '🧠', desc: 'Gamma + Chuva para manter o cérebro ativo' },
    professional: { name: 'Focus Boost', icon: '⚡', desc: 'Alpha + Café para entrar em estado de fluxo' },
    creative: { name: 'Creative Flow', icon: '🎨', desc: 'Theta + Floresta para pensamento criativo' },
    student: { name: 'Deep Study', icon: '📚', desc: 'Beta + Ruído Branco para absorção de conteúdo' },
    evening: { name: 'Evening Wind Down', icon: '🌙', desc: 'Theta + Espaço para relaxar e desacelerar' },
};

export default function OnboardingScreen() {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [result, setResult] = useState<NeuroType | null>(null);

    const { completeOnboarding } = useUserStore();
    const { applyPresetForNeuroType } = usePresetsStore();

    const handleOption = (value: string) => {
        const newAnswers = [...answers, value];
        if (step < QUESTIONS.length - 1) {
            setAnswers(newAnswers);
            setStep(step + 1);
        } else {
            const neuro = resolveNeuroType(newAnswers);
            setResult(neuro);
        }
    };

    const handleConfirm = () => {
        if (!result) return;
        applyPresetForNeuroType(result);
        completeOnboarding(result);
        // AuthGuard redirecionará para /
    };

    const progress = (step / QUESTIONS.length) * 100;
    const q = QUESTIONS[step];
    const presetInfo = result ? PRESET_LABELS[result] : null;

    return (
        <View style={s.root}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={s.header}>
                    <View style={s.logoDot} />
                    <Text style={s.logoText}>KiraWave</Text>
                </View>

                {/* Barra de progresso */}
                {!result && (
                    <View style={s.progressBg}>
                        <View style={[s.progressFill, { width: `${progress}%` as any }]} />
                    </View>
                )}

                {/* Resultado */}
                {result && presetInfo ? (
                    <View style={s.resultArea}>
                        <Text style={s.resultEmoji}>{presetInfo.icon}</Text>
                        <Text style={s.resultTitle}>Seu perfil: {presetInfo.name}</Text>
                        <Text style={s.resultDesc}>{presetInfo.desc}</Text>
                        <Text style={s.resultSub}>
                            Vamos configurar o KiraWave especialmente para você.
                        </Text>
                        <TouchableOpacity style={s.btnConfirm} onPress={handleConfirm}>
                            <Text style={s.btnConfirmTx}>✨ Começar minha jornada</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={s.questionArea}>
                        <Text style={s.stepLabel}>
                            {step + 1} de {QUESTIONS.length}
                        </Text>
                        <Text style={s.questionText}>{q.text}</Text>
                        <View style={s.options}>
                            {q.options.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value + opt.label}
                                    style={s.optionBtn}
                                    onPress={() => handleOption(opt.value)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={s.optionEmoji}>{opt.emoji}</Text>
                                    <Text style={s.optionLabel}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: THEME.bg },
    inner: { flexGrow: 1, padding: 24, paddingBottom: 48 },

    header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
    logoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME.primary },
    logoText: { color: THEME.text, fontSize: 18, fontWeight: '600' },

    progressBg: {
        height: 4, backgroundColor: THEME.surface, borderRadius: 2, marginBottom: 40, overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: THEME.primary, borderRadius: 2 },

    questionArea: { flex: 1 },
    stepLabel: { color: THEME.muted, fontSize: 13, marginBottom: 14 },
    questionText: {
        color: THEME.text, fontSize: 24, fontWeight: '600',
        lineHeight: 34, marginBottom: 32,
    },

    options: { gap: 12 },
    optionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border,
        borderRadius: 16, padding: 18,
    },
    optionEmoji: { fontSize: 24 },
    optionLabel: { color: THEME.text, fontSize: 15, fontWeight: '400', flex: 1 },

    resultArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 40 },
    resultEmoji: { fontSize: 72, marginBottom: 8 },
    resultTitle: { color: THEME.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
    resultDesc: { color: THEME.muted, fontSize: 16, textAlign: 'center', lineHeight: 24 },
    resultSub: { color: THEME.muted, fontSize: 14, textAlign: 'center', opacity: 0.7 },
    btnConfirm: {
        backgroundColor: THEME.primary, borderRadius: 16,
        paddingHorizontal: 36, paddingVertical: 16, marginTop: 12,
    },
    btnConfirmTx: { color: '#0A0F1C', fontWeight: '700', fontSize: 17 },
});
