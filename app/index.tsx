import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'expo-router';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Platform,
    Dimensions,
    Image,
} from 'react-native';

// ── Tipos ─────────────────────────────────────────────────────────
type FreqKey = 'alpha' | 'theta' | 'beta' | 'gamma';
type AmbientKey = 'rain' | 'cafe' | 'space' | 'forest' | 'white';

interface Freq { name: string; hz: number; desc: string; }
interface Ambient { name: string; emoji: string; filterType: BiquadFilterType; freq: number; Q: number; }

// ── Dados ──────────────────────────────────────────────────────────
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
    bg: '#0d0608', surface: '#160a0c', card: '#1e0d10',
    border: '#3a1520', primary: '#c0392b', primaryGlow: '#e74c3c',
    text: '#f5e6e8', muted: '#a08090', success: '#2ecc71',
};

// ── Utilitários ───────────────────────────────────────────────────
const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// ── Componente principal ───────────────────────────────────────────
export default function App() {
    const [rem, setRem] = useState(25 * 60);
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [freqKey, setFreqKey] = useState<FreqKey>('alpha');
    const [ambKey, setAmbKey] = useState<AmbientKey>('rain');
    const [bVol, setBVol] = useState(70);
    const [aVol, setAVol] = useState(35);
    const [zenMode, setZenMode] = useState(false);
    const [done, setDone] = useState(false);
    const [syncCount, setSyncCount] = useState(2847);
    const [audioOn, setAudioOn] = useState(false);

    // Web Audio (web only)
    const acRef = useRef<AudioContext | null>(null);
    const oscLRef = useRef<OscillatorNode | null>(null);
    const oscRRef = useRef<OscillatorNode | null>(null);
    const gainLRef = useRef<GainNode | null>(null);
    const gainRRef = useRef<GainNode | null>(null);
    const noiseSrc = useRef<AudioBufferSourceNode | null>(null);
    const noiseGn = useRef<GainNode | null>(null);
    const masterGn = useRef<GainNode | null>(null);
    const ivlRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Limpa o áudio quando o componente desmonta (previne bugs no hot-reload)
    useEffect(() => {
        return () => {
            if (acRef.current) {
                acRef.current.close();
                acRef.current = null;
            }
        };
    }, []);

    // Sync counter
    useEffect(() => {
        const t = setInterval(() => {
            setSyncCount(c => Math.max(2400, Math.min(3500, c + Math.floor(Math.random() * 7) - 3)));
        }, 5000);
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
        return () => clearInterval(ivlRef.current!);
    }, [running]);

    // ── Audio (web only) ────────────────────────────────────────────
    const buildNoise = useCallback((ac: AudioContext, amb: Ambient, vol: number) => {
        if (noiseSrc.current) { 
            try { 
                noiseSrc.current.stop(); 
                noiseSrc.current.disconnect();
            } catch (_) { } 
        }
        if (noiseGn.current) {
            try { noiseGn.current.disconnect(); } catch (_) { }
        }
        const sr = ac.sampleRate;
        const buf = ac.createBuffer(1, sr * 4, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const src = ac.createBufferSource();
        src.buffer = buf; src.loop = true;
        const flt = ac.createBiquadFilter();
        flt.type = amb.filterType; flt.frequency.value = amb.freq; flt.Q.value = amb.Q;
        const gn = ac.createGain(); gn.gain.value = (vol / 100) * 0.25;
        src.connect(flt); flt.connect(gn); gn.connect(masterGn.current!);
        src.start();
        noiseSrc.current = src; noiseGn.current = gn;
    }, []);

    // ref espelho do freqKey para evitar stale closure no bootAudio
    const freqKeyRef = useRef<FreqKey>(freqKey);

    // Reage a mudanças de freqKey e aplica diretamente no oscilador
    // (useEffect garante que o state já está atualizado quando roda)
    useEffect(() => {
        freqKeyRef.current = freqKey;
        if (oscRRef.current) {
            // cancela automações anteriores e aplica o novo valor
            oscRRef.current.frequency.cancelScheduledValues(0);
            oscRRef.current.frequency.value = CARRIER + FREQS[freqKey].hz;
        }
    }, [freqKey]);

    // ── Garante que o AudioContext existe e está inicializado ─────────
    const ensureContext = useCallback((): AudioContext | null => {
        if (Platform.OS !== 'web') return null;
        if (acRef.current) return acRef.current;

        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AC) return null;

        const ac = new AC() as AudioContext;
        acRef.current = ac;

        // Master gain
        const master = ac.createGain();
        master.gain.value = 1;
        master.connect(ac.destination);
        masterGn.current = master;

        // Merger estéreo
        const merger = ac.createChannelMerger(2);
        merger.connect(master);

        // Gains binaural
        const gL = ac.createGain(); gL.gain.value = (bVol / 100) * 0.5;
        const gR = ac.createGain(); gR.gain.value = (bVol / 100) * 0.5;
        gL.connect(merger, 0, 0);
        gR.connect(merger, 0, 1);
        gainLRef.current = gL;
        gainRRef.current = gR;

        // Osciladores
        const oL = ac.createOscillator();
        oL.type = 'sine';
        oL.frequency.value = CARRIER;
        oL.connect(gL);
        oL.start();
        oscLRef.current = oL;

        const oR = ac.createOscillator();
        oR.type = 'sine';
        // Usa o ref para sempre pegar o freqKey mais atual, sem stale closure
        oR.frequency.value = CARRIER + FREQS[freqKeyRef.current].hz;
        oR.connect(gR);
        oR.start();
        oscRRef.current = oR;

        return ac;
    // bVol não deve entrar pois só é usado na criação inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const bootAudio = useCallback(() => {
        const ac = ensureContext();
        if (!ac) return;
        // Reconstrói o ruído se ainda não existir (primeira vez após close)
        if (!noiseSrc.current) {
            buildNoise(ac, AMBIENTS[ambKey], aVol);
        }
        ac.resume();
        setAudioOn(true);
    }, [ensureContext, buildNoise, ambKey, aVol]);

    const toggleTimer = () => {
        if (!running) {
            bootAudio();
            setRunning(true);
        } else {
            setRunning(false);
            if (acRef.current) { acRef.current.suspend(); setAudioOn(false); }
        }
    };

    const resetTimer = () => {
        setRunning(false); setRem(25 * 60); setElapsed(0); setDone(false);
        if (acRef.current) { acRef.current.suspend(); setAudioOn(false); }
    };

    const skipTimer = () => {
        setRunning(false); setElapsed(rem); setRem(0); setDone(true);
        if (acRef.current) { acRef.current.suspend(); setAudioOn(false); }
    };

    const handleFreq = (k: FreqKey) => {
        // Apenas atualiza o estado; o useEffect acima aplica no oscilador
        setFreqKey(k);
    };

    const handleAmb = (k: AmbientKey) => {
        setAmbKey(k);
        if (acRef.current) buildNoise(acRef.current, AMBIENTS[k], aVol);
    };

    const handleBVol = (v: number) => {
        setBVol(v);
        if (gainLRef.current && gainRRef.current && acRef.current) {
            const t = acRef.current.currentTime;
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

    const s = styles;

    // ── ZEN MODE ───────────────────────────────────────────────────
    if (zenMode) {
        return (
            <View style={[s.root, s.zenRoot]}>
                <StatusBar style="light" />
                <Text style={s.zenTimer}>{fmt(rem)}</Text>
                <Text style={s.zenSub}>{FREQS[freqKey].name} · {AMBIENTS[ambKey].name}</Text>
                <TouchableOpacity style={s.btnGhost} onPress={() => setZenMode(false)}>
                    <Text style={s.btnGhostTx}>Pausar conexão</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={s.root}>
            <StatusBar style="light" />

            {/* HEADER */}
            <View style={s.header}>
                <View style={s.logoRow}>
                    <View style={s.logoDot} />
                    <Text style={s.logoText}>KiraWave</Text>
                </View>
                <View style={s.syncPill}>
                    <View style={s.syncDot} />
                    <Text style={s.syncTx}>{syncCount.toLocaleString('pt-BR')} sincronizados</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

                {/* AUDIO STATUS */}
                <View style={s.audioBar}>
                    <View style={[s.audioDot, audioOn && s.audioDotOn]} />
                    <Text style={[s.audioTx, audioOn && s.audioTxOn]}>
                        {audioOn
                            ? `🎧 Binaural ativo · ${FREQS[freqKey].name} ${FREQS[freqKey].hz}Hz + ${AMBIENTS[ambKey].name}`
                            : 'Toque em Iniciar para ativar os binaurais'}
                    </Text>
                </View>

                {/* TIMER */}
                <View style={s.timerBlock}>
                    <Text style={s.timerDisplay}>{fmt(rem)}</Text>
                    <Text style={s.timerLabel}>Sessão de foco · Pomodoro</Text>
                    <View style={s.timerCtrl}>
                        <TouchableOpacity style={s.btnGhost} onPress={resetTimer}>
                            <Text style={s.btnGhostTx}>↺</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.btnPrimary} onPress={toggleTimer}>
                            <Text style={s.btnPrimaryTx}>{running ? 'Pausar' : rem === 0 ? 'Reiniciar' : 'Iniciar sessão'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.btnGhost} onPress={skipTimer}>
                            <Text style={s.btnGhostTx}>⏭</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FREQ CARDS */}
                <Text style={s.sectionLabel}>FREQUÊNCIA BINAURAL</Text>
                <View style={s.freqGrid}>
                    {(Object.entries(FREQS) as [FreqKey, Freq][]).map(([k, f]) => (
                        <TouchableOpacity
                            key={k}
                            style={[s.freqCard, freqKey === k && s.freqCardOn]}
                            onPress={() => handleFreq(k)}
                        >
                            <View style={s.freqTop}>
                                <Text style={s.freqName}>{f.name}</Text>
                                <View style={[s.freqDot, freqKey === k && s.freqDotOn]} />
                            </View>
                            <Text style={s.freqHz}>{f.hz} Hz</Text>
                            <Text style={s.freqDesc}>{f.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* VOLUME SLIDERS — web only, native needs a slider lib */}
                {Platform.OS === 'web' && (
                    <View style={s.sliderBlock}>
                        <View style={s.sliderRow}>
                            <Text style={s.sliderLabel}>Binaural</Text>
                            <input
                                type="range" min={0} max={100} value={bVol}
                                onChange={e => handleBVol(Number(e.target.value))}
                                style={{ flex: 1, accentColor: THEME.primary }}
                            />
                            <Text style={s.sliderVal}>{bVol}%</Text>
                        </View>
                        <View style={s.sliderRow}>
                            <Text style={s.sliderLabel}>Ambiente</Text>
                            <input
                                type="range" min={0} max={100} value={aVol}
                                onChange={e => handleAVol(Number(e.target.value))}
                                style={{ flex: 1, accentColor: THEME.primary }}
                            />
                            <Text style={s.sliderVal}>{aVol}%</Text>
                        </View>
                    </View>
                )}

                {/* AMBIENT */}
                <Text style={s.sectionLabel}>SOM AMBIENTE</Text>
                <View style={s.ambientGrid}>
                    {(Object.entries(AMBIENTS) as [AmbientKey, Ambient][]).map(([k, a]) => (
                        <TouchableOpacity
                            key={k}
                            style={[s.ambBtn, ambKey === k && s.ambBtnOn]}
                            onPress={() => handleAmb(k)}
                        >
                            <Text style={[s.ambTx, ambKey === k && s.ambTxOn]}>{a.emoji} {a.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ZEN BUTTON */}
                <TouchableOpacity style={s.zenBtn} onPress={() => { setZenMode(true); if (!running) toggleTimer(); }}>
                    <Text style={s.zenBtnTx}>🧠 Modo Isolamento Neural (Zen)</Text>
                </TouchableOpacity>

                {/* ABOUT LINK */}
                <Link href="/about" asChild>
                    <TouchableOpacity style={s.aboutBtn}>
                        <Text style={s.aboutBtnTx}>✨ Roadmap & Apoio</Text>
                    </TouchableOpacity>
                </Link>

                {/* SHARE CARD */}
                {done && (
                    <View style={s.shareCard}>
                        <Text style={s.shareTitle}>Card de Sincronização · Tema Kira</Text>
                        <View style={s.shareStats}>
                            <Text style={s.shareStat}>Duração <Text style={s.shareVal}>{Math.round(elapsed / 60)} min</Text></Text>
                            <Text style={s.shareStat}>Onda <Text style={s.shareVal}>{FREQS[freqKey].name} {FREQS[freqKey].hz}Hz</Text></Text>
                            <Text style={s.shareStat}>Ambiente <Text style={s.shareVal}>{AMBIENTS[ambKey].name}</Text></Text>
                        </View>
                        <TouchableOpacity style={s.btnPrimary} onPress={resetTimer}>
                            <Text style={s.btnPrimaryTx}>Nova sessão</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </View>
    );
}

// ── STYLES ─────────────────────────────────────────────────────────
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: THEME.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: THEME.border },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: THEME.primary },
    logoText: { color: THEME.text, fontSize: 15, fontWeight: '500', letterSpacing: 0.4 },
    syncPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1a0a0d', borderWidth: 0.5, borderColor: THEME.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    syncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.success },
    syncTx: { color: THEME.muted, fontSize: 12 },
    body: { padding: 16, paddingBottom: 40 },
    audioBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: THEME.card, borderWidth: 0.5, borderColor: THEME.border, borderRadius: 10, padding: 10, marginBottom: 4 },
    audioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#333' },
    audioDotOn: { backgroundColor: THEME.success },
    audioTx: { color: THEME.muted, fontSize: 12, flex: 1 },
    audioTxOn: { color: THEME.text },
    timerBlock: { alignItems: 'center', paddingVertical: 20 },
    timerDisplay: { color: THEME.text, fontSize: 60, fontWeight: '500', letterSpacing: -2, fontVariant: ['tabular-nums'] },
    timerLabel: { color: THEME.muted, fontSize: 12, marginTop: 4 },
    timerCtrl: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
    btnPrimary: { backgroundColor: THEME.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
    btnPrimaryTx: { color: '#fff', fontWeight: '500', fontSize: 14 },
    btnGhost: { borderWidth: 0.5, borderColor: THEME.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    btnGhostTx: { color: THEME.muted, fontSize: 13 },
    sectionLabel: { color: THEME.muted, fontSize: 11, letterSpacing: 1, marginBottom: 8, marginTop: 4 },
    freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
    freqCard: { width: (width - 48) / 2, backgroundColor: THEME.card, borderWidth: 0.5, borderColor: THEME.border, borderRadius: 10, padding: 12 },
    freqCardOn: { borderColor: THEME.primary },
    freqTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
    freqName: { color: THEME.text, fontWeight: '500', fontSize: 13 },
    freqHz: { color: THEME.muted, fontSize: 11 },
    freqDesc: { color: THEME.muted, fontSize: 11 },
    freqDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: THEME.border },
    freqDotOn: { backgroundColor: THEME.primary },
    sliderBlock: { marginBottom: 14 },
    sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 7 },
    sliderLabel: { color: THEME.muted, fontSize: 12, width: 66 },
    sliderVal: { color: THEME.text, fontSize: 12, width: 36, textAlign: 'right' },
    ambientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 16 },
    ambBtn: { backgroundColor: THEME.card, borderWidth: 0.5, borderColor: THEME.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
    ambBtnOn: { backgroundColor: '#2a0e13', borderColor: THEME.primary },
    ambTx: { color: THEME.muted, fontSize: 12 },
    ambTxOn: { color: THEME.text },
    zenBtn: { backgroundColor: '#1a0a0d', borderWidth: 0.5, borderColor: THEME.border, borderRadius: 10, padding: 11, alignItems: 'center', marginBottom: 14 },
    zenBtnTx: { color: THEME.muted, fontSize: 13 },
    aboutBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#a82c20', borderRadius: 10, padding: 11, alignItems: 'center', marginBottom: 16 },
    aboutBtnTx: { color: '#e74c3c', fontSize: 13, fontWeight: '500' },
    shareCard: { backgroundColor: THEME.card, borderWidth: 0.5, borderColor: THEME.border, borderRadius: 12, padding: 14, gap: 10 },
    shareTitle: { color: THEME.text, fontWeight: '500', fontSize: 13 },
    shareStats: { flexDirection: 'row', gap: 14 },
    shareStat: { color: THEME.muted, fontSize: 11 },
    shareVal: { color: THEME.primary, fontWeight: '500' },
    zenRoot: { flex: 1, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center', gap: 10 },
    zenTimer: { color: THEME.text, fontSize: 72, fontWeight: '500', letterSpacing: -3, fontVariant: ['tabular-nums'] },
    zenSub: { color: THEME.muted, fontSize: 13, marginBottom: 26 },
});