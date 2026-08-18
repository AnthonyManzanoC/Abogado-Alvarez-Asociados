import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/ui/reveal";
import { getSettings } from "@/infrastructure/repositories/content-repository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quiénes somos", description: "Conozca la filosofía, el criterio y la forma de ejercer del Estudio Jurídico Ab. Josué Álvarez." };

export default async function AboutPage() {
  const settings = await getSettings();
  return <PublicShell settings={settings}><main>
    <section className="page-hero about-page-hero"><div className="container-shell"><Reveal><span className="eyebrow" style={{ color: "var(--gold)" }}>{settings.about_eyebrow}</span><h1>Una firma construida sobre criterio y confianza.</h1></Reveal></div></section>
    <section className="section-pad"><div className="container-shell about-page-grid">
      <Reveal className="about-page-media">{settings.about_image_media_id ? <img src={`/api/media/${settings.about_image_media_id}`} alt={`Quiénes somos · ${settings.firm_name}`} /> : <div className="about-visual-fallback"><span>J</span><i>·</i><span>A</span></div>}<div className="about-page-logo"><BrandMark logoUrl={settings.logo_url} shortName={settings.short_name} /></div></Reveal>
      <div className="about-page-story"><Reveal><span className="eyebrow" style={{ color: "var(--gold)" }}>Nuestra filosofía</span><h2 className="section-title">{settings.about_title}</h2></Reveal><Reveal delay={.08}><div className="prose-legal">{settings.about_text.split(/\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></Reveal><Reveal delay={.12} className="about-commitment"><ShieldCheck size={28} /><div><strong>Confidencialidad desde el primer contacto</strong><p>Cada conversación se trata con reserva, transparencia y respeto por la importancia de su asunto.</p></div></Reveal><Reveal delay={.16}><Link href="/contacto" className="button-primary">Converse con el estudio <ArrowRight size={14} /></Link></Reveal></div>
    </div></section>
  </main></PublicShell>;
}
