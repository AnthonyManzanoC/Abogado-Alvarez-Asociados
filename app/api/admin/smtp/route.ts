import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestSession } from "@/lib/auth";
import { db } from "@/infrastructure/database/postgres";
import { encryptSecret } from "@/lib/secret-vault";

const schema = z.object({ host: z.string().max(250), port: z.coerce.number().int().min(1).max(65535), secure: z.boolean(), username: z.string().max(250), password: z.string().max(500).optional(), from_name: z.string().min(2).max(200), from_email: z.string().email(), reply_to: z.string().email().or(z.literal("")), enabled: z.boolean() });

export async function PUT(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session || session.role === "editor") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const value = schema.parse(await request.json());
    const password = value.password ? encryptSecret(value.password) : null;
    await db`update public.smtp_settings set host=${value.host},port=${value.port},secure=${value.secure},username=${value.username},password_encrypted=case when ${password}::text is null then password_encrypted else ${password} end,from_name=${value.from_name},from_email=${value.from_email},reply_to=${value.reply_to},enabled=${value.enabled},updated_at=now() where id=true`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Configuración inválida." }, { status: 400 });
  }
}
