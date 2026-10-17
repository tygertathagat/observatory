import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark-dimmed.css";
import { getEssay, listEssays } from "@/lib/essays";
import { profile } from "@/content/site";

// essays are fully prerendered; allow the route to block on params rather than stream a shell
export const instant = false;

export function generateStaticParams() {
  return listEssays().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = getEssay(slug);
  if (!e) return {};
  const title = e.meta.sample ? `${e.meta.title} · Demo essay` : `${e.meta.title} · ${profile.name}`;
  const description = e.meta.sample ? `Demo essay, illustrative content, not written by ${profile.name}. ${e.meta.summary}` : e.meta.summary;
  return {
    title,
    description,
    openGraph: { title, description, type: "article", publishedTime: e.meta.date, modifiedTime: e.meta.updated, tags: e.meta.tags },
    twitter: { card: "summary", title, description },
    alternates: { types: { "application/rss+xml": "/feed.xml" } },
  };
}

const fmt = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function EssayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEssay(slug);
  if (!e) notFound();
  const { meta, body } = e;

  return (
    <main className="essay mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-20">
      <nav className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs uppercase tracking-wider text-muted">
        <Link href="/#signal" className="transition hover:text-accent">← Back to the observatory</Link>
        <Link href="/feed.xml" className="transition hover:text-accent">RSS</Link>
      </nav>
      <header className="mt-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          {meta.sample ? "Demo essay — illustrative content" : "Essay"}
        </p>
        <h1 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight md:text-6xl text-balance">{meta.title}</h1>
        <p className="mt-4 text-lg text-muted">{meta.summary}</p>
        <p className="mt-4 font-mono text-xs text-muted">
          Published {fmt(meta.date)}
          {meta.updated && <> · Revised {fmt(meta.updated)}</>}
          {" · "}
          {meta.tags.map((t) => (
            <span key={t} className="mr-2">#{t}</span>
          ))}
        </p>
      </header>
      <article className="prose-observatory mt-10">
        <MDXRemote
          source={body}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm, remarkMath], rehypePlugins: [rehypeKatex, rehypeHighlight] } }}
        />
      </article>
      <footer className="mt-16 border-t border-line pt-6 font-mono text-xs text-muted">
        {meta.sample ? <>Demo essay — illustrative content, not written by {profile.name}. </> : <>Written by {profile.name}. </>}
        <Link href="/#contact" className="transition hover:text-accent">Get in touch</Link>.
      </footer>
    </main>
  );
}
