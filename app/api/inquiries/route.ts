import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/infrastructure/database/postgres";
import { sendInquiryEmail } from "@/infrastructure/email/legal-mailer";
import type { Inquiry } from "@/core/domain/entities";

const schema = z.object({
  full_name: z.string().min(3).max(150), email: z.string().email(), phone: z.string().max(50).default(""),
  matter: z.string().min(2).max(100), message: z.string().min(10).max(4000),
});

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const data = schema.parse(Object.fromEntries(form));
    const [inquiry] = await db<Inquiry[]>`
      insert into public.inquiries(full_name,email,phone,matter,message)
      values(${data.full_name},${data.email.toLowerCase()},${data.phone},${data.matter},${data.message})
      returning id::text,full_name,email,phone,matter,message,status,scheduled_at::text,resolution_notes,notification_sent_at::text,created_at::text
    `;
    let emailSent = false;
    try {
      emailSent = await sendInquiryEmail({ inquiry, kind: "received" });
      if (emailSent) await db`update public.inquiries set notification_sent_at=now() where id=${inquiry.id}`;
    } catch (error) {
      console.error("No se pudo enviar la autorespuesta SMTP:", error instanceof Error ? error.message : error);
    }
    return NextResponse.json({ ok: true, emailSent }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No fue posible registrar la solicitud." }, { status: 400 });
  }
}
