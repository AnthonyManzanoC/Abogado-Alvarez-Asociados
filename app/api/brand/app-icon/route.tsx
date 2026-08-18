import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/infrastructure/database/postgres";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const [settings] = await db<{ primary_color: string; logo_url: string | null }[]>`select primary_color,logo_url from public.site_settings where id=true`;
  const gold = settings?.primary_color || "#b9945a";
  const dimension = new URL(request.url).searchParams.get("size") === "192" ? 192 : 512;
  const logo = settings?.logo_url ? new URL(settings.logo_url, request.url).toString() : null;
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#101311", color: gold, border: `${Math.round(dimension * .047)}px solid ${gold}`, borderRadius: Math.round(dimension * .17), fontFamily: "Georgia", fontSize: Math.round(dimension * .43), letterSpacing: Math.round(dimension * -.035) }}>{logo ? <img src={logo} alt="" style={{ width: "72%", height: "72%", objectFit: "contain" }} /> : <>J<span style={{ opacity: .5, margin: `0 ${Math.round(dimension * .043)}px`, fontSize: Math.round(dimension * .215) }}>·</span>A</>}</div>, { width: dimension, height: dimension });
}
