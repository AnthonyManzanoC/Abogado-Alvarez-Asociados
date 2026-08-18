import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { loadHomePage } from "@/core/application/content-service";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/ui/reveal";
import { LawyerCard } from "@/components/lawyer-card";
import { ArticleCard } from "@/components/article-card";
import { BrandMark } from "@/components/brand-mark";

export const dynamic = "force-dynamic";

function HeroTitle({ title }: { title: string }) {
  const words = title.trim().split(/\s+/); const pivot = Math.max(2, Math.ceil(words.length * 0.52));
  return <h1>{words.slice(0, pivot).join(" ")}<em>{words.slice(pivot).join(" ")}</em></h1>;
}

export default async function Home() {
  const { settings, lawyers, articles, practiceAreas } = await loadHomePage();
  const structuredData = { "@context": "https://schema.org", "@type": "LegalService", name: settings.firm_name, description: settings.hero_description, url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", email: settings.email, telephone: settings.phone, areaServed: "Ecuador" };
  return (
    <PublicShell settings={settings}>
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
        <section className="hero">
          <div className="hero-grid" /><div className="hero-architecture"><div className="hero-orbit" /></div>
          <div className="container-shell hero-content"><div className="hero-copy">
            <Reveal><span className="eyebrow" style={{ color: "var(--gold)" }}>{settings.eyebrow}</span></Reveal>
            <Reveal delay={0.08}><HeroTitle title={settings.hero_title} /></Reveal>
            <Reveal delay={0.16}><p className="hero-description">{settings.hero_description}</p></Reveal>
            <Reveal delay={0.24} className="hero-actions"><Link href="/contacto" className="button-primary">Solicitar consulta <ArrowRight size={15} /></Link><Link href="/servicios" className="button-ghost">Conocer el estudio</Link></Reveal>
          </div><div className="hero-index"><span>Defensa · Estrategia · Confianza</span><strong>01</strong></div></div>
        </section>

        <section className="lawyers-section lawyers-priority section-pad">
          <div className="container-shell">
            <Reveal className="section-head lawyers-heading"><div><span className="eyebrow" style={{ color: "var(--gold)" }}>Directorio profesional</span><h2 className="section-title">Personas que piensan<br />antes de actuar.</h2></div><Link href="/equipo" className="button-light">Ver directorio <ArrowRight size={14} /></Link></Reveal>
            <div className="lawyer-editorial-layout">
              <div className="lawyer-grid editorial-directory">{lawyers.map((lawyer, index) => <Reveal delay={index * .08} key={lawyer.id}><LawyerCard lawyer={lawyer} /></Reveal>)}</div>
              <Reveal delay={0.12} className="lawyer-editorial-note"><span>El criterio<br />detrás de<br /><em>cada decisión.</em></span><p>Perfiles construidos sobre preparación, escucha y responsabilidad profesional.</p><ArrowUpRight size={24} /></Reveal>
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Principios del estudio"><div className="container-shell trust-grid">
          {[['Directo','Trato personal'],['Preciso','Análisis integral'],['Reservado','Máxima confidencialidad'],['Estratégico','Decisiones con propósito']].map(([title,copy],index)=><Reveal className="trust-item" delay={index*.04} key={title}><span>{title}</span><p>{copy}</p></Reveal>)}
        </div></section>

        <section className="practice-section section-pad" id="servicios"><div className="container-shell">
          <Reveal className="section-head"><div><span className="eyebrow" style={{ color: "var(--gold)" }}>Áreas de práctica</span><h2 className="section-title">Cuando el riesgo es real,<br />la estrategia importa.</h2></div><p>Una práctica jurídica transversal para personas, familias y organizaciones que necesitan avanzar con certeza.</p></Reveal>
          <div className="practice-grid">{practiceAreas.map((area,index)=><Reveal key={area.id} delay={index*.04}><Link href="/servicios" className="practice-row"><span className="practice-no">{String(index+1).padStart(2,'0')}</span><h3>{area.title}</h3><p>{area.description}</p><ArrowUpRight size={19}/></Link></Reveal>)}</div>
        </div></section>

        <section className="section-pad about-showcase"><div className="container-shell about-showcase-grid">
          <Reveal className="about-showcase-visual">{settings.about_image_media_id ? <img src={`/api/media/${settings.about_image_media_id}`} alt={`Equipo de ${settings.firm_name}`} /> : <div className="about-visual-fallback"><span>J</span><i>·</i><span>A</span></div>}<div className="about-visual-brand"><BrandMark logoUrl={settings.logo_url} shortName={settings.short_name} /></div></Reveal>
          <div className="about-showcase-copy"><Reveal><span className="eyebrow" style={{ color: "var(--gold)" }}>{settings.about_eyebrow}</span><h2 className="section-title">{settings.about_title}</h2></Reveal><Reveal delay={0.08}><p>{settings.about_text}</p><Link href="/nosotros" className="button-light">Conocer nuestra historia <ArrowRight size={14} /></Link></Reveal><div className="principle-row">{[['01','Escuchar','Comprender el contexto humano y jurídico antes de definir cualquier movimiento.'],['02','Diseñar','Transformar la complejidad en una ruta clara, medible y realista.'],['03','Defender','Ejecutar con rigor, transparencia y absoluta atención al detalle.']].map(([n,t,d],i)=><Reveal className="principle" delay={i*.07} key={n}><span className="num">{n}</span><h3>{t}</h3><p>{d}</p></Reveal>)}</div></div>
        </div></section>

        <section className="editorial-section section-pad"><div className="container-shell">
          <Reveal className="section-head"><div><span className="eyebrow" style={{ color: "var(--gold)" }}>Perspectiva legal</span><h2 className="section-title">Ideas para decidir<br />con más claridad.</h2></div><Link href="/editorial" className="button-light">Toda la editorial <ArrowRight size={14}/></Link></Reveal>
          <div className="article-grid">{articles.map((article,index)=><Reveal delay={index*.06} key={article.id}><ArticleCard article={article} featured={index===0}/></Reveal>)}</div>
        </div></section>

        <section className="contact-band"><div className="container-shell contact-band-grid"><Reveal><span className="eyebrow">El siguiente paso</span><h2>Hablemos con absoluta claridad.</h2></Reveal><Reveal delay={0.1}><p>Cuéntenos qué está en juego. Su información será tratada con reserva y recibirá una primera orientación sobre la ruta posible.</p><Link href="/contacto" className="button-light" style={{ marginTop: 20 }}>Solicitar evaluación <ArrowRight size={15}/></Link></Reveal></div></section>
      </main>
    </PublicShell>
  );
}
