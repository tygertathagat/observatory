"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Rss } from "lucide-react";
import { shares, feeds, links } from "@/content/site";
import type { EssayMeta } from "@/lib/essays";
import type { RadarResult } from "@/lib/radar";
import type { View } from "../room/route";

type Tab = "essays" | "linkedin" | "radar";
const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "essays", label: "Essays", hint: "Written by me" },
  { id: "linkedin", label: "Shared on LinkedIn", hint: "Posted or shared by me" },
  { id: "radar", label: "Reading Radar", hint: "Not by me · auto-refreshed" },
];

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function SignalPanel({ slug, onNavigate, essays }: { slug: string | null; onNavigate: (v: View, slug?: string | null) => void; essays: EssayMeta[] }) {
  const tab: Tab = slug === "linkedin" || slug === "radar" ? slug : "essays";
  const [tag, setTag] = useState<string | null>(null);
  const [radar, setRadar] = useState<RadarResult | null>(null);
  const [radarErr, setRadarErr] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== "radar" || radar) return;
    fetch("/api/radar")
      .then((r) => r.json())
      .then(setRadar)
      .catch((e) => setRadarErr(String(e)));
  }, [tab, radar]);

  const tags = Array.from(new Set(essays.flatMap((e) => e.tags))).sort();
  const list = essays.filter((e) => !tag || e.tags.includes(tag));

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">The Signal Desk</p>
      <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight md:text-6xl text-balance">
        What I write, share, <em className="italic text-accent">and read.</em>
      </h2>

      <div role="tablist" aria-label="Signal Desk views" className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => onNavigate("signal", t.id === "essays" ? null : t.id)} className={`min-h-11 rounded-full border px-4 py-2 text-left text-sm transition ${tab === t.id ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:text-fg"}`}>
            {t.label}
            <span className="ml-2 font-mono text-[10px] uppercase tracking-wider opacity-70">{t.hint}</span>
          </button>
        ))}
      </div>

      {tab === "essays" && (
        <section className="mt-8" aria-label="Essays">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setTag(null)} className={`rounded-full border px-3 py-1 font-mono text-xs ${!tag ? "border-accent text-accent" : "border-line text-muted"}`}>all</button>
            {tags.map((t) => (
              <button key={t} type="button" onClick={() => setTag(t === tag ? null : t)} className={`rounded-full border px-3 py-1 font-mono text-xs ${tag === t ? "border-accent text-accent" : "border-line text-muted"}`}>#{t}</button>
            ))}
            <a href="/feed.xml" className="ml-auto inline-flex items-center gap-1 font-mono text-xs text-muted transition hover:text-accent"><Rss size={12} /> RSS</a>
          </div>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {list.map((e) => (
              <li key={e.slug}>
                <a href={`/essays/${e.slug}`} className="group grid gap-2 py-6 md:grid-cols-[130px_1fr_auto] md:items-baseline md:gap-6">
                  <span className="font-mono text-xs text-muted">{fmt(e.date)}{e.updated && <span className="block">rev. {fmt(e.updated)}</span>}</span>
                  <span>
                    <span className="font-display block text-2xl tracking-tight transition group-hover:text-accent md:text-3xl">{e.title}</span>
                    {e.sample && <span className="mt-1 inline-block rounded-full border border-accent/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">Demo essay — illustrative content</span>}
                    <span className="mt-2 block text-base text-muted">{e.summary}</span>
                    <span className="mt-2 block font-mono text-[10px] text-muted">{e.tags.map((t) => `#${t}`).join("  ")}</span>
                  </span>
                  <ArrowUpRight size={16} className="text-muted transition group-hover:text-accent" />
                </a>
              </li>
            ))}
            {list.length === 0 && <li className="py-10 text-center font-mono text-xs uppercase tracking-wider text-muted">No published essays yet</li>}
          </ul>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted">Essays live in content/essays as MDX. Drafts never appear here.</p>
        </section>
      )}

      {tab === "linkedin" && (
        <section className="mt-8" aria-label="Shared on LinkedIn">
          <p className="max-w-2xl text-base text-muted">
            Posts and articles I wrote on LinkedIn, and links I shared there with my commentary. Items are added by hand; nothing here is pulled automatically. Original links are kept.
          </p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {shares.map((s) => (
              <li key={s.url} className="rounded-2xl border border-line bg-elevated p-5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {s.kind === "link" ? <span className="text-fg">Shared · {s.publisher ?? "third party"}</span> : <span className="text-accent">Written by me · LinkedIn {s.kind}</span>}
                  {" · "}{fmt(s.date)}
                </p>
                {s.embed ? (
                  <iframe src={s.embed} title={s.title} className="mt-3 h-[420px] w-full rounded-xl border border-line" loading="lazy" allowFullScreen />
                ) : (
                  <a href={s.url} target="_blank" rel="noreferrer" className="group mt-3 block">
                    <span className="font-display block text-xl tracking-tight transition group-hover:text-accent">{s.title}</span>
                    <span className="mt-1 block text-sm text-muted">{s.description}</span>
                  </a>
                )}
                {s.commentary && <p className="mt-3 border-l-2 border-accent pl-3 text-sm italic text-muted">{s.commentary}</p>}
                <a href={s.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-muted transition hover:text-accent">Open on {s.kind === "link" ? "the original site" : "LinkedIn"} <ArrowUpRight size={12} /></a>
              </li>
            ))}
            {shares.length === 0 && (
              <li className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted md:col-span-2">
                Nothing added yet. <a href={links.linkedin} target="_blank" rel="noreferrer" className="underline hover:text-accent">My LinkedIn profile</a> has the live feed.
              </li>
            )}
          </ul>
        </section>
      )}

      {tab === "radar" && (
        <section className="mt-8" aria-label="Reading Radar">
          <p className="max-w-2xl text-base text-muted">
            An automatically refreshed selection from technical feeds I follow. Not written or endorsed by me; each item links to its source.
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted">
            Sources: {feeds.map((f) => f.name).join(" · ")}
            {radar?.fetchedAt && <> · refreshed {fmtTime(radar.fetchedAt)}{radar.stale && " (serving last good data)"}</>}
          </p>
          {!radar && !radarErr && <p className="mt-8 font-mono text-xs text-muted">Loading…</p>}
          {radarErr && <p className="mt-8 text-sm text-accent">Could not load the radar: {radarErr}</p>}
          {radar && radar.items.length === 0 && <p className="mt-8 text-sm text-muted">No items available right now{radar.errors.length ? `: ${radar.errors.join("; ")}` : "."}</p>}
          {radar && radar.items.length > 0 && (
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {radar.items.map((it) => (
                <li key={it.id}>
                  <a href={it.url} target="_blank" rel="noreferrer" className="group grid gap-1 py-4 md:grid-cols-[110px_1fr] md:gap-6">
                    <span className="font-mono text-xs text-muted">{fmt(it.date)}</span>
                    <span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{it.topic} · {it.source}</span>
                      <span className="block text-lg transition group-hover:text-accent">{it.title}</span>
                      {it.excerpt && <span className="mt-1 block text-sm text-muted">{it.excerpt}</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {radar && radar.errors.length > 0 && radar.items.length > 0 && <p className="mt-3 font-mono text-[10px] text-muted">Some sources failed: {radar.errors.join("; ")}</p>}
        </section>
      )}
    </div>
  );
}
