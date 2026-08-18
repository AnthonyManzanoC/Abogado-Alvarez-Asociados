import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { db } from "@/infrastructure/database/postgres";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const bucket = "legal-media";

export async function POST(request: NextRequest) {
  if (!await getRequestSession(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File) || !allowed.has(file.type) || file.size <= 0 || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Use JPG, PNG, WEBP o AVIF de hasta 5 MB." }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let storagePath: string | null = null;
  if (serviceKey && url) {
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: existing } = await supabase.storage.getBucket(bucket);
    if (!existing) await supabase.storage.createBucket(bucket, { public: true, fileSizeLimit: 5242880, allowedMimeTypes: [...allowed] });
    const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
    storagePath = `${new Date().getFullYear()}/${randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from(bucket).upload(storagePath, bytes, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (error) return NextResponse.json({ error: `Supabase Storage: ${error.message}` }, { status: 400 });
  }
  const [saved] = storagePath
    ? await db<{ id: string }[]>`insert into public.media_assets(filename,mime_type,size_bytes,data,storage_bucket,storage_path,alt_text) values(${file.name},${file.type},${file.size},null,${bucket},${storagePath},${String(form.get("alt_text") || "")}) returning id::text`
    : await db<{ id: string }[]>`insert into public.media_assets(filename,mime_type,size_bytes,data,alt_text) values(${file.name},${file.type},${file.size},${bytes},${String(form.get("alt_text") || "")}) returning id::text`;
  return NextResponse.json({ id: saved.id, url: `/api/media/${saved.id}`, provider: storagePath ? "supabase-storage" : "postgres-fallback" }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session || session.role === "editor") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Imagen inválida" }, { status: 400 });
  const [asset] = await db<{ storage_bucket: string | null; storage_path: string | null }[]>`select storage_bucket,storage_path from public.media_assets where id=${id}`;
  if (!asset) return NextResponse.json({ error: "La imagen ya no existe" }, { status: 404 });
  if (asset.storage_bucket && asset.storage_path) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !url) return NextResponse.json({ error: "Configure SUPABASE_SERVICE_ROLE_KEY antes de borrar este archivo de Storage." }, { status: 400 });
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.storage.from(asset.storage_bucket).remove([asset.storage_path]);
    if (error) return NextResponse.json({ error: `Supabase Storage: ${error.message}` }, { status: 400 });
  }
  await db.begin(async (transaction) => {
    await transaction`update public.site_settings set logo_url=null,logo_media_id=null where logo_media_id=${id}`;
    await transaction`delete from public.media_assets where id=${id}`;
  });
  return NextResponse.json({ ok: true });
}
