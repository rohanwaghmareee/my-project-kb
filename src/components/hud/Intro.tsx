"use client";

import { unlockAudio } from "@/lib/sound";
import { useFairy } from "@/lib/store";

const FLOATING = ["🌷", "🌷", "🦋", "🌷", "✨", "🌷", "💖", "🌷", "🧚", "🌷", "🌷", "✨"];

export function Intro() {
  const mode = useFairy((s) => s.mode);
  const start = useFairy((s) => s.start);
  if (mode !== "intro") return null;
  return (
    <div className="intro fixed inset-0 z-[60] flex items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        {FLOATING.map((e, i) => (
          <span
            key={i}
            className="floaty absolute text-3xl md:text-5xl"
            style={{
              left: `${(i * 8.3 + 4) % 100}%`,
              animationDelay: `${(i * 0.9) % 6}s`,
              animationDuration: `${9 + (i % 4) * 2}s`,
            }}
          >
            {e}
          </span>
        ))}
      </div>
      <div className="intro-card relative mx-4 max-w-xl rounded-[2rem] px-8 py-10 text-center md:px-14 md:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500/80">A fairy land made for</p>
        <h1 className="font-script mt-3 text-7xl leading-none text-rose-600 md:text-8xl">Khushi</h1>
        <p className="font-script mt-2 text-4xl text-fuchsia-500 md:text-5xl">Happy Birthday</p>
        <p className="mt-6 text-base leading-relaxed text-rose-900/80 md:text-lg">
          A whole enchanted world where every bunny, butterfly and tulip comes alive at your touch.
          Somewhere deep inside the castle, something precious is waiting for you…
        </p>
        <button
          type="button"
          onClick={() => {
            unlockAudio();
            start();
          }}
          className="btn-primary mt-8 text-lg"
        >
          Step into the fairy land ✨
        </button>
        <p className="mt-5 text-xs text-rose-900/60">
          Drag to look around · scroll to zoom · tap everything 🌷 · sound on for magic 🔔
        </p>
      </div>
    </div>
  );
}
