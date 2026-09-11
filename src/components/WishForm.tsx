"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { TULIP_COLORS, TULIP_COLOR_KEYS, type TulipColor } from "@/lib/constants";

export function WishForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState<TulipColor>("pink");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, color }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setName("");
      setMessage("");
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not plant your wish");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass space-y-3 rounded-3xl p-5">
      <h2 className="font-script text-4xl text-rose-600">Plant a wish</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required placeholder="Your name" className="field" />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={280}
        required
        rows={4}
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
              className={`h-7 w-7 rounded-full border-2 transition ${color === key ? "scale-110 border-rose-600" : "border-white"}`}
              style={{ background: TULIP_COLORS[key] }}
            />
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-700">Your tulip has bloomed in the Wish Garden 🌷</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
        {busy ? "Planting…" : "🌷 Plant my wish"}
      </button>
    </form>
  );
}
