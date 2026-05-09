// src/features/audio/useAudio.ts
// Hook que instancia o AudioEngine correto e sincroniza com o Zustand store
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useAudioStore } from '../../store/useAudioStore';
import { FREQS, AMBIENTS } from '../../../services/themes/tokens';
import type { IAudioEngine } from './types';
import type { FreqKey, AmbientKey } from '../../types';

export function useAudio() {
    const engineRef = useRef<IAudioEngine | null>(null);
    const { freqKey, ambKey, bVol, aVol, audioOn, setFreq, setAmb, setBVol, setAVol, setAudioOn } =
        useAudioStore();

    // Garante que o engine existe (somente web por ora)
    const getEngine = useCallback(async (): Promise<IAudioEngine | null> => {
        if (Platform.OS !== 'web') return null;
        if (!engineRef.current) {
            const { WebAudioEngine } = await import('./webAudioEngine');
            engineRef.current = new WebAudioEngine();
        }
        return engineRef.current;
    }, []);

    // Pre-carrega o engine para evitar perder o "user gesture" no primeiro clique
    useEffect(() => {
        getEngine();
    }, [getEngine]);

    // Cleanup ao desmontar
    useEffect(() => {
        return () => {
            engineRef.current?.dispose();
            engineRef.current = null;
        };
    }, []);

    const bootAudio = useCallback(async () => {
        const engine = await getEngine();
        if (!engine) return;
        engine.boot();
        engine.setBinauralFreq(FREQS[freqKey].hz);
        engine.setBinauralVolume(bVol);
        engine.setAmbient(AMBIENTS[ambKey], aVol);
        engine.resume();
        setAudioOn(true);
    }, [getEngine, freqKey, ambKey, bVol, aVol, setAudioOn]);

    const suspendAudio = useCallback(async () => {
        const engine = await getEngine();
        engine?.suspend();
        setAudioOn(false);
    }, [getEngine, setAudioOn]);

    const handleFreq = useCallback(
        async (key: FreqKey) => {
            setFreq(key);
            const engine = await getEngine();
            engine?.setBinauralFreq(FREQS[key].hz);
        },
        [getEngine, setFreq]
    );

    const handleAmb = useCallback(
        async (key: AmbientKey) => {
            setAmb(key);
            const engine = await getEngine();
            if (engine) engine.setAmbient(AMBIENTS[key], aVol);
        },
        [getEngine, setAmb, aVol]
    );

    const handleBVol = useCallback(
        async (vol: number) => {
            setBVol(vol);
            const engine = await getEngine();
            engine?.setBinauralVolume(vol);
        },
        [getEngine, setBVol]
    );

    const handleAVol = useCallback(
        async (vol: number) => {
            setAVol(vol);
            const engine = await getEngine();
            engine?.setAmbientVolume(vol);
        },
        [getEngine, setAVol]
    );

    const getFFTData = useCallback(async () => {
        const engine = await getEngine();
        return engine?.getFFTData() ?? null;
    }, [getEngine]);

    return {
        freqKey, ambKey, bVol, aVol, audioOn,
        bootAudio, suspendAudio,
        handleFreq, handleAmb, handleBVol, handleAVol,
        getFFTData,
    };
}
