import type { MetadataRoute } from "next";
import { getArticles, getLawyers } from "@/infrastructure/repositories/content-repository";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const [lawyers, articles] = await Promise.all([getLawyers(true), getArticles(true)]);
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/equipo`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/editorial`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    ...lawyers.map((lawyer) => ({ url: `${base}/equipo/${lawyer.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...articles.map((article) => ({ url: `${base}/editorial/${article.slug}`, lastModified: article.published_at ? new Date(article.published_at) : now, changeFrequency: "monthly" as const, priority: 0.65 })),
  ];
}
