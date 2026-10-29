"use client";

import { useState } from "react";

type Node = { id: string; label: string; x: number; y: number; w?: number; note: string; kind?: "gpu" | "store" | "edge" };
type Edge = [string, string, string?];

const DIAGRAMS: Record<string, { title: string; nodes: Node[]; edges: Edge[] }> = {
  inference: {
    title: "Concurrent multi-model inference behind Triton",
    nodes: [
      { id: "client", label: "Client apps", x: 60, y: 150, note: "Client applications submit images through the API.", kind: "edge" },
      { id: "alb", label: "ALB", x: 220, y: 150, note: "AWS Application Load Balancer in front of several Uvicorn workers.", kind: "edge" },
      { id: "api", label: "FastAPI", x: 370, y: 150, w: 110, note: "Stateless API: auth, rate limiting, tenancy, audit logs. Fans out inference with asyncio.gather." },
      { id: "yolo", label: "YOLO", x: 580, y: 60, note: "Detection and landmark models.", kind: "gpu" },
      { id: "eff", label: "EfficientNet", x: 580, y: 150, w: 120, note: "Feature classification.", kind: "gpu" },
      { id: "vlm", label: "Vision LLM", x: 580, y: 240, w: 110, note: "Multimodal reasoning and structured report text.", kind: "gpu" },
      { id: "triton", label: "Triton", x: 760, y: 105, note: "GPU inference server; ONNX / TensorRT exports validated against the legacy pipeline.", kind: "gpu" },
      { id: "db", label: "Aurora", x: 370, y: 270, note: "Async PostgreSQL via SQLAlchemy + asyncpg.", kind: "store" },
      { id: "s3", label: "S3", x: 220, y: 270, note: "Image storage with scoped access.", kind: "store" },
    ],
    edges: [["client", "alb"], ["alb", "api"], ["api", "yolo", "async"], ["api", "eff", "async"], ["api", "vlm", "async"], ["yolo", "triton"], ["eff", "triton"], ["api", "db"], ["api", "s3"]],
  },
  llm: {
    title: "Fine-tune, serve, learn from feedback",
    nodes: [
      { id: "code", label: "Proprietary code", x: 60, y: 150, w: 150, note: "Never leaves the client's infrastructure.", kind: "store" },
      { id: "sft", label: "SFT (LoRA)", x: 290, y: 80, w: 110, note: "Supervised fine-tuning of Qwen / Llama / Phi on the language.", kind: "gpu" },
      { id: "adapter", label: "Gen adapter", x: 290, y: 220, w: 110, note: "Separate LoRA adapter for text-to-code.", kind: "gpu" },
      { id: "vllm", label: "vLLM", x: 500, y: 150, note: "Serving on 2× A100 on-premise and in Pronto's cloud.", kind: "gpu" },
      { id: "rag", label: "Agentic RAG", x: 500, y: 40, w: 120, note: "Explains areas of the codebase in natural language." },
      { id: "dev", label: "Developers", x: 700, y: 150, w: 110, note: "Ask, generate, rate.", kind: "edge" },
      { id: "dpo", label: "DPO", x: 700, y: 270, note: "Preference tuning from developer ratings feeds the next round.", kind: "gpu" },
    ],
    edges: [["code", "sft"], ["code", "adapter"], ["sft", "vllm"], ["adapter", "vllm"], ["rag", "vllm"], ["vllm", "dev"], ["dev", "dpo", "ratings"], ["dpo", "sft", "next round"]],
  },
  signal: {
    title: "From microphone to fault class",
    nodes: [
      { id: "mic", label: "Mics + tacho", x: 60, y: 150, w: 120, note: "Audio channels plus shaft speed from a tachometer.", kind: "edge" },
      { id: "filt", label: "Filter / normalise", x: 250, y: 150, w: 150, note: "Butterworth band-pass, Yeo-Johnson, windowing." },
      { id: "order", label: "Order tracking", x: 470, y: 60, w: 130, note: "Resample by shaft angle so features stop drifting with RPM." },
      { id: "cwt", label: "CWT scalogram", x: 470, y: 240, w: 130, note: "Morlet wavelet time-frequency image.", kind: "store" },
      { id: "cnn", label: "ResNet / ViT", x: 680, y: 150, w: 120, note: "Image classifier: healthy, humming, rumble, chatter.", kind: "gpu" },
      { id: "xai", label: "Grad-CAM", x: 680, y: 270, w: 110, note: "Shows which time-frequency regions drove the call." },
    ],
    edges: [["mic", "filt"], ["filt", "order"], ["filt", "cwt"], ["order", "cwt"], ["cwt", "cnn"], ["cnn", "xai"]],
  },
  costing: {
    title: "Read with ML, decide with arithmetic",
    nodes: [
      { id: "dwg", label: "CAD drawing (PNG)", x: 60, y: 150, w: 150, note: "Raster export of a single gear drawing.", kind: "edge" },
      { id: "cv", label: "OpenCV + Hough", x: 280, y: 60, w: 140, note: "Denoise, deskew, extract geometry." },
      { id: "ocr", label: "OCR", x: 280, y: 150, note: "Dimensions, tolerances, material." },
      { id: "yolo", label: "YOLOv5", x: 280, y: 240, note: "Manufacturing symbols.", kind: "gpu" },
      { id: "feat", label: "Structured features", x: 480, y: 150, w: 160, note: "Teeth, module, diameters, face width, bore, material." },
      { id: "rag", label: "RAG (Milvus)", x: 700, y: 60, w: 120, note: "Historical should-cost examples and machine rates.", kind: "store" },
      { id: "calc", label: "Cost engine", x: 700, y: 240, w: 120, note: "Deterministic formulas → Excel sheet under human validation." },
    ],
    edges: [["dwg", "cv"], ["dwg", "ocr"], ["dwg", "yolo"], ["cv", "feat"], ["ocr", "feat"], ["yolo", "feat"], ["feat", "rag"], ["feat", "calc"], ["rag", "calc"]],
  },
};

/** Interactive, illustrative architecture diagram. Hover or focus a node to read what it does. */
export function ArchDiagram({ id }: { id: keyof typeof DIAGRAMS }) {
  const d = DIAGRAMS[id];
  const [active, setActive] = useState<string | null>(null);
  const byId = Object.fromEntries(d.nodes.map((n) => [n.id, n]));
  const cur = active ? byId[active] : null;
  const W = (n: Node) => n.w ?? 90;

  return (
    <figure className="rounded-2xl border border-line bg-elevated p-4 md:p-6">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{d.title}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Illustrative, simplified</span>
      </figcaption>
      <svg viewBox="0 0 880 330" className="mt-4 w-full" role="group" aria-label={`${d.title} diagram`}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10z" fill="var(--muted)" />
          </marker>
        </defs>
        {d.edges.map(([a, b, lbl], i) => {
          const A = byId[a], B = byId[b];
          const ax = A.x + W(A), ay = A.y + 18, bx = B.x, by = B.y + 18;
          const lit = active === a || active === b;
          const mx = (ax + bx) / 2;
          return (
            <g key={i} opacity={active && !lit ? 0.25 : 1}>
              <path d={`M${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`} fill="none" stroke={lit ? "var(--accent)" : "var(--muted)"} strokeWidth={lit ? 2 : 1.2} markerEnd="url(#arr)" />
              {lbl && <text x={mx} y={(ay + by) / 2 - 6} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-geist-mono)">{lbl}</text>}
            </g>
          );
        })}
        {d.nodes.map((n) => {
          const lit = active === n.id;
          const fill = n.kind === "gpu" ? "var(--accent-soft)" : n.kind === "store" ? "rgba(143,184,255,0.12)" : "var(--bg)";
          return (
            <g
              key={n.id}
              tabIndex={0}
              role="button"
              aria-label={`${n.label}: ${n.note}`}
              onPointerEnter={() => setActive(n.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(n.id)}
              onBlur={() => setActive(null)}
              style={{ cursor: "pointer", outline: "none" }}
              opacity={active && !lit ? 0.45 : 1}
            >
              <rect x={n.x} y={n.y} width={W(n)} height="36" rx="8" fill={fill} stroke={lit ? "var(--accent)" : "var(--line)"} strokeWidth={lit ? 2 : 1} />
              <text x={n.x + W(n) / 2} y={n.y + 23} textAnchor="middle" fontSize="13" fill="var(--fg)" fontFamily="var(--font-geist-sans)">{n.label}</text>
            </g>
          );
        })}
      </svg>
      <p className="mt-3 min-h-[2.5rem] text-sm leading-relaxed text-muted" aria-live="polite">
        {cur ? (
          <>
            <span className="text-fg">{cur.label}.</span> {cur.note}
          </>
        ) : (
          "Hover or tab through the boxes to read what each part does. Amber boxes run on GPU; blue boxes store data."
        )}
      </p>
    </figure>
  );
}
