"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { projects, type CaseStudy } from "@/content/site";
import type { View } from "../room/route";
import { ArchDiagram } from "./ArchDiagram";

const STATUS: Record<CaseStudy["status"], string> = {
  shipped: "In production",
  mvp: "MVP",
  poc: "Proof of concept",
  personal: "Personal project",
};

function Block({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="grid gap-3 border-t border-line py-6 md:grid-cols-[180px_1fr]">
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{title}</h3>
      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t} className={`flex gap-3 text-base leading-relaxed ${t.startsWith("TODO") ? "text-accent/80" : "text-muted"}`}>
            <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

function XRay({ p }: { p: CaseStudy }) {
  const [deep, setDeep] = useState(false);
  if (!p.xray) return null;
  return (
    <section className="border-t border-line py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Architecture X-Ray</h3>
        <div role="tablist" aria-label="Detail level" className="flex rounded-full border border-line p-0.5 font-mono text-[11px]">
          <button type="button" role="tab" aria-selected={!deep} onClick={() => setDeep(false)} className={`min-h-10 rounded-full px-3 py-1 ${!deep ? "bg-accent text-white" : "text-muted"}`}>High level</button>
          <button type="button" role="tab" aria-selected={deep} onClick={() => setDeep(true)} className={`min-h-10 rounded-full px-3 py-1 ${deep ? "bg-accent text-white" : "text-muted"}`}>Engineering detail</button>
        </div>
      </div>
      {!deep ? (
        <p className="mt-4 text-base leading-relaxed text-muted">The diagram above is the high-level view. Switch to engineering detail for the request flow, where it bottlenecks, and how it fails.</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[["Request flow", p.xray.requestFlow], ["Bottlenecks", p.xray.bottlenecks], ["Failure modes", p.xray.failureModes]].map(([k, v]) => (
            <div key={k as string} className="rounded-2xl border border-line bg-elevated p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent">{k as string}</p>
              <ol className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
                {(v as string[]).map((t, i) => (
                  <li key={t} className="flex gap-2"><span className="font-mono text-[10px] text-accent">{String(i + 1).padStart(2, "0")}</span>{t}</li>
                ))}
              </ol>
            </div>
          ))}
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted md:col-span-3">Verified project detail, described without product specifics (NDA).</p>
        </div>
      )}
    </section>
  );
}

export function WorkPanel({ slug, onNavigate }: { slug: string | null; onNavigate: (v: View, slug?: string | null) => void }) {
  const p = slug ? projects.find((x) => x.slug === slug) : null;

  if (p) {
    const i = projects.indexOf(p);
    const next = projects[(i + 1) % projects.length];
    return (
      <article className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
        <button type="button" onClick={() => onNavigate("work")} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted transition hover:text-accent">
          <ArrowLeft size={14} /> All work
        </button>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-accent">{p.kicker}</p>
        <h2 className="font-display mt-3 text-4xl leading-[1.02] tracking-tight md:text-6xl text-balance">{p.title}</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span>{p.context}</span>
          <span aria-hidden>·</span>
          <span>{p.period}</span>
          <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">{STATUS[p.status]}</span>
          {p.confidential && (
            <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
              <Lock size={10} /> under NDA
            </span>
          )}
          {p.unverified && (
            <span className="rounded-full border border-accent/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">draft · unverified</span>
          )}
        </div>

        <div className="mt-10">
          <Block title="Problem & context" items={[p.problem]} />
          <Block title="My role" items={[p.role]} />
          <Block title="Constraints" items={p.constraints} />
          <Block title="Architecture" items={p.architecture} />
          {p.diagram && (
            <div className="border-t border-line py-6">
              <ArchDiagram id={p.diagram} />
            </div>
          )}
          <XRay p={p} />
          {p.decisions.length > 0 && (
            <section className="grid gap-3 border-t border-line py-6 md:grid-cols-[180px_1fr]">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Decisions & trade-offs</h3>
              <ul className="space-y-4">
                {p.decisions.map((d) => (
                  <li key={d.decision} className="rounded-2xl border border-line bg-elevated p-4">
                    <p className="text-base">{d.decision}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-accent">Trade-off · </span>
                      {d.tradeoff}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <Block title="Outcomes (verified only)" items={p.outcomes} />
          <Block title="Lessons & next steps" items={p.lessons} />
          <section className="grid gap-3 border-t border-line py-6 md:grid-cols-[180px_1fr]">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Stack</h3>
            <ul className="flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <li key={s} className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-[11px] text-accent">{s}</li>
              ))}
            </ul>
          </section>
        </div>

        <button type="button" onClick={() => onNavigate("work", next.slug)} className="group mt-6 flex w-full items-center justify-between rounded-2xl border border-line p-5 text-left transition hover:border-accent">
          <span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Next</span>
            <span className="mt-1 block font-display text-2xl tracking-tight">{next.title}</span>
          </span>
          <ArrowRight className="text-muted transition group-hover:translate-x-1 group-hover:text-accent" />
        </button>
      </article>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Selected work</p>
      <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight md:text-6xl text-balance">
        What&rsquo;s happening <em className="italic text-accent">underneath.</em>
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        Case studies written the way I think about systems: the problem, the constraints, the architecture, and the decisions that cost something.
      </p>
      <ol className="mt-10 divide-y divide-line border-y border-line">
        {projects.map((p, i) => (
          <li key={p.slug}>
            <button
              type="button"
              onClick={() => onNavigate("work", p.slug)}
              className="group grid w-full gap-2 py-6 text-left transition md:grid-cols-[60px_1fr_auto] md:items-baseline md:gap-6"
            >
              <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="font-display block text-2xl tracking-tight transition group-hover:text-accent md:text-4xl">{p.title}</span>
                <span className="mt-1 block text-sm text-muted">{p.kicker} · {p.context}</span>
                <span className="mt-3 block max-w-2xl text-base leading-relaxed text-muted">{p.problem.split(". ")[0]}.</span>
              </span>
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted">
                {STATUS[p.status]}
                {p.unverified && <span className="text-accent">· draft</span>}
                <ArrowRight size={14} className="transition group-hover:translate-x-1 group-hover:text-accent" />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
