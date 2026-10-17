import Image from "next/image";
import { beyond, links } from "@/content/site";

export function BeyondPanel({ photos }: { photos: string[] }) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">A moment of calm</p>
      <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight md:text-6xl text-balance">
        Look up from the desk <em className="italic text-accent">for a minute.</em>
      </h2>
      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_280px]">
        <div className="space-y-5 text-lg leading-relaxed text-muted">
          {beyond.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="rounded-2xl border border-line bg-elevated p-6 text-sm">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Elsewhere</p>
          {links.instagram && (
            <a href={links.instagram} target="_blank" rel="noreferrer" className="mt-3 block text-base transition hover:text-accent">Instagram ↗</a>
          )}
          <p className="mt-6 text-xs leading-relaxed text-muted">{beyond.note}</p>
        </div>
      </div>

      {photos.length > 0 ? (
        <ul className="mt-12 columns-2 gap-3 md:columns-3 [&>li]:mb-3 [&>li]:break-inside-avoid">
          {photos.map((src) => {
            const file = src.split("/").pop() ?? "";
            const caption = beyond.captions[file] ?? "";
            return (
              <li key={src} className="overflow-hidden rounded-2xl border border-line">
                <Image src={src} alt={caption || "Photograph by Tathagat"} width={900} height={700} className="h-auto w-full" />
                {caption && <p className="px-3 py-2 text-xs text-muted">{caption}</p>}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-12 rounded-2xl border border-dashed border-line p-8 text-center font-mono text-xs uppercase tracking-wider text-muted">
          Photographs to follow · drop files into public/beyond
        </p>
      )}
    </div>
  );
}
