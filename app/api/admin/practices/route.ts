import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestSession } from "@/lib/auth";
import { db } from "@/infrastructure/database/postgres";
import { slugify } from "@/lib/slugify";

const schema = z.object({ id: z.string().uuid().optional(), slug: z.string().optional(), title: z.string().min(3).max(150), description: z.string().min(10).max(1200), icon: z.string().max(40).default("scale"), display_order: z.number().int(), published: z.boolean() });
export async function POST(request: NextRequest) {
  if (!await getRequestSession(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const area = schema.parse(await request.json()); const slug = slugify(area.slug || area.title);
    if (area.id) await db`update public.practice_areas set slug=${slug},title=${area.title},description=${area.description},icon=${area.icon},display_order=${area.display_order},published=${area.published},updated_at=now() where id=${area.id}`;
    else await db`insert into public.practice_areas(slug,title,description,icon,display_order,published) values(${slug},${area.title},${area.description},${area.icon},${area.display_order},${area.published})`;
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Datos inválidos." }, { status: 400 }); }
}
export async function DELETE(request: NextRequest) {
  const session = await getRequestSession(request); if (!session || session.role === "editor") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id"); if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  await db`delete from public.practice_areas where id=${id}`; return NextResponse.json({ ok: true });
}
