import { XMLParser } from "fast-xml-parser";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { feeds } from "@/content/site";

export type RadarItem = {
  id: string;
  title: string;
  url: string;
  date: string; // ISO
  source: string;
  topic: string;
  excerpt: string;
};
export type RadarResult = {
  items: RadarItem[];
  fetchedAt: string | null; // last successful refresh
  errors: string[];
  stale: boolean; // true when serving a previous successful result
};

const CACHE_DIR = join(process.cwd(), ".cache");
const CACHE_FILE = join(CACHE_DIR, "radar.json");
const TTL_MS = Number(process.env.RADAR_TTL_HOURS ?? 24) * 3600 * 1000;

const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const text = (v: unknown): string => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && "#text" in (v as object)) return String((v as { "#text": unknown })["#text"] ?? "");
  return String(v);
};

function readCache(): RadarResult | null {
  try {
    return JSON.parse(readFileSync(CACHE_FILE, "utf8"));
  } catch {
    return null;
  }
}
function writeCache(r: RadarResult) {
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify(r));
  } catch {}
}

/** Only feeds listed in content/site.ts are ever fetched (allowlist). */
async function fetchFeed(f: (typeof feeds)[number]): Promise<RadarItem[]> {
  const res = await fetch(f.url, { headers: { "User-Agent": "observatory-radar/1.0" }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`${f.name}: HTTP ${res.status}`);
  const xml = await res.text();
  const doc = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" }).parse(xml);
  const out: RadarItem[] = [];
  const rssItems = doc?.rss?.channel?.item;
  const atomEntries = doc?.feed?.entry;
  const list = rssItems ? [].concat(rssItems) : atomEntries ? [].concat(atomEntries) : [];
  for (const it of list as Record<string, unknown>[]) {
    const title = strip(text(it.title));
    let url = text(it.link);
    if (!url && Array.isArray(it.link)) {
      const alt = (it.link as Record<string, string>[]).find((l) => !l["@_rel"] || l["@_rel"] === "alternate");
      url = alt?.["@_href"] ?? "";
    } else if (!url && it.link && typeof it.link === "object") url = (it.link as Record<string, string>)["@_href"] ?? "";
    const dateRaw = text(it.pubDate) || text(it.published) || text(it.updated) || text(it["dc:date"]);
    const d = new Date(dateRaw);
    if (!title || !url || isNaN(d.getTime())) continue;
    const excerpt = strip(text(it.description) || text(it.summary) || text(it.content) || text(it["content:encoded"])).slice(0, 240);
    out.push({ id: url, title, url, date: d.toISOString(), source: f.name, topic: f.topic, excerpt });
  }
  return out.slice(0, f.limit ?? 8);
}

export async function getRadar(force = false): Promise<RadarResult> {
  const cached = readCache();
  if (!force && cached?.fetchedAt && Date.now() - new Date(cached.fetchedAt).getTime() < TTL_MS) return { ...cached, stale: false };

  const results = await Promise.allSettled(feeds.map(fetchFeed));
  const items: RadarItem[] = [];
  const errors: string[] = [];
  results.forEach((r, i) => (r.status === "fulfilled" ? items.push(...r.value) : errors.push(`${feeds[i].name}: ${String(r.reason).slice(0, 120)}`)));

  if (items.length === 0) {
    // total outage: keep serving the last good data
    return cached ? { ...cached, stale: true, errors } : { items: [], fetchedAt: null, errors, stale: false };
  }
  const seen = new Set<string>();
  const dedup = items.filter((it) => (seen.has(it.id) ? false : (seen.add(it.id), true))).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 40);
  const fresh: RadarResult = { items: dedup, fetchedAt: new Date().toISOString(), errors, stale: false };
  writeCache(fresh);
  return fresh;
}
