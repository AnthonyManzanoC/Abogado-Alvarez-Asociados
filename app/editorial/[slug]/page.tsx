import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, getSettings } from "@/infrastructure/repositories/content-repository";
import { PublicShell } from "@/components/public-shell";
import { RichText } from "@/components/rich-text";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const article=await getArticleBySlug((await params).slug);return article?{title:article.title,description:article.excerpt}:{title:'Editorial'}}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){const [settings,article]=await Promise.all([getSettings(),getArticleBySlug((await params).slug)]);if(!article)notFound();const date=article.published_at?new Intl.DateTimeFormat('es-EC',{day:'numeric',month:'long',year:'numeric'}).format(new Date(article.published_at)):'';return <PublicShell settings={settings}><main className="article-detail"><div className="container-shell"><Reveal className="article-header"><span className="eyebrow" style={{color:'var(--gold)'}}>{article.category}</span><h1>{article.title}</h1><p>{article.excerpt}</p><div className="article-byline">{article.author_name||'Estudio Jurídico'} · {date}</div></Reveal>{article.cover_media_id&&<Reveal className="article-hero-image"><img src={`/api/media/${article.cover_media_id}`} alt={`Portada de ${article.title}`}/></Reveal>}<Reveal><RichText content={article.content}/></Reveal></div></main></PublicShell>}
