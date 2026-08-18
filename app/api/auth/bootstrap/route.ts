import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/infrastructure/database/postgres";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

const schema=z.object({fullName:z.string().min(3).max(120),email:z.string().email(),password:z.string().min(10).max(128)});
export async function POST(request:Request){
  try{
    const body=schema.parse(await request.json());
    const [{count}]=await db<{count:number}[]>`select count(*)::int as count from public.admin_users`;
    if(count>0)return NextResponse.json({error:'La cuenta propietaria ya fue configurada.'},{status:409});
    let authUserId:string|null=null;
    const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    if(key&&url){const supabase=createClient(url,key,{auth:{persistSession:false}});const {data,error}=await supabase.auth.signUp({email:body.email,password:body.password,options:{data:{full_name:body.fullName}}});if(error)return NextResponse.json({error:`Supabase Auth: ${error.message}`},{status:400});authUserId=data.user?.id??null}
    const passwordHash=await hash(body.password,12);
    const [user]=await db<{id:string,email:string,full_name:string,role:'owner'}[]>`insert into public.admin_users(auth_user_id,email,full_name,password_hash,role) values(${authUserId},${body.email.toLowerCase()},${body.fullName},${passwordHash},'owner') returning id::text,email,full_name,role`;
    const token=await createSession({userId:user.id,email:user.email,fullName:user.full_name,role:user.role});
    const response=NextResponse.json({ok:true});response.cookies.set(SESSION_COOKIE,token,sessionCookieOptions);return response;
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Datos inválidos.'},{status:400})}
}
