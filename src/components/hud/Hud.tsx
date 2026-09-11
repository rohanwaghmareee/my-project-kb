"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DISCOVERY_ITEMS } from "@/lib/constants";
import { useFairy } from "@/lib/store";

const HINTS = [
  "Tap the animals — they love attention 🐰",
  "Every tulip blooms when you touch it 🌷",
  "Light the cake, open the gifts, free the balloons 🎂",
  "The castle door opens for a princess 🏰",
  "Something precious hides in the deepest room 💍",
  "Butterflies grant wishes if you catch them 🦋",
];

type View = { label: string; icon: string; position: [number, number, number]; target: [number, number, number] };
const VIEWS: View[] = [
  { label: "Overview", icon: "🏞️", position: [2, 13, 46], target: [0, 4, 2] },
  { label: "Castle", icon: "🏰", position: [6, 7, 22], target: [0, 6, 0] },
  { label: "Tulip path", icon: "🌷", position: [-6, 4, 30], target: [0, 1, 16] },
  { label: "Wish garden", icon: "💌", position: [20, 6, 24], target: [14, 1, 15] },
  { label: "Waterfall", icon: "💦", position: [-24, 5, 8], target: [-18, 3, -4] },
  { label: "The lake", icon: "🦢", position: [-2, 6, -2], target: [2, 1, -14] },
];

export function Hud() {
  const mode = useFairy((s) => s.mode);
  const room = useFairy((s) => s.room);
  const discovered = useFairy((s) => s.discovered);
  const explorers = useFairy((s) => s.explorers);
  const soundOn = useFairy((s) => s.soundOn);
  const toggleSound = useFairy((s) => s.toggleSound);
  const setWishPanelOpen = useFairy((s) => s.setWishPanelOpen);
  const wishes = useFairy((s) => s.wishes);
  const setFocus = useFairy((s) => s.setFocus);
  const enterCastle = useFairy((s) => s.enterCastle);
  const exitCastle = useFairy((s) => s.exitCastle);
  const goToRoom = useFairy((s) => s.goToRoom);
  const hint = useFairy((s) => s.hint);
  const transitioning = useFairy((s) => s.transitioning);
  const [hintIndex, setHintIndex] = useState(0);
  const [showFound, setShowFound] = useState(false);
  const [showViews, setShowViews] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setHintIndex((i) => (i + 1) % HINTS.length), 6000);
    return () => window.clearInterval(t);
  }, []);

  const total = DISCOVERY_ITEMS.length;
  const found = discovered.length;
  const roomNames = ["Grand Hall", "Tulip Gallery", "Hall of Wishes", "Heart Chamber"];

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-0 z-[70] bg-[#fff0f6] transition-opacity duration-700 ${
          transitioning ? "opacity-100" : "opacity-0"
        }`}
      />
      {mode !== "intro" && (
        <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-3 md:p-5">
          {/* top row */}
          <div className="flex items-start justify-between gap-3">
            <div className="glass pointer-events-auto rounded-2xl px-4 py-2.5 md:px-5 md:py-3">
              <h1 className="font-script text-3xl leading-none text-rose-600 md:text-4xl">Khushi&apos;s Fairy Land</h1>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-fuchsia-600/80 md:text-xs">
                {mode === "inside" ? `Castle · ${roomNames[room]}` : "Happy Birthday, Princess 🌷"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFound((v) => !v)}
                  className="glass pointer-events-auto rounded-full px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-white"
                >
                  ✨ {found}/{total} found
                </button>
                <button
                  type="button"
                  onClick={toggleSound}
                  aria-label="Toggle sound"
                  className="glass pointer-events-auto rounded-full px-3 py-2 text-base hover:bg-white"
                >
                  {soundOn ? "🔔" : "🔕"}
                </button>
              </div>
              {showFound && (
                <div className="glass pointer-events-auto w-64 rounded-2xl p-3 text-sm md:w-72">
                  <p className="mb-2 font-semibold text-rose-700">Fairy friends & treasures</p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {DISCOVERY_ITEMS.map((item) => {
                      const ok = discovered.includes(item.key);
                      return (
                        <div
                          key={item.key}
                          title={ok ? item.label : "???"}
                          className={`flex h-9 items-center justify-center rounded-xl text-lg ${
                            ok ? "bg-rose-100" : "bg-slate-100 opacity-50 grayscale"
                          }`}
                        >
                          {ok ? item.icon : "?"}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-rose-900/60">
                    {found === total
                      ? "You found everything! You are officially a fairy 🧚"
                      : "Keep touching things — the land remembers what you found."}
                    {explorers > 0 && ` · ${explorers} explorer${explorers === 1 ? "" : "s"} so far`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* bottom row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="glass pointer-events-auto max-w-md rounded-2xl px-4 py-2.5 text-sm text-rose-900/80">
              {hint ?? (mode === "inside" ? "Click the glowing door to go deeper 🚪" : HINTS[hintIndex])}
            </div>
            <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
              {mode === "outside" && (
                <div className="relative">
                  <button type="button" onClick={() => setShowViews((v) => !v)} className="btn-soft">
                    🎥 Views
                  </button>
                  {showViews && (
                    <div className="glass absolute bottom-12 right-0 flex w-44 flex-col gap-1 rounded-2xl p-2">
                      {VIEWS.map((v) => (
                        <button
                          key={v.label}
                          type="button"
                          onClick={() => {
                            setFocus(v.position, v.target);
                            setShowViews(false);
                          }}
                          className="rounded-xl px-3 py-1.5 text-left text-sm text-rose-800 hover:bg-rose-100"
                        >
                          {v.icon} {v.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button type="button" onClick={() => setWishPanelOpen(true)} className="btn-soft">
                🌷 Plant a wish
              </button>
              <button type="button" onClick={() => setWishPanelOpen(true)} className="btn-soft">
                💌 Wishes ({wishes.length})
              </button>
              {mode === "outside" ? (
                <button type="button" onClick={enterCastle} className="btn-primary">
                  🏰 Enter the castle
                </button>
              ) : (
                <>
                  {room > 0 && (
                    <button type="button" onClick={() => goToRoom(room - 1)} className="btn-soft">
                      ◀ {roomNames[room - 1]}
                    </button>
                  )}
                  {room < 3 && (
                    <button type="button" onClick={() => goToRoom(room + 1)} className="btn-soft">
                      {roomNames[room + 1]} ▶
                    </button>
                  )}
                  <button type="button" onClick={exitCastle} className="btn-primary">
                    🌷 Back to the garden
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {mode !== "intro" && (
        <Link
          href="/wishes"
          className="glass pointer-events-auto fixed bottom-1 left-1/2 z-40 hidden -translate-x-1/2 rounded-full px-3 py-1 text-[11px] text-rose-700/70 hover:text-rose-700 md:block"
        >
          open the wish book →
        </Link>
      )}
    </>
  );
}
