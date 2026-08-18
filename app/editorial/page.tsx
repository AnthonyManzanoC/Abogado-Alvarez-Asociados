import type { Metadata } from "next";
import { getArticles, getSettings } from "@/infrastructure/repositories/content-repository";
import { PublicShell } from "@/components/public-shell";
import { ArticleCard } from "@/components/article-card";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editorial", description: "Análisis, guías y perspectiva jurídica del Estudio Josué Álvarez." };

export default async function EditorialPage(){const [settings,articles]=await Promise.all([getSettings(),getArticles(true)]);return <PublicShell settings={settings}><main><section className="page-hero"><div className="container-shell"><Reveal><span className="eyebrow" style={{color:'var(--gold)'}}>Editorial</span><h1>El derecho explicado con criterio.</h1><p>Análisis, contexto y herramientas para entender mejor las decisiones jurídicas que afectan su vida y su organización.</p></Reveal></div></section><section className="listing-section editorial-section"><div className="container-shell"><div className="article-grid">{articles.map((article,index)=><Reveal key={article.id} delay={index*.06}><ArticleCard article={article} featured={index===0}/></Reveal>)}</div></div></section></main></PublicShell>}
