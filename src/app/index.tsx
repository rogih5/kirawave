import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    StyleSheet, Text, View, TouchableOpacity,
    ScrollView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AmbientBackground from './components/AmbientBackground';
import { useAudio } from '../features/audio/useAudio';
import { useSessionStore } from '../store/useSessionStore';
import { useUserStore } from '../store/useUserStore';
import { usePresetsStore } from '../store/usePresetsStore';
import { usePremiumStore } from '../store/usePremiumStore';
import { FREE_FREQS, FREE_AMBIENTS } from '../features/premium/premiumConfig';
import { THEME, FREQS, AMBIENTS } from '../../services/themes/tokens';
import type { FreqKey, AmbientKey } from '../types';

const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function MainScreen() {
    const { rem, running, elapsed, done, sessions, start, pause, reset, skip, tick, addSession } =
        useSessionStore();
    const { freqKey, ambKey, bVol, aVol, audioOn, bootAudio, suspendAudio, handleFreq, handleAmb, handleBVol, handleAVol } =
        useAudio();
    const { uid, setUser, syncCount, tickSyncCount } = useUserStore();
    const { isPremium } = usePremiumStore();
    const router = useRouter();
    const { presets, activePresetId, applyPreset } = usePresetsStore();
    const [zenMode, setZenMode] = useState(false);

    const userLogout = async () => {
        try {
            await AsyncStorage.removeItem('isLoggedIn');
            setUser(null);
            router.replace('/login');
        } catch (e) {
            console.error('Erro ao sair:', e);
        }
    };

    const elapsedRef = useRef(elapsed);
    useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);

    useEffect(() => {
        if (!running) return;
        const ivl = setInterval(tick, 1000);
        return () => clearInterval(ivl);
    }, [running, tick]);

    useEffect(() => {
        if (done && elapsedRef.current > 30) {
            addSession({
                id: Date.now().toString(),
                duration: elapsedRef.current,
                freqKey,
                ambKey,
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
            });
        }
    }, [done]);

    useEffect(() => {
        const t = setInterval(tickSyncCount, 6000);
        return () => clearInterval(t);
    }, []);

    const toggleTimer = async () => {
        if (!running) {
            await bootAudio();
            start();
        } else {
            pause();
            await suspendAudio();
        }
    };

    const resetTimer = async () => {
        reset();
        await suspendAudio();
    };

    const skipTimer = async () => {
        skip();
        await suspendAudio();
    };

    if (zenMode) {
        return (
            <View style={s.zenRoot}>
                <StatusBar style="light" />

                <View style={[StyleSheet.absoluteFill, { zIndex: -1, pointerEvents: 'none' }]}>
                    <AmbientBackground ambKey={ambKey} intensity={aVol / 70} />
                </View>

                <TouchableOpacity
                    style={s.zenCloseBtn}
                    onPress={() => setZenMode(false)}
                    activeOpacity={0.6}
                >
                    <Ionicons name="close-outline" size={32} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>

                <View style={s.zenContent}>
                    <Text style={s.zenTimer}>{fmt(rem)}</Text>
                    <View style={s.zenDivider} />
                    <Text style={s.zenSub}>
                        {FREQS[freqKey].name.toUpperCase()} • {AMBIENTS[ambKey].name.toUpperCase()}
                    </Text>
                </View>

                <Text style={s.zenQuote}>Mantenha o foco, respire fundo.</Text>
            </View>
        );
    }

    return (
        <View style={s.root}>
            <StatusBar style="light" />

            <View style={[StyleSheet.absoluteFill, { zIndex: -1, pointerEvents: 'none' }]}>
                <AmbientBackground ambKey={ambKey} intensity={aVol / 100} />
            </View>

            <View style={s.header}>
                <View style={s.logoRow}>
                    <View style={s.logoDot} />
                    <Text style={s.logoText}>KiraWave</Text>
                    {isPremium && (
                        <View style={s.premiumBadge}>
                            <Text style={s.premiumBadgeTx}>PREMIUM</Text>
                        </View>
                    )}
                </View>
                <View style={s.headerRight}>
                    <View style={s.syncPill}>
                        <View style={s.syncDot} />
                        <Text style={s.syncTx}>{syncCount.toLocaleString('pt-BR')} focando</Text>
                    </View>
                    <TouchableOpacity onPress={userLogout} style={s.logoutBtn}>
                        <Text style={s.logoutTx}>Sair</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={s.body}
                showsVerticalScrollIndicator={false}
            >
                <View style={s.timerBlock}>
                    <Text style={s.timerDisplay}>{fmt(rem)}</Text>
                    <Text style={s.timerFreq}>
                        {FREQS[freqKey].name} {FREQS[freqKey].hz}Hz • {AMBIENTS[ambKey].name}
                    </Text>
                    <View style={s.timerCtrl}>
                        <TouchableOpacity style={s.btnGhost} onPress={resetTimer} activeOpacity={0.7}>
                            <Ionicons name="refresh-outline" size={24} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity style={s.btnPrimary} onPress={toggleTimer} activeOpacity={0.9}>
                            <LinearGradient
                                colors={running ? ['#FB7185', '#E11D48'] : [THEME.primary, '#0891B2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={s.btnPrimaryGradient}
                            >
                                <Ionicons name={running ? "pause" : "play"} size={24} color="white" style={{ marginRight: 10 }} />
                                <Text style={s.btnPrimaryTx}>
                                    {running ? 'Pausar' : 'Iniciar Foco'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={s.btnGhost} onPress={skipTimer} activeOpacity={0.7}>
                            <Ionicons name="play-skip-forward-outline" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* PRESETS */}
                <Text style={s.sectionLabel}>PRESETS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.presetsRow}>
                    {presets.map((p) => {
                        const locked = !isPremium;
                        return (
                            <TouchableOpacity
                                key={p.id}
                                style={[s.presetChip, activePresetId === p.id && s.presetChipOn, locked && s.presetChipLocked]}
                                onPress={() => locked ? router.push('/premium') : applyPreset(p.id)}
                            >
                                <Text style={s.presetIcon}>{locked ? '🔒' : p.icon}</Text>
                                <Text style={[s.presetName, activePresetId === p.id && s.presetNameOn, locked && s.lockedTx]}>
                                    {p.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* FREQUÊNCIA BINAURAL */}
                <Text style={s.sectionLabel}>FREQUÊNCIA BINAURAL</Text>
                <View style={s.freqGrid}>
                    {(Object.entries(FREQS) as [FreqKey, typeof FREQS[FreqKey]][]).map(([k, f]) => {
                        const locked = !isPremium && !FREE_FREQS.includes(k);
                        return (
                            <TouchableOpacity
                                key={k}
                                style={[s.freqCard, freqKey === k && s.freqCardOn, locked && s.freqCardLocked]}
                                onPress={() => locked ? router.push('/premium') : handleFreq(k)}
                            >
                                {locked && (
                                    <View style={s.lockTag}>
                                        <Ionicons name="lock-closed" size={10} color="#A78BFA" />
                                        <Text style={s.lockTagTx}>PREMIUM</Text>
                                    </View>
                                )}
                                <Text style={[s.freqName, locked && s.lockedTx]}>{f.name}</Text>
                                <Text style={[s.freqHz, locked && s.lockedTx]}>{f.hz} Hz</Text>
                                <Text style={[s.freqDesc, locked && s.lockedTx]}>{f.desc}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {Platform.OS === 'web' && (
                    <View style={s.sliderBlock}>
                        <View style={s.sliderRow}>
                            <Text style={s.sliderLabel}>Binaural</Text>
                            <input
                                type="range" min={0} max={100} value={bVol}
                                onChange={(e) => handleBVol(Number(e.target.value))}
                                style={{ flex: 1 }}
                            />
                            <Text style={s.sliderVal}>{bVol}%</Text>
                        </View>
                        <View style={s.sliderRow}>
                            <Text style={s.sliderLabel}>Ambiente</Text>
                            <input
                                type="range" min={0} max={100} value={aVol}
                                onChange={(e) => handleAVol(Number(e.target.value))}
                                style={{ flex: 1 }}
                            />
                            <Text style={s.sliderVal}>{aVol}%</Text>
                        </View>
                    </View>
                )}

                {/* SOM AMBIENTE */}
                <Text style={s.sectionLabel}>SOM AMBIENTE</Text>
                <View style={s.ambientGrid}>
                    {(Object.entries(AMBIENTS) as [AmbientKey, typeof AMBIENTS[AmbientKey]][]).map(([k, a]) => {
                        const locked = !isPremium && !FREE_AMBIENTS.includes(k);
                        return (
                            <TouchableOpacity
                                key={k}
                                style={[s.ambBtn, ambKey === k && s.ambBtnOn, locked && s.ambBtnLocked]}
                                onPress={() => locked ? router.push('/premium') : handleAmb(k)}
                            >
                                <Text style={[s.ambTx, ambKey === k && s.ambTxOn, locked && s.lockedTx]}>
                                    {locked ? '🔒' : a.emoji} {a.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* MODO ZEN */}
                <TouchableOpacity
                    style={[s.zenBtn, !isPremium && s.zenBtnLocked]}
                    onPress={() => {
                        if (!isPremium) { router.push('/premium'); return; }
                        setZenMode(true);
                        if (!running) toggleTimer();
                    }}
                >
                    <Text style={[s.zenBtnTx, !isPremium && s.zenBtnTxLocked]}>
                        {isPremium ? '🧠 Modo Zen (Isolamento Total)' : '🔒 Modo Zen — Exclusivo Premium'}
                    </Text>
                </TouchableOpacity>

                {/* Card inferior: upgrade ou status premium */}
                {!isPremium ? (
                    <Link href="/premium" asChild>
                        <TouchableOpacity style={s.upgradeCardBtn} activeOpacity={0.9}>
                            <LinearGradient
                                colors={['rgba(167, 139, 250, 0.2)', 'rgba(124, 58, 237, 0.1)']}
                                style={s.upgradeCardGradient}
                            >
                                <View style={s.upgradeCardInfo}>
                                    <Ionicons name="sparkles" size={22} color="#A78BFA" />
                                    <View>
                                        <Text style={s.upgradeCardTitle}>Desbloqueie o Premium</Text>
                                        <Text style={s.upgradeCardSub}>Todas as frequências, sons e presets</Text>
                                    </View>
                                </View>
                                <View style={s.upgradePriceBadge}>
                                    <Text style={s.upgradePriceTx}>R$19,90/mês</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Link>
                ) : (
                    <Link href="/about" asChild>
                        <TouchableOpacity style={s.premiumCardBtn} activeOpacity={0.9}>
                            <LinearGradient
                                colors={['rgba(167, 139, 250, 0.15)', 'rgba(34, 211, 238, 0.1)']}
                                style={s.premiumCardGradient}
                            >
                                <View style={s.premiumCardInfo}>
                                    <Ionicons name="checkmark-circle" size={20} color={THEME.primary} />
                                    <View>
                                        <Text style={s.premiumCardTitle}>Membro Premium ✨</Text>
                                        <Text style={s.premiumCardSub}>Ver Roadmap e Apoiar o Projeto</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Link>
                )}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: THEME.bg },
    zenRoot: { flex: 1, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center' },
    zenCloseBtn: { position: 'absolute', top: 50, right: 30, width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
    zenContent: { alignItems: 'center', justifyContent: 'center' },
    zenTimer: {
        color: 'white',
        fontSize: 140,
        fontWeight: '100',
        letterSpacing: -10,
        textShadow: '0px 0px 50px rgba(255, 255, 255, 0.2)'
    },
    zenDivider: { width: 40, height: 2, backgroundColor: THEME.primary, marginVertical: 20, opacity: 0.5 },
    zenSub: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '700', letterSpacing: 3 },
    zenQuote: { position: 'absolute', bottom: 60, color: 'rgba(255,255,255,0.2)', fontSize: 13, fontStyle: 'italic', letterSpacing: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        backgroundColor: 'rgba(10, 15, 28, 0.7)',
        backdropFilter: 'blur(10px)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        zIndex: 100
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME.primary, boxShadow: '0px 0px 10px #22D3EE' },
    logoText: { color: THEME.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
    premiumBadge: {
        backgroundColor: 'rgba(167, 139, 250, 0.2)', borderRadius: 8,
        paddingHorizontal: 8, paddingVertical: 3,
        borderWidth: 1, borderColor: 'rgba(167, 139, 250, 0.4)',
    },
    premiumBadgeTx: { color: '#A78BFA', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    syncPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(34, 211, 238, 0.1)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)' },
    syncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.primary },
    syncTx: { color: THEME.primary, fontSize: 11, fontWeight: '700' },
    logoutBtn: { backgroundColor: 'rgba(251, 113, 133, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    logoutTx: { color: '#FB7185', fontSize: 11, fontWeight: '700' },

    body: { padding: 20, paddingBottom: 100 },
    timerBlock: { alignItems: 'center', paddingVertical: 40, marginBottom: 20 },
    timerDisplay: {
        color: 'white',
        fontSize: 100,
        fontWeight: '200',
        letterSpacing: -6,
        textShadow: '0px 0px 30px rgba(34, 211, 238, 0.3)'
    },
    timerFreq: { color: THEME.accent, fontSize: 14, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginTop: 10, opacity: 0.8 },
    timerCtrl: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 30 },

    btnPrimary: { borderRadius: 20, overflow: 'hidden', boxShadow: '0px 10px 20px rgba(167, 139, 250, 0.3)' },
    btnPrimaryGradient: { paddingHorizontal: 40, paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
    btnPrimaryTx: { color: 'white', fontWeight: '800', fontSize: 18 },

    btnGhost: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.02)' },

    sectionLabel: { color: 'white', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 30, marginBottom: 15, opacity: 0.5 },

    presetsRow: { marginBottom: 10 },
    presetChip: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 25, paddingHorizontal: 18, paddingVertical: 12, marginRight: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
    presetChipOn: { borderColor: THEME.primary, backgroundColor: 'rgba(34,211,238,0.1)', boxShadow: '0px 0px 15px rgba(34, 211, 238, 0.2)' },
    presetChipLocked: { opacity: 0.5, borderColor: 'rgba(167,139,250,0.2)' },
    presetIcon: { fontSize: 18 },
    presetName: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
    presetNameOn: { color: THEME.primary },

    freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    freqCard: { width: '48.2%', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 20 },
    freqCardOn: {
        borderColor: THEME.primary,
        backgroundColor: 'rgba(34, 211, 238, 0.05)',
        boxShadow: '0px 0px 20px rgba(34, 211, 238, 0.15)',
    },
    freqCardLocked: { opacity: 0.5 },
    freqName: { color: 'white', fontWeight: '700', fontSize: 16 },
    freqHz: { color: THEME.primary, fontSize: 13, fontWeight: '600', marginTop: 2 },
    freqDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8, lineHeight: 18 },
    lockTag: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        alignSelf: 'flex-start', marginBottom: 8,
        backgroundColor: 'rgba(167,139,250,0.15)', borderRadius: 8,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    lockTagTx: { color: '#A78BFA', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
    lockedTx: { opacity: 0.5 },

    ambientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    ambBtn: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14 },
    ambBtnOn: { backgroundColor: 'rgba(167,139,250,0.15)', borderColor: THEME.accent, boxShadow: '0px 0px 15px rgba(167, 139, 250, 0.2)' },
    ambBtnLocked: { opacity: 0.5 },
    ambTx: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
    ambTxOn: { color: 'white' },

    zenBtn: { backgroundColor: 'rgba(167, 139, 250, 0.1)', borderWidth: 1, borderColor: 'rgba(167, 139, 250, 0.3)', borderRadius: 20, padding: 18, alignItems: 'center', marginTop: 10 },
    zenBtnLocked: { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' },
    zenBtnTx: { color: THEME.accent, fontWeight: '700', fontSize: 15 },
    zenBtnTxLocked: { color: 'rgba(255,255,255,0.3)' },

    upgradeCardBtn: { marginTop: 40, borderRadius: 28, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(167, 139, 250, 0.4)', boxShadow: '0px 15px 35px rgba(167, 139, 250, 0.15)' },
    upgradeCardGradient: { padding: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    upgradeCardInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
    upgradeCardTitle: { color: 'white', fontSize: 17, fontWeight: '800' },
    upgradeCardSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 3 },
    upgradePriceBadge: { backgroundColor: '#7C3AED', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
    upgradePriceTx: { color: 'white', fontSize: 12, fontWeight: '800' },

    premiumCardBtn: { marginTop: 40, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(167, 139, 250, 0.3)', boxShadow: '0px 15px 35px rgba(0,0,0,0.4)' },
    premiumCardGradient: { padding: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    premiumCardInfo: { flexDirection: 'row', alignItems: 'center', gap: 18 },
    premiumCardTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
    premiumCardSub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 },

    sliderBlock: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, marginVertical: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
    sliderLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700', width: 80, textTransform: 'uppercase', letterSpacing: 1 },
    sliderVal: { color: THEME.primary, fontSize: 14, fontWeight: '800', width: 45, textAlign: 'right' },
});
