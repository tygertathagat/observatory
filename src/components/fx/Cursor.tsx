"use client";

import { useEffect, useRef } from "react";

/** Custom cursor: a lagging ring that expands over interactive elements. Hidden on touch devices. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const d = dot.current!,
      r = ring.current!;
    let mx = -100,
      my = -100,
      rx = -100,
      ry = -100;
    let raf = 0;
    let hot = false;

    const move = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const el = (e.target as HTMLElement | null)?.closest(
        "a, button, [data-magnetic], input, textarea, canvas[data-interactive]"
      );
      hot = !!el;
    };
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      d.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      r.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(${hot ? 2.2 : 1})`;
      r.style.opacity = hot ? "0.9" : "0.5";
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        aria-hidden
        className="cursor-dot pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-accent"
      />
      <div
        ref={ring}
        aria-hidden
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[100] h-8 w-8 rounded-full border border-accent transition-[opacity] duration-200"
      />
    </>
  );
}
