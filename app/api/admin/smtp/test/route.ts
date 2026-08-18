import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestSession } from "@/lib/auth";
import { verifyAndSendTestEmail } from "@/infrastructure/email/legal-mailer";

export async function POST(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session || session.role === "editor") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const { recipient } = z.object({ recipient: z.string().email() }).parse(await request.json());
    await verifyAndSendTestEmail(recipient);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No fue posible enviar la prueba." }, { status: 400 });
  }
}
