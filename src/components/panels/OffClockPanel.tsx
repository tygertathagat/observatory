"use client";

import { useEffect, useState } from "react";
import { Gamepad2, Map, Trophy } from "lucide-react";
import { personal, milan } from "@/content/site";
import type { MilanData } from "@/app/api/milan/route";
import { TacticsBoard } from "./TacticsBoard";

const fmtKick = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Matchday() {
  const [d, setD] = useState<MilanData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/milan").then((r) => r.json()).then(setD).catch((e) => setErr(String(e)));
  }, []);

  return (
    <div className="rounded-2xl border border-[#b11b2a]/40 bg-elevated p-5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-[#e05a68]">Matchday · {milan.club}</p>
      {!d && !err && <p className="mt-3 font-mono text-xs text-muted">Loading…</p>}
      {err && <p className="mt-3 text-sm text-muted">Fixture data unavailable right now.</p>}
      {d && !d.configured && (
        <p className="mt-3 text-sm text-muted">
          Fixtures are not configured. Add a <code className="font-mono text-xs">FOOTBALL_DATA_TOKEN</code> on the server to show the next match and the last result from {d.source}.
        </p>
      )}
      {d && d.configured && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Next</p>
            {d.next ? (
              <>
                <p className="mt-1 text-base">{d.next.home} <span className="text-muted">v</span> {d.next.away}</p>
                <p className="text-sm text-muted">{d.next.competition} · {fmtKick(d.next.utcDate)}{d.next.status === "POSTPONED" && " · postponed"}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">No upcoming fixture listed.</p>
            )}
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Last result</p>
            {d.last ? (
              <>
                <p className="mt-1 text-base">{d.last.home} {d.last.homeScore} <span className="text-muted">–</span> {d.last.awayScore} {d.last.away}</p>
                <p className="text-sm text-muted">{d.last.competition} · {fmtKick(d.last.utcDate)}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">No completed match listed.</p>
            )}
          </div>
          <p className="font-mono text-[10px] text-muted sm:col-span-2">
            Source: {d.source}{d.fetchedAt && ` · updated ${fmtTime(d.fetchedAt)}`}{d.stale && " · serving last good data"}{d.error && ` · ${d.error}`}
          </p>
        </div>
      )}
    </div>
  );
}

export function OffClockPanel({ slug }: { slug: string | null }) {
  useEffect(() => {
    if (!slug) return;
    const t = setTimeout(() => document.getElementById(`off-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 450);
    return () => clearTimeout(t);
  }, [slug]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Off the clock</p>
      <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight md:text-6xl text-balance">
        Rossoneri, games, <em className="italic text-accent">and other worlds.</em>
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-muted">A compact tour of the non-work half. Nothing here is a claim of expertise.</p>

      <section id="off-milan" className="mt-12 scroll-mt-20 grid gap-8 md:grid-cols-[1fr_1fr]">
        <div>
          <h3 className="flex items-center gap-2 font-display text-2xl tracking-tight"><Trophy size={18} className="text-[#e05a68]" /> {milan.club}</h3>
          <p className="mt-3 text-base leading-relaxed text-muted">{milan.blurb}</p>
          <ul className="mt-4 space-y-1 text-sm text-muted">
            {personal.football.player && <li>Player: {personal.football.player}</li>}
            {personal.football.position && <li>I play: {personal.football.position}</li>}
          </ul>
        </div>
        <Matchday />
      </section>

      <section id="off-football" className="mt-12 scroll-mt-20 grid gap-8 md:grid-cols-[1fr_1.1fr]">
        <div>
          <h3 className="font-display text-2xl tracking-tight">The tactics board</h3>
          <p className="mt-3 text-base leading-relaxed text-muted">{personal.football.blurb}</p>
        </div>
        <TacticsBoard initial={personal.football.defaultFormation} />
      </section>

      <section id="off-gaming" className="mt-12 scroll-mt-20 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 font-display text-2xl tracking-tight"><Gamepad2 size={18} className="text-accent" /> Gaming</h3>
          <p className="mt-3 text-base leading-relaxed text-muted">{personal.gaming.blurb}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {personal.gaming.games.map((g) => <li key={g} className="rounded-full border border-line px-3 py-1 text-sm">{g}</li>)}
            {personal.gaming.platform && <li className="rounded-full border border-line px-3 py-1 text-sm text-muted">{personal.gaming.platform}</li>}
          </ul>
        </div>
        <div id="off-fantasy" className="scroll-mt-20">
          <h3 className="flex items-center gap-2 font-display text-2xl tracking-tight"><Map size={18} className="text-accent" /> Fantasy and maps</h3>
          <p className="mt-3 text-base leading-relaxed text-muted">{personal.fantasy.blurb}</p>
          {personal.fantasy.books.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">{personal.fantasy.books.map((b) => <li key={b} className="rounded-full border border-line px-3 py-1 text-sm">{b}</li>)}</ul>
          ) : (
            <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted">Shelf titles to follow</p>
          )}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-line bg-elevated p-6">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Small facts</h3>
        <ul className="mt-3 space-y-1">
          {personal.facts.map((f) => (
            <li key={f} className="flex gap-3 text-base text-muted"><span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />{f}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
