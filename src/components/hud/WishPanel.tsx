"use client";

import { useState, type FormEvent } from "react";
import { TULIP_COLORS, TULIP_COLOR_KEYS, type TulipColor, type WishDTO } from "@/lib/constants";
import { playSound } from "@/lib/sound";
import { useFairy } from "@/lib/store";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export function WishPanel() {
  const open = useFairy((s) => s.wishPanelOpen);
  const setOpen = useFairy((s) => s.setWishPanelOpen);
  const wishes = useFairy((s) => s.wishes);
  const addWish = useFairy((s) => s.addWish);
  const addBurst = useFairy((s) => s.addBurst);
  const setFocus = useFairy((s) => s.setFocus);
  const mode = useFairy((s) => s.mode);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState<TulipColor>("pink");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, color }),
      });
      const data = (await res.json()) as { wish?: WishDTO; error?: string };
      if (!res.ok || !data.wish) throw new Error(data.error ?? "Something went wrong");
      addWish(data.wish);
      setSuccess(`Your ${color} tulip just bloomed in the Wish Garden, ${data.wish.name}! 🌷`);
      setName("");
      setMessage("");
      playSound("magic");
      addBurst({ position: [14, 2, 15], color: TULIP_COLORS[color], kind: "hearts", count: 30 });
      if (mode === "outside") setFocus([20, 6, 24], [14, 1, 15]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not plant your wish");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-rose-950/30 backdrop-blur-[2px]"
      />
      <aside className="panel relative flex h-full w-full max-w-md flex-col overflow-hidden bg-[#fff7fa] shadow-2xl">
        <div className="flex items-center justify-between border-b border-rose-100 px-5 py-4">
          <div>
            <h2 className="font-script text-4xl leading-none text-rose-600">Wish Garden</h2>
            <p className="mt-1 text-xs text-rose-900/60">Every wish plants a tulip for Khushi 🌷</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="btn-soft px-3 py-1.5">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3 border-b border-rose-100 px-5 py-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            required
            placeholder="Your name"
            className="field"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={280}
            required
            rows={3}
            placeholder="Your birthday wish for Khushi…"
            className="field resize-none"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-900/70">Tulip colour</span>
            <div className="flex gap-1.5">
              {TULIP_COLOR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-label={key}
                  onClick={() => setColor(key)}
                  className={`h-7 w-7 rounded-full border-2 transition ${
                    color === key ? "scale-110 border-rose-600" : "border-white"
                  }`}
                  style={{ background: TULIP_COLORS[key] }}
                />
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? "Planting…" : "🌷 Plant my wish"}
          </button>
        </form>

        <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-900/50">
            {wishes.length} wishes blooming
          </p>
          {[...wishes].reverse().map((w) => (
            <article key={w.id} className="rounded-2xl border border-rose-100 bg-white/80 p-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: TULIP_COLORS[w.color] }} />
                <strong className="text-sm text-rose-800">{w.name}</strong>
                <span className="ml-auto text-[11px] text-rose-900/40">{timeAgo(w.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-rose-950/80">{w.message}</p>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
