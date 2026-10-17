"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

type P = { x: number; y: number };
const RAW: Record<string, number[][]> = {
  "4-3-3": [[8, 50], [24, 18], [22, 40], [22, 60], [24, 82], [44, 30], [40, 50], [44, 70], [66, 20], [72, 50], [66, 80]],
  "4-4-2": [[8, 50], [24, 18], [22, 40], [22, 60], [24, 82], [46, 16], [42, 40], [42, 60], [46, 84], [68, 40], [68, 60]],
  "3-5-2": [[8, 50], [22, 28], [20, 50], [22, 72], [42, 12], [44, 34], [38, 50], [44, 66], [42, 88], [68, 40], [68, 60]],
  "4-2-3-1": [[8, 50], [24, 18], [22, 40], [22, 60], [24, 82], [38, 38], [38, 62], [56, 20], [58, 50], [56, 80], [74, 50]],
};
const FORMATIONS: Record<string, P[]> = Object.fromEntries(
  Object.entries(RAW).map(([k, v]) => [k, v.map(([x, y]) => ({ x, y }))])
);

/**
 * A small tactics board. Pick a formation, drag players, or use the keyboard:
 * tab to a player, arrow keys to move. Purely a fan's toy.
 */
export function TacticsBoard({ initial = "4-3-3" }: { initial?: string }) {
  const [formation, setFormation] = useState(initial);
  const [players, setPlayers] = useState<P[]>(FORMATIONS[initial]);
  const [drag, setDrag] = useState<number | null>(null);
  const dragRef = useRef<number | null>(null);
  const grab = (i: number | null) => {
    dragRef.current = i;
    setDrag(i);
  };
  const svg = useRef<SVGSVGElement>(null);

  const pick = (f: string) => {
    setFormation(f);
    setPlayers(FORMATIONS[f]);
  };

  const toPitch = (e: PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };
  const clamp = (p: P): P => ({ x: Math.min(97, Math.max(3, p.x)), y: Math.min(96, Math.max(4, p.y)) });
  const move = (i: number, p: P) => setPlayers((ps) => ps.map((q, j) => (j === i ? clamp(p) : q)));

  const onKey = (i: number) => (e: KeyboardEvent) => {
    const d = e.shiftKey ? 5 : 2;
    const p = players[i];
    const map: Record<string, P> = {
      ArrowLeft: { x: p.x - d, y: p.y },
      ArrowRight: { x: p.x + d, y: p.y },
      ArrowUp: { x: p.x, y: p.y - d },
      ArrowDown: { x: p.x, y: p.y + d },
    };
    if (map[e.key]) {
      e.preventDefault();
      move(i, map[e.key]);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-elevated p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 font-mono text-[10px] uppercase tracking-wider text-muted">Formation</span>
        {Object.keys(FORMATIONS).map((f) => (
          <button key={f} type="button" onClick={() => pick(f)} aria-pressed={formation === f} className={`min-h-10 rounded-full border px-3 py-1 font-mono text-xs transition ${formation === f ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:text-fg"}`}>
            {f}
          </button>
        ))}
        <button type="button" onClick={() => setPlayers(FORMATIONS[formation])} className="ml-auto min-h-10 rounded-full border border-line px-3 py-1 font-mono text-xs text-muted transition hover:text-fg">
          reset
        </button>
      </div>
      <svg
        ref={svg}
        viewBox="0 0 100 100"
        className="mt-4 aspect-[3/2] w-full touch-none select-none rounded-xl"
        role="group"
        aria-label="Tactics board. Tab to a player and use the arrow keys to move them."
        onPointerMove={(e) => dragRef.current !== null && move(dragRef.current, toPitch(e))}
        onPointerUp={() => grab(null)}
        onPointerLeave={() => grab(null)}
      >
        <rect width="100" height="100" fill="#2f6b45" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={i * 16.7} y="0" width="8.35" height="100" fill="#000" opacity="0.06" />
        ))}
        <g stroke="#e6e2d6" strokeWidth="0.5" fill="none" opacity="0.9">
          <rect x="2" y="2" width="96" height="96" />
          <line x1="50" y1="2" x2="50" y2="98" />
          <circle cx="50" cy="50" r="9" />
          <rect x="2" y="24" width="16" height="52" />
          <rect x="82" y="24" width="16" height="52" />
          <rect x="2" y="38" width="6" height="24" />
          <rect x="92" y="38" width="6" height="24" />
        </g>
        {players.map((p, i) => (
          <g
            key={i}
            tabIndex={0}
            role="button"
            aria-label={`Player ${i + 1}`}
            onKeyDown={onKey(i)}
            onPointerDown={(e) => {
              svg.current?.setPointerCapture?.(e.pointerId);
              grab(i);
            }}
            style={{ cursor: drag === i ? "grabbing" : "grab", outline: "none", transition: drag === i ? "none" : "transform 0.5s cubic-bezier(.22,1,.36,1)", transform: `translate(${p.x}px, ${p.y}px)` }}
          >
            <circle r="3.4" fill={i === 0 ? "#ffd166" : "#f2f2ef"} stroke="#1a1a1c" strokeWidth="0.5" />
            <text y="1.1" textAnchor="middle" fontSize="2.8" fill="#1a1a1c" fontFamily="var(--font-geist-mono)">{i + 1}</text>
          </g>
        ))}
      </svg>
      <p className="mt-3 text-xs text-muted">Drag players, or tab to one and use the arrow keys. A fan&rsquo;s toy, not analysis.</p>
    </div>
  );
}
