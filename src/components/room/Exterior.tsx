"use client";

/**
 * Blue hour outside the observatory. Pure SVG, so it paints on first frame.
 * Layers carry data-depth for a gentle parallax handled by Room.tsx.
 */
export function Exterior({ lit, portrait = false }: { lit: boolean; portrait?: boolean }) {
  return (
    <svg viewBox={portrait ? "760 60 840 840" : "0 0 1600 900"} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full select-none" aria-hidden>
      <defs>
        <linearGradient id="xsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1324" />
          <stop offset="0.5" stopColor="#1c2a44" />
          <stop offset="0.78" stopColor="#3e4a66" />
          <stop offset="1" stopColor="#8a6a55" />
        </linearGradient>
        <linearGradient id="xmist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9aa3b8" stopOpacity="0" />
          <stop offset="1" stopColor="#9aa3b8" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="xwarm" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffb86b" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb86b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="xstone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a2d33" />
          <stop offset="0.5" stopColor="#3b3f47" />
          <stop offset="1" stopColor="#22252b" />
        </linearGradient>
        <linearGradient id="xdome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a5f6a" />
          <stop offset="1" stopColor="#2d3038" />
        </linearGradient>
        <radialGradient id="xvig" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
      </defs>

      {/* sky and stars */}
      <g data-depth="0.1">
        <rect width="1600" height="900" fill="url(#xsky)" />
        <g fill="#e8e4d8">
          {[
            [120, 80, 1.2], [260, 160, 0.8], [410, 60, 1], [560, 140, 0.7], [700, 40, 1.3], [860, 120, 0.8],
            [1010, 70, 1.1], [1180, 150, 0.7], [1320, 50, 1.2], [1460, 110, 0.9], [1540, 200, 0.7], [330, 230, 0.6],
            [960, 220, 0.6], [1240, 260, 0.8], [80, 300, 0.6], [640, 260, 0.7],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} opacity={0.5 + ((i * 37) % 50) / 100} />
          ))}
        </g>
      </g>

      {/* far ridges */}
      <g data-depth="0.2">
        <path d="M0 520 L140 440 L260 480 L400 380 L540 450 L700 360 L860 430 L1000 370 L1160 440 L1300 380 L1440 450 L1600 400 L1600 900 L0 900Z" fill="#232b45" />
        <rect y="400" width="1600" height="300" fill="url(#xmist)" />
      </g>
      <g data-depth="0.3">
        <path d="M0 600 L120 560 L260 590 L420 520 L560 580 L720 540 L880 600 L1040 550 L1200 610 L1360 560 L1600 620 L1600 900 L0 900Z" fill="#1a2238" />
        <g className="mist" opacity="0.35">
          <ellipse cx="300" cy="620" rx="320" ry="26" fill="#9aa3b8" />
          <ellipse cx="900" cy="640" rx="420" ry="30" fill="#9aa3b8" />
          <ellipse cx="1400" cy="615" rx="300" ry="22" fill="#9aa3b8" />
        </g>
      </g>

      {/* observatory hill */}
      <g data-depth="0.5">
        <path d="M0 760 Q 300 640 700 690 Q 1000 720 1250 640 Q 1450 600 1600 660 L1600 900 L0 900Z" fill="#111827" />
        <path d="M0 760 Q 300 640 700 690 Q 1000 720 1250 640 Q 1450 600 1600 660 L1600 900 L0 900Z" fill="#0d1320" opacity="0.5" />

        {/* footpath */}
        <path d="M1080 700 C 1000 730, 900 740, 820 790 S 640 850, 560 900" stroke="#3a3326" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d="M1080 700 C 1000 730, 900 740, 820 790 S 640 850, 560 900" stroke="#5a4a36" strokeWidth="4" fill="none" strokeDasharray="10 16" opacity="0.6" />

        {/* observatory: stone drum + timber annex + dome */}
        <g transform="translate(1180 560)">
          {/* warm ground light */}
          <ellipse cx="-20" cy="120" rx="260" ry="70" fill="url(#xwarm)" className={lit ? "" : "opacity-50"} />
          {/* annex */}
          <rect x="-230" y="40" width="190" height="90" fill="#2a2118" />
          <path d="M-240 40 L-135 -10 L-30 40Z" fill="#3a2d20" />
          <rect x="-200" y="70" width="28" height="34" fill="#ffb347" opacity="0.9" />
          <rect x="-150" y="70" width="28" height="34" fill="#ffb347" opacity="0.9" />
          <rect x="-100" y="70" width="28" height="34" fill="#e8a040" opacity="0.8" />
          {/* drum */}
          <rect x="-60" y="-10" width="190" height="140" fill="url(#xstone)" />
          {/* stone courses */}
          <g stroke="#1b1e24" strokeWidth="2" opacity="0.6">
            {[12, 34, 56, 78, 100, 122].map((y) => (
              <line key={y} x1="-60" y1={y} x2="130" y2={y} />
            ))}
          </g>
          {/* windows on drum */}
          <rect x="-20" y="50" width="24" height="40" rx="10" fill="#ffb347" />
          <rect x="60" y="50" width="24" height="40" rx="10" fill="#ffb347" />
          {/* door */}
          <rect x="22" y="80" width="26" height="50" rx="12" fill="#ffc46b" />
          {/* dome */}
          <path d="M-70 -10 A 105 105 0 0 1 140 -10Z" fill="url(#xdome)" />
          {/* dome slit, partially open: amber light inside */}
          <path d="M20 -112 L52 -112 L58 -10 L14 -10Z" fill="#ffb86b" opacity="0.95" />
          <path d="M52 -112 L70 -108 L76 -10 L58 -10Z" fill="#1b1e24" />
          {/* dome ribs */}
          <g stroke="#1b1e24" strokeWidth="2" fill="none" opacity="0.7">
            <path d="M-50 -30 A 90 90 0 0 1 35 -114" />
            <path d="M-20 -80 A 100 100 0 0 1 35 -114" />
            <path d="M120 -30 A 90 90 0 0 0 35 -114" />
          </g>
        </g>

        {/* apple trees */}
        {[
          [360, 712, 0.9], [1480, 700, 0.8],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x="-5" y="-10" width="10" height="46" fill="#1c1510" />
            <circle cx="0" cy="-30" r="36" fill="#1a2a24" />
            <circle cx="-22" cy="-14" r="24" fill="#16231e" />
            <circle cx="22" cy="-14" r="24" fill="#16231e" />
            <circle cx="-10" cy="-40" r="3" fill="#8a3a2e" />
            <circle cx="14" cy="-26" r="3" fill="#8a3a2e" />
          </g>
        ))}
      </g>

      {/* foreground grass edge */}
      <g data-depth="0.8">
        <path d="M0 860 Q 200 820 400 850 T 800 850 T 1200 850 T 1600 860 L1600 900 L0 900Z" fill="#090c14" />
      </g>
      <rect width="1600" height="900" fill="url(#xvig)" pointerEvents="none" />
    </svg>
  );
}
