import { ArrowUpRight, Mail } from "lucide-react";
import { links, profile } from "@/content/site";

export function ContactPanel() {
  const rows = [
    { label: "LinkedIn", href: links.linkedin },
    { label: "GitHub", href: links.github },
    { label: "Instagram", href: links.instagram },
    { label: "Resume (PDF)", href: links.resume },
  ].filter((r) => r.href);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Contact</p>
      <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight md:text-6xl text-balance">
        Working on something that needs to <em className="italic text-accent">actually run?</em>
      </h2>
      <p className="mt-5 max-w-xl text-lg text-muted">
        Employers, consulting clients, collaborators, or anyone curious: write to me. {profile.availability}.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        {links.email && (
          <a href={`mailto:${links.email}`} className="inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg transition hover:bg-accent hover:text-white">
            <Mail size={16} /> {links.email}
          </a>
        )}
        {rows.map((r) => (
          <a key={r.label} href={r.href} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium transition hover:border-accent hover:text-accent">
            {r.label}
            <ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        ))}
      </div>
      <p className="mt-10 text-sm text-muted">No form, no tracking. Email goes straight to me.</p>
    </div>
  );
}
