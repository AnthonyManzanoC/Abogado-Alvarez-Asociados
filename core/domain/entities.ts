export type SiteSettings = {
  firm_name: string;
  short_name: string;
  eyebrow: string;
  hero_title: string;
  hero_description: string;
  about_title: string;
  about_text: string;
  about_eyebrow: string;
  primary_color: string;
  accent_color: string;
  logo_url: string | null;
  logo_media_id: string | null;
  about_image_media_id: string | null;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  map_embed_url: string;
  map_title: string;
  instagram: string;
  linkedin: string;
};

export type MediaAsset = {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  alt_text: string;
  created_at: string;
  url: string;
  provider: "supabase-storage" | "postgres";
  usage_count: number;
};

export type Highlight = { title: string; description: string };

export type Lawyer = {
  id: string;
  slug: string;
  full_name: string;
  title: string;
  summary: string;
  bio: string;
  specialties: string[];
  education: string[];
  languages: string[];
  bar_admissions: string[];
  highlights: Highlight[];
  email: string;
  phone: string;
  photo_media_id: string | null;
  featured: boolean;
  published: boolean;
  display_order: number;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: "draft" | "published";
  featured: boolean;
  author_lawyer_id: string | null;
  author_name?: string | null;
  cover_media_id: string | null;
  published_at: string | null;
};

export type PracticeArea = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  display_order: number;
  published?: boolean;
};

export type InquiryStatus = "new" | "reviewed" | "scheduled" | "resolved" | "rejected";

export type Inquiry = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  matter: string;
  message: string;
  status: InquiryStatus;
  scheduled_at: string | null;
  resolution_notes: string;
  notification_sent_at: string | null;
  created_at: string;
};

export type SmtpSettings = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  from_name: string;
  from_email: string;
  reply_to: string;
  enabled: boolean;
  has_password: boolean;
};

export type EmailTemplate = {
  template_key: "received" | "scheduled" | "resolved" | "rejected";
  subject: string;
  heading: string;
  message: string;
};

export type HomeContent = {
  settings: SiteSettings;
  lawyers: Lawyer[];
  articles: Article[];
  practiceAreas: PracticeArea[];
};
