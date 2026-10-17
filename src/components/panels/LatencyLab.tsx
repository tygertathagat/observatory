"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Batching vs latency: a discrete-event simulation of an inference server.
 * Requests arrive as a Poisson process. The server collects a batch until either
 * `maxBatch` requests are waiting or `maxWait` ms have passed since the first one,
 * then runs the batch. Batch runtime = fixed overhead + per-item cost that shrinks
 * with batch size (the GPU amortises). All numbers are simulated, not measured.
 */
type Stats = { p50: number; p95: number; throughput: number; utilisation: number; meanBatch: number; dropped: number };

function simulate(rate: number, maxBatch: number, maxWait: number, overhead: number, perItem: number, seconds = 20, seed = 7): { stats: Stats; latencies: number[] } {
  // deterministic PRNG so sliders are reproducible
  let s = seed;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const expo = (mean: number) => -Math.log(1 - rnd()) * mean;

  const horizon = seconds * 1000;
  const arrivals: number[] = [];
  let t = 0;
  while (t < horizon) {
    t += expo(1000 / rate);
    arrivals.push(t);
  }
  const latencies: number[] = [];
  let i = 0;
  let serverFree = 0;
  let busy = 0;
  let batches = 0;
  let items = 0;
  let dropped = 0;
  const QUEUE_LIMIT = 2000;
  while (i < arrivals.length) {
    // batch starts forming at the first waiting arrival or when the server frees up
    const first = Math.max(arrivals[i], serverFree);
    const deadline = first + maxWait;
    let j = i;
    while (j < arrivals.length && j - i < maxBatch && arrivals[j] <= deadline) j++;
    if (j === i) j = i + 1;
    const start = Math.max(serverFree, j - i < maxBatch ? Math.min(deadline, arrivals[j - 1] > first ? deadline : first) : arrivals[j - 1]);
    const n = j - i;
    // per-item cost falls with batch size: amortised kernels, but not for free
    const runtime = overhead + perItem * Math.pow(n, 0.6);
    const end = start + runtime;
    for (let k = i; k < j; k++) {
      const lat = end - arrivals[k];
      if (lat > 60000 || j - i > QUEUE_LIMIT) dropped++;
      else latencies.push(lat);
    }
    busy += runtime;
    batches++;
    items += n;
    serverFree = end;
    i = j;
  }
  const sorted = [...latencies].sort((a, b) => a - b);
  const q = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] ?? 0;
  const span = Math.max(serverFree, horizon);
  return {
    stats: { p50: q(0.5), p95: q(0.95), throughput: (items / span) * 1000, utilisation: Math.min(1, busy / span), meanBatch: items / Math.max(1, batches), dropped },
    latencies: sorted,
  };
}

const Slider = ({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) => (
  <label className="block">
    <span className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-muted">
      {label}
      <span className="text-fg">{value}{unit}</span>
    </span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full accent-[var(--accent)]" />
  </label>
);

const Stat = ({ k, v, cmp }: { k: string; v: string; cmp?: string }) => (
  <div className="rounded-xl border border-line bg-bg p-3">
    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">{k}</p>
    <p className="font-display mt-1 text-2xl">{v}</p>
    {cmp && <p className="font-mono text-[10px] text-muted">{cmp}</p>}
  </div>
);

export function LatencyLab() {
  const [rate, setRate] = useState(80); // requests / s
  const [maxBatch, setMaxBatch] = useState(8);
  const [maxWait, setMaxWait] = useState(10); // ms
  const [overhead, setOverhead] = useState(6); // ms per batch
  const [perItem, setPerItem] = useState(4); // ms per item at batch size 1
  const canvas = useRef<HTMLCanvasElement>(null);

  const result = useMemo(() => simulate(rate, maxBatch, maxWait, overhead, perItem), [rate, maxBatch, maxWait, overhead, perItem]);
  const noBatch = useMemo(() => simulate(rate, 1, 0, overhead, perItem), [rate, overhead, perItem]);

  // latency histogram
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = c.clientWidth, H = 160;
    c.width = W * dpr;
    c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const lat = result.latencies;
    if (!lat.length) return;
    const max = Math.max(lat[lat.length - 1], 1);
    const bins = 40;
    const counts = new Array(bins).fill(0);
    for (const l of lat) counts[Math.min(bins - 1, Math.floor((l / max) * bins))]++;
    const peak = Math.max(...counts);
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    const muted = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
    const bw = W / bins;
    counts.forEach((n, i) => {
      const h = (n / peak) * (H - 24);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(i * bw + 1, H - 18 - h, bw - 2, h);
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = muted;
    ctx.font = "10px ui-monospace, monospace";
    ctx.fillText("0 ms", 2, H - 4);
    ctx.textAlign = "right";
    ctx.fillText(`${max.toFixed(0)} ms`, W - 2, H - 4);
    // p95 marker
    const x = (result.stats.p95 / max) * W;
    ctx.strokeStyle = "#e05a68";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H - 18);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.textAlign = "left";
    ctx.fillStyle = "#e05a68";
    ctx.fillText("p95", Math.min(W - 24, x + 3), 10);
  }, [result]);

  const s = result.stats, b = noBatch.stats;

  return (
    <div className="rounded-2xl border border-line bg-elevated p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-2xl tracking-tight">Batching vs latency</h3>
        <span className="rounded-full border border-accent/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">Simulated · not a GPU benchmark</span>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Dynamic batching trades a little waiting for a lot of throughput. Requests arrive at random (Poisson). The server runs a batch when it has <em>max batch</em> items or when the first item has waited <em>max wait</em>. Each batch costs a fixed overhead plus a per-item cost that shrinks as the batch grows. Move the sliders and watch p95.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="space-y-4">
          <Slider label="Arrival rate" value={rate} min={5} max={400} step={5} unit=" req/s" onChange={setRate} />
          <Slider label="Max batch" value={maxBatch} min={1} max={64} step={1} unit="" onChange={setMaxBatch} />
          <Slider label="Max wait" value={maxWait} min={0} max={50} step={1} unit=" ms" onChange={setMaxWait} />
          <Slider label="Batch overhead" value={overhead} min={1} max={30} step={1} unit=" ms" onChange={setOverhead} />
          <Slider label="Per-item cost (n=1)" value={perItem} min={1} max={30} step={1} unit=" ms" onChange={setPerItem} />
          <p className="font-mono text-[10px] leading-relaxed text-muted">Per-item cost scales as n<sup>0.6</sup> inside a batch. That exponent is an assumption, not a measurement. 20 simulated seconds, fixed random seed.</p>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat k="p50 latency" v={`${s.p50.toFixed(1)} ms`} cmp={`no batching: ${b.p50.toFixed(1)}`} />
            <Stat k="p95 latency" v={`${s.p95.toFixed(1)} ms`} cmp={`no batching: ${b.p95.toFixed(1)}`} />
            <Stat k="Throughput" v={`${s.throughput.toFixed(0)} /s`} cmp={`no batching: ${b.throughput.toFixed(0)}`} />
            <Stat k="Utilisation" v={`${(s.utilisation * 100).toFixed(0)}%`} cmp={`mean batch ${s.meanBatch.toFixed(1)}`} />
          </div>
          <canvas ref={canvas} className="mt-4 block h-[160px] w-full rounded-xl border border-line bg-bg" aria-label="Latency histogram" />
          <p className="mt-2 text-xs text-muted">
            {b.utilisation >= 0.999 && s.utilisation < 0.999
              ? "Without batching the server is saturated and latency runs away; batching keeps it stable at this load."
              : s.utilisation >= 0.999
                ? "The server is saturated: latency grows without bound. Raise max batch, lower the arrival rate, or cut per-item cost."
                : "Headroom remains. Lowering max wait tightens p50 at the cost of smaller batches."}
          </p>
        </div>
      </div>
    </div>
  );
}
