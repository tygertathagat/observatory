"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Exterior } from "./Exterior";
import { Interior, HOTSPOT_LABELS, type HotspotId } from "./Interior";
import { ArrowRight } from "lucide-react";
import { Panel } from "./Panel";
import { RoomMenu } from "./RoomMenu";
import { Ambience } from "./Ambience";
import { useRoute, VIEWS, type View } from "./route";
import { profile } from "@/content/site";
import type { EssayMeta } from "@/lib/essays";

const ease = [0.22, 1, 0.36, 1] as const;

export function Room({ beyondPhotos, essays, portraitSrc }: { beyondPhotos: string[]; essays: EssayMeta[]; portraitSrc: string | null }) {
  const { route, go } = useRoute();
  const [insideState, setInside] = useState(false);
  // a direct URL to a section lands inside with that panel open
  const inside = insideState || !!route.view;
  const [hovered, setHovered] = useState<HotspotId | null>(null);
  const [hintsOn, setHintsOn] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const [mid, setMid] = useState(false); // laptop-ish aspect ratios
  const [leaving, setLeaving] = useState(false); // opening frame fading out
  const navToggle = useRef<HTMLButtonElement>(null);
  const prevView = useRef<View | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pq = window.matchMedia("(max-width: 767px)");
    const aq = window.matchMedia("(min-width: 768px) and (max-aspect-ratio: 17/10)");
    const sync = () => {
      setReduce(mq.matches);
      setPortrait(pq.matches);
      setMid(aq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    pq.addEventListener("change", sync);
    aq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      pq.removeEventListener("change", sync);
      aq.removeEventListener("change", sync);
    };
  }, []);

  // gentle parallax on fine pointers only, never on reduced motion
  useEffect(() => {
    const el = stage.current;
    if (!el || reduce) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      const layers = el.querySelectorAll<SVGGElement>("[data-depth]");
      layers.forEach((l) => {
        const d = parseFloat(l.dataset.depth || "0");
        const k = (d - 0.5) * 18;
        l.setAttribute("transform", `translate(${(-cx * k).toFixed(2)} ${(-cy * k * 0.6).toFixed(2)})`);
      });
      raf = requestAnimationFrame(tick);
    };
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduce, inside]);

  // labels are always visible; they brighten as the pointer approaches each object
  useEffect(() => {
    const el = stage.current;
    if (!el || !inside || portrait) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      const svg = el.querySelector<SVGSVGElement>("svg.scene");
      if (!svg || !last) return;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const p = new DOMPoint(last.clientX, last.clientY).matrixTransform(ctm.inverse());
      el.querySelectorAll<SVGGElement>("[data-hot]").forEach((h) => {
        const lx = Number(h.dataset.lx), ly = Number(h.dataset.ly);
        const d = Math.hypot(p.x - lx - 60, p.y - ly + 30); // measure from roughly the object's centre
        const near = Math.max(0, Math.min(1, 1 - (d - 90) / 420));
        h.style.setProperty("--near", (near * near).toFixed(3));
      });
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      el.querySelectorAll<SVGGElement>("[data-hot]").forEach((h) => h.style.setProperty("--near", "0"));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [inside, portrait]);

  const enter = useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => setLeaving(false), 700);
    setInside(true);
    setHintsOn(true);
    window.setTimeout(() => setHintsOn(false), 3000);
    // keyboard users land on the first object in the room, not on the header
    window.setTimeout(() => (document.querySelector("[data-hot]") as HTMLElement | null)?.focus(), 400);
  }, []);

  const open = useCallback(
    (v: View | null, slug?: string | null) => {
      const active = document.activeElement as HTMLElement | null;
      // remember the control that opened the panel (not the body, not the panel itself)
      if (active && active !== document.body && !active.closest(".panel")) lastTrigger.current = active;
      go(v, slug);
    },
    [go]
  );

  /** After a panel closes, put focus somewhere sensible: the opening control, else the matching nav button, else the logo. */
  const restoreFocus = useCallback((view: View | null) => {
    window.setTimeout(() => {
      const t = lastTrigger.current;
      lastTrigger.current = null;
      if (t && t.isConnected) return t.focus();
      const nav = view ? (document.querySelector(`[data-nav="${view}"]`) as HTMLElement | null) : null;
      (nav ?? navToggle.current ?? (document.querySelector("[data-home]") as HTMLElement | null))?.focus();
    }, 60);
  }, []);

  const close = useCallback(() => go(null), [go]);

  // whenever a panel closes (Escape, close button, backdrop, browser back/forward), wait for it to leave
  // the DOM, then restore focus if nothing else has taken it
  useEffect(() => {
    if (route.view) {
      prevView.current = route.view;
      return;
    }
    const was = prevView.current;
    if (!was) return;
    let tries = 0;
    const id = window.setInterval(() => {
      tries++;
      const gone = !document.querySelector(".panel");
      if (gone || tries > 40) {
        window.clearInterval(id);
        const a = document.activeElement;
        if (!a || a === document.body || !a.isConnected || a.closest(".panel")) restoreFocus(was);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [route.view, restoreFocus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && route.view) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [route.view, close]);

  return (
    <div className="room fixed inset-0 overflow-hidden bg-[#0a0d16]" data-hints={hintsOn ? "1" : "0"} data-portrait={portrait ? "1" : "0"}>
      <div ref={stage} className={portrait && inside ? "absolute inset-0 overflow-y-auto overscroll-contain" : "absolute inset-0"}>
        <AnimatePresence initial={false}>
          {!inside ? (
            <motion.div
              key="outside"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.35, transition: { duration: 1.1, ease } }}
              transition={{ duration: 0.6 }}
            >
              <Exterior lit framing={portrait ? "portrait" : mid ? "mid" : "wide"} />
            </motion.div>
          ) : (
            <motion.div
              key="inside"
              className={portrait ? "relative" : "absolute inset-0"}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduce ? 0.3 : 1.2, ease }}
            >
              {portrait ? (
                <>
                  {/* phones: the whole study as a postcard, then large destinations below. No cropping, no tiny targets. */}
                  <div className="relative mt-16 aspect-[1480/720] w-full">
                    <Interior onOpen={(v, slug) => open(v, slug)} hovered={hovered} setHovered={setHovered} awake={inside} portrait />
                  </div>
                  <nav aria-label="Places in the study" className="px-4 pb-10 pt-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#e8b36b]">Where to?</p>
                    <ul className="mt-3 grid grid-cols-2 gap-2">
                      {VIEWS.map((v) => {
                        const [obj, label] = HOTSPOT_LABELS[v].split(" · ");
                        return (
                          <li key={v}>
                            <button type="button" data-nav={v} onClick={() => open(v)} className="flex min-h-[72px] w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-left backdrop-blur-md transition active:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8b36b]">
                              <span>
                                <span className="block text-[15px] leading-tight text-[#f2ede4]">{label ?? obj}</span>
                                {label && <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-[#e8dcc6]/60">{obj}</span>}
                              </span>
                              <ArrowRight size={16} className="shrink-0 text-[#e8b36b]" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </>
              ) : (
                <Interior onOpen={(v, slug) => open(v, slug)} hovered={hovered} setHovered={setHovered} awake={inside} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* opening frame: name, intro, two actions. Plain HTML, renders immediately.
          It fades with a CSS transition and is removed on a timer, so it never lingers if animation frames pause. */}
      {(!inside || leaving) && (
          <section
            aria-label="Introduction"
            aria-hidden={inside || undefined}
            className={`absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-[#070a12]/90 via-[#070a12]/30 to-transparent px-6 pb-14 transition-opacity duration-500 md:justify-center md:px-16 md:pb-0 ${inside ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <div className="max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#e8b36b]">
                {profile.role} · {profile.region}
              </p>
              <h1 className="mt-4 font-display text-[18vw] leading-[0.9] tracking-tight text-[#f2ede4] md:text-[7.5rem]">
                {profile.name}
              </h1>
              <p className="mt-4 font-display text-2xl italic text-[#e8dcc6] md:text-3xl">{profile.intro}</p>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[#c9c2b4] md:text-lg">
                &ldquo;{profile.statement}&rdquo;
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={enter}
                  className="rounded-full bg-[#e8b36b] px-6 py-3 text-sm font-medium text-[#1a1208] transition hover:bg-[#ffc98a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8b36b]"
                >
                  Explore the observatory
                </button>
                <button
                  type="button"
                  onClick={() => open("work")}
                  className="rounded-full border border-[#e8dcc6]/30 px-6 py-3 text-sm font-medium text-[#f2ede4] transition hover:border-[#e8b36b] hover:text-[#e8b36b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8b36b]"
                >
                  View my work
                </button>
              </div>
            </div>
          </section>
      )}

      <RoomMenu active={route.view} onOpen={(v, s) => open(v, s)} visible={inside} onHome={() => { go(null); setInside(false); }} essays={essays} />
      <Ambience visible={inside} />

      <Panel view={route.view} slug={route.slug} onClose={close} onNavigate={open} beyondPhotos={beyondPhotos} essays={essays} portrait={portraitSrc} />
    </div>
  );
}
