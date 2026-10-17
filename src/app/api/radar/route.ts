import { NextResponse } from "next/server";
import { getRadar } from "@/lib/radar";

/**
 * Reading Radar: allowlisted RSS/Atom feeds, cached on disk for RADAR_TTL_HOURS (default 24).
 * A scheduler can hit /api/radar?refresh=1 with the RADAR_REFRESH_TOKEN header to force a refresh.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const force = url.searchParams.get("refresh") === "1" && !!process.env.RADAR_REFRESH_TOKEN && req.headers.get("x-refresh-token") === process.env.RADAR_REFRESH_TOKEN;
  const r = await getRadar(force);
  return NextResponse.json(r, { headers: { "Cache-Control": "public, max-age=900" } });
}
