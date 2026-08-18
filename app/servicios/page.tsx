import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getPracticeAreas, getSettings } from "@/infrastructure/repositories/content-repository";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Servicios legales", description: "Áreas de práctica y asesoría estratégica del Estudio Jurídico Josué Álvarez." };

export default async function ServicesPage() {
  const [settings, areas] = await Promise.all([getSettings(), getPracticeAreas()]);
  return <PublicShell settings={settings}><main>
    <section className="page-hero"><div className="container-shell"><Reveal><span className="eyebrow" style={{color:'var(--gold)'}}>Áreas de práctica</span><h1>Soluciones que parten de una buena estrategia.</h1><p>Abordamos cada asunto desde el riesgo real, el objetivo de fondo y la mejor ruta disponible. Sin fórmulas genéricas.</p></Reveal></div></section>
    <section className="practice-section section-pad"><div className="container-shell"><div className="practice-grid">{areas.map((area,index)=><Reveal key={area.id} delay={index*.05}><div className="practice-row"><span className="practice-no">{String(index+1).padStart(2,'0')}</span><h3>{area.title}</h3><p>{area.description}</p><ArrowUpRight size={19}/></div></Reveal>)}</div></div></section>
    <section className="section-pad"><div className="container-shell intro-grid"><Reveal className="intro-aside"><span className="eyebrow" style={{color:'var(--gold)'}}>Método</span><p>Evaluar, priorizar y actuar. Cada etapa tiene una razón y cada decisión debe poder explicarse.</p></Reveal><Reveal><h2 className="section-title">La excelencia jurídica también se mide en claridad.</h2><p style={{maxWidth:740,lineHeight:1.9,color:'#5e655f',fontSize:16}}>Antes de recomendar una acción, entendemos la historia, los documentos, las relaciones y el costo de cada escenario. El resultado es una estrategia comprensible, ejecutable y alineada con sus prioridades.</p><Link href="/contacto" className="button-primary" style={{marginTop:30}}>Evaluar mi asunto <ArrowRight size={15}/></Link></Reveal></div></section>
  </main></PublicShell>;
}
