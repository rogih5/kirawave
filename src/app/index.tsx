// src/app/index.tsx — Tela principal refatorada
// Lógica de áudio e estado movida para hooks/stores; esta tela é apenas UI
import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import {
    StyleSheet, Text, View, TouchableOpacity,
    ScrollView, Platform,
} from 'react-native';
import AmbientBackground from './components/AmbientBackground';
import { useAudio } from '../features/audio/useAudio';
import { useSessionStore } from '../store/useSessionStore';
import { useUserStore } from '../store/useUserStore';
import { usePresetsStore } from '../store/usePresetsStore';
import { THEME, FREQS, AMBIENTS } from '../../services/themes/tokens';
import type { FreqKey, AmbientKey } from '../types';

const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function MainScreen() {
    const { rem, running, elapsed, done, sessions, start, pause, reset, skip, tick, addSession } =
        useSessionStore();
    const { freqKey, ambKey, bVol, aVol, audioOn, bootAudio, suspendAudio, handleFreq, handleAmb, handleBVol, handleAVol } =
        useAudio();
    const { syncCount, tickSyncCount, displayName, logout: userLogout } = useUserStore();
    const { presets, activePresetId, applyPreset } = usePresetsStore();
    const [zenMode, setZenMode] = useState(false);

    const elapsedRef = useRef(elapsed);
    useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);

    // Timer interval
    useEffect(() => {
        if (!running) return;
        const ivl = setInterval(tick, 1000);
        return () => clearInterval(ivl);
    }, [running, tick]);

    // Salvar sessão ao concluir
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

    // Sync counter
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

    // Zen Mode
    if (zenMode) {
        return (
            <View style={s.zenRoot}>
                <StatusBar style="light" />
                <AmbientBackground ambKey={ambKey} intensity={aVol / 85} />
                <Text style={s.zenTimer}>{fmt(rem)}</Text>
                <Text style={s.zenSub}>
                    {FREQS[freqKey].name} {FREQS[freqKey].hz}Hz • {AMBIENTS[ambKey].name}
                </Text>
                <TouchableOpacity style={s.btnGhost} onPress={() => setZenMode(false)}>
                    <Text style={s.btnGhostTx}>Sair do Modo Zen</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={s.root}>
            <StatusBar style="light" />
            <View style={[StyleSheet.absoluteFill, { zIndex: -1000 }]}>
                <AmbientBackground ambKey={ambKey} intensity={aVol / 100} />
            </View>

            {/* Header */}
            <View style={s.header}>
                <View style={s.logoRow}>
                    <View style={s.logoDot} />
                    <Text style={s.logoText}>KiraWave</Text>
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

            <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

                {/* Timer */}
                <View style={s.timerBlock}>
                    <Text style={s.timerDisplay}>{fmt(rem)}</Text>
                    <Text style={s.timerFreq}>
                        {FREQS[freqKey].name} {FREQS[freqKey].hz}Hz • {AMBIENTS[ambKey].name}
                    </Text>
                    <View style={s.timerCtrl}>
                        <TouchableOpacity style={s.btnGhost} onPress={resetTimer}>
                            <Text style={s.btnGhostTx}>↺</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.btnPrimary} onPress={toggleTimer}>
                            <Text style={s.btnPrimaryTx}>
                                {running ? '⏸ Pausar' : '▶ Iniciar'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.btnGhost} onPress={skipTimer}>
                            <Text style={s.btnGhostTx}>⏭</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Presets */}
                <Text style={s.sectionLabel}>PRESETS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.presetsRow}>
                    {presets.map((p) => (
                        <TouchableOpacity
                            key={p.id}
                            style={[s.presetChip, activePresetId === p.id && s.presetChipOn]}
                            onPress={() => applyPreset(p.id)}
                        >
                            <Text style={s.presetIcon}>{p.icon}</Text>
                            <Text style={[s.presetName, activePresetId === p.id && s.presetNameOn]}>
                                {p.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Frequências */}
                <Text style={s.sectionLabel}>FREQUÊNCIA BINAURAL</Text>
                <View style={s.freqGrid}>
                    {(Object.entries(FREQS) as [FreqKey, typeof FREQS[FreqKey]][]).map(([k, f]) => (
                        <TouchableOpacity
                            key={k}
                            style={[s.freqCard, freqKey === k && s.freqCardOn]}
                            onPress={() => handleFreq(k)}
                        >
                            <Text style={s.freqName}>{f.name}</Text>
                            <Text style={s.freqHz}>{f.hz} Hz</Text>
                            <Text style={s.freqDesc}>{f.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Volume sliders (web only) */}
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

                {/* Ambientes */}
                <Text style={s.sectionLabel}>SOM AMBIENTE</Text>
                <View style={s.ambientGrid}>
                    {(Object.entries(AMBIENTS) as [AmbientKey, typeof AMBIENTS[AmbientKey]][]).map(([k, a]) => (
                        <TouchableOpacity
                            key={k}
                            style={[s.ambBtn, ambKey === k && s.ambBtnOn]}
                            onPress={() => handleAmb(k)}
                        >
                            <Text style={[s.ambTx, ambKey === k && s.ambTxOn]}>
                                {a.emoji} {a.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={s.zenBtn}
                    onPress={() => { setZenMode(true); if (!running) toggleTimer(); }}
                >
                    <Text style={s.zenBtnTx}>🧠 Modo Zen (Isolamento Total)</Text>
                </TouchableOpacity>

                <Link href="/about" asChild>
                    <TouchableOpacity style={s.aboutBtn}>
                        <Text style={s.aboutBtnTx}>✨ Roadmap & Apoio via Pix</Text>
                    </TouchableOpacity>
                </Link>

                {/* Sessão concluída */}
                {done && (
                    <View style={s.shareCard}>
                        <Text style={s.shareTitle}>🎯 Sessão concluída!</Text>
                        <Text style={s.shareSub}>
                            {fmt(elapsedRef.current)} · {FREQS[freqKey].name} {FREQS[freqKey].hz}Hz · {AMBIENTS[ambKey].name}
                        </Text>
                        <TouchableOpacity style={s.btnPrimary} onPress={resetTimer}>
                            <Text style={s.btnPrimaryTx}>▶ Nova Sessão</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Histórico */}
                {sessions.length > 0 && (
                    <View style={s.historyBlock}>
                        <Text style={s.sectionLabel}>SESSÕES DE HOJE</Text>
                        {sessions.map((session, i) => (
                            <View key={session.id} style={s.historyItem}>
                                <Text style={s.historyTime}>{fmt(session.duration)}</Text>
                                <View style={s.historyMeta}>
                                    <Text style={s.historyFreq}>{FREQS[session.freqKey].name} {FREQS[session.freqKey].hz}Hz</Text>
                                    <Text style={s.historyAmb}>{AMBIENTS[session.ambKey].name}</Text>
                                </View>
                                <Text style={s.historyTs}>
                                    {new Date(session.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        ))}
                        <Text style={s.historyTotal}>
                            Total: {fmt(sessions.reduce((a, s) => a + s.duration, 0))}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: THEME.bg },
    zenRoot: { flex: 1, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center', gap: 20 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: THEME.border, zIndex: 10 },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: THEME.primary },
    logoText: { color: THEME.text, fontSize: 17, fontWeight: '600' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    syncPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: THEME.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
    syncDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: THEME.primary },
    syncTx: { color: THEME.muted, fontSize: 12 },
    logoutBtn: { marginLeft: 8, padding: 4 },
    logoutTx: { color: '#FB7185', fontSize: 12, fontWeight: '600' },

    body: { padding: 16, paddingBottom: 100, zIndex: 1 },
    timerBlock: { alignItems: 'center', paddingVertical: 30 },
    timerDisplay: { color: THEME.primary, fontSize: 88, fontWeight: '300', letterSpacing: -5 },
    timerFreq: { color: THEME.accent, fontSize: 15, marginTop: 8, marginBottom: 4 },
    timerCtrl: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
    zenTimer: { color: THEME.primary, fontSize: 110, fontWeight: '300', letterSpacing: -7 },
    zenSub: { color: THEME.accent, fontSize: 17.5 },

    sectionLabel: { color: THEME.muted, fontSize: 12, letterSpacing: 1, marginTop: 20, marginBottom: 10 },

    presetsRow: { marginBottom: 4 },
    presetChip: { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
    presetChipOn: { borderColor: THEME.primary, backgroundColor: 'rgba(34,211,238,0.1)' },
    presetIcon: { fontSize: 16 },
    presetName: { color: THEME.muted, fontSize: 13 },
    presetNameOn: { color: THEME.primary, fontWeight: '600' },

    freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    freqCard: { width: '48%', backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 12, padding: 14 },
    freqCardOn: { borderColor: THEME.primary, shadowColor: THEME.primary, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
    freqName: { color: THEME.text, fontWeight: '600', fontSize: 15 },
    freqHz: { color: THEME.primary, fontSize: 13 },
    freqDesc: { color: THEME.muted, fontSize: 12, marginTop: 4 },

    ambientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    ambBtn: { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
    ambBtnOn: { backgroundColor: 'rgba(167,139,250,0.2)', borderColor: THEME.accent },
    ambTx: { color: THEME.muted, fontSize: 13 },
    ambTxOn: { color: THEME.text, fontWeight: '500' },

    btnPrimary: { backgroundColor: THEME.primary, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginTop: 10 },
    btnPrimaryTx: { color: '#0A0F1C', fontWeight: '700' },
    btnGhost: { borderWidth: 1, borderColor: THEME.border, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
    btnGhostTx: { color: THEME.muted },

    zenBtn: { backgroundColor: 'rgba(167,139,250,0.1)', borderWidth: 1, borderColor: THEME.accent, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
    zenBtnTx: { color: THEME.accent, fontWeight: '500' },
    aboutBtn: { borderWidth: 1, borderColor: THEME.accent, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 },
    aboutBtnTx: { color: THEME.accent, fontWeight: '500' },

    sliderBlock: { marginVertical: 12 },
    sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    sliderLabel: { color: THEME.muted, fontSize: 12, width: 68 },
    sliderVal: { color: THEME.text, fontSize: 12, width: 36, textAlign: 'right' },

    shareCard: { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.primary, borderRadius: 14, padding: 20, alignItems: 'center', gap: 10, marginTop: 16 },
    shareTitle: { color: THEME.text, fontWeight: '700', fontSize: 16 },
    shareSub: { color: THEME.muted, fontSize: 13 },

    historyBlock: { marginTop: 8, marginBottom: 20 },
    historyItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: THEME.border },
    historyTime: { color: THEME.primary, fontWeight: '700', fontSize: 15, width: 52 },
    historyMeta: { flex: 1 },
    historyFreq: { color: THEME.text, fontSize: 13, fontWeight: '500' },
    historyAmb: { color: THEME.muted, fontSize: 11 },
    historyTs: { color: THEME.muted, fontSize: 11 },
    historyTotal: { color: THEME.accent, fontWeight: '600', fontSize: 13, textAlign: 'right', marginTop: 10 },
});
