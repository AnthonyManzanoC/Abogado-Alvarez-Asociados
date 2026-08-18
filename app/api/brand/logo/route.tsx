import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/infrastructure/database/postgres";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const [settings] = await db<{ logo_url: string | null; primary_color: string }[]>`select logo_url,primary_color from public.site_settings where id=true`;
  if (settings?.logo_url && settings.logo_url !== "/api/brand/logo") return NextResponse.redirect(new URL(settings.logo_url, request.url), { status: 307 });
  const gold = settings?.primary_color || "#b9945a";
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#101311", color: gold, border: `8px solid ${gold}`, fontFamily: "Georgia", fontSize: 52, letterSpacing: -5 }}>J<span style={{ opacity: .45, margin: "0 7px", fontSize: 29 }}>·</span>A</div>, { width: 128, height: 128 });
}
