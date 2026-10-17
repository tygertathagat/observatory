"use client";

import { useCallback, useEffect, useState } from "react";

export const VIEWS = ["work", "signal", "bench", "exploring", "about", "offclock", "beyond", "contact"] as const;
export type View = (typeof VIEWS)[number];
export type Route = { view: View | null; slug: string | null };

const ALIASES: Record<string, View> = { journal: "signal", lab: "bench" };

function parse(hash: string): Route {
  const [raw, s] = hash.replace(/^#\/?/, "").split("/");
  const v = ALIASES[raw] ?? raw;
  const view = (VIEWS as readonly string[]).includes(v) ? (v as View) : null;
  return { view, slug: view && s ? decodeURIComponent(s) : null };
}

/** Hash-based routing so every destination has a shareable URL and back/forward work. */
export function useRoute() {
  const [route, setRoute] = useState<Route>({ view: null, slug: null });

  useEffect(() => {
    const sync = () => setRoute(parse(window.location.hash));
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const go = useCallback((view: View | null, slug?: string | null) => {
    const next = view ? `#${view}${slug ? "/" + encodeURIComponent(slug) : ""}` : "#";
    if (window.location.hash === next) return;
    if (!view) history.pushState(null, "", window.location.pathname + window.location.search);
    else window.location.hash = next;
    setRoute(parse(next));
  }, []);

  return { route, go };
}
