import { db } from "@/db";
import { wishes } from "@/db/schema";
import { isTulipColor } from "@/lib/constants";
import { getWishes, toWishDTO } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getWishes();
    return NextResponse.json({ wishes: list });
  } catch (error) {
    console.error("GET /api/wishes failed", error);
    return NextResponse.json({ error: "Could not load wishes" }, { status: 500 });
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
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  const color = isTulipColor(data.color) ? data.color : "pink";

  if (name.length < 1 || name.length > 60) {
    return NextResponse.json(
      { error: "Please tell us your name (1–60 characters)." },
      { status: 400 },
    );
  }
  if (message.length < 2 || message.length > 280) {
    return NextResponse.json(
      { error: "Your wish should be between 2 and 280 characters." },
      { status: 400 },
    );
  }

  try {
    const [row] = await db
      .insert(wishes)
      .values({ name, message, color })
      .returning();
    return NextResponse.json({ wish: toWishDTO(row) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/wishes failed", error);
    return NextResponse.json({ error: "Could not plant your wish" }, { status: 500 });
  }
}
