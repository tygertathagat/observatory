"use client";

import type { View } from "./route";
import { profile } from "@/content/site";
import type { EssayMeta } from "@/lib/essays";
import { Search } from "./Search";

const items: { id: View; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "signal", label: "Signal" },
  { id: "bench", label: "Bench" },
  { id: "exploring", label: "Exploring" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export function RoomMenu({
  active,
  onOpen,
  onHome,
  visible,
  essays,
}: {
  active: View | null;
  onOpen: (v: View, slug?: string | null) => void;
  onHome: () => void;
  visible: boolean;
  essays: EssayMeta[];
}) {
  return (
    <header className={`pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-3 transition-opacity duration-700 md:px-8 md:py-4 ${visible ? "opacity-100" : "opacity-0"}`}>
      <button type="button" data-home onClick={onHome} aria-label="Back outside" className={`inline-flex min-h-11 items-center font-display text-2xl tracking-tight text-[#f2ede4] ${visible ? "pointer-events-auto" : ""}`}>
        {profile.name}
        <span className="text-[#e8b36b]">.</span>
      </button>
      <div className={`flex items-center gap-2 ${visible ? "pointer-events-auto" : ""}`}>
        <nav aria-label="Sections" className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-black/45 p-1 backdrop-blur-md md:flex">
          {items.map((it) => (
            <button key={it.id} type="button" data-nav={it.id} onClick={() => onOpen(it.id)} aria-current={active === it.id ? "page" : undefined} className={`min-h-10 rounded-full px-3 py-1.5 text-[13px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8b36b] md:px-4 md:text-sm ${active === it.id ? "bg-[#e8b36b] text-[#1a1208]" : "text-[#e8dcc6]/85 hover:text-white"}`}>
              {it.label}
            </button>
          ))}
        </nav>
        <span className="rounded-full border border-white/10 bg-black/45 p-1 backdrop-blur-md">
          <Search onOpen={onOpen} essays={essays} />
        </span>
      </div>
    </header>
  );
}
