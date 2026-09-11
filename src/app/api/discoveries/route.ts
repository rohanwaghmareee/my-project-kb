import { db } from "@/db";
import { discoveries } from "@/db/schema";
import { DISCOVERY_KEYS, isDiscoveryKey } from "@/lib/constants";
import { getExplorerCount, getVisitorDiscoveries } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VISITOR_RE = /^[a-zA-Z0-9_-]{6,64}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const visitorId = searchParams.get("visitor") ?? "";
  if (!VISITOR_RE.test(visitorId)) {
    return NextResponse.json({ error: "Invalid visitor id" }, { status: 400 });
  }
  try {
    const [found, explorers] = await Promise.all([
      getVisitorDiscoveries(visitorId),
      getExplorerCount(),
    ]);
    return NextResponse.json({
      discovered: found,
      total: DISCOVERY_KEYS.length,
      explorers,
    });
  } catch (error) {
    console.error("GET /api/discoveries failed", error);
    return NextResponse.json({ error: "Could not load discoveries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const data = (body ?? {}) as Record<string, unknown>;
  const visitorId = typeof data.visitorId === "string" ? data.visitorId : "";
  const itemKey = data.itemKey;

  if (!VISITOR_RE.test(visitorId)) {
    return NextResponse.json({ error: "Invalid visitor id" }, { status: 400 });
  }
  if (!isDiscoveryKey(itemKey)) {
    return NextResponse.json({ error: "Unknown fairy land item" }, { status: 400 });
  }

  try {
    await db
      .insert(discoveries)
      .values({ visitorId, itemKey })
      .onConflictDoNothing();
    const found = await getVisitorDiscoveries(visitorId);
    return NextResponse.json({ discovered: found, total: DISCOVERY_KEYS.length });
  } catch (error) {
    console.error("POST /api/discoveries failed", error);
    return NextResponse.json({ error: "Could not save discovery" }, { status: 500 });
  }
}
