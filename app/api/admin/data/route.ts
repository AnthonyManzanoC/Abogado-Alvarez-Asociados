import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { getArticles, getLawyers, getPracticeAreas, getSettings } from "@/infrastructure/repositories/content-repository";
import { db } from "@/infrastructure/database/postgres";

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const canAdminister = session.role !== "editor";
  const [settings, lawyers, articles, practices, users, inquiries, smtp, emailTemplates, media] = await Promise.all([
    getSettings(), getLawyers(false), getArticles(false), getPracticeAreas(false),
    canAdminister ? db`select id::text,email,full_name,role,active,last_login_at::text,created_at::text from public.admin_users order by created_at` : Promise.resolve([]),
    db`select id::text,full_name,email,phone,matter,message,status,scheduled_at::text,resolution_notes,notification_sent_at::text,created_at::text from public.inquiries order by created_at desc limit 100`,
    canAdminister ? db`select host,port,secure,username,from_name,from_email,reply_to,enabled,(password_encrypted <> '') as has_password from public.smtp_settings where id=true`.then((rows) => rows[0]) : Promise.resolve({ host: "", port: 587, secure: false, username: "", from_name: "", from_email: "", reply_to: "", enabled: false, has_password: false }),
    canAdminister ? db`select template_key,subject,heading,message from public.email_templates order by case template_key when 'received' then 1 when 'scheduled' then 2 when 'resolved' then 3 else 4 end` : Promise.resolve([]),
    db`select m.id::text,m.filename,m.mime_type,m.size_bytes,m.alt_text,m.created_at::text,('/api/media/' || m.id::text) as url,case when m.storage_path is null then 'postgres' else 'supabase-storage' end as provider,((select count(*) from public.lawyers l where l.photo_media_id=m.id)+(select count(*) from public.articles a where a.cover_media_id=m.id)+(select count(*) from public.site_settings s where s.logo_media_id=m.id)+(select count(*) from public.site_settings s where s.about_image_media_id=m.id))::int as usage_count from public.media_assets m order by m.created_at desc`,
  ]);
  return NextResponse.json({ session, settings, lawyers, articles, practices, users, inquiries, smtp, emailTemplates, media });
}
