import { db } from "@/db";
import { discoveries, ringMoments, wishes } from "@/db/schema";
import { and, asc, count, eq } from "drizzle-orm";
import { isTulipColor, type WishDTO } from "./constants";

const SEED_WISHES = [
  {
    name: "The Fairy Council",
    message:
      "Happy Birthday, Khushi! Every tulip in this land bloomed the moment you arrived. 🌷",
    color: "pink",
  },
  {
    name: "The Castle Keeper",
    message:
      "The gates are open just for you, Princess. Something precious waits in the deepest room… 💍",
    color: "purple",
  },
  {
    name: "Bunny & Friends",
    message: "Hoppy Birthday! Come play with us in the garden! 🐰🦊🦌",
    color: "yellow",
  },
];

let seeded = false;

async function ensureSeed() {
  if (seeded) return;
  const [{ value }] = await db.select({ value: count() }).from(wishes);
  if (value === 0) {
    await db.insert(wishes).values(SEED_WISHES);
  }
  seeded = true;
}

export function toWishDTO(row: typeof wishes.$inferSelect): WishDTO {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    color: isTulipColor(row.color) ? row.color : "pink",
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getWishes(): Promise<WishDTO[]> {
  await ensureSeed();
  const rows = await db.select().from(wishes).orderBy(asc(wishes.createdAt));
  return rows.map(toWishDTO);
}

export async function getRingCount(): Promise<number> {
  const [{ value }] = await db.select({ value: count() }).from(ringMoments);
  return value;
}

export async function getVisitorDiscoveries(visitorId: string) {
  const rows = await db
    .select({ itemKey: discoveries.itemKey })
    .from(discoveries)
    .where(eq(discoveries.visitorId, visitorId));
  return rows.map((r) => r.itemKey);
}

export async function hasDiscovered(visitorId: string, itemKey: string) {
  const rows = await db
    .select({ id: discoveries.id })
    .from(discoveries)
    .where(
      and(eq(discoveries.visitorId, visitorId), eq(discoveries.itemKey, itemKey)),
    )
    .limit(1);
  return rows.length > 0;
}

export async function getExplorerCount(): Promise<number> {
  const rows = await db
    .selectDistinct({ visitorId: discoveries.visitorId })
    .from(discoveries);
  return rows.length;
}
