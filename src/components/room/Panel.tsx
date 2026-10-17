"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { View } from "./route";
import type { EssayMeta } from "@/lib/essays";
import { WorkPanel } from "../panels/WorkPanel";
import { SignalPanel } from "../panels/SignalPanel";
import { BenchPanel } from "../panels/BenchPanel";
import { ExploringPanel } from "../panels/ExploringPanel";
import { AboutPanel } from "../panels/AboutPanel";
import { OffClockPanel } from "../panels/OffClockPanel";
import { BeyondPanel } from "../panels/BeyondPanel";
import { ContactPanel } from "../panels/ContactPanel";

export const TITLES: Record<View, string> = {
  work: "Selected work",
  signal: "The Signal Desk",
  bench: "Experiment Bench",
  exploring: "Things I'm exploring",
  about: "About me",
  offclock: "Off the clock",
  beyond: "A moment of calm",
  contact: "Contact",
};

export function Panel({
  view,
  slug,
  onClose,
  onNavigate,
  beyondPhotos,
  essays,
  portrait,
}: {
  view: View | null;
  slug: string | null;
  onClose: () => void;
  onNavigate: (v: View, slug?: string | null) => void;
  beyondPhotos: string[];
  essays: EssayMeta[];
  portrait: string | null;
}) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const aside = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // the panel is modal: keep Tab inside it
  const trap = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !aside.current) return;
    const focusables = Array.from(
      aside.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  useEffect(() => {
    if (view) {
      closeBtn.current?.focus();
      body.current?.scrollTo({ top: 0 });
    }
  }, [view]);

  return (
    <AnimatePresence>
      {view && (
        <motion.div key="backdrop" className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.25 }} onClick={onClose}>
          <motion.aside
            ref={aside}
            role="dialog"
            aria-modal="true"
            aria-label={TITLES[view]}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={trap}
            initial={reduce ? { opacity: 0 } : { x: "6%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: "4%", opacity: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="panel absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-bg shadow-2xl md:w-[min(1100px,88vw)]"
          >
            <div className="flex items-center justify-between border-b border-line bg-bg/85 px-5 py-3 backdrop-blur md:px-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{TITLES[view]}</p>
              <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-muted transition hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                <X size={16} />
              </button>
            </div>
            <div ref={body} className="flex-1 overflow-y-auto pb-16">
              {view === "work" && <WorkPanel slug={slug} onNavigate={onNavigate} />}
              {view === "signal" && <SignalPanel slug={slug} onNavigate={onNavigate} essays={essays} />}
              {view === "bench" && <BenchPanel slug={slug} onNavigate={onNavigate} />}
              {view === "exploring" && <ExploringPanel slug={slug} onNavigate={onNavigate} />}
              {view === "about" && <AboutPanel slug={slug} portrait={portrait} />}
              {view === "offclock" && <OffClockPanel slug={slug} />}
              {view === "beyond" && <BeyondPanel photos={beyondPhotos} />}
              {view === "contact" && <ContactPanel />}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
