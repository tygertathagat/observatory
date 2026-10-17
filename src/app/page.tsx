import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Room } from "@/components/room/Room";
import { Cursor } from "@/components/fx/Cursor";
import { Fallback } from "@/components/panels/Fallback";
import { listEssays } from "@/lib/essays";

/** Drop photos into public/beyond/ and they appear in "Beyond the screen". */
function beyondPhotos(): string[] {
  try {
    return readdirSync(join(process.cwd(), "public", "beyond"))
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort()
      .map((f) => `/beyond/${f}`);
  } catch {
    return [];
  }
}

/** Drop one portrait into public/me/ and it appears in About. */
function portrait(): string | null {
  try {
    const f = readdirSync(join(process.cwd(), "public", "me")).filter((x) => /\.(jpe?g|png|webp|avif)$/i.test(x)).sort()[0];
    return f ? `/me/${f}` : null;
  } catch {
    return null;
  }
}

export default function Home() {
  const photos = beyondPhotos();
  const essays = listEssays();
  return (
    <main>
      <Cursor />
      <Room beyondPhotos={photos} essays={essays} portraitSrc={portrait()} />
      {/* Semantic, crawlable copy of the content. Hidden visually when the scene runs; shown if JavaScript is unavailable. */}
      <Fallback photos={photos} essays={essays} />
    </main>
  );
}
