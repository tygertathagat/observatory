"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { Section } from "./Section";
import { Reveal } from "./Reveal";

type Mode = "healthy" | "humming" | "rumble" | "chatter";

const MODES: { id: Mode; label: string; desc: string; pred: Record<Mode, number> }[] = [
  {
    id: "healthy",
    label: "Healthy",
    desc: "Clean gear-mesh tone with a few harmonics and low broadband noise.",
    pred: { healthy: 0.94, humming: 0.03, rumble: 0.02, chatter: 0.01 },
  },
  {
    id: "humming",
    label: "Humming",
    desc: "Strong low-frequency hum: shaft-frequency sidebands around the mesh frequency.",
    pred: { healthy: 0.05, humming: 0.89, rumble: 0.04, chatter: 0.02 },
  },
  {
    id: "rumble",
    label: "Rumble",
    desc: "Bearing impacts and resonance: modulated low-band noise.",
    pred: { healthy: 0.02, humming: 0.06, rumble: 0.9, chatter: 0.02 },
  },
  {
    id: "chatter",
    label: "Chatter",
    desc: "Broadband impulsive tooth impacts: periodic clicks across the whole spectrum.",
    pred: { healthy: 0.01, humming: 0.02, rumble: 0.05, chatter: 0.92 },
  },
];

/** Synthesises a gearbox with Web Audio and draws a scrolling spectrogram. */
export function GearboxLab() {
  const [mode, setMode] = useState<Mode>("healthy");
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(0.5);
  const canvas = useRef<HTMLCanvasElement>(null);
  const audio = useRef<{
    ctx: AudioContext;
    master: GainNode;
    analyser: AnalyserNode;
    nodes: AudioNode[];
  } | null>(null);

  const stopGraph = () => {
    const a = audio.current;
    if (!a) return;
    for (const n of a.nodes) {
      try {
        if ("stop" in n) (n as OscillatorNode | AudioBufferSourceNode).stop();
        n.disconnect();
      } catch {}
    }
    a.nodes = [];
  };

  const buildGraph = (m: Mode) => {
    const a = audio.current;
    if (!a) return;
    stopGraph();
    const { ctx, master } = a;
    const nodes: AudioNode[] = [];
    const out = ctx.createGain();
    out.gain.value = 0.25;
    out.connect(master);
    nodes.push(out);

    const osc = (f: number, g: number, type: OscillatorType = "sawtooth") => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      const gn = ctx.createGain();
      gn.gain.value = g;
      o.connect(gn).connect(out);
      o.start();
      nodes.push(o, gn);
      return o;
    };
    const noise = (g: number, lo?: number, hi?: number) => {
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      let last: AudioNode = src;
      if (lo) {
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = lo;
        last.connect(hp);
        last = hp;
        nodes.push(hp);
      }
      if (hi) {
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = hi;
        last.connect(lp);
        last = lp;
        nodes.push(lp);
      }
      const gn = ctx.createGain();
      gn.gain.value = g;
      last.connect(gn).connect(out);
      src.start();
      nodes.push(src, gn);
      return gn;
    };

    const GMF = 420; // gear-mesh frequency
    // base mesh tone + harmonics (present in all modes)
    osc(GMF, 0.18, "triangle");
    osc(GMF * 2, 0.08, "sine");
    osc(GMF * 3, 0.04, "sine");
    noise(0.03, 200, 6000);

    if (m === "humming") {
      osc(60, 0.35, "sine");
      osc(120, 0.2, "sine");
      osc(GMF - 25, 0.12, "sine");
      osc(GMF + 25, 0.12, "sine");
    }
    if (m === "rumble") {
      const g = noise(0.6, 40, 300);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 7;
      const lg = ctx.createGain();
      lg.gain.value = 0.4;
      lfo.connect(lg).connect(g.gain);
      lfo.start();
      nodes.push(lfo, lg);
      osc(90, 0.15, "sine");
    }
    if (m === "chatter") {
      // periodic broadband clicks at ~18 Hz
      const g = noise(0.9, 800, 12000);
      g.gain.value = 0;
      const clicker = ctx.createOscillator();
      clicker.type = "square";
      clicker.frequency.value = 18;
      const shaper = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) curve[i] = i > 236 ? 1 : 0;
      shaper.curve = curve;
      const cg = ctx.createGain();
      cg.gain.value = 0.9;
      clicker.connect(shaper).connect(cg).connect(g.gain);
      clicker.start();
      nodes.push(clicker, shaper, cg);
    }
    a.nodes = nodes;
  };

  const start = async () => {
    if (!audio.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = vol;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      master.connect(analyser).connect(ctx.destination);
      audio.current = { ctx, master, analyser, nodes: [] };
    }
    await audio.current.ctx.resume();
    buildGraph(mode);
    setPlaying(true);
  };
  const stop = () => {
    stopGraph();
    audio.current?.ctx.suspend();
    setPlaying(false);
  };

  useEffect(() => {
    if (playing) buildGraph(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (audio.current) audio.current.master.gain.value = vol;
  }, [vol]);

  // spectrogram: own pixel buffer, shifted left each frame
  const playingRef = useRef(false);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx2d = c.getContext("2d")!;
    const W = 600,
      H = 220;
    c.width = W;
    c.height = H;
    const img = ctx2d.createImageData(W, H);
    const px = img.data;
    for (let i = 3; i < px.length; i += 4) px[i] = 255; // opaque black
    ctx2d.putImageData(img, 0, 0);
    const data = new Uint8Array(512);
    // precompute bin per row (log-ish scale, 0..~6 kHz)
    const rowBin = new Int32Array(H);
    for (let y = 0; y < H; y++) {
      const f = Math.pow((H - y) / H, 2);
      rowBin[y] = Math.min(511, Math.floor(f * 130));
    }
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const a = audio.current;
      if (!a || !playingRef.current) return;
      a.analyser.getByteFrequencyData(data);
      // shift every row left by one pixel
      for (let y = 0; y < H; y++) {
        const row = y * W * 4;
        px.copyWithin(row, row + 4, row + W * 4);
      }
      for (let y = 0; y < H; y++) {
        const v = data[rowBin[y]] / 255;
        const i = (y * W + W - 1) * 4;
        // black → deep red → orange → yellow-white
        const t = Math.sqrt(v);
        px[i] = Math.min(255, 20 + t * 300);
        px[i + 1] = Math.max(0, t * 180 - 30);
        px[i + 2] = Math.max(0, t * 120 - 60);
        px[i + 3] = 255;
      }
      ctx2d.putImageData(img, 0, 0);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const a = audio;
    return () => {
      stopGraph();
      a.current?.ctx.close();
    };
  }, []);

  const current = MODES.find((m) => m.id === mode)!;

  return (
    <Section
      id="lab"
      eyebrow="Interactive · Gearbox Lab"
      title={
        <>
          Hear what a <em className="italic text-accent">faulty gearbox</em>{" "}
          sounds like.
        </>
      }
    >
      <Reveal>
        <p className="max-w-2xl text-lg text-muted">
          For Mahindra Swaraj R&amp;D I turned gearbox audio into scalograms and
          trained vision models to spot faults. This is a synthesised toy
          version: pick a condition, press play, and watch the live spectrogram.
          The classifier bars are illustrative, not the production model.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col overflow-hidden rounded-3xl border border-line bg-black">
          <canvas
            ref={canvas}
            data-interactive
            className="block min-h-[220px] w-full flex-1"
          />
          <div className="flex flex-wrap items-center gap-3 border-t border-line bg-elevated p-4">
            <button
              type="button"
              onClick={playing ? stop : start}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white transition hover:scale-105"
              aria-label={playing ? "Stop" : "Play"}
            >
              {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    mode === m.id
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line text-muted hover:border-accent hover:text-fg"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <label className="ml-auto flex items-center gap-2 text-muted">
              <Volume2 size={16} />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={vol}
                onChange={(e) => setVol(parseFloat(e.target.value))}
                className="w-24 accent-[var(--accent)]"
                aria-label="Volume"
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-elevated p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Classifier output
          </p>
          <ul className="mt-4 space-y-3">
            {MODES.map((m) => {
              const p = playing ? current.pred[m.id] : 0;
              return (
                <li key={m.id}>
                  <div className="flex justify-between text-sm">
                    <span className={m.id === mode && playing ? "text-accent" : ""}>
                      {m.label}
                    </span>
                    <span className="font-mono text-xs text-muted">
                      {(p * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-700"
                      style={{ width: `${p * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-muted">{current.desc}</p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted">
            Real pipeline: Butterworth → envelope / cepstrum → CWT scalogram →
            ViT / ResNet → Grad-CAM
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
