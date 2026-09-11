"use client";

import { create } from "zustand";
import { DISCOVERY_KEYS, type DiscoveryKey, type WishDTO } from "./constants";

export type Mode = "intro" | "outside" | "inside";

export type Burst = {
  id: number;
  position: [number, number, number];
  color: string;
  kind: "hearts" | "sparkles" | "petals" | "confetti";
  count?: number;
};

export type Focus = {
  position: [number, number, number];
  target: [number, number, number];
  key: number;
};

type FairyState = {
  mode: Mode;
  room: number;
  transitioning: boolean;
  visitorId: string | null;
  discovered: DiscoveryKey[];
  explorers: number;
  bursts: Burst[];
  focus: Focus | null;
  ringOpened: boolean;
  ringRevealVisible: boolean;
  ringCount: number;
  wishes: WishDTO[];
  wishPanelOpen: boolean;
  soundOn: boolean;
  hint: string | null;

  start: () => void;
  enterCastle: () => void;
  exitCastle: () => void;
  goToRoom: (room: number) => void;
  initVisitor: () => void;
  discover: (key: DiscoveryKey) => void;
  addBurst: (burst: Omit<Burst, "id">) => void;
  removeBurst: (id: number) => void;
  setFocus: (position: [number, number, number], target: [number, number, number]) => void;
  clearFocus: () => void;
  openRing: () => void;
  closeRingReveal: () => void;
  setWishes: (wishes: WishDTO[]) => void;
  addWish: (wish: WishDTO) => void;
  setRingCount: (count: number) => void;
  setWishPanelOpen: (open: boolean) => void;
  toggleSound: () => void;
  setHint: (hint: string | null) => void;
};

let burstId = 1;
let focusKey = 1;

function makeVisitorId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 32);
  }
  return `v${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
}

function withTransition(apply: () => void, set: (partial: Partial<FairyState>) => void) {
  set({ transitioning: true });
  window.setTimeout(() => {
    apply();
    window.setTimeout(() => set({ transitioning: false }), 80);
  }, 650);
}

export const useFairy = create<FairyState>((set, get) => ({
  mode: "intro",
  room: 0,
  transitioning: false,
  visitorId: null,
  discovered: [],
  explorers: 0,
  bursts: [],
  focus: null,
  ringOpened: false,
  ringRevealVisible: false,
  ringCount: 0,
  wishes: [],
  wishPanelOpen: false,
  soundOn: true,
  hint: null,

  start: () => set({ mode: "outside" }),

  enterCastle: () =>
    withTransition(() => set({ mode: "inside", room: 0, focus: null }), set),

  exitCastle: () =>
    withTransition(
      () => set({ mode: "outside", room: 0, ringRevealVisible: false, focus: null }),
      set,
    ),

  goToRoom: (room) => withTransition(() => set({ room }), set),

  initVisitor: () => {
    if (get().visitorId) return;
    let id = "";
    try {
      id = window.localStorage.getItem("khushi-visitor") ?? "";
      if (!id) {
        id = makeVisitorId();
        window.localStorage.setItem("khushi-visitor", id);
      }
    } catch {
      id = makeVisitorId();
    }
    set({ visitorId: id });
    fetch(`/api/discoveries?visitor=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { discovered?: string[]; explorers?: number } | null) => {
        if (!data) return;
        const found = (data.discovered ?? []).filter((k): k is DiscoveryKey =>
          (DISCOVERY_KEYS as string[]).includes(k),
        );
        set((s) => ({
          discovered: Array.from(new Set([...s.discovered, ...found])),
          explorers: data.explorers ?? s.explorers,
        }));
      })
      .catch(() => {});
  },

  discover: (key) => {
    const { discovered, visitorId } = get();
    if (discovered.includes(key)) return;
    set({ discovered: [...discovered, key] });
    if (!visitorId) return;
    fetch("/api/discoveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, itemKey: key }),
    }).catch(() => {});
  },

  addBurst: (burst) => {
    const id = burstId++;
    set((s) => ({ bursts: [...s.bursts.slice(-12), { ...burst, id }] }));
  },

  removeBurst: (id) => set((s) => ({ bursts: s.bursts.filter((b) => b.id !== id) })),

  setFocus: (position, target) =>
    set({ focus: { position, target, key: focusKey++ } }),

  clearFocus: () => set({ focus: null }),

  openRing: () => {
    if (get().ringOpened) {
      set({ ringRevealVisible: true });
      return;
    }
    set({ ringOpened: true });
    window.setTimeout(() => set({ ringRevealVisible: true }), 1800);
    const visitorId = get().visitorId;
    fetch("/api/ring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { total?: number } | null) => {
        if (data?.total !== undefined) set({ ringCount: data.total });
      })
      .catch(() => {});
  },

  closeRingReveal: () => set({ ringRevealVisible: false }),

  setWishes: (wishes) => set({ wishes }),
  addWish: (wish) => set((s) => ({ wishes: [...s.wishes, wish] })),
  setRingCount: (count) => set({ ringCount: count }),
  setWishPanelOpen: (open) => set({ wishPanelOpen: open }),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  setHint: (hint) => set({ hint }),
}));
