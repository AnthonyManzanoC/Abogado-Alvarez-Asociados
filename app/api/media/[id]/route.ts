import { NextResponse } from "next/server";
import { db } from "@/infrastructure/database/postgres";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [file] = await db<{ data: Uint8Array | null; mime_type: string; filename: string; storage_bucket: string | null; storage_path: string | null }[]>`select data,mime_type,filename,storage_bucket,storage_path from public.media_assets where id=${(await params).id} limit 1`;
  if (!file) return new NextResponse(null, { status: 404 });
  if (file.storage_bucket && file.storage_path && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(file.storage_bucket)}/${file.storage_path.split("/").map(encodeURIComponent).join("/")}`;
    return NextResponse.redirect(publicUrl, { status: 307 });
  }
  if (!file.data) return new NextResponse(null, { status: 404 });
  return new NextResponse(file.data as BodyInit, { headers: { "Content-Type": file.mime_type, "Cache-Control": "public, max-age=31536000, immutable", "Content-Disposition": `inline; filename="${file.filename.replace(/"/g, "")}"` } });
}
