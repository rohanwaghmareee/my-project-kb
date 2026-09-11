import { db } from "@/db";
import { ringMoments } from "@/db/schema";
import { getRingCount } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const total = await getRingCount();
    return NextResponse.json({ total });
  } catch (error) {
    console.error("GET /api/ring failed", error);
    return NextResponse.json({ error: "Could not load ring moments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let visitorId: string | null = null;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (typeof body.visitorId === "string" && /^[a-zA-Z0-9_-]{6,64}$/.test(body.visitorId)) {
      visitorId = body.visitorId;
    }
  } catch {
    // body is optional
  }

  try {
    await db.insert(ringMoments).values({ visitorId });
    const total = await getRingCount();
    return NextResponse.json({ total }, { status: 201 });
  } catch (error) {
    console.error("POST /api/ring failed", error);
    return NextResponse.json({ error: "Could not record the moment" }, { status: 500 });
  }
}
