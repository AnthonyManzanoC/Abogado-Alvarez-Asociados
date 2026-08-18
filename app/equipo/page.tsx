import type { Metadata } from "next";
import { getLawyers, getSettings } from "@/infrastructure/repositories/content-repository";
import { PublicShell } from "@/components/public-shell";
import { LawyerCard } from "@/components/lawyer-card";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Equipo", description: "Directorio profesional del Estudio Jurídico Josué Álvarez." };

export default async function TeamPage() {
  const [settings, lawyers] = await Promise.all([getSettings(), getLawyers(true)]);
  return <PublicShell settings={settings}><main><section className="page-hero"><div className="container-shell"><Reveal><span className="eyebrow" style={{color:'var(--gold)'}}>Directorio profesional</span><h1>El criterio detrás de cada decisión.</h1><p>Perfiles construidos sobre la preparación, la escucha y la responsabilidad de representar intereses que importan.</p></Reveal></div></section><section className="listing-section lawyers-section"><div className="container-shell"><div className="lawyer-grid">{lawyers.map((lawyer,index)=><Reveal key={lawyer.id} delay={index*.08}><LawyerCard lawyer={lawyer}/></Reveal>)}</div></div></section></main></PublicShell>;
}
