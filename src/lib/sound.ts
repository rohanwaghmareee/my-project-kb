"use client";

import { useFairy } from "./store";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function unlockAudio() {
  getCtx();
}

type SoundKind = "pop" | "chime" | "sparkle" | "magic" | "quack" | "whoosh" | "love";

function tone(
  ac: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  glideTo?: number,
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + duration);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playSound(kind: SoundKind) {
  if (!useFairy.getState().soundOn) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  switch (kind) {
    case "pop":
      tone(ac, 520, t, 0.12, "sine", 0.25, 880);
      break;
    case "chime":
      [784, 988, 1175].forEach((f, i) => tone(ac, f, t + i * 0.07, 0.35, "triangle", 0.12));
      break;
    case "sparkle":
      [1568, 1976, 2349, 2637].forEach((f, i) =>
        tone(ac, f, t + i * 0.05, 0.22, "sine", 0.07),
      );
      break;
    case "magic":
      [523, 659, 784, 1047, 1319].forEach((f, i) =>
        tone(ac, f, t + i * 0.08, 0.5, "triangle", 0.1),
      );
      break;
    case "quack":
      tone(ac, 300, t, 0.14, "sawtooth", 0.08, 180);
      tone(ac, 300, t + 0.18, 0.14, "sawtooth", 0.08, 180);
      break;
    case "whoosh":
      tone(ac, 200, t, 0.5, "sine", 0.12, 900);
      break;
    case "love":
      [523, 659, 784, 1047].forEach((f, i) => tone(ac, f, t + i * 0.16, 0.9, "sine", 0.14));
      [1319, 1568].forEach((f, i) => tone(ac, f, t + 0.7 + i * 0.16, 1.4, "triangle", 0.08));
      break;
  }
}
