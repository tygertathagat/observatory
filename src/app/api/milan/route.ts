import { NextResponse } from "next/server";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * AC Milan next fixture and last result from football-data.org (official API, free tier with a key).
 * The key stays server-side in FOOTBALL_DATA_TOKEN. Without it the route reports an honest
 * unconfigured state. Responses are cached on disk for 6 hours; the last good data is kept on failure.
 */
const TEAM_ID = 98; // AC Milan on football-data.org
const CACHE = join(process.cwd(), ".cache", "milan.json");
const TTL = 6 * 3600 * 1000;

type Match = {
  id: number;
  utcDate: string;
  status: string;
  competition: { name: string };
  homeTeam: { name: string; shortName?: string };
  awayTeam: { name: string; shortName?: string };
  score: { fullTime: { home: number | null; away: number | null } };
};
export type MilanData = {
  configured: boolean;
  source: string;
  fetchedAt: string | null;
  stale: boolean;
  next: { utcDate: string; competition: string; home: string; away: string; status: string } | null;
  last: { utcDate: string; competition: string; home: string; away: string; homeScore: number | null; awayScore: number | null; status: string } | null;
  error?: string;
};

function readCache(): MilanData | null {
  try {
    return JSON.parse(readFileSync(CACHE, "utf8"));
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  void new URL(req.url); // request-bound: never prerendered at build time
  const token = process.env.FOOTBALL_DATA_TOKEN;
  const source = "football-data.org";
  if (!token) {
    return NextResponse.json<MilanData>({ configured: false, source, fetchedAt: null, stale: false, next: null, last: null });
  }
  const cached = readCache();
  if (cached?.fetchedAt && Date.now() - new Date(cached.fetchedAt).getTime() < TTL) return NextResponse.json({ ...cached, stale: false });

  try {
    const res = await fetch(`https://api.football-data.org/v4/teams/${TEAM_ID}/matches?limit=60`, {
      headers: { "X-Auth-Token": token },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { matches: Match[] };
    const now = Date.now();
    const sorted = [...data.matches].sort((a, b) => a.utcDate.localeCompare(b.utcDate));
    const nextM = sorted.find((m) => new Date(m.utcDate).getTime() > now && m.status !== "FINISHED" && m.status !== "CANCELLED");
    const lastM = [...sorted].reverse().find((m) => m.status === "FINISHED");
    const name = (t: Match["homeTeam"]) => t.shortName || t.name;
    const out: MilanData = {
      configured: true,
      source,
      fetchedAt: new Date().toISOString(),
      stale: false,
      next: nextM ? { utcDate: nextM.utcDate, competition: nextM.competition.name, home: name(nextM.homeTeam), away: name(nextM.awayTeam), status: nextM.status } : null,
      last: lastM
        ? { utcDate: lastM.utcDate, competition: lastM.competition.name, home: name(lastM.homeTeam), away: name(lastM.awayTeam), homeScore: lastM.score.fullTime.home, awayScore: lastM.score.fullTime.away, status: lastM.status }
        : null,
    };
    try {
      mkdirSync(join(process.cwd(), ".cache"), { recursive: true });
      writeFileSync(CACHE, JSON.stringify(out));
    } catch {}
    return NextResponse.json(out);
  } catch (e) {
    if (cached) return NextResponse.json({ ...cached, stale: true, error: String(e).slice(0, 120) });
    return NextResponse.json<MilanData>({ configured: true, source, fetchedAt: null, stale: false, next: null, last: null, error: String(e).slice(0, 120) });
  }
}
