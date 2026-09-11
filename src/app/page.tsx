import { FairyLandApp } from "@/components/FairyLandApp";
import { getRingCount, getWishes } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [wishes, ringCount] = await Promise.all([getWishes(), getRingCount()]);
  return <FairyLandApp initialWishes={wishes} initialRingCount={ringCount} />;
}
