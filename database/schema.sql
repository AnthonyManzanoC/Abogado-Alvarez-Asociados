create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  firm_name text not null default 'Estudio Jurídico Ab. Josué Álvarez',
  short_name text not null default 'Josué Álvarez',
  eyebrow text not null default 'Estudio jurídico · Ecuador',
  hero_title text not null default 'La claridad legal cambia el rumbo.',
  hero_description text not null default 'Asesoría estratégica, defensa rigurosa y acompañamiento cercano para decisiones que no admiten improvisación.',
  about_title text not null default 'Criterio, carácter y una defensa construida alrededor de usted.',
  about_text text not null default 'Cada asunto exige una lectura precisa del riesgo y una estrategia diseñada con propósito. Trabajamos con confidencialidad, atención directa y una visión jurídica que convierte la complejidad en decisiones claras.',
  about_eyebrow text not null default 'Quiénes somos',
  primary_color text not null default '#B9945A',
  accent_color text not null default '#7E897F',
  logo_url text,
  email text not null default 'contacto@josuealvarez.legal',
  phone text not null default '+593 00 000 0000',
  whatsapp text not null default '',
  address text not null default 'Ecuador · Atención con cita previa',
  map_embed_url text not null default 'https://www.google.com/maps?q=Ecuador&output=embed',
  map_title text not null default 'Ubicación del estudio',
  instagram text not null default '',
  linkedin text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  mime_type text not null,
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  data bytea,
  storage_bucket text,
  storage_path text,
  alt_text text not null default '',
  created_at timestamptz not null default now()
);

alter table public.media_assets alter column data drop not null;
alter table public.media_assets add column if not exists storage_bucket text;
alter table public.media_assets add column if not exists storage_path text;

alter table public.site_settings add column if not exists about_eyebrow text not null default 'Quiénes somos';
alter table public.site_settings add column if not exists map_embed_url text not null default 'https://www.google.com/maps?q=Ecuador&output=embed';
alter table public.site_settings add column if not exists map_title text not null default 'Ubicación del estudio';
alter table public.site_settings add column if not exists logo_media_id uuid references public.media_assets(id) on delete set null;
alter table public.site_settings add column if not exists about_image_media_id uuid references public.media_assets(id) on delete set null;
update public.site_settings s set logo_media_id=m.id from public.media_assets m where s.logo_media_id is null and s.logo_url=('/api/media/' || m.id::text);

create table if not exists public.lawyers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  title text not null default 'Abogado',
  summary text not null default '',
  bio text not null default '',
  specialties text[] not null default '{}',
  education text[] not null default '{}',
  languages text[] not null default '{}',
  bar_admissions text[] not null default '{}',
  highlights jsonb not null default '[]'::jsonb,
  email text not null default '',
  phone text not null default '',
  photo_media_id uuid references public.media_assets(id) on delete set null,
  featured boolean not null default false,
  published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lawyers_published_order_idx on public.lawyers(published, display_order);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  category text not null default 'Análisis',
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  author_lawyer_id uuid references public.lawyers(id) on delete set null,
  cover_media_id uuid references public.media_assets(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_status_date_idx on public.articles(status, published_at desc);

create table if not exists public.practice_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  icon text not null default 'scale',
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.practice_areas add column if not exists created_at timestamptz not null default now();
alter table public.practice_areas add column if not exists updated_at timestamptz not null default now();

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null default '',
  matter text not null,
  message text not null,
  status text not null default 'new',
  scheduled_at timestamptz,
  resolution_notes text not null default '',
  notification_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.inquiries add column if not exists scheduled_at timestamptz;
alter table public.inquiries add column if not exists resolution_notes text not null default '';
alter table public.inquiries add column if not exists notification_sent_at timestamptz;
alter table public.inquiries drop constraint if exists inquiries_status_check;
update public.inquiries set status = case status when 'contacted' then 'reviewed' when 'closed' then 'resolved' else status end;
alter table public.inquiries add constraint inquiries_status_check check (status in ('new', 'reviewed', 'scheduled', 'resolved', 'rejected'));

create table if not exists public.smtp_settings (
  id boolean primary key default true check (id),
  host text not null default '',
  port integer not null default 587 check (port between 1 and 65535),
  secure boolean not null default false,
  username text not null default '',
  password_encrypted text not null default '',
  from_name text not null default 'Estudio Jurídico Ab. Josué Álvarez',
  from_email text not null default '',
  reply_to text not null default '',
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.smtp_settings (id) values (true) on conflict (id) do nothing;

create table if not exists public.email_templates (
  template_key text primary key check (template_key in ('received', 'scheduled', 'resolved', 'rejected')),
  subject text not null,
  heading text not null,
  message text not null,
  updated_at timestamptz not null default now()
);

insert into public.email_templates (template_key, subject, heading, message) values
  ('received', 'Hemos recibido su consulta', 'Su consulta está siendo analizada', 'Hemos recibido correctamente la información que nos compartió. Nuestro equipo la revisará con la atención y confidencialidad que merece.'),
  ('scheduled', 'Su consulta jurídica ha sido agendada', 'Su cita ha sido confirmada', 'Hemos reservado un espacio para revisar su asunto. A continuación encontrará la fecha y hora programadas.'),
  ('resolved', 'Actualización final de su consulta', 'Su consulta ha sido atendida', 'Hemos completado la revisión de su solicitud. En este correo encontrará las observaciones finales registradas por el estudio.'),
  ('rejected', 'Respuesta a su solicitud de consulta', 'Agradecemos su confianza', 'Después de revisar la información inicial, en esta ocasión no podremos asumir el asunto. Esta decisión no constituye una valoración sobre el mérito de su caso.')
on conflict (template_key) do nothing;

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references public.inquiries(id) on delete set null,
  template_key text not null,
  recipient text not null,
  subject text not null,
  success boolean not null default false,
  error_message text not null default '',
  sent_at timestamptz not null default now()
);

create index if not exists email_logs_inquiry_idx on public.email_logs(inquiry_id, sent_at desc);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null unique,
  full_name text not null,
  password_hash text not null,
  role text not null default 'editor' check (role in ('owner', 'admin', 'editor')),
  active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (true) on conflict (id) do nothing;
update public.site_settings set logo_url = null where logo_url = '';

insert into public.practice_areas (slug, title, description, icon, display_order) values
  ('derecho-civil', 'Derecho civil', 'Soluciones precisas para obligaciones, contratos, responsabilidad y controversias patrimoniales.', 'landmark', 1),
  ('derecho-corporativo', 'Derecho corporativo', 'Estructuras, acuerdos y prevención jurídica para empresas que necesitan avanzar con certeza.', 'building', 2),
  ('litigios', 'Litigios estratégicos', 'Defensa técnica y narrativa procesal enfocada en proteger su posición y sus objetivos.', 'scale', 3),
  ('familia', 'Familia y patrimonio', 'Acompañamiento humano y reservado en decisiones familiares y patrimoniales sensibles.', 'shield', 4)
on conflict (slug) do nothing;

insert into public.lawyers (slug, full_name, title, summary, bio, specialties, education, languages, highlights, email, featured, display_order)
values (
  'josue-alvarez',
  'Ab. Josué Álvarez',
  'Abogado director',
  'Estrategia jurídica con atención directa, criterio independiente y un compromiso innegociable con cada caso.',
  'Josué Álvarez dirige el estudio con una práctica centrada en comprender el problema completo antes de definir la estrategia. Su enfoque combina rigor técnico, comunicación transparente y acompañamiento cercano en cada etapa.\n\nLa información académica, credenciales específicas y casos destacados pueden completarse desde el panel administrativo para mantener un perfil público exacto y verificable.',
  array['Litigios estratégicos', 'Derecho civil', 'Asesoría preventiva'],
  array['Formación académica editable desde el CMS'],
  array['Español'],
  '[{"title":"Atención directa","description":"Cada asunto es liderado con participación personal y comunicación clara."},{"title":"Estrategia a medida","description":"Las decisiones responden al contexto real, el riesgo y el objetivo del cliente."}]'::jsonb,
  'contacto@josuealvarez.legal',
  true,
  1
)
on conflict (slug) do nothing;

insert into public.articles (slug, title, excerpt, content, category, status, featured, author_lawyer_id, published_at)
select
  'como-prepararse-para-una-consulta-legal',
  'Cómo prepararse para una consulta legal estratégica',
  'La calidad de una primera conversación puede cambiar el rumbo de todo el asunto. Estas son las claves para llegar con claridad.',
  'Una consulta jurídica eficaz comienza antes de sentarse frente al abogado. Reunir los documentos, ordenar una cronología simple y definir el resultado que se espera permite concentrar la conversación en las decisiones importantes.\n\n## 1. Construya una cronología\n\nAnote fechas, personas y hechos relevantes sin intentar interpretar jurídicamente lo ocurrido. La secuencia ayuda a identificar plazos, riesgos y vacíos de información.\n\n## 2. Reúna los documentos\n\nContratos, comunicaciones, comprobantes y decisiones anteriores aportan contexto verificable. Lleve copias legibles y conserve los originales.\n\n## 3. Defina su prioridad\n\nNo todos los asuntos buscan el mismo resultado. A veces la prioridad es prevenir, negociar, recuperar o defender. Expresarlo con claridad permite diseñar una estrategia realista.\n\nEste contenido es informativo y no sustituye una evaluación jurídica individual.',
  'Guía práctica', 'published', true, l.id, now() - interval '5 days'
from public.lawyers l where l.slug = 'josue-alvarez'
on conflict (slug) do nothing;

insert into public.articles (slug, title, excerpt, content, category, status, featured, author_lawyer_id, published_at)
select
  'contratos-claros-negocios-solidos',
  'Contratos claros, relaciones más sólidas',
  'Un contrato útil no acumula cláusulas: distribuye riesgos, anticipa escenarios y deja decisiones comprensibles.',
  'Los mejores contratos no son los más extensos, sino los que permiten a cada parte entender qué debe hacer, qué puede exigir y qué ocurrirá si el contexto cambia.\n\nLa revisión preventiva reduce zonas grises, alinea expectativas y protege la continuidad de la relación. El análisis debe considerar la operación real, no únicamente una plantilla.\n\nEste contenido es informativo y no constituye asesoría legal.',
  'Opinión', 'published', false, l.id, now() - interval '15 days'
from public.lawyers l where l.slug = 'josue-alvarez'
on conflict (slug) do nothing;

alter table public.site_settings enable row level security;
alter table public.lawyers enable row level security;
alter table public.articles enable row level security;
alter table public.practice_areas enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_settings' and policyname='Public settings are readable') then
    create policy "Public settings are readable" on public.site_settings for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='lawyers' and policyname='Published lawyers are readable') then
    create policy "Published lawyers are readable" on public.lawyers for select using (published = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='articles' and policyname='Published articles are readable') then
    create policy "Published articles are readable" on public.articles for select using (status = 'published');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='practice_areas' and policyname='Published practices are readable') then
    create policy "Published practices are readable" on public.practice_areas for select using (published = true);
  end if;
end $$;
