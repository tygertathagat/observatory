"use client";

import { exploring, expertise } from "@/content/site";
import type { View } from "../room/route";

const LEVEL = { learning: "Actively learning", practising: "Practising", expertise: "Expertise" } as const;

export function ExploringPanel({ slug, onNavigate }: { slug: string | null; onNavigate: (v: View, slug?: string | null) => void }) {
  const active = exploring.find((i) => i.id === slug) ?? null;
  const byId = Object.fromEntries(exploring.map((i) => [i.id, i]));

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Things I&rsquo;m exploring</p>
      <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight md:text-6xl text-balance">
        A learning map, <em className="italic text-accent">not a résumé.</em>
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        What I&rsquo;m studying now, as distinct from what I already do for a living. Select a star to read why it&rsquo;s there.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* constellation */}
        <div className="relative overflow-hidden rounded-3xl border border-line bg-[#0b1324]">
          <svg viewBox="0 0 100 100" className="block aspect-[4/3] w-full" role="group" aria-label="Learning map">
            <defs>
              <radialGradient id="star" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#fff" />
                <stop offset="0.4" stopColor="#ffd9a0" />
                <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* faint background stars */}
            {Array.from({ length: 40 }).map((_, i) => (
              <circle key={i} cx={(i * 37) % 100} cy={(i * 53) % 100} r={0.25 + (i % 3) * 0.12} fill="#e8e4d8" opacity={0.25 + (i % 5) / 10} />
            ))}
            {exploring.map((n) =>
              n.links.map((l) => {
                const m = byId[l];
                const lit = active && (active.id === n.id || active.id === l);
                return <line key={n.id + l} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke={lit ? "#e8b36b" : "#9aa3b8"} strokeWidth={lit ? 0.5 : 0.25} opacity={lit ? 0.9 : 0.4} />;
              })
            )}
            {exploring.map((n) => {
              const lit = active?.id === n.id;
              return (
                <g key={n.id} tabIndex={0} role="button" aria-label={`${n.label}, ${LEVEL[n.level]}`} onClick={() => onNavigate("exploring", n.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("exploring", n.id)} style={{ cursor: "pointer", outline: "none" }}>
                  <circle cx={n.x} cy={n.y} r={lit ? 5 : 3.5} fill="url(#star)" opacity={lit ? 1 : 0.8} />
                  <circle cx={n.x} cy={n.y} r={lit ? 1.6 : 1.1} fill={n.level === "practising" ? "#8fb8ff" : "#ffd9a0"} />
                  <text x={n.x} y={n.y + 7.5} textAnchor="middle" fontSize="3" fill={lit ? "#ffd9a0" : "#e8dcc6"} fontFamily="var(--font-geist-sans)">{n.label}</text>
                </g>
              );
            })}
          </svg>
          <p className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-wider text-[#9aa3b8]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#ffd9a0]" /> learning &nbsp; <span className="inline-block h-2 w-2 rounded-full bg-[#8fb8ff]" /> practising
          </p>
        </div>

        {/* detail + accessible list */}
        <div className="space-y-4">
          <div className="min-h-[180px] rounded-3xl border border-line bg-elevated p-6">
            {active ? (
              <>
                <p className="font-mono text-[10px] uppercase tracking-wider text-accent">{LEVEL[active.level]}</p>
                <h3 className="font-display mt-2 text-3xl tracking-tight">{active.label}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted">{active.why}</p>
                <ul className="mt-4 space-y-1 text-sm text-muted">
                  {active.notes.length ? active.notes.map((n) => <li key={n}>— {n}</li>) : <li className="font-mono text-[10px] uppercase tracking-wider">Notes to follow</li>}
                </ul>
              </>
            ) : (
              <p className="text-muted">Pick a topic from the map or the list.</p>
            )}
          </div>
          <ul aria-label="Learning topics" className="divide-y divide-line rounded-3xl border border-line">
            {exploring.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => onNavigate("exploring", n.id)} aria-current={active?.id === n.id ? "true" : undefined} className={`flex w-full items-center justify-between px-5 py-3 text-left text-sm transition hover:text-accent ${active?.id === n.id ? "text-accent" : ""}`}>
                  {n.label}
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{LEVEL[n.level]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-12 rounded-3xl border border-line p-6">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">For contrast: established expertise</h3>
        <ul className="mt-4 grid gap-2 md:grid-cols-2">
          {expertise.map((e) => (
            <li key={e} className="flex gap-3 text-base text-muted">
              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
              {e}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
