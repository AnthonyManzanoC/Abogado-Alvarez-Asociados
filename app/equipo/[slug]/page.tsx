import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { getLawyerBySlug, getSettings } from "@/infrastructure/repositories/content-repository";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const lawyer = await getLawyerBySlug((await params).slug);
  return lawyer ? { title: lawyer.full_name, description: lawyer.summary } : { title: "Perfil profesional" };
}

function initials(name:string){return name.replace(/Ab\.\s*/i,'').split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join('')}

export default async function LawyerProfile({ params }: { params: Promise<{ slug: string }> }) {
  const [settings, lawyer] = await Promise.all([getSettings(), getLawyerBySlug((await params).slug)]);
  if (!lawyer) notFound();
  return <PublicShell settings={settings}><main>
    <section className="profile-hero"><div className="container-shell profile-grid"><Reveal className="profile-photo">{lawyer.photo_media_id?<img src={`/api/media/${lawyer.photo_media_id}`} alt={`Retrato profesional de ${lawyer.full_name}`}/>:<span className="lawyer-initials">{initials(lawyer.full_name)}</span>}</Reveal><Reveal delay={.08} className="profile-copy"><span className="eyebrow" style={{color:'var(--gold)'}}>{lawyer.title}</span><h1>{lawyer.full_name}</h1><p>{lawyer.summary}</p><div className="profile-specialties">{lawyer.specialties.map(item=><span key={item}>{item}</span>)}</div>{lawyer.email&&<a href={`mailto:${lawyer.email}`} className="button-primary" style={{marginTop:28}}><Mail size={14}/> Contactar</a>}</Reveal></div></section>
    <section className="section-pad"><div className="container-shell bio-grid"><div><Reveal><span className="eyebrow" style={{color:'var(--gold)'}}>Biografía</span><div className="prose-legal" style={{marginTop:35}}>{lawyer.bio.split(/\n\n+/).map((p,i)=><p key={i}>{p}</p>)}</div></Reveal><div className="highlights-grid">{lawyer.highlights.map((item,index)=><Reveal className="highlight-card" delay={index*.05} key={item.title}><h3>{item.title}</h3><p>{item.description}</p></Reveal>)}</div></div><Reveal className="profile-facts"><div className="fact-block"><h3>Áreas de enfoque</h3><ul>{lawyer.specialties.map(item=><li key={item}>{item}</li>)}</ul></div>{lawyer.education.length>0&&<div className="fact-block"><h3>Formación</h3><ul>{lawyer.education.map(item=><li key={item}>{item}</li>)}</ul></div>}{lawyer.bar_admissions.length>0&&<div className="fact-block"><h3>Colegiatura</h3><ul>{lawyer.bar_admissions.map(item=><li key={item}>{item}</li>)}</ul></div>}{lawyer.languages.length>0&&<div className="fact-block"><h3>Idiomas</h3><ul>{lawyer.languages.map(item=><li key={item}>{item}</li>)}</ul></div>}</Reveal></div></section>
  </main></PublicShell>;
}
