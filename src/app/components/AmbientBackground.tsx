// src/app/components/AmbientBackground.tsx
// Movido de app/components/ para src/app/components/
import { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import type { AmbientKey } from '../../types';

interface Props {
    ambKey: AmbientKey;
    intensity?: number;
}

function useCanvas(ambKey: AmbientKey, intensity: number) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = canvas.width = canvas.offsetWidth || window.innerWidth;
        const H = canvas.height = canvas.offsetHeight || window.innerHeight;

        // ── CHUVA ──────────────────────────────────────────────────
        if (ambKey === 'rain') {
            type Drop = { x: number; y: number; len: number; speed: number; op: number; };
            const drops: Drop[] = Array.from({ length: 120 }, () => ({
                x: Math.random() * W, y: Math.random() * H,
                len: 10 + Math.random() * 25,
                speed: 6 + Math.random() * 8,
                op: 0.12 + Math.random() * 0.25,
            }));
            const draw = () => {
                ctx.clearRect(0, 0, W, H);
                drops.forEach(d => {
                    const grad = ctx.createLinearGradient(d.x, d.y, d.x - 4, d.y + d.len);
                    grad.addColorStop(0, `rgba(34,211,238,0)`);
                    grad.addColorStop(1, `rgba(103,232,249,${d.op * intensity})`);
                    ctx.strokeStyle = grad; ctx.lineWidth = 1.2;
                    ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 3, d.y + d.len); ctx.stroke();
                    d.y += d.speed; d.x -= 2;
                    if (d.y > H + d.len) { d.y = -d.len; d.x = Math.random() * W; }
                });
                rafRef.current = requestAnimationFrame(draw);
            };
            draw();
        }

        // ── ESPAÇO ─────────────────────────────────────────────────
        if (ambKey === 'space') {
            type Star = { x: number; y: number; r: number; phase: number; speed: number; color: string; };
            const colors = ['255,255,255', '196,181,253', '167,139,250', '103,232,249'];
            const stars: Star[] = Array.from({ length: 180 }, () => ({
                x: Math.random() * W, y: Math.random() * H,
                r: 0.4 + Math.random() * 1.8,
                phase: Math.random() * Math.PI * 2,
                speed: 0.003 + Math.random() * 0.008,
                color: colors[Math.floor(Math.random() * colors.length)],
            }));
            const nebula = ctx.createRadialGradient(W * 0.35, H * 0.4, 0, W * 0.35, H * 0.4, W * 0.55);
            nebula.addColorStop(0, 'rgba(124,58,237,0.06)');
            nebula.addColorStop(0.5, 'rgba(167,139,250,0.03)');
            nebula.addColorStop(1, 'rgba(0,0,0,0)');
            let t = 0;
            const draw = () => {
                ctx.clearRect(0, 0, W, H);
                ctx.fillStyle = nebula; ctx.fillRect(0, 0, W, H);
                t++;
                stars.forEach(s => {
                    const op = (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))) * intensity;
                    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${s.color},${op})`; ctx.fill();
                    if (s.r > 1.3) {
                        ctx.strokeStyle = `rgba(${s.color},${op * 0.4})`; ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(s.x - s.r * 3, s.y); ctx.lineTo(s.x + s.r * 3, s.y);
                        ctx.moveTo(s.x, s.y - s.r * 3); ctx.lineTo(s.x, s.y + s.r * 3);
                        ctx.stroke();
                    }
                });
                rafRef.current = requestAnimationFrame(draw);
            };
            draw();
        }

        // ── CAFÉ ───────────────────────────────────────────────────
        if (ambKey === 'cafe') {
            type Puff = { x: number; y: number; r: number; vy: number; vx: number; op: number; phase: number; };
            const puffs: Puff[] = Array.from({ length: 18 }, () => ({
                x: W * 0.3 + Math.random() * W * 0.4,
                y: H * 0.5 + Math.random() * H * 0.4,
                r: 6 + Math.random() * 20, vy: -(0.3 + Math.random() * 0.6),
                vx: (Math.random() - 0.5) * 0.4, op: 0,
                phase: Math.random() * Math.PI * 2,
            }));
            let t = 0;
            const draw = () => {
                ctx.clearRect(0, 0, W, H); t += 0.5;
                puffs.forEach(p => {
                    p.y += p.vy; p.x += p.vx + Math.sin(t * 0.02 + p.phase) * 0.3; p.r += 0.08;
                    p.op = Math.max(0, 0.15 * (1 - (H - p.y) / (H * 0.5))) * intensity;
                    if (p.y < H * 0.1 || p.r > 55) {
                        p.y = H * 0.6 + Math.random() * H * 0.3;
                        p.x = W * 0.25 + Math.random() * W * 0.5;
                        p.r = 6 + Math.random() * 12; p.op = 0;
                    }
                    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                    grad.addColorStop(0, `rgba(251,146,60,${p.op})`);
                    grad.addColorStop(0.5, `rgba(234,88,12,${p.op * 0.5})`);
                    grad.addColorStop(1, `rgba(0,0,0,0)`);
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = grad; ctx.fill();
                });
                rafRef.current = requestAnimationFrame(draw);
            };
            draw();
        }

        // ── FLORESTA ───────────────────────────────────────────────
        if (ambKey === 'forest') {
            type Firefly = { x: number; y: number; vy: number; vx: number; op: number; phase: number; r: number; };
            const flies: Firefly[] = Array.from({ length: 45 }, () => ({
                x: Math.random() * W, y: H * 0.2 + Math.random() * H * 0.75,
                vy: -(0.1 + Math.random() * 0.3), vx: (Math.random() - 0.5) * 0.25,
                op: Math.random(), phase: Math.random() * Math.PI * 2,
                r: 1 + Math.random() * 2.5,
            }));
            let t = 0;
            const draw = () => {
                ctx.clearRect(0, 0, W, H);
                const bg = ctx.createLinearGradient(0, H * 0.6, 0, H);
                bg.addColorStop(0, 'rgba(0,0,0,0)');
                bg.addColorStop(1, `rgba(5,46,22,${0.08 * intensity})`);
                ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
                t++;
                flies.forEach(f => {
                    f.op = (0.5 + 0.5 * Math.sin(t * 0.04 + f.phase)) * intensity;
                    f.y += f.vy; f.x += f.vx + Math.sin(t * 0.025 + f.phase) * 0.5;
                    if (f.y < -10) { f.y = H * 0.9 + Math.random() * H * 0.1; f.x = Math.random() * W; }
                    if (f.x < 0) f.x = W; if (f.x > W) f.x = 0;
                    const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 5);
                    glow.addColorStop(0, `rgba(74,222,128,${f.op * 0.8})`);
                    glow.addColorStop(0.4, `rgba(74,222,128,${f.op * 0.2})`);
                    glow.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 5, 0, Math.PI * 2);
                    ctx.fillStyle = glow; ctx.fill();
                    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(187,247,208,${f.op})`; ctx.fill();
                });
                rafRef.current = requestAnimationFrame(draw);
            };
            draw();
        }

        // ── RUÍDO BRANCO ───────────────────────────────────────────
        if (ambKey === 'white') {
            const cx = W / 2, cy = H / 2;
            type Ring = { r: number; op: number; speed: number; delay: number; active: boolean; };
            const rings: Ring[] = Array.from({ length: 6 }, (_, i) => ({
                r: 0, op: 0, speed: 0.8 + i * 0.15, delay: i * 60, active: false,
            }));
            let t = 0;
            const maxR = Math.max(W, H) * 0.7;
            const draw = () => {
                ctx.clearRect(0, 0, W, H); t++;
                rings.forEach(ring => {
                    if (t < ring.delay) return;
                    if (!ring.active) { ring.r = 1; ring.op = 0.5; ring.active = true; }
                    ring.r += ring.speed;
                    ring.op = Math.max(0, 0.5 * (1 - ring.r / maxR)) * intensity;
                    if (ring.r > maxR) { ring.r = 1; ring.op = 0.5; }
                    ctx.beginPath(); ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(226,232,240,${ring.op})`; ctx.lineWidth = 1.5; ctx.stroke();
                });
                rafRef.current = requestAnimationFrame(draw);
            };
            draw();
        }

        return () => { cancelAnimationFrame(rafRef.current); };
    }, [ambKey, intensity]);

    return canvasRef;
}

function AmbientCanvas({ ambKey, intensity }: { ambKey: AmbientKey; intensity: number }) {
    const ref = useCanvas(ambKey, intensity);
    return (
        <canvas
            ref={ref as any}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
    );
}

export default memo(function AmbientBackground({ ambKey, intensity = 0.6 }: Props) {
    if (Platform.OS !== 'web') return null;
    return (
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
            <AmbientCanvas ambKey={ambKey} intensity={intensity} />
        </View>
    );
});
