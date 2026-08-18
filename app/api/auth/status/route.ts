import { NextResponse } from "next/server";
import { db } from "@/infrastructure/database/postgres";
export async function GET(){const [{count}]=await db<{count:number}[]>`select count(*)::int as count from public.admin_users`;return NextResponse.json({configured:count>0,supabaseAuth:Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)})}
