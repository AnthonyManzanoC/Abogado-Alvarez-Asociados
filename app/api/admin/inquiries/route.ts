import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestSession } from "@/lib/auth";
import { db } from "@/infrastructure/database/postgres";
import { sendInquiryEmail } from "@/infrastructure/email/legal-mailer";
import type { Inquiry } from "@/core/domain/entities";

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["reviewed", "scheduled", "resolved", "rejected"]),
  scheduled_at: z.string().datetime().nullable().optional(),
  resolution_notes: z.string().max(5000).default(""),
});

export async function PUT(request: NextRequest) {
  if (!await getRequestSession(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const item = schema.parse(await request.json());
    if (item.status === "scheduled" && !item.scheduled_at) return NextResponse.json({ error: "Seleccione la fecha y hora de la cita." }, { status: 400 });
    if (["resolved", "rejected"].includes(item.status) && item.resolution_notes.trim().length < 8) return NextResponse.json({ error: "Escriba las observaciones que recibirá el cliente." }, { status: 400 });
    const [inquiry] = await db<Inquiry[]>`select id::text,full_name,email,phone,matter,message,status,scheduled_at::text,resolution_notes,notification_sent_at::text,created_at::text from public.inquiries where id=${item.id}`;
    if (!inquiry) return NextResponse.json({ error: "La consulta no existe." }, { status: 404 });
    if (item.status !== "reviewed") {
      await sendInquiryEmail({ inquiry, kind: item.status, scheduledAt: item.scheduled_at, notes: item.resolution_notes });
    }
    await db`update public.inquiries set status=${item.status},scheduled_at=${item.scheduled_at ?? null},resolution_notes=${item.resolution_notes},notification_sent_at=case when ${item.status} = 'reviewed' then notification_sent_at else now() end where id=${item.id}`;
    return NextResponse.json({ ok: true, emailSent: item.status !== "reviewed" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo actualizar la consulta." }, { status: 400 });
  }
}
