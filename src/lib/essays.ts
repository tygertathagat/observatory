import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

export type EssayMeta = {
  slug: string;
  title: string;
  summary: string;
  date: string; // ISO date of publication
  updated?: string; // ISO date of a meaningful revision, set by hand
  tags: string[];
  status: "draft" | "published";
  sample?: boolean;
};

const DIR = join(process.cwd(), "content", "essays");

function toIso(v: unknown): string | undefined {
  if (!v) return undefined;
  const d = v instanceof Date ? v : new Date(String(v));
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

function read(file: string): { meta: EssayMeta; body: string } {
  const raw = readFileSync(join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  const slug = file.replace(/\.mdx?$/, "");
  const meta: EssayMeta = {
    slug,
    title: String(data.title ?? slug),
    summary: String(data.summary ?? ""),
    date: toIso(data.date) ?? toIso(statSync(join(DIR, file)).mtime)!,
    updated: toIso(data.updated),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    status: data.status === "published" ? "published" : "draft",
    sample: Boolean(data.sample),
  };
  return { meta, body: content };
}

/** Published essays, newest first. Drafts are never returned. */
export function listEssays(): EssayMeta[] {
  let files: string[] = [];
  try {
    files = readdirSync(DIR).filter((f) => /\.mdx?$/.test(f));
  } catch {
    return [];
  }
  return files
    .map((f) => read(f).meta)
    .filter((m) => m.status === "published")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getEssay(slug: string): { meta: EssayMeta; body: string } | null {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  for (const ext of [".mdx", ".md"]) {
    try {
      const r = read(slug + ext);
      return r.meta.status === "published" ? r : null;
    } catch {}
  }
  return null;
}
