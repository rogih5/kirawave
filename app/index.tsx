
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'expo-router';
import AmbientBackground from './components/AmbientBackground';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Platform,
    Dimensions,
} from 'react-native';

type FreqKey = 'alpha' | 'theta' | 'beta' | 'gamma';
type AmbientKey = 'rain' | 'cafe' | 'space' | 'forest' | 'white';

interface Freq { name: string; hz: number; desc: string; }
interface Ambient { name: string; emoji: string; filterType: BiquadFilterType; freq: number; Q: number; }

const FREQS: Record<FreqKey, Freq> = {
    alpha: { name: 'Alpha', hz: 10, desc: 'Foco relaxado · fluxo' },
    theta: { name: 'Theta', hz: 7, desc: 'Meditação · intuição' },
    beta: { name: 'Beta', hz: 18, desc: 'Alerta cognitivo' },
    gamma: { name: 'Gamma', hz: 40, desc: 'Alta performance' },
};

const AMBIENTS: Record<AmbientKey, Ambient> = {
    rain: { name: 'Chuva', emoji: '🌧', filterType: 'bandpass', freq: 800, Q: 0.8 },
    cafe: { name: 'Café', emoji: '☕', filterType: 'lowpass', freq: 1200, Q: 1.0 },
    space: { name: 'Espaço', emoji: '🌌', filterType: 'lowpass', freq: 200, Q: 2.0 },
    forest: { name: 'Floresta', emoji: '🌿', filterType: 'bandpass', freq: 600, Q: 0.5 },
    white: { name: 'Branco', emoji: '💨', filterType: 'allpass', freq: 1000, Q: 1.0 },
};

const CARRIER = 200;

const THEME = {
    bg: '#0A0F1C',
    surface: '#0D1425',
    card: '#111827',
    border: '#1E2D45',
    primary: '#22D3EE',
    accent: '#A78BFA',
    text: '#F1F5F9',
    muted: '#64748B',
};

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function App() {
    const [rem, setRem] = useState(25 * 60);
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [freqKey, setFreqKey] = useState<FreqKey>('alpha');
    const [ambKey, setAmbKey] = useState<AmbientKey>('rain');
    const [bVol, setBVol] = useState(70);
    const [aVol, setAVol] = useState(45);
    const [zenMode, setZenMode] = useState(false);
    const [done, setDone] = useState(false);
    const [syncCount, setSyncCount] = useState(2847);
    const [audioOn, setAudioOn] = useState(false);
    const [sessions, setSessions] = useState<Array<{
        duration: number; freq: string; amb: string; ts: string;
    }>>([]);

    const acRef = useRef<AudioContext | null>(null);
    const oscLRef = useRef<OscillatorNode | null>(null);
    const oscRRef = useRef<OscillatorNode | null>(null);
    const gainLRef = useRef<GainNode | null>(null);
    const gainRRef = useRef<GainNode | null>(null);
    const noiseSrc = useRef<AudioBufferSourceNode | null>(null);
    const noiseGn = useRef<GainNode | null>(null);
    const masterGn = useRef<GainNode | null>(null);
    const ivlRef = useRef<NodeJS.Timeout | null>(null);
    const freqKeyRef = useRef<FreqKey>('alpha');

    useEffect(() => { freqKeyRef.current = freqKey; }, [freqKey]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (acRef.current) acRef.current.close();
        };
    }, []);

    // Salva sessão quando timer conclui
    const elapsedRef = useRef(0);
    useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
    useEffect(() => {
        if (done && elapsedRef.current > 30) {
            setSessions(prev => [{
                duration: elapsedRef.current,
                freq: `${FREQS[freqKey].name} ${FREQS[freqKey].hz}Hz`,
                amb: AMBIENTS[ambKey].name,
                ts: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            }, ...prev].slice(0, 10)); // guarda até 10 sessões
        }
    }, [done]);

    // Sync Counter
    useEffect(() => {
        const t = setInterval(() => {
            setSyncCount(c => Math.max(2400, Math.min(3500, c + Math.floor(Math.random() * 7) - 3)));
        }, 6000);
        return () => clearInterval(t);
    }, []);

    // Timer
    useEffect(() => {
        if (!running) return;
        ivlRef.current = setInterval(() => {
            setRem(r => {
                if (r <= 1) {
                    clearInterval(ivlRef.current!);
                    setRunning(false);
                    setDone(true);
                    return 0;
                }
                return r - 1;
            });
            setElapsed(e => e + 1);
        }, 1000);
        return () => { if (ivlRef.current) clearInterval(ivlRef.current); };
    }, [running]);

    // Web Audio
    const buildNoise = useCallback((ac: AudioContext, amb: Ambient, vol: number) => {
        if (noiseSrc.current) noiseSrc.current.stop();
        const sr = ac.sampleRate;
        const buf = ac.createBuffer(1, sr * 4, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

        const src = ac.createBufferSource();
        src.buffer = buf; src.loop = true;
        const flt = ac.createBiquadFilter();
        flt.type = amb.filterType;
        flt.frequency.value = amb.freq;
        flt.Q.value = amb.Q;

        const gn = ac.createGain();
        gn.gain.value = (vol / 100) * 0.25;

        src.connect(flt); flt.connect(gn); gn.connect(masterGn.current!);
        src.start();
        noiseSrc.current = src;
        noiseGn.current = gn;
    }, []);

    const ensureContext = useCallback(() => {
        if (Platform.OS !== 'web' || acRef.current) return acRef.current;

        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ac = new AC();
        acRef.current = ac;

        const master = ac.createGain();
        master.connect(ac.destination);
        masterGn.current = master;

        const merger = ac.createChannelMerger(2);
        merger.connect(master);

        const gL = ac.createGain(); gL.gain.value = (bVol / 100) * 0.5;
        const gR = ac.createGain(); gR.gain.value = (bVol / 100) * 0.5;
        gL.connect(merger, 0, 0);
        gR.connect(merger, 0, 1);

        gainLRef.current = gL;
        gainRRef.current = gR;

        const oL = ac.createOscillator(); oL.type = 'sine'; oL.frequency.value = CARRIER;
        const oR = ac.createOscillator(); oR.type = 'sine'; oR.frequency.value = CARRIER + FREQS[freqKeyRef.current].hz;

        oL.connect(gL); oR.connect(gR);
        oL.start(); oR.start();

        oscLRef.current = oL;
        oscRRef.current = oR;

        return ac;
    }, [bVol]);

    const bootAudio = useCallback(() => {
        const ac = ensureContext();
        if (!ac) return;
        if (!noiseSrc.current) buildNoise(ac, AMBIENTS[ambKey], aVol);
        ac.resume();
        setAudioOn(true);
    }, [ensureContext, buildNoise, ambKey, aVol]);

    const toggleTimer = () => {
        if (!running) {
            // Se timer está em 00:00, reseta automaticamente antes de iniciar
            if (rem === 0) {
                setRem(25 * 60);
                setElapsed(0);
                setDone(false);
            }
            bootAudio();
            setRunning(true);
        } else {
            setRunning(false);
            if (acRef.current) acRef.current.suspend();
            setAudioOn(false);
        }
    };

    const resetTimer = () => {
        setRunning(false);
        setRem(25 * 60);
        setElapsed(0);
        setDone(false);
        if (acRef.current) acRef.current.suspend();
        setAudioOn(false);
    };

    const skipTimer = () => {
        setRunning(false);
        setElapsed(rem);
        setRem(0);
        setDone(true);
        if (acRef.current) acRef.current.suspend();
        setAudioOn(false);
    };

    const handleFreq = (k: FreqKey) => setFreqKey(k);

    const handleAmb = (k: AmbientKey) => {
        setAmbKey(k);
        if (acRef.current) buildNoise(acRef.current, AMBIENTS[k], aVol);
    };

    const handleBVol = (v: number) => {
        setBVol(v);
        if (gainLRef.current && gainRRef.current) {
            const t = acRef.current?.currentTime || 0;
            gainLRef.current.gain.setValueAtTime((v / 100) * 0.5, t);
            gainRRef.current.gain.setValueAtTime((v / 100) * 0.5, t);
        }
    };

    const handleAVol = (v: number) => {
        setAVol(v);
        if (noiseGn.current && acRef.current) {
            noiseGn.current.gain.setValueAtTime((v / 100) * 0.25, acRef.current.currentTime);
        }
    };

    // Zen Mode
    if (zenMode) {
        return (
            <View style={styles.zenRoot}>
                <StatusBar style="light" />
                <AmbientBackground ambKey={ambKey} intensity={aVol / 85} />
                <Text style={styles.zenTimer}>{fmt(rem)}</Text>
                <Text style={styles.zenSub}>
                    {FREQS[freqKey].name} {FREQS[freqKey].hz}Hz • {AMBIENTS[ambKey].name}
                </Text>
                <TouchableOpacity style={styles.btnGhost} onPress={() => setZenMode(false)}>
                    <Text style={styles.btnGhostTx}>Sair do Modo Zen</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar style="light" />
            <AmbientBackground ambKey={ambKey} intensity={aVol / 100} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoRow}>
                    <View style={styles.logoDot} />
                    <Text style={styles.logoText}>KiraWave</Text>
                </View>
                <View style={styles.syncPill}>
                    <View style={styles.syncDot} />
                    <Text style={styles.syncTx}>{syncCount.toLocaleString('pt-BR')} focando agora</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
                {/* Timer */}
                <View style={styles.timerBlock}>
                    <Text style={styles.timerDisplay}>{fmt(rem)}</Text>
                    <Text style={styles.timerFreq}>
                        {FREQS[freqKey].name} {FREQS[freqKey].hz}Hz • {AMBIENTS[ambKey].name}
                    </Text>

                    <View style={styles.timerCtrl}>
                        <TouchableOpacity style={styles.btnGhost} onPress={resetTimer}>
                            <Text style={styles.btnGhostTx}>↺</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnPrimary} onPress={toggleTimer}>
                            <Text style={styles.btnPrimaryTx}>
                                {running ? '⏸ Pausar' : '▶ Iniciar sessão'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnGhost} onPress={skipTimer}>
                            <Text style={styles.btnGhostTx}>⏭</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Frequências */}
                <Text style={styles.sectionLabel}>FREQUÊNCIA BINAURAL</Text>
                <View style={styles.freqGrid}>
                    {(Object.entries(FREQS) as [FreqKey, Freq][]).map(([k, f]) => (
                        <TouchableOpacity
                            key={k}
                            style={[styles.freqCard, freqKey === k && styles.freqCardOn]}
                            onPress={() => handleFreq(k)}
                        >
                            <Text style={styles.freqName}>{f.name}</Text>
                            <Text style={styles.freqHz}>{f.hz} Hz</Text>
                            <Text style={styles.freqDesc}>{f.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sliders (Web) */}
                {Platform.OS === 'web' && (
                    <View style={styles.sliderBlock}>
                        <View style={styles.sliderRow}>
                            <Text style={styles.sliderLabel}>Binaural</Text>
                            <input type="range" min={0} max={100} value={bVol} onChange={e => handleBVol(Number(e.target.value))} />
                            <Text style={styles.sliderVal}>{bVol}%</Text>
                        </View>
                        <View style={styles.sliderRow}>
                            <Text style={styles.sliderLabel}>Ambiente</Text>
                            <input type="range" min={0} max={100} value={aVol} onChange={e => handleAVol(Number(e.target.value))} />
                            <Text style={styles.sliderVal}>{aVol}%</Text>
                        </View>
                    </View>
                )}

                {/* Ambientes */}
                <Text style={styles.sectionLabel}>SOM AMBIENTE</Text>
                <View style={styles.ambientGrid}>
                    {(Object.entries(AMBIENTS) as [AmbientKey, Ambient][]).map(([k, a]) => (
                        <TouchableOpacity
                            key={k}
                            style={[styles.ambBtn, ambKey === k && styles.ambBtnOn]}
                            onPress={() => handleAmb(k)}
                        >
                            <Text style={[styles.ambTx, ambKey === k && styles.ambTxOn]}>{a.emoji} {a.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.zenBtn} onPress={() => { setZenMode(true); if (!running) toggleTimer(); }}>
                    <Text style={styles.zenBtnTx}>🧠 Modo Zen (Isolamento Total)</Text>
                </TouchableOpacity>

                <Link href="/about" asChild>
                    <TouchableOpacity style={styles.aboutBtn}>
                        <Text style={styles.aboutBtnTx}>✨ Roadmap & Apoio via Pix</Text>
                    </TouchableOpacity>
                </Link>

                {/* CARD SESSÃO CONCLUÍDA */}
                {done && (
                    <View style={styles.shareCard}>
                        <Text style={styles.shareTitle}>🎯 Sessão concluída!</Text>
                        <Text style={styles.shareSub}>
                            {fmt(elapsedRef.current)} · {FREQS[freqKey].name} {FREQS[freqKey].hz}Hz · {AMBIENTS[ambKey].name}
                        </Text>
                        <TouchableOpacity style={styles.btnPrimary} onPress={resetTimer}>
                            <Text style={styles.btnPrimaryTx}>▶ Nova Sessão (25:00)</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* HISTÓRICO DE SESSÕES */}
                {sessions.length > 0 && (
                    <View style={styles.historyBlock}>
                        <Text style={styles.sectionLabel}>SESSÕES DE HOJE</Text>
                        {sessions.map((s, i) => (
                            <View key={i} style={styles.historyItem}>
                                <Text style={styles.historyTime}>{fmt(s.duration)}</Text>
                                <View style={styles.historyMeta}>
                                    <Text style={styles.historyFreq}>{s.freq}</Text>
                                    <Text style={styles.historyAmb}>{s.amb}</Text>
                                </View>
                                <Text style={styles.historyTs}>{s.ts}</Text>
                            </View>
                        ))}
                        <Text style={styles.historyTotal}>
                            Total: {fmt(sessions.reduce((acc, s) => acc + s.duration, 0))}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: THEME.bg },
    zenRoot: { flex: 1, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center', gap: 20 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: THEME.border },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: THEME.primary },
    logoText: { color: THEME.text, fontSize: 17, fontWeight: '600' },
    syncPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: THEME.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
    syncDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: THEME.primary },
    syncTx: { color: THEME.muted, fontSize: 13 },

    body: { padding: 16, paddingBottom: 100 },
    timerBlock: { alignItems: 'center', paddingVertical: 30 },
    timerDisplay: { color: THEME.primary, fontSize: 88, fontWeight: '300', letterSpacing: -5 },
    timerFreq: { color: THEME.accent, fontSize: 16, marginTop: 8, marginBottom: 4 },
    timerCtrl: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },

    zenTimer: { color: THEME.primary, fontSize: 110, fontWeight: '300', letterSpacing: -7 },
    zenSub: { color: THEME.accent, fontSize: 17.5 },

    sectionLabel: { color: THEME.muted, fontSize: 12, letterSpacing: 1, marginTop: 20, marginBottom: 10 },
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
    historyTime: { color: THEME.primary, fontWeight: '700', fontSize: 15, width: 52, fontVariant: ['tabular-nums'] as any },
    historyMeta: { flex: 1 },
    historyFreq: { color: THEME.text, fontSize: 13, fontWeight: '500' },
    historyAmb: { color: THEME.muted, fontSize: 11 },
    historyTs: { color: THEME.muted, fontSize: 11 },
    historyTotal: { color: THEME.accent, fontWeight: '600', fontSize: 13, textAlign: 'right', marginTop: 10 },
});
