import { store } from "./store";
let ctx: AudioContext | null = null;
const NOTES: Record<"rank" | "boss" | "turn", number[]> = { rank: [523, 659, 784], boss: [392, 523, 659, 784], turn: [784, 659, 523, 392, 523] };
export function chime(kind: "rank" | "boss" | "turn") {
  if (!store.acc.settings.sound) return;
  try { ctx ??= new AudioContext(); const t0 = ctx.currentTime;
    NOTES[kind].forEach((f, i) => { const o = ctx!.createOscillator(), g = ctx!.createGain(); o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0 + i * 0.12); g.gain.exponentialRampToValueAtTime(0.2, t0 + i * 0.12 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.12 + 0.25); o.connect(g).connect(ctx!.destination); o.start(t0 + i * 0.12); o.stop(t0 + i * 0.12 + 0.3); });
  } catch { /* no audio, no problem */ }
}
