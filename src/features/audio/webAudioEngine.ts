// src/features/audio/webAudioEngine.ts
// Implementação Web Audio API — roda apenas em Platform.OS === 'web'
import type { IAudioEngine } from './types';
import type { AmbientConfig } from '../../../services/themes/tokens';
import { CARRIER_HZ } from '../../../services/themes/tokens';

export class WebAudioEngine implements IAudioEngine {
    private ac: AudioContext | null = null;
    private masterGn: GainNode | null = null;
    private gainL: GainNode | null = null;
    private gainR: GainNode | null = null;
    private oscL: OscillatorNode | null = null;
    private oscR: OscillatorNode | null = null;
    private noiseSrc: AudioBufferSourceNode | null = null;
    private noiseGn: GainNode | null = null;
    private analyser: AnalyserNode | null = null;
    private _binauralHz = 10;
    private _bVol = 0.7;
    private _running = false;

    boot(): void {
        if (this.ac) return;

        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.ac = new AC() as AudioContext;

        // Analyser para FFT
        this.analyser = this.ac.createAnalyser();
        this.analyser.fftSize = 256;

        // Master gain
        this.masterGn = this.ac.createGain();
        this.masterGn.connect(this.analyser);
        this.analyser.connect(this.ac.destination);

        // Binaural: merger de 2 canais
        const merger = this.ac.createChannelMerger(2);
        merger.connect(this.masterGn);

        this.gainL = this.ac.createGain();
        this.gainR = this.ac.createGain();
        this.gainL.gain.value = this._bVol * 0.5;
        this.gainR.gain.value = this._bVol * 0.5;
        this.gainL.connect(merger, 0, 0);
        this.gainR.connect(merger, 0, 1);

        this.oscL = this.ac.createOscillator();
        this.oscR = this.ac.createOscillator();
        this.oscL.type = 'sine';
        this.oscR.type = 'sine';
        this.oscL.frequency.value = CARRIER_HZ;
        this.oscR.frequency.value = CARRIER_HZ + this._binauralHz;
        this.oscL.connect(this.gainL);
        this.oscR.connect(this.gainR);
        this.oscL.start();
        this.oscR.start();

        this._running = true;
    }

    suspend(): void {
        this.ac?.suspend();
        this._running = false;
    }

    resume(): void {
        this.ac?.resume();
        this._running = true;
    }

    dispose(): void {
        try {
            this.noiseSrc?.stop();
            this.oscL?.stop();
            this.oscR?.stop();
        } catch {}
        this.ac?.close();
        this.ac = null;
        this._running = false;
    }

    setBinauralFreq(hz: number): void {
        this._binauralHz = hz;
        if (this.oscR && this.ac) {
            this.oscR.frequency.setValueAtTime(CARRIER_HZ + hz, this.ac.currentTime);
        }
    }

    setBinauralVolume(vol: number): void {
        this._bVol = vol / 100;
        if (!this.ac || !this.gainL || !this.gainR) return;
        const t = this.ac.currentTime;
        this.gainL.gain.setValueAtTime(this._bVol * 0.5, t);
        this.gainR.gain.setValueAtTime(this._bVol * 0.5, t);
    }

    setAmbient(amb: AmbientConfig, vol: number): void {
        if (!this.ac || !this.masterGn) return;
        try { this.noiseSrc?.stop(); } catch {}

        const sr = this.ac.sampleRate;
        const buf = this.ac.createBuffer(1, sr * 4, sr);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

        const src = this.ac.createBufferSource();
        src.buffer = buf;
        src.loop = true;

        const flt = this.ac.createBiquadFilter();
        flt.type = amb.filterType;
        flt.frequency.value = amb.freq;
        flt.Q.value = amb.Q;

        const gn = this.ac.createGain();
        gn.gain.value = (vol / 100) * 0.25;

        src.connect(flt);
        flt.connect(gn);
        gn.connect(this.masterGn);
        src.start();

        this.noiseSrc = src;
        this.noiseGn = gn;
    }

    setAmbientVolume(vol: number): void {
        if (!this.noiseGn || !this.ac) return;
        this.noiseGn.gain.setValueAtTime((vol / 100) * 0.25, this.ac.currentTime);
    }

    getFFTData(): Float32Array | null {
        if (!this.analyser) return null;
        const arr = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatFrequencyData(arr);
        return arr;
    }

    isRunning(): boolean {
        return this._running;
    }
}
