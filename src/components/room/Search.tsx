"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { projects, exploring, links } from "@/content/site";
import type { EssayMeta } from "@/lib/essays";
import type { View } from "./route";

type Item = { id: string; label: string; group: string; view?: View; slug?: string; href?: string };

export function Search({ onOpen, essays }: { onOpen: (v: View, slug?: string | null) => void; essays: EssayMeta[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  const items: Item[] = useMemo(
    () => [
      { id: "work", label: "Selected work", group: "Sections", view: "work" },
      { id: "signal", label: "The Signal Desk", group: "Sections", view: "signal" },
      { id: "bench", label: "Experiment Bench", group: "Sections", view: "bench" },
      { id: "exploring", label: "Things I'm exploring", group: "Sections", view: "exploring" },
      { id: "about", label: "About me", group: "Sections", view: "about" },
      { id: "now", label: "Now", group: "Sections", view: "about", slug: "now" },
      { id: "offclock", label: "Off the clock", group: "Sections", view: "offclock" },
      { id: "contact", label: "Contact", group: "Sections", view: "contact" },
      ...projects.map((p) => ({ id: `p-${p.slug}`, label: p.title, group: "Projects", view: "work" as View, slug: p.slug })),
      ...essays.map((e) => ({ id: `e-${e.slug}`, label: e.title, group: "Essays", href: `/essays/${e.slug}` })),
      ...exploring.map((x) => ({ id: `x-${x.id}`, label: x.label, group: "Exploring", view: "exploring" as View, slug: x.id })),
      { id: "batching", label: "Batching vs latency", group: "Experiments", view: "bench", slug: "batching" },
      { id: "gearbox", label: "Gearbox Lab", group: "Experiments", view: "bench", slug: "gearbox" },
      { id: "milan", label: "AC Milan", group: "Off the clock", view: "offclock", slug: "milan" },
      { id: "email", label: `Email ${links.email}`, group: "Contact", href: `mailto:${links.email}` },
      { id: "li", label: "LinkedIn", group: "Contact", href: links.linkedin },
      { id: "gh", label: "GitHub", group: "Contact", href: links.github },
    ],
    [essays]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (s ? items.filter((i) => i.label.toLowerCase().includes(s) || i.group.toLowerCase().includes(s)) : items).slice(0, 12);
  }, [q, items]);

  const show = () => {
    setQ("");
    setIdx(0);
    setOpen(true);
    setTimeout(() => input.current?.focus(), 30);
  };
  const run = (it: Item) => {
    setOpen(false);
    if (it.href) {
      if (it.href.startsWith("/")) window.location.href = it.href;
      else window.open(it.href, "_blank", "noopener");
    } else if (it.view) onOpen(it.view, it.slug ?? null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else show();
      } else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" onClick={show} aria-label="Search the site" className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-white/10 px-3 font-mono text-[11px] text-[#e8dcc6]/80 transition hover:text-white">
        <SearchIcon size={12} /> <span className="hidden md:inline">Search</span> <kbd className="hidden rounded border border-white/15 px-1 text-[9px] md:inline">⌘K</kbd>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/55 p-4 pt-[14vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div role="dialog" aria-label="Search" onClick={(e) => e.stopPropagation()} initial={reduce ? { opacity: 0 } : { y: 10, scale: 0.98, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={reduce ? { opacity: 0 } : { y: 8, scale: 0.98, opacity: 0 }} transition={{ duration: reduce ? 0 : 0.18 }} className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-elevated shadow-2xl">
              <div className="flex items-center gap-3 border-b border-line px-4">
                <SearchIcon size={16} className="text-muted" />
                <input
                  ref={input}
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setIdx(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setIdx((i) => Math.min(i + 1, filtered.length - 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setIdx((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Enter" && filtered[idx]) run(filtered[idx]);
                  }}
                  placeholder="Projects, essays, topics, contact…"
                  className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                />
                <kbd className="rounded border border-line px-1.5 font-mono text-[10px] text-muted">esc</kbd>
              </div>
              <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
                {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">Nothing matches.</li>}
                {filtered.map((it, i) => (
                  <li key={it.id} role="option" aria-selected={i === idx}>
                    <button type="button" onMouseEnter={() => setIdx(i)} onClick={() => run(it)} className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${i === idx ? "bg-accent-soft text-accent" : ""}`}>
                      {it.label}
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{it.group}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
