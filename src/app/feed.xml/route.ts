import { listEssays } from "@/lib/essays";
import { profile } from "@/content/site";

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

/** RSS 2.0 feed of published essays. Set SITE_URL in the environment for absolute links. */
export function GET() {
  const base = process.env.SITE_URL?.replace(/\/$/, "") ?? "";
  const items = listEssays()
    .map(
      (e) => `
    <item>
      <title>${esc(e.title)}</title>
      <link>${base}/essays/${e.slug}</link>
      <guid isPermaLink="true">${base}/essays/${e.slug}</guid>
      <pubDate>${new Date(e.date + "T00:00:00Z").toUTCString()}</pubDate>
      <description>${esc((e.sample ? "Demo essay, illustrative content. " : "") + e.summary)}</description>
      ${e.tags.map((t) => `<category>${esc(t)}</category>`).join("")}
    </item>`
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(profile.name)} · Essays</title>
    <link>${base}/</link>
    <description>${esc(profile.statement)}</description>
    <language>en</language>${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
