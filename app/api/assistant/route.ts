import { NextResponse } from "next/server";
import { z } from "zod";
import { answerLegalAssistant } from "@/core/application/legal-assistant-service";
import { getArticles, getLawyers, getPracticeAreas, getSettings } from "@/infrastructure/repositories/content-repository";

const schema = z.object({ message: z.string().trim().min(2).max(800) });

export async function POST(request: Request) {
  try {
    const { message } = schema.parse(await request.json());
    const [settings, practices, lawyers, articles] = await Promise.all([getSettings(), getPracticeAreas(true), getLawyers(true), getArticles(true, 5)]);
    return NextResponse.json(answerLegalAssistant(message, { settings, practices, lawyers, articles }));
  } catch {
    return NextResponse.json({ error: "No pude procesar el mensaje. Intente escribirlo nuevamente." }, { status: 400 });
  }
}
