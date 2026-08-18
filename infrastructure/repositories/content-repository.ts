import type { Article, HomeContent, Lawyer, PracticeArea, SiteSettings } from "@/core/domain/entities";
import { db } from "@/infrastructure/database/postgres";

export async function getSettings(): Promise<SiteSettings> {
  const [settings] = await db<SiteSettings[]>`select firm_name, short_name, eyebrow, hero_title, hero_description, about_title, about_text, about_eyebrow, primary_color, accent_color, logo_url, logo_media_id::text, about_image_media_id::text, email, phone, whatsapp, address, map_embed_url, map_title, instagram, linkedin from public.site_settings where id = true`;
  return settings;
}

export async function getLawyers(publishedOnly = true): Promise<Lawyer[]> {
  return db<Lawyer[]>`
    select id::text, slug, full_name, title, summary, bio, specialties, education, languages,
      bar_admissions, highlights, email, phone, photo_media_id::text, featured, published, display_order
    from public.lawyers
    ${publishedOnly ? db`where published = true` : db``}
    order by display_order, full_name
  `;
}

export async function getLawyerBySlug(slug: string): Promise<Lawyer | null> {
  const [lawyer] = await db<Lawyer[]>`
    select id::text, slug, full_name, title, summary, bio, specialties, education, languages,
      bar_admissions, highlights, email, phone, photo_media_id::text, featured, published, display_order
    from public.lawyers where slug = ${slug} and published = true limit 1
  `;
  return lawyer ?? null;
}

export async function getArticles(publishedOnly = true, limit?: number): Promise<Article[]> {
  const rows = await db<Article[]>`
    select a.id::text, a.slug, a.title, a.excerpt, a.content, a.category, a.status, a.featured,
      a.author_lawyer_id::text, l.full_name as author_name, a.cover_media_id::text,
      a.published_at::text
    from public.articles a
    left join public.lawyers l on l.id = a.author_lawyer_id
    ${publishedOnly ? db`where a.status = 'published'` : db``}
    order by a.featured desc, a.published_at desc nulls last, a.created_at desc
    ${limit ? db`limit ${limit}` : db``}
  `;
  return rows;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const [article] = await db<Article[]>`
    select a.id::text, a.slug, a.title, a.excerpt, a.content, a.category, a.status, a.featured,
      a.author_lawyer_id::text, l.full_name as author_name, a.cover_media_id::text,
      a.published_at::text
    from public.articles a left join public.lawyers l on l.id = a.author_lawyer_id
    where a.slug = ${slug} and a.status = 'published' limit 1
  `;
  return article ?? null;
}

export async function getPracticeAreas(publishedOnly = true): Promise<PracticeArea[]> {
  return db<PracticeArea[]>`
    select id::text, slug, title, description, icon, display_order, published
    from public.practice_areas ${publishedOnly ? db`where published = true` : db``} order by display_order
  `;
}

export async function getHomeContent(): Promise<HomeContent> {
  const [settings, lawyers, articles, practiceAreas] = await Promise.all([
    getSettings(), getLawyers(true), getArticles(true, 3), getPracticeAreas(true),
  ]);
  return { settings, lawyers, articles, practiceAreas };
}
