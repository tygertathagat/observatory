import { profile, projects, links, exploring, experience, now } from "@/content/site";
import type { EssayMeta } from "@/lib/essays";

/**
 * Semantic HTML copy of the essential content. It is visible only when
 * JavaScript is unavailable (the scene is client-rendered), and it keeps
 * the page meaningful for crawlers and assistive tech.
 */
export function Fallback({ photos, essays }: { photos: string[]; essays: EssayMeta[] }) {
  return (
    <div className="fallback mx-auto max-w-3xl px-5 py-16">
      <noscript>
        <p className="mb-8 rounded-xl border border-line p-4 text-sm text-muted">
          The interactive observatory needs JavaScript. Here is the same content as plain text.
        </p>
      </noscript>
      <h1 className="font-display text-5xl">{profile.name}</h1>
      <p className="mt-2 text-lg">{profile.role} · {profile.region}</p>
      <p className="mt-4 text-muted">{profile.statement}</p>

      <h2 className="font-display mt-12 text-3xl">Selected work</h2>
      <ul className="mt-4 space-y-6">
        {projects.map((p) => (
          <li key={p.slug}>
            <h3 className="text-xl"><a href={`#work/${p.slug}`}>{p.title}</a></h3>
            <p className="text-sm text-muted">{p.context} · {p.period}</p>
            <p className="mt-2 text-muted">{p.problem}</p>
          </li>
        ))}
      </ul>

      <h2 className="font-display mt-12 text-3xl">Essays</h2>
      <ul className="mt-4 space-y-2">
        {essays.map((e) => (
          <li key={e.slug}><a href={`/essays/${e.slug}`}>{e.title}</a> <span className="text-muted">({e.date})</span></li>
        ))}
      </ul>

      <h2 className="font-display mt-12 text-3xl">Now <small className="text-muted">({now.updated})</small></h2>
      <p className="mt-2 text-muted">Building: {now.building} Studying: {now.studying}</p>

      <h2 className="font-display mt-12 text-3xl">Experience</h2>
      <ul className="mt-4 space-y-3">
        {experience.map((e) => (
          <li key={e.company}><strong>{e.company}</strong> — {e.role} ({e.period})</li>
        ))}
      </ul>

      <h2 className="font-display mt-12 text-3xl">Things I&rsquo;m exploring</h2>
      <ul className="mt-4 list-disc pl-5 text-muted">
        {exploring.map((i) => (
          <li key={i.id}>{i.label}: {i.why}</li>
        ))}
      </ul>

      {photos.length > 0 && <p className="mt-12 text-muted">{photos.length} photographs in “A moment of calm”.</p>}

      <h2 className="font-display mt-12 text-3xl">Contact</h2>
      <p className="mt-4">
        <a href={`mailto:${links.email}`}>{links.email}</a>
        {links.linkedin && <> · <a href={links.linkedin}>LinkedIn</a></>}
      </p>
    </div>
  );
}
