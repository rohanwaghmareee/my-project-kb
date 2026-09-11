import Link from "next/link";
import { WishForm } from "@/components/WishForm";
import { TULIP_COLORS } from "@/lib/constants";
import { getRingCount, getWishes } from "@/lib/data";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function WishesPage() {
  const [wishes, ringCount] = await Promise.all([getWishes(), getRingCount()]);
  return (
    <main className="intro min-h-dvh px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500/80">The wish book of</p>
          <h1 className="font-script mt-2 text-7xl leading-none text-rose-600 md:text-8xl">Khushi</h1>
          <p className="mt-3 text-rose-900/70">
            {wishes.length} wishes are blooming as tulips in her fairy land
            {ringCount > 0 && ` · the ring has been opened ${ringCount} time${ringCount === 1 ? "" : "s"} 💍`}
          </p>
          <Link href="/" className="btn-primary mt-5">
            🌷 Enter the 3D fairy land
          </Link>
        </header>

        <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <WishForm />
          <section className="space-y-3">
            {[...wishes].reverse().map((w) => (
              <article key={w.id} className="glass rounded-3xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" style={{ filter: `drop-shadow(0 0 6px ${TULIP_COLORS[w.color]})` }}>
                    🌷
                  </span>
                  <strong className="text-rose-800">{w.name}</strong>
                  <span className="ml-auto text-xs text-rose-900/40">{formatDate(w.createdAt)}</span>
                </div>
                <p className="mt-2 leading-relaxed text-rose-950/80">{w.message}</p>
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
