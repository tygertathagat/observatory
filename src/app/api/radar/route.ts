import { NextResponse } from "next/server";
import { getRadar } from "@/lib/radar";

/**
 * Reading Radar: allowlisted RSS/Atom feeds, cached on disk for RADAR_TTL_HOURS (default 24).
 * A scheduler can hit /api/radar?refresh=1 with the x-refresh-token header (RADAR_REFRESH_TOKEN)
 * or, on Vercel Cron, the automatic "Authorization: Bearer <CRON_SECRET>" header (see vercel.json).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  // a scheduler may force a refresh with either our own token header or Vercel Cron's bearer secret
  const auth = req.headers.get("authorization");
  const viaToken = !!process.env.RADAR_REFRESH_TOKEN && req.headers.get("x-refresh-token") === process.env.RADAR_REFRESH_TOKEN;
  const viaCron = !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
  const force = url.searchParams.get("refresh") === "1" && (viaToken || viaCron);
  const r = await getRadar(force);
  return NextResponse.json(r, { headers: { "Cache-Control": "public, max-age=900" } });
}
