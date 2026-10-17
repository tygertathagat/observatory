"use client";

import { LatencyLab } from "./LatencyLab";
import { GearboxLab } from "../GearboxLab";
import type { View } from "../room/route";

const EXPERIMENTS = [
  { id: "batching", label: "Batching vs latency", blurb: "Why inference servers wait on purpose." },
  { id: "gearbox", label: "Gearbox Lab", blurb: "Hear four fault conditions and watch the spectrum." },
];

export function BenchPanel({ slug, onNavigate }: { slug: string | null; onNavigate: (v: View, slug?: string | null) => void }) {
  const active = EXPERIMENTS.find((e) => e.id === slug)?.id ?? "batching";
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Experiment Bench</p>
      <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight md:text-6xl text-balance">
        Small demonstrations of <em className="italic text-accent">how I think.</em>
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-muted">Interactive, browser-only, and honest about being simulations. The point is the trade-off, not the number.</p>

      <div role="tablist" aria-label="Experiments" className="mt-8 flex flex-wrap gap-2">
        {EXPERIMENTS.map((e) => (
          <button key={e.id} type="button" role="tab" aria-selected={active === e.id} onClick={() => onNavigate("bench", e.id)} className={`min-h-11 rounded-full border px-4 py-2 text-left text-sm transition ${active === e.id ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:text-fg"}`}>
            {e.label}
            <span className="ml-2 font-mono text-[10px] uppercase tracking-wider opacity-70">{e.blurb}</span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        {active === "batching" && <LatencyLab />}
        {active === "gearbox" && (
          <div className="-mx-5 md:-mx-8">
            <GearboxLab />
          </div>
        )}
      </div>
    </div>
  );
}
