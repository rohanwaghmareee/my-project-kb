"use client";

import { useFairy } from "@/lib/store";

const PETALS = Array.from({ length: 18 }, (_, i) => i);

export function RingReveal() {
  const visible = useFairy((s) => s.ringRevealVisible);
  const close = useFairy((s) => s.closeRingReveal);
  const exitCastle = useFairy((s) => s.exitCastle);
  const setWishPanelOpen = useFairy((s) => s.setWishPanelOpen);
  const ringCount = useFairy((s) => s.ringCount);
  if (!visible) return null;
  return (
    <div className="reveal fixed inset-0 z-[90] flex items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0">
        {PETALS.map((i) => (
          <span
            key={i}
            className="petal absolute text-2xl md:text-4xl"
            style={{
              left: `${(i * 5.6 + 2) % 100}%`,
              animationDelay: `${(i * 0.7) % 5}s`,
              animationDuration: `${7 + (i % 5)}s`,
            }}
          >
            {i % 3 === 0 ? "💖" : "🌷"}
          </span>
        ))}
      </div>
      <div className="reveal-card relative w-full max-w-2xl rounded-[2.5rem] px-6 py-10 text-center md:px-14 md:py-14">
        <div className="ring-badge mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-5xl">💍</div>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-rose-500/80">Khushi,</p>
        <h2 className="font-script mt-3 text-6xl leading-[0.95] text-rose-600 md:text-8xl">I love you</h2>
        <p className="font-script mt-4 text-4xl leading-tight text-fuchsia-600 md:text-6xl">
          &amp; Happy Birthday,
          <br />
          love of my life.
        </p>
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-rose-900/80 md:text-lg">
          You are the tulip in every garden I will ever walk through. Every room of this castle, every
          creature in this land — I built them all just to say it one more time:{" "}
          <span className="font-semibold text-rose-700">I love you.</span>
        </p>
        <p className="mt-5 text-3xl tracking-widest">🌷🌷💐🌷🌷</p>
        <p className="font-script mt-4 text-3xl text-rose-500">— forever yours</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              close();
              exitCastle();
            }}
            className="btn-primary"
          >
            🌷 Back to our fairy land
          </button>
          <button
            type="button"
            onClick={() => {
              close();
              setWishPanelOpen(true);
            }}
            className="btn-soft"
          >
            💌 Read the wishes
          </button>
          <button type="button" onClick={close} className="btn-soft">
            Stay a little longer 💍
          </button>
        </div>
        {ringCount > 0 && (
          <p className="mt-5 text-[11px] text-rose-900/50">
            This promise has been opened {ringCount} time{ringCount === 1 ? "" : "s"} — and it is true every time.
          </p>
        )}
      </div>
    </div>
  );
}
