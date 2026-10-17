"use client";

import { useEffect } from "react";
import Image from "next/image";
import { profile, experience, education, expertise, now } from "@/content/site";

const Bullet = ({ t }: { t: string }) => (
  <li className="flex gap-3 text-base leading-relaxed text-muted">
    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
    {t}
  </li>
);

const fmt = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function AboutPanel({ slug, portrait }: { slug: string | null; portrait: string | null }) {
  useEffect(() => {
    if (!slug) return;
    const t = setTimeout(() => document.getElementById(`about-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 450);
    return () => clearTimeout(t);
  }, [slug]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">About me</p>
      <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight md:text-6xl text-balance">
        AI engineer, <em className="italic text-accent">curious about the machinery,</em> nerd at heart.
      </h2>
      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_300px]">
        <div className="space-y-5 text-lg leading-relaxed text-muted">
          {profile.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="rounded-2xl border border-line bg-elevated p-6 text-sm">
          {portrait ? (
            <Image src={portrait} alt={`${profile.name}, portrait`} width={600} height={750} className="mb-6 aspect-[4/5] w-full rounded-xl object-cover" priority />
          ) : (
            <div className="mb-6 flex aspect-[4/5] w-full items-center justify-center rounded-xl border border-dashed border-line font-mono text-[10px] uppercase tracking-wider text-muted">
              portrait · public/me
            </div>
          )}
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Now</p>
          <p className="mt-2">{profile.currentTitle} at <span className="font-medium">{profile.currentCompany}</span></p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-accent">Based</p>
          <p className="mt-2">{profile.location}</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-accent">Pronouns</p>
          <p className="mt-2">{profile.pronouns}</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-accent">Open to</p>
          <p className="mt-2 text-muted">{profile.availability}</p>
        </div>
      </div>

      <section id="about-now" className="mt-14 scroll-mt-20 rounded-2xl border border-line bg-elevated p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Now</h3>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">last updated {fmt(now.updated)}</span>
        </div>
        <dl className="mt-4 grid gap-4 md:grid-cols-3">
          {[["Building", now.building], ["Studying", now.studying], ["Enjoying", now.enjoying]].map(([k, v]) => (
            <div key={k}>
              <dt className="font-display text-xl">{k}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">What I do for a living</h3>
        <ul className="mt-4 grid gap-2 md:grid-cols-2">{expertise.map((e) => <Bullet key={e} t={e} />)}</ul>
      </section>

      <section className="mt-14">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Experience</h3>
        <ol className="relative mt-6 border-l border-line">
          {experience.map((e) => (
            <li key={e.company} className="relative pb-10 pl-8 last:pb-0">
              <span className="absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full bg-accent ring-4 ring-bg" />
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">{e.period} · {e.location}</p>
              <h4 className="font-display mt-1 text-2xl tracking-tight md:text-3xl">{e.company}</h4>
              <p className="text-sm text-accent">{e.role}</p>
              <ul className="mt-3 space-y-1.5">{e.points.map((p) => <Bullet key={p} t={p} />)}</ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Education</h3>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {education.map((ed) => (
            <li key={ed.degree} className="rounded-2xl border border-line bg-elevated p-5">
              <p className="font-display text-xl tracking-tight">{ed.degree}</p>
              <p className="mt-1 text-sm text-muted">{ed.school}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-14 text-sm text-muted">
        The football, games and other worlds live in <a href="#offclock" className="underline transition hover:text-accent">Off the clock</a>.
      </p>
    </div>
  );
}
