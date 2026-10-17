"use client";

import type { ReactNode } from "react";
import type { View } from "./route";

export type HotspotId = View | "tactics" | "gaming" | "football" | "scarf";
export const HOTSPOTS: Record<HotspotId, { label: string; view: View; slug?: string }> = {
  work: { label: "Workstation · Selected work", view: "work" },
  signal: { label: "Notebook · The Signal Desk", view: "signal" },
  bench: { label: "Sketches · Experiment Bench", view: "bench" },
  exploring: { label: "Telescope · Things I'm exploring", view: "exploring" },
  about: { label: "Bookshelf · About me", view: "about" },
  offclock: { label: "Off the clock", view: "offclock" },
  beyond: { label: "Window · A moment of calm", view: "beyond" },
  contact: { label: "Letter · Contact", view: "contact" },
  tactics: { label: "Tactics board · Off the clock", view: "offclock", slug: "football" },
  gaming: { label: "Controller · Gaming", view: "offclock", slug: "gaming" },
  football: { label: "Football · Off the clock", view: "offclock" },
  scarf: { label: "Scarf · AC Milan", view: "offclock", slug: "milan" },
};
export const HOTSPOT_LABELS: Record<View, string> = {
  work: HOTSPOTS.work.label,
  signal: HOTSPOTS.signal.label,
  bench: HOTSPOTS.bench.label,
  exploring: HOTSPOTS.exploring.label,
  about: HOTSPOTS.about.label,
  offclock: HOTSPOTS.offclock.label,
  beyond: HOTSPOTS.beyond.label,
  contact: HOTSPOTS.contact.label,
};

/**
 * Inside the observatory: a warm study under the dome. Layered SVG with
 * data-depth for parallax. Every hotspot is a real button for keyboard users.
 */
export function Interior({
  onOpen,
  hovered,
  setHovered,
  awake,
  portrait = false,
}: {
  onOpen: (v: View, slug?: string) => void;
  hovered: HotspotId | null;
  setHovered: (v: HotspotId | null) => void;
  awake: boolean;
  portrait?: boolean;
}) {
  const hot = (id: HotspotId, children: ReactNode, lx: number, ly: number) => {
    const { label, view, slug } = HOTSPOTS[id];
    const fire = (el: Element) => {
      (el as SVGElement & { focus: () => void }).focus?.();
      onOpen(view, slug);
    };
    return (
      <g
        role="button"
        tabIndex={0}
        aria-label={label}
        className="hotspot"
        data-hot={id}
        data-on={hovered === id ? "1" : "0"}
        onPointerEnter={() => setHovered(id)}
        onPointerLeave={() => setHovered(null)}
        onFocus={() => setHovered(id)}
        onBlur={() => setHovered(null)}
        onClick={(e) => fire(e.currentTarget)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fire(e.currentTarget);
          }
        }}
      >
        {children}
        <g className="hotlabel" transform={`translate(${lx} ${ly})`}>
          <rect x={-8} y={-17} rx={4} width={label.length * 7.4 + 16} height={24} />
          <text x={0} y={0}>{label}</text>
        </g>
      </g>
    );
  };

  return (
    <svg viewBox={portrait ? "420 200 860 620" : "0 0 1600 900"} preserveAspectRatio="xMidYMid slice" className="scene absolute inset-0 h-full w-full select-none">
      <defs>
        <linearGradient id="isky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1324" />
          <stop offset="0.6" stopColor="#1c2a44" />
          <stop offset="1" stopColor="#5a4a4a" />
        </linearGradient>
        <linearGradient id="imist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9aa3b8" stopOpacity="0" />
          <stop offset="1" stopColor="#9aa3b8" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="ilamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffb86b" stopOpacity="0.8" />
          <stop offset="0.4" stopColor="#ff9a4a" stopOpacity="0.25" />
          <stop offset="1" stopColor="#ff9a4a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="iscreen" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#8fb8ff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#8fb8ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="iwalnut" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3a28" />
          <stop offset="1" stopColor="#2e1c12" />
        </linearGradient>
        <linearGradient id="istone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b1a1d" />
          <stop offset="1" stopColor="#2b2621" />
        </linearGradient>
        <linearGradient id="iscreenbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d1424" />
          <stop offset="1" stopColor="#101c33" />
        </linearGradient>
        <linearGradient id="ibrass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a6a36" />
          <stop offset="0.5" stopColor="#d9b56b" />
          <stop offset="1" stopColor="#7a5a2c" />
        </linearGradient>
        <clipPath id="iwin">
          <rect x="300" y="130" width="620" height="440" rx="6" />
        </clipPath>
        <clipPath id="iscr">
          <rect x="690" y="470" width="300" height="180" rx="6" />
        </clipPath>
        <radialGradient id="ivig" cx="0.5" cy="0.55" r="0.75">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.75" />
        </radialGradient>
      </defs>

      {/* ---- outside the window: terrace, orchard, ridges, mist ---- */}
      <g data-depth="0.25" clipPath="url(#iwin)">
        <rect x="200" y="0" width="900" height="700" fill="url(#isky)" />
        <path d="M200 400 L320 340 L420 380 L520 300 L640 350 L760 290 L880 340 L1000 300 L1100 370 L1100 700 L200 700Z" fill="#232b45" />
        <rect x="200" y="320" width="900" height="200" fill="url(#imist)" />
        <path d="M200 470 L300 430 L400 460 L500 410 L600 450 L700 420 L820 470 L940 430 L1100 490 L1100 700 L200 700Z" fill="#1a2238" />
        <g className="mist" opacity="0.4">
          <ellipse cx="500" cy="480" rx="260" ry="18" fill="#9aa3b8" />
          <ellipse cx="900" cy="500" rx="220" ry="16" fill="#9aa3b8" />
        </g>
        {/* a few trees on the slope, nothing more */}
        <g fill="#121a2a">
          {Array.from({ length: 4 }).map((_, i) => {
            const x = 330 + i * 150 + (i % 2) * 40;
            const y = 526 + (i % 2) * 6;
            return (
              <g key={i}>
                <rect x={x + 9} y={y + 18} width="5" height="30" />
                <circle cx={x + 11} cy={y + 10} r="20" />
                <circle cx={x - 2} cy={y + 20} r="13" />
                <circle cx={x + 24} cy={y + 20} r="13" />
              </g>
            );
          })}
        </g>
        {/* terrace rail */}
        <rect x="200" y="548" width="900" height="6" fill="#3a2d20" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <rect key={i} x={230 + i * 70} y="552" width="6" height="30" fill="#2a2018" />
        ))}
        <rect x="200" y="580" width="900" height="120" fill="#0f1322" />
      </g>

      {/* ---- stone wall, dome curve, window ---- */}
      <g data-depth="0.45">
        <rect x="0" y="0" width="1600" height="130" fill="url(#istone)" />
        <rect x="0" y="570" width="1600" height="330" fill="url(#istone)" />
        <rect x="0" y="130" width="300" height="440" fill="url(#istone)" />
        <rect x="920" y="130" width="680" height="440" fill="url(#istone)" />
        {/* stone courses */}
        <g stroke="#0e0d0f" strokeWidth="1.5" opacity="0.5">
          {[40, 80, 120, 610, 650].map((y) => (
            <line key={y} x1="0" y1={y} x2="1600" y2={y} />
          ))}
          {[180, 220, 260, 300, 340, 380, 420, 460, 500, 540].map((y) => (
            <g key={y}>
              <line x1="0" y1={y} x2="300" y2={y} />
              <line x1="920" y1={y} x2="1600" y2={y} />
            </g>
          ))}
        </g>
        {/* dome ribs across the top */}
        <path d="M-100 140 Q 800 -120 1700 140" stroke="#3a3530" strokeWidth="18" fill="none" />
        <path d="M-100 160 Q 800 -80 1700 160" stroke="#2a2622" strokeWidth="6" fill="none" />
        <rect x="0" y="700" width="1600" height="200" fill="#120e0b" />

        {hot(
          "beyond",
          <g>
            <rect x="300" y="130" width="620" height="440" rx="6" fill="#fff" opacity="0.03" />
            <rect x="286" y="116" width="648" height="468" rx="10" fill="none" stroke="#4a3426" strokeWidth="28" />
            <rect x="606" y="130" width="8" height="440" fill="#4a3426" />
            <rect x="300" y="340" width="620" height="8" fill="#4a3426" />
            <rect x="270" y="580" width="680" height="22" rx="3" fill="#5a3e2d" />
            <path d="M330 150 L370 150 L520 550 L480 550Z" fill="#fff" opacity="0.03" />
          </g>,
          700,
          165
        )}
      </g>

      {/* ---- wall pieces: fantasy map, tactics board ---- */}
      <g data-depth="0.55">
        {/* hand-drawn map pinned to the left wall */}
        <g transform="translate(60 150)">
          <path d="M0 0 L170 6 L166 130 L4 124Z" fill="#d9c9a3" />
          <path d="M0 0 L170 6 L166 130 L4 124Z" fill="#000" opacity="0.08" />
          <g stroke="#6b4f2c" strokeWidth="1.2" fill="none" opacity="0.8">
            <path d="M18 90 C 40 60, 60 95, 85 70 S 130 50, 150 80" />
            <path d="M20 40 l10 -12 l10 12 M40 36 l8 -10 l8 10 M62 44 l9 -11 l9 11" />
            <path d="M100 30 l8 -10 l8 10 M118 26 l7 -9 l7 9" />
            <path d="M30 110 q 20 -10 40 0 q 20 10 40 0" strokeDasharray="3 3" />
            <circle cx="120" cy="96" r="3" />
            <circle cx="55" cy="60" r="2.5" />
          </g>
          <path d="M138 14 l6 10 l-12 0Z M138 34 l6 -10 l-12 0Z" fill="#8a3a2e" />
          <circle cx="6" cy="4" r="3" fill="#b5523a" />
          <circle cx="166" cy="8" r="3" fill="#b5523a" />
        </g>

        {hot(
          "tactics",
          <g transform="translate(960 160)">
            <rect x="-6" y="-6" width="162" height="112" rx="4" fill="#3b2a20" />
            <rect x="0" y="0" width="150" height="100" rx="2" fill="#2f6b45" />
            <g stroke="#e6e2d6" strokeWidth="1.5" fill="none" opacity="0.85">
              <rect x="6" y="6" width="138" height="88" />
              <line x1="75" y1="6" x2="75" y2="94" />
              <circle cx="75" cy="50" r="12" />
              <rect x="6" y="30" width="22" height="40" />
              <rect x="122" y="30" width="22" height="40" />
            </g>
            {[[30, 50], [50, 25], [50, 75], [70, 40], [70, 60], [95, 30], [95, 70], [112, 50]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="4" fill={i < 4 ? "#ffd166" : "#f2f2ef"} />
            ))}
          </g>,
          960,
          140
        )}
      </g>

      {/* ---- bookshelf ---- */}
      <g data-depth="0.6">
        {hot(
          "about",
          <g>
            <rect x="1130" y="150" width="330" height="550" fill="#2a1c14" />
            <rect x="1130" y="150" width="330" height="14" fill="#5a3e2d" />
            {[290, 430, 570].map((y) => (
              <rect key={y} x="1130" y={y} width="330" height="12" fill="#5a3e2d" />
            ))}
            {[["#8a3a3a", 26], ["#2f5a6b", 18], ["#c99a4a", 30], ["#4a3a6a", 22], ["#3f6b4a", 20], ["#d6c7a8", 16], ["#b5523a", 28], ["#395a8a", 24], ["#b58a5a", 20], ["#2d2d2d", 30]].map(([c, w], i, arr) => {
              const x = 1145 + arr.slice(0, i).reduce((n, [, ww]) => n + (ww as number) + 3, 0);
              const h = 100 + ((i * 37) % 30);
              return <rect key={i} x={x} y={290 - h} width={w as number} height={h} rx="2" fill={c as string} />;
            })}
            {[["#d9a066", 24], ["#45607a", 30], ["#a04a3a", 18], ["#e0d7c0", 22], ["#2b4a3a", 26], ["#6a4a7a", 20], ["#c9c9c9", 16], ["#8a6a3a", 30], ["#3a3a5a", 22]].map(([c, w], i, arr) => {
              const x = 1150 + arr.slice(0, i).reduce((n, [, ww]) => n + (ww as number) + 4, 0);
              const h = 95 + ((i * 53) % 35);
              return <rect key={i} x={x} y={430 - h} width={w as number} height={h} rx="2" fill={c as string} />;
            })}
            {[["#b5523a", 22], ["#2f5a6b", 26], ["#c99a4a", 18], ["#4a3a6a", 30]].map(([c, w], i, arr) => {
              const x = 1150 + arr.slice(0, i).reduce((n, [, ww]) => n + (ww as number) + 4, 0);
              return <rect key={i} x={x} y={460} width={w as number} height={110} rx="2" fill={c as string} />;
            })}
            {/* brass sextant on the shelf */}
            <g transform="translate(1350 540)">
              <path d="M-26 20 A 30 30 0 0 1 26 20 L 20 24 A 24 24 0 0 0 -20 24Z" fill="url(#ibrass)" />
              <path d="M0 -24 L-24 22 M0 -24 L24 22" stroke="#d9b56b" strokeWidth="3" />
              <circle cx="0" cy="-24" r="4" fill="#d9b56b" />
            </g>
            <rect x="1380" y="400" width="60" height="26" rx="2" fill="#d6c7a8" />
            <rect x="1386" y="405" width="48" height="16" fill="#8a9ab5" />
          </g>,
          1170,
          135
        )}
      </g>

      {/* ---- desk and objects ---- */}
      <g data-depth="0.9">
        <path d="M80 660 L1520 660 L1600 760 L0 760Z" fill="url(#iwalnut)" />
        <rect x="0" y="760" width="1600" height="30" fill="#24150e" />
        <rect x="0" y="790" width="1600" height="110" fill="#0a0806" />

        {/* lamp */}
        <g>
          <ellipse cx="300" cy="655" rx="60" ry="10" fill="#1d130d" />
          <rect x="292" y="520" width="14" height="135" fill="#3b2a20" />
          <path d="M250 440 L350 440 L390 530 L210 530Z" fill="#e8b36b" />
          <rect x="240" y="434" width="120" height="10" rx="5" fill="#3b2a20" />
        </g>

        {/* telescope on tripod, front-left, aimed at the window */}
        {hot(
          "exploring",
          <g>
            <g stroke="#3b2a20" strokeWidth="8" strokeLinecap="round">
              <line x1="130" y1="700" x2="190" y2="560" />
              <line x1="250" y1="700" x2="190" y2="560" />
              <line x1="190" y1="700" x2="190" y2="560" />
            </g>
            <g transform="translate(190 555) rotate(-28)">
              <rect x="-40" y="-16" width="200" height="32" rx="10" fill="url(#ibrass)" />
              <rect x="150" y="-20" width="40" height="40" rx="8" fill="#6b4f28" />
              <rect x="-60" y="-10" width="30" height="20" rx="6" fill="#6b4f28" />
              <rect x="20" y="-12" width="6" height="24" fill="#3a2a16" />
              <rect x="90" y="-12" width="6" height="24" fill="#3a2a16" />
            </g>
            <circle cx="190" cy="560" r="12" fill="#2a1d14" />
          </g>,
          150,
          520
        )}

        {/* workstation */}
        {hot(
          "work",
          <g>
            <rect x="790" y="640" width="100" height="18" rx="3" fill="#1a1a1c" />
            <rect x="830" y="600" width="20" height="45" fill="#1a1a1c" />
            <rect x="676" y="456" width="328" height="208" rx="12" fill="#17171a" />
            <rect x="690" y="470" width="300" height="180" rx="6" fill="url(#iscreenbg)" />
            <g clipPath="url(#iscr)" className={`screen ${awake || hovered === "work" ? "on" : ""}`}>
              <rect x="690" y="470" width="300" height="180" fill="#0b1220" />
              <g fill="#8fb8ff" opacity="0.9">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <rect key={i} className="codeline" style={{ animationDelay: `${i * 0.18}s` }} x={704 + (i % 3) * 14} y={486 + i * 18} width={60 + ((i * 71) % 140)} height="6" rx="3" />
                ))}
              </g>
              <g fill="#e8b36b" opacity="0.9">
                <rect className="codeline" style={{ animationDelay: "1.5s" }} x="720" y="612" width="40" height="6" rx="3" />
                <rect className="codeline" style={{ animationDelay: "1.7s" }} x="770" y="612" width="90" height="6" rx="3" />
              </g>
              <rect className="cursorblink" x="868" y="610" width="6" height="10" fill="#f2f2ef" />
            </g>
            <rect x="700" y="688" width="280" height="22" rx="5" fill="#1f1f22" />
            <g fill="#2e2e32">
              {Array.from({ length: 12 }).map((_, i) => (
                <rect key={i} x={712 + i * 22} y="694" width="16" height="10" rx="2" />
              ))}
            </g>
            <rect x="1010" y="690" width="34" height="22" rx="10" fill="#1f1f22" />
          </g>,
          760,
          440
        )}

        {/* game controller resting by the keyboard */}
        {hot(
          "gaming",
          <g transform="translate(610 700)">
            <path d="M0 0 h64 a14 14 0 0 1 14 14 l4 14 a10 10 0 0 1 -18 6 l-8 -10 h-48 l-8 10 a10 10 0 0 1 -18 -6 l4 -14 a14 14 0 0 1 14 -14Z" fill="#232326" />
            <circle cx="16" cy="12" r="6" fill="#3a3a40" />
            <path d="M16 8 v8 M12 12 h8" stroke="#8d8d95" strokeWidth="1.5" />
            <circle cx="54" cy="9" r="2.5" fill="#e8b36b" />
            <circle cx="60" cy="14" r="2.5" fill="#8fb8ff" />
            <circle cx="48" cy="14" r="2.5" fill="#f2f2ef" />
            <circle cx="54" cy="19" r="2.5" fill="#b5523a" />
          </g>,
          600,
          690
        )}

        {/* chair back in front of the desk, with a red-and-black scarf over it */}
        {hot(
          "scarf",
          <g transform="translate(700 760)">
            <path d="M40 0 L220 0 L212 70 L48 70Z" fill="#2a1d14" />
            <rect x="60" y="8" width="140" height="52" rx="10" fill="#3b2a20" />
            {/* scarf */}
            <g>
              <path d="M66 4 C 70 40, 60 70, 50 100 L 76 102 C 86 72, 92 42, 92 6Z" fill="#b11b2a" />
              {[20, 36, 52, 68, 84].map((y) => (
                <path key={y} d={`M${62 + (y - 20) * -0.12} ${y} q 14 2 28 0 l -2 8 q -14 2 -26 0Z`} fill="#121214" />
              ))}
              <path d="M176 4 C 178 40, 186 70, 196 98 L 170 100 C 160 70, 154 40, 152 6Z" fill="#b11b2a" />
              {[20, 36, 52, 68, 84].map((y) => (
                <path key={y} d={`M${154 + (y - 20) * 0.12} ${y} q 14 2 28 0 l 2 8 q -14 2 -26 0Z`} fill="#121214" />
              ))}
              <path d="M66 4 L176 4 L178 14 L64 14Z" fill="#b11b2a" />
              <g fill="#f2ede4">
                {[52, 78, 102].map((y) => (
                  <rect key={y} x="50" y={y} width="26" height="3" rx="1.5" />
                ))}
              </g>
            </g>
          </g>,
          690,
          750
        )}

        {/* small original stadium illustration, framed, left wall */}
        <g transform="translate(80 310)">
          <rect x="-8" y="-8" width="156" height="96" rx="3" fill="#3b2a20" />
          <rect x="0" y="0" width="140" height="80" fill="#1a2238" />
          <g fill="#2f3650">
            <ellipse cx="70" cy="52" rx="62" ry="18" />
          </g>
          <g fill="#4a5578">
            <rect x="14" y="20" width="18" height="34" rx="3" />
            <rect x="108" y="20" width="18" height="34" rx="3" />
            <rect x="40" y="26" width="60" height="22" rx="4" />
          </g>
          <g stroke="#e8b36b" strokeWidth="1.5" opacity="0.8">
            <line x1="16" y1="18" x2="30" y2="18" />
            <line x1="110" y1="18" x2="124" y2="18" />
            <line x1="44" y1="24" x2="96" y2="24" />
          </g>
          <ellipse cx="70" cy="56" rx="40" ry="8" fill="#2f6b45" />
        </g>

        {/* football on the floor, left of the desk */}
        {hot(
          "football",
          <g transform="translate(90 830)">
          <ellipse cx="0" cy="28" rx="30" ry="6" fill="#000" opacity="0.5" />
          <circle cx="0" cy="0" r="30" fill="#e6e2d6" />
          <g fill="#1a1a1c">
            <path d="M0 -8 l9 6 l-3 11 h-12 l-3 -11Z" />
            <path d="M-26 -10 l10 -4 l4 8 l-6 8 l-8 -3Z" />
            <path d="M26 -10 l-10 -4 l-4 8 l6 8 l8 -3Z" />
            <path d="M-14 22 l8 -6 l10 2 l2 8 l-9 4Z" />
            <path d="M0 -30 l8 4 l-4 7 h-8 l-4 -7Z" />
          </g>
          <circle cx="0" cy="0" r="30" fill="url(#ilamp)" opacity="0.5" />
        </g>,
          60,
          780
        )}

        {/* technical sketches on the desk: the experiment bench */}
        {hot(
          "bench",
          <g transform="translate(1270 690)">
            <path d="M0 0 L120 -6 L128 40 L8 46Z" fill="#e6dcc3" opacity="0.95" />
            <path d="M6 -14 L126 -20 L134 26 L14 32Z" fill="#efe6d2" opacity="0.95" />
            <g stroke="#6b5a4a" strokeWidth="1" fill="none" opacity="0.75">
              <circle cx="46" cy="6" r="14" />
              <circle cx="46" cy="6" r="5" />
              <path d="M76 -8 h40 M76 4 h40 M76 16 h30" />
              <path d="M20 22 l10 -10 l10 6 l12 -12 l10 8" />
            </g>
          </g>,
          1260,
          660
        )}

        {/* notebook */}
        {hot(
          "signal",
          <g className="notebook">
            <path d="M1080 690 L1230 680 L1250 740 L1100 752Z" fill="#e9dfc8" />
            <path className="page" d="M1082 688 L1150 684 L1168 744 L1100 750Z" fill="#f4ecd8" />
            <path d="M1158 684 L1232 679 L1252 739 L1172 744Z" fill="#f7f0de" />
            <g stroke="#6b5a4a" strokeWidth="1.5" fill="none" opacity="0.7">
              {[0, 1, 2, 3].map((i) => (
                <path key={i} d={`M${1172 + i * 3} ${694 + i * 11} q 12 -4 24 0 t 24 0 t 18 0`} />
              ))}
              <circle cx="1210" cy="736" r="7" />
            </g>
            <path d="M1040 735 L1120 700 L1126 708 L1046 744Z" fill="#2a2a2e" />
            <path d="M1120 700 L1132 696 L1126 708Z" fill="#c9a26b" />
          </g>,
          1120,
          660
        )}

        {/* letter */}
        {hot(
          "contact",
          <g className="letter">
            <path d="M420 720 L560 712 L572 760 L432 770Z" fill="#efe6d2" />
            <path d="M420 720 L560 712 L496 742Z" fill="#e2d7bf" />
            <circle cx="500" cy="740" r="7" fill="#b5523a" />
          </g>,
          430,
          705
        )}

        {/* mug */}
        <g>
          <rect x="1300" y="690" width="44" height="46" rx="6" fill="#3f6b4a" />
          <path d="M1344 700 q 22 0 22 18 q 0 18 -22 18" fill="none" stroke="#3f6b4a" strokeWidth="6" />
          <ellipse cx="1322" cy="690" rx="22" ry="6" fill="#2a2a2e" />
          <g className="steam" stroke="#fff" strokeWidth="2" fill="none" opacity="0.25">
            <path d="M1312 680 q 6 -12 0 -24" />
            <path d="M1326 684 q 6 -12 0 -24" />
          </g>
        </g>
      </g>

      {/* ---- light ---- */}
      <g data-depth="0.9" style={{ mixBlendMode: "screen" }} pointerEvents="none">
        <ellipse cx="300" cy="640" rx="420" ry="260" fill="url(#ilamp)" />
        <ellipse cx="840" cy="640" rx="260" ry="160" fill="url(#iscreen)" className={awake || hovered === "work" ? "" : "opacity-30"} />
      </g>
      <rect x="0" y="0" width="1600" height="900" fill="url(#ivig)" pointerEvents="none" />
    </svg>
  );
}
