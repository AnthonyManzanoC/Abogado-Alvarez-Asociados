import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Article } from "@/core/domain/entities";

function formatDate(value: string | null) {
  if (!value) return "Próximamente";
  return new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <Link href={`/editorial/${article.slug}`} className={`article-card focus-ring ${featured ? "featured" : ""} ${article.cover_media_id ? "has-cover" : ""}`}>
      {article.cover_media_id && <div className="article-card-cover"><img src={`/api/media/${article.cover_media_id}`} alt={`Portada de ${article.title}`} /></div>}
      <div className="article-card-content"><div className="article-meta"><span>{article.category}</span><span>{formatDate(article.published_at)}</span></div>
      <h3>{article.title}</h3><p>{article.excerpt}</p></div>
      <span className="article-arrow"><ArrowUpRight size={14} /></span>
    </Link>
  );
}
