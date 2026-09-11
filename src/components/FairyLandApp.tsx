"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import type { WishDTO } from "@/lib/constants";
import { useFairy } from "@/lib/store";
import { Hud } from "./hud/Hud";
import { Intro } from "./hud/Intro";
import { RingReveal } from "./hud/RingReveal";
import { WishPanel } from "./hud/WishPanel";

const Scene = dynamic(() => import("./world/Scene"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-0 flex items-center justify-center bg-gradient-to-b from-[#ffe4f1] via-[#f3e6ff] to-[#dff5e3]">
      <div className="text-center">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
        <p className="font-script text-3xl text-rose-600">Growing the tulips…</p>
      </div>
    </div>
  ),
});

export function FairyLandApp({
  initialWishes,
  initialRingCount,
}: {
  initialWishes: WishDTO[];
  initialRingCount: number;
}) {
  const setWishes = useFairy((s) => s.setWishes);
  const setRingCount = useFairy((s) => s.setRingCount);
  const initVisitor = useFairy((s) => s.initVisitor);

  useEffect(() => {
    setWishes(initialWishes);
    setRingCount(initialRingCount);
    initVisitor();
  }, [initialWishes, initialRingCount, setWishes, setRingCount, initVisitor]);

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <Scene />
      <Hud />
      <WishPanel />
      <RingReveal />
      <Intro />
    </div>
  );
}
