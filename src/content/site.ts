/**
 * All personal content lives here, separate from the scene renderer.
 * Anything marked `unverified: true` or wrapped in TODO is a placeholder
 * Tathagat still needs to confirm or replace. See docs/NEEDED.md.
 */

export const profile = {
  name: "Tathagat",
  role: "AI Engineer",
  currentTitle: "Technical Director, AI",
  currentCompany: "Vigyanam Labs",
  region: "Himalayan region of India",
  location: "Shimla, Himachal Pradesh, India",
  pronouns: "he/him",
  intro: "AI engineer. Systems thinker. Nerd at heart.",
  statement:
    "I build intelligent systems and like understanding exactly how, and why, they work.",
  thread: "What's happening underneath?",
  bio: [
    "I'm an AI engineer with a master's in Data Science and AI. My work is production AI: computer-vision inference, LLM serving and applications, and the backend architecture that holds them together.",
    "I care about the layer underneath the frameworks. Right now that means GPU computing and distributed training: CUDA, DDP and FSDP, NCCL, profiling. I study these because the systems I ship are only as good as my understanding of what they run on.",
    "Outside work I'm a nerd with a football habit: I play, I watch, I argue about formations. I game (Valorant, EA Sports FC), I read fantasy, and I build physical things when the problem is interesting enough. I live in the Himalayan region of India, with an apple orchard that is my quiet place rather than my job.",
  ],
  availability: "Open to remote, hybrid, on-site and relocation",
};

export const links = {
  email: "tathagat1@outlook.in",
  linkedin: "https://www.linkedin.com/in/tathagat3/",
  instagram: "https://www.instagram.com/__the__white__wolf/",
  github: "https://github.com/tygertathagat",
  resume: "/Tathagat-CV.pdf", // web copy without the phone number; source in docs/cv/
};

/* ------------------------------------------------------------------ */
/* Selected work: case studies                                         */
/* ------------------------------------------------------------------ */

export type CaseStudy = {
  slug: string;
  title: string;
  kicker: string;
  context: string;
  period: string;
  status: "shipped" | "mvp" | "poc" | "personal";
  confidential?: boolean;
  unverified?: boolean;
  problem: string;
  role: string;
  constraints: string[];
  architecture: string[];
  decisions: { decision: string; tradeoff: string }[];
  outcomes: string[];
  lessons: string[];
  stack: string[];
  diagram?: "inference" | "llm" | "signal" | "costing";
  /** Architecture X-Ray: deeper engineering detail, shown only when present and verified. */
  xray?: {
    requestFlow: string[];
    bottlenecks: string[];
    failureModes: string[];
  };
};

export const projects: CaseStudy[] = [
  {
    slug: "cv-inference-triton",
    title: "Production computer-vision inference on Triton",
    kicker: "Clinical screening platform",
    context: "Vigyanam Labs · product under NDA",
    period: "2025 — present",
    status: "shipped",
    confidential: true,
    problem:
      "A facial-analysis screening product needed to run several vision models and a multimodal LLM on every submission, with throughput and reliability good enough for both a consumer app and a multi-tenant clinical B2B product. The product itself is under NDA, so this study describes the engineering, not the product.",
    role:
      "Designed and built the platform from an empty repository: models, serving layer, API, multi-tenancy and cloud deployment. Led a small team through production hardening.",
    constraints: [
      "GPU-heavy inference had to be separated from core API handling so the API stayed responsive under load.",
      "PHI-aware storage and access control: organisation, clinic, staff and patient scopes with audit logs.",
      "Model parity: a GPU Triton service had to reproduce the legacy Python pipeline's outputs before it could replace it.",
    ],
    architecture: [
      "Stateless FastAPI service, 50+ endpoints, Uvicorn multi-worker behind an AWS Application Load Balancer.",
      "Concurrent inference fan-out with asyncio: YOLO detection, EfficientNet classification and a vision LLM run in parallel per request.",
      "NVIDIA Triton serving ONNX / TensorRT-style exports; preprocessing differences debugged against the legacy pipeline.",
      "Async PostgreSQL via SQLAlchemy + asyncpg on Aurora; S3 for images; Secrets Manager with an LRU cache; SlowAPI rate limiting; Prometheus metrics.",
    ],
    decisions: [
      {
        decision: "Run detection, classification and the vision LLM concurrently per request rather than sequentially.",
        tradeoff: "More complex error handling and timeouts, in exchange for latency bounded by the slowest model instead of the sum.",
      },
      {
        decision: "Move GPU models behind Triton instead of loading them in the API workers.",
        tradeoff: "An extra network hop and a parity-validation effort, for independent scaling and far cleaner API processes.",
      },
      {
        decision: "Tenancy modelled explicitly (organisation → clinic → staff → patient) with RBAC and audit logs from the start.",
        tradeoff: "Slower first release, but no retrofit when the B2B product arrived.",
      },
    ],
    outcomes: [
      "In production serving both the consumer and B2B products.",
      "Triton service validated at parity with the legacy pipeline and deployed for high-throughput analysis.",
    ],
    lessons: [
      "Most 'model differences' after export are preprocessing differences. Diff the tensors before the weights.",
      "Separating GPU execution from the API early is cheaper than untangling it later.",
    ],
    stack: ["Python", "FastAPI", "asyncio", "Triton", "TensorRT", "ONNX", "YOLO", "EfficientNet", "Claude Vision", "AWS", "PostgreSQL", "Prometheus"],
    diagram: "inference",
    xray: {
      requestFlow: [
        "Client uploads one or more images; the ALB routes to a stateless Uvicorn worker.",
        "Auth resolves the tenant scope (organisation → clinic → staff → patient) from cached Secrets Manager credentials; SlowAPI applies per-key rate limits.",
        "Images are written to S3 under a PHI-aware key scheme; a submission row is created in Aurora via asyncpg.",
        "The worker fans out with asyncio.gather: detection and classification go to Triton, the vision LLM call goes out in parallel.",
        "Results are merged into a structured report, persisted, audit-logged, and returned.",
      ],
      bottlenecks: [
        "GPU queueing on Triton under burst load: batching and instance counts set the ceiling, not the API.",
        "The vision LLM call is the slowest leg; the parallel fan-out hides it behind local inference instead of adding to it.",
        "Image preprocessing on the API side costs CPU; moving it next to the model removed a parity bug and freed worker time.",
      ],
      failureModes: [
        "Triton unavailable: the API returns a clear 503 for inference routes while CRUD routes stay up (GPU work is isolated from core handling).",
        "Vision LLM timeout: the request completes with local-model results and flags the missing section, rather than failing the whole submission.",
        "Export parity drift after a model update: parity validation against the legacy pipeline is a release gate, not an afterthought.",
      ],
    },
  },
  {
    slug: "llm-serving-vllm",
    title: "Fine-tuned LLMs for a proprietary language, served with vLLM",
    kicker: "Pronto CodeLLM",
    context: "Pronto Software, Australia · via Netsmartz",
    period: "2024 — 2025",
    status: "shipped",
    problem:
      "Pronto's product is written in its own proprietary programming language. Developers wanted to ask questions about the codebase in plain English and generate code in that language, without any source code leaving their infrastructure.",
    role:
      "Led the AI work: data preparation, fine-tuning, the agentic RAG layer, the feedback loop and the serving deployment on Pronto's own hardware and cloud.",
    constraints: [
      "No proprietary code could leave the client's environment, so everything ran on-premise or in their cloud.",
      "Open models had never seen the language; general coding ability did not transfer.",
      "Developer feedback had to improve the model continuously, not just be collected.",
    ],
    architecture: [
      "Supervised fine-tuning of Qwen 2.5, Llama and Phi on the proprietary codebase (Hugging Face, LoRA / PEFT).",
      "A separate LoRA generation adapter for text-to-code synthesis, trained on top of the fine-tuned base.",
      "Agentic RAG over the codebase for explanation and navigation queries.",
      "Preference tuning with DPO from developer ratings, closing the feedback loop.",
      "Serving with vLLM on dual A100s on-premise and on Pronto's cloud.",
    ],
    decisions: [
      {
        decision: "Fine-tune open models rather than prompt a hosted API.",
        tradeoff: "Significant training effort, but the only option compatible with the data-residency constraint.",
      },
      {
        decision: "Keep explanation (RAG) and generation (adapter) as separate capabilities.",
        tradeoff: "Two things to maintain, but each could be evaluated and improved independently.",
      },
    ],
    outcomes: [
      "Delivered and running inside Pronto's infrastructure with vLLM.",
      "DPO feedback loop in place so developer ratings feed future training rounds.",
    ],
    lessons: [
      "For a language the base model has never seen, data curation matters more than model choice.",
      "DPO is the cheapest way to turn thumbs-up / thumbs-down into real improvement.",
    ],
    stack: ["Qwen 2.5", "Llama", "Phi", "LoRA / PEFT", "DPO", "vLLM", "Agentic RAG", "Hugging Face", "A100"],
    diagram: "llm",
  },
  {
    slug: "async-backend-architecture",
    title: "Backend architecture and asynchronous workflows for AI products",
    kicker: "FastAPI platform patterns",
    context: "Netsmartz and Vigyanam Labs",
    period: "2024 — present",
    status: "shipped",
    problem:
      "AI features tend to arrive as notebooks. Turning them into dependable services means auth, rate limits, async I/O, background work, feedback capture, structured logs and deployment, repeated across several products.",
    role: "Owned the backend design for the AI services I shipped, and the API contracts other teams integrated against.",
    constraints: [
      "Mixed workloads: fast CRUD calls next to slow model calls on the same service.",
      "External LLM and vision APIs with their own latency and failure modes.",
      "Small teams; the architecture had to be understandable by the next engineer.",
    ],
    architecture: [
      "FastAPI with async routes; PostgreSQL, Redis, and Milvus / FAISS for vector search.",
      "Dockerised services with structured logging, authentication, feedback capture and external LLM integrations.",
      "Long-running inference separated from request handling; concurrency with asyncio where calls are independent.",
      "Deployed on AWS and Azure depending on the client.",
    ],
    decisions: [
      {
        decision: "Default to async everywhere, including the database driver.",
        tradeoff: "Stricter discipline around blocking calls, for far better throughput under slow upstream APIs.",
      },
    ],
    outcomes: ["Pattern reused across several client and product backends."],
    lessons: ["Capture user feedback in the API from day one; it is the training data for the next version."],
    stack: ["Python", "FastAPI", "asyncio", "PostgreSQL", "Redis", "Milvus", "FAISS", "Docker", "AWS", "Azure"],
  },
  {
    slug: "gearbox-fault-detection",
    title: "Acoustic gearbox fault detection",
    kicker: "Mahindra Swaraj Tractors R&D",
    context: "Visiting engineer, via Netsmartz",
    period: "2024 — 2025",
    status: "poc",
    problem:
      "Tell whether a running tractor gearbox is healthy, humming, rumbling or chattering from its sound and vibration, so faults are caught before assembly is complete.",
    role: "Designed the signal-processing chain, built the dataset representation and trained and compared the models.",
    constraints: [
      "Noisy factory audio with human and environmental sound mixed in.",
      "RPM varied between recordings, so fixed-frequency features drifted.",
    ],
    architecture: [
      "Inputs: microphone audio and a tachometer channel for shaft speed.",
      "Signal chain: band-pass / Butterworth filtering, Yeo-Johnson normalisation, windowing, envelope spectrum, cepstrum, spectral kurtosis.",
      "Gear-domain features: gear-mesh frequency and harmonics, shaft sidebands, order tracking from the tachometer.",
      "Continuous Wavelet Transform (Morlet) scalograms as the image representation.",
      "ResNet-50, EfficientNet and ViT compared on scalograms; Grad-CAM and SHAP for explainability.",
    ],
    decisions: [
      {
        decision: "Turn the signal into scalogram images and use vision models.",
        tradeoff: "Loses some phase information, but gives strong pretrained backbones and visual explanations engineers trust.",
      },
    ],
    outcomes: ["Proof of concept delivered; a synthesised toy version is playable in the Field Journal."],
    lessons: ["Order tracking with the tachometer mattered more than any model change."],
    stack: ["Signal processing", "CWT", "ResNet-50", "EfficientNet", "ViT", "Grad-CAM", "SHAP", "PyTorch"],
    diagram: "signal",
  },
  {
    slug: "should-be-costing",
    title: "Should-be-costing from CAD drawings",
    kicker: "Mahindra Swaraj Tractors R&D",
    context: "Visiting engineer, via Netsmartz",
    period: "2024 — 2025",
    status: "mvp",
    problem:
      "Given an AutoCAD drawing of a tractor gear, estimate what it should cost to manufacture, so procurement can negotiate from evidence.",
    role: "Built the drawing-understanding pipeline, the retrieval layer and the deterministic costing engine, from PoC to MVP.",
    constraints: [
      "Drawings arrived as raster exports, not CAD data.",
      "Costs had to be explainable line by line and remain under human validation.",
    ],
    architecture: [
      "OpenCV preprocessing (denoise, binarise, deskew), geometry via Canny / Hough lines and LineTR.",
      "OCR for dimensions, tolerances and material; YOLOv5 for manufacturing symbols.",
      "Structured features: teeth, module, pitch / root / outer diameters, face width, bore, material.",
      "RAG over Milvus / FAISS for master data, historical should-cost examples and machine rates.",
      "Deterministic cost engine: material weight × rate, machining time × machine rate, tooling, overhead; Excel output.",
    ],
    decisions: [
      {
        decision: "Keep the final cost calculation deterministic and formula-based rather than predicted by a model.",
        tradeoff: "Less 'magic', but every number on the sheet can be traced and defended.",
      },
    ],
    outcomes: ["PoC progressed to an MVP used under human validation."],
    lessons: ["Use ML to read, and arithmetic to decide, when the output has to be audited."],
    stack: ["OpenCV", "YOLOv5", "OCR", "Gemini Vision", "RAG", "Milvus", "FAISS", "Python"],
    diagram: "costing",
  },
];

/* ------------------------------------------------------------------ */
/* Things I'm exploring (active learning, not claimed expertise)        */
/* ------------------------------------------------------------------ */

export type Interest = {
  id: string;
  label: string;
  level: "learning" | "practising" | "expertise";
  why: string;
  notes: string[];
  x: number;
  y: number;
  links: string[];
};

export const exploring: Interest[] = [
  {
    id: "cuda",
    label: "CUDA",
    level: "learning",
    why: "To understand what a kernel actually costs, instead of trusting a framework's number.",
    notes: ["TODO: add notes as I go."],
    x: 22,
    y: 38,
    links: ["profiling", "distributed"],
  },
  {
    id: "distributed",
    label: "Distributed training",
    level: "learning",
    why: "The models I serve are increasingly trained across many GPUs; I want to reason about that, not just configure it.",
    notes: [],
    x: 48,
    y: 24,
    links: ["ddp-fsdp", "nccl"],
  },
  {
    id: "ddp-fsdp",
    label: "DDP and FSDP",
    level: "learning",
    why: "Where the memory goes, and what sharding really trades away.",
    notes: [],
    x: 70,
    y: 40,
    links: ["nccl"],
  },
  {
    id: "nccl",
    label: "NCCL",
    level: "learning",
    why: "All-reduce is the heartbeat of multi-GPU training. I want to see it, not assume it.",
    notes: [],
    x: 82,
    y: 66,
    links: ["profiling"],
  },
  {
    id: "profiling",
    label: "Profiling and performance",
    level: "practising",
    why: "I already profile inference services in production; now I'm extending that to training loops.",
    notes: [],
    x: 50,
    y: 70,
    links: ["math"],
  },
  {
    id: "math",
    label: "Mathematical foundations",
    level: "practising",
    why: "Linear algebra, probability and optimisation, revisited slowly with pen and paper so the intuition is mine.",
    notes: [],
    x: 24,
    y: 76,
    links: ["cuda"],
  },
];

export const expertise = [
  "Production AI systems and backend architecture",
  "Computer-vision inference and optimisation (Triton, TensorRT, ONNX)",
  "LLM serving and applications (vLLM, fine-tuning with LoRA and DPO, agentic RAG)",
  "FastAPI, async Python, PostgreSQL, Docker, AWS and Azure",
];

/* ------------------------------------------------------------------ */
/* Experience & education (from CV, verified)                           */
/* ------------------------------------------------------------------ */

export const experience = [
  {
    company: "Vigyanam Labs",
    role: "Technical Director, AI · Lead AI Engineer",
    period: "Dec 2025 — present",
    location: "Mohali, India",
    points: [
      "Own end-to-end AI architecture and delivery: PoCs, ML/LLM services, roadmaps, API contracts and release plans.",
      "Design production systems across generative AI, RAG, computer vision, OCR, healthcare workflows, model serving and cloud deployment.",
    ],
  },
  {
    company: "Netsmartz",
    role: "AI/ML Engineer",
    period: "Jul 2024 — Dec 2025",
    location: "Mohali, India",
    points: [
      "Built modular RAG, LLM fine-tuning, forecasting, invoice-extraction and computer-vision applications.",
      "Visiting engineer for Mahindra Swaraj R&D; led the Pronto Software engagement.",
    ],
  },
  {
    company: "Salt Holdings",
    role: "Data Analyst Intern",
    period: "Jan 2024 — Jul 2024",
    location: "Mohali, India",
    points: ["Analytics and ML workflows in Python and SQL: cleaning, EDA, feature engineering, reporting."],
  },
];

export const education = [
  { degree: "M.Sc. Data Science & Artificial Intelligence", school: "Himachal Pradesh University" },
  { degree: "B.Tech. Information Technology", school: "University Institute of Information Technology, HPU" },
];

/* ------------------------------------------------------------------ */
/* Beyond the screen                                                    */
/* ------------------------------------------------------------------ */

export const beyond = {
  intro: [
    "The window faces the ridgelines. Most evenings that is all it needs to do.",
    "I live in the Himalayan region of India. There is an apple orchard out there too, which is my quiet place, not my job. This page is a short pause before you go back to the desk.",
  ],
  /** Drop photos into public/beyond/ and add honest captions here, keyed by filename.
   *  TODO: Tathagat to add place names if he wants them; these describe only what is visible. */
  captions: {
    "dsc03398.jpg": "A road cut through the gorge.",
    "dsc03487.jpg": "A monastery under bare ridgelines.",
    "dsc03529.jpg": "Somewhere up a valley, with the car.",
    "dsc03657.jpg": "A café window covered in riders' stickers.",
    "dsc03731.jpg": "Looking down over an eroded riverbed.",
    "dsc03846.jpg": "A high lake, snow on the far peaks.",
    "dsc03941.jpg": "Snow peaks above an autumn plateau.",
    "dsc03942.jpg": "The same peaks, wider.",
    "dsc04053.jpg": "Above a village and its poplars.",
  } as Record<string, string>,
  note: "Photographs on this page are Tathagat's own. No stock or generated imagery is presented as his property.",
};

/* ------------------------------------------------------------------ */
/* Personal corner (configurable; nothing here is invented)             */
/* ------------------------------------------------------------------ */

export const personal = {
  football: {
    blurb:
      "Football is where I switch off and switch on at the same time. I play when I can, watch more than I should, and enjoy thinking about shape and formations, strictly as a fan.",
    club: "AC Milan",
    player: "", // TODO: favourite player, if you want it shown
    position: "", // TODO: the position you play, if you want it shown
    defaultFormation: "4-3-3" as const,
  },
  gaming: {
    blurb:
      "Mostly competitive shooters and football games. No ranks or stats here, just what I actually play.",
    games: ["Valorant", "EA Sports FC"],
    platform: "", // TODO: PC / console, if you want it shown
  },
  fantasy: {
    blurb:
      "Fantasy worlds and the maps that come with them. I like a book that builds a system and then plays fair with its own rules.",
    books: [] as string[], // TODO: favourite books or authors, if you want them shown
  },
  facts: [
    "Pronouns: he/him",
    "Can hold his breath for more than two minutes (his claim, from his GitHub profile)",
    "Gym and football are the non-screen hours",
  ],
};

/* ------------------------------------------------------------------ */
/* Asset credits                                                        */
/* ------------------------------------------------------------------ */

export const credits = [
  {
    asset: "Observatory, study, landscape and all scene artwork",
    creator: "Original vector illustration made for this site",
    source: "src/components/room/*.tsx",
    licence: "Part of this project",
    attribution: "None required",
  },
  {
    asset: "Rain, wind and gearbox sounds",
    creator: "Synthesised in the browser with Web Audio",
    source: "src/components/room/Ambience.tsx, src/components/GearboxLab.tsx",
    licence: "Part of this project",
    attribution: "None required",
  },
  {
    asset: "Typefaces: Instrument Serif, Geist, Geist Mono",
    creator: "Rodrigo Fuenzalida; Vercel",
    source: "Google Fonts via next/font",
    licence: "SIL Open Font License 1.1",
    attribution: "None required beyond licence",
  },
];

/* ------------------------------------------------------------------ */
/* Now: a dated, hand-edited note                                       */
/* ------------------------------------------------------------------ */

export const now = {
  updated: "2026-10-17",
  building: "This observatory, and the production hardening of a GPU Triton inference service at work.",
  studying: "CUDA and distributed training: DDP, FSDP, NCCL, and profiling training loops.",
  enjoying: "Football season, Valorant and EA Sports FC, and a fantasy series I'll name once I'm sure I'm recommending it.", // TODO: replace with your own words
};

/* ------------------------------------------------------------------ */
/* The Signal Desk                                                       */
/* ------------------------------------------------------------------ */

/** Things Tathagat has shared on LinkedIn. Add a URL, a description and optional commentary.
 *  `embed` is the official LinkedIn embed URL (Post → "..." → Embed this post) when available;
 *  without it a link card is shown. Nothing here is discovered automatically. */
export type Share = {
  url: string;
  title: string;
  date: string; // ISO
  kind: "post" | "article" | "link"; // post/article = written by Tathagat on LinkedIn; link = third-party content he shared
  description: string;
  commentary?: string; // Tathagat's own words about it
  publisher?: string; // for third-party links
  embed?: string;
};
export const shares: Share[] = [
  // TODO: add your LinkedIn posts and shared links here. Example:
  // { url: "https://www.linkedin.com/posts/...", title: "...", date: "2026-01-01", kind: "post", description: "..." },
];

/** Reading Radar sources (allowlist). Only these URLs are ever fetched by the server. */
export const feeds: { name: string; url: string; topic: string; limit?: number }[] = [
  { name: "NVIDIA Technical Blog", url: "https://developer.nvidia.com/blog/feed/", topic: "GPU computing", limit: 8 },
  { name: "PyTorch Blog", url: "https://pytorch.org/blog/feed.xml", topic: "AI systems", limit: 6 },
  { name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml", topic: "AI systems", limit: 6 },
  { name: "arXiv cs.DC", url: "https://rss.arxiv.org/rss/cs.DC", topic: "Research · distributed", limit: 6 },
  { name: "arXiv cs.LG", url: "https://rss.arxiv.org/rss/cs.LG", topic: "Research · learning", limit: 6 },
];

/* ------------------------------------------------------------------ */
/* AC Milan                                                              */
/* ------------------------------------------------------------------ */

export const milan = {
  club: "AC Milan",
  blurb:
    "I support AC Milan. That is the whole claim: no memorabilia stories, no invented memories, just the club I follow and the colours on the chair.",
  stadium: "San Siro", // used only as a caption for the original illustration in the study
};
