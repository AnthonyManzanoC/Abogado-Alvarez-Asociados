import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestSession } from "@/lib/auth";
import { db } from "@/infrastructure/database/postgres";

const schema = z.object({ template_key: z.enum(["received", "scheduled", "resolved", "rejected"]), subject: z.string().min(4).max(180), heading: z.string().min(4).max(180), message: z.string().min(10).max(2500) });
export async function PUT(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session || session.role === "editor") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const template = schema.parse(await request.json());
    await db`update public.email_templates set subject=${template.subject},heading=${template.heading},message=${template.message},updated_at=now() where template_key=${template.template_key}`;
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Plantilla inválida." }, { status: 400 }); }
}
