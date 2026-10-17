"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/** Optional wind-and-interior ambience, synthesised from filtered noise. Off until the visitor turns it on. */
export function Ambience({ visible }: { visible: boolean }) {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const start = async () => {
    if (!ctxRef.current) {
      const ctx = new AudioContext();
      const len = ctx.sampleRate * 6;
      const buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        let last = 0;
        for (let i = 0; i < len; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + 0.015 * white) / 1.015;
          d[i] = last * 4;
        }
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 700;
      // slow gusts
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 350;
      lfo.connect(lfoGain).connect(lp.frequency);
      lfo.start();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      src.connect(lp).connect(gain).connect(ctx.destination);
      src.start();
      ctxRef.current = ctx;
      gainRef.current = gain;
    }
    const ctx = ctxRef.current;
    await ctx.resume();
    gainRef.current!.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 1.5);
    setOn(true);
  };
  const stop = () => {
    const ctx = ctxRef.current;
    if (ctx && gainRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      setTimeout(() => ctx.suspend(), 900);
    }
    setOn(false);
  };

  useEffect(() => {
    const ref = ctxRef;
    return () => {
      ref.current?.close();
    };
  }, []);

  return (
    <button
      type="button"
      onClick={on ? stop : start}
      aria-pressed={on}
      aria-label={on ? "Turn ambient sound off" : "Turn ambient sound on"}
      className={`absolute right-4 top-16 z-30 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-black/45 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-[#e8dcc6]/80 backdrop-blur-md transition hover:text-white md:right-8 md:top-auto md:bottom-5 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {on ? <Volume2 size={14} /> : <VolumeX size={14} />}
      wind {on ? "on" : "off"}
    </button>
  );
}
