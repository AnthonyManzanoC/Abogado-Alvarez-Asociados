import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/infrastructure/database/postgres";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

const schema=z.object({email:z.string().email(),password:z.string().min(1)});
export async function POST(request:Request){
  try{
    const body=schema.parse(await request.json());
    const [user]=await db<{id:string,email:string,full_name:string,role:'owner'|'admin'|'editor',active:boolean,password_hash:string,auth_user_id:string|null}[]>`select id::text,email,full_name,role,active,password_hash,auth_user_id::text from public.admin_users where lower(email)=lower(${body.email}) limit 1`;
    if(!user||!user.active)return NextResponse.json({error:'Credenciales incorrectas.'},{status:401});
    let valid=false;
    const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    if(key&&url&&user.auth_user_id){const supabase=createClient(url,key,{auth:{persistSession:false}});const {error}=await supabase.auth.signInWithPassword({email:body.email,password:body.password});valid=!error}else{valid=await compare(body.password,user.password_hash)}
    if(!valid)return NextResponse.json({error:'Credenciales incorrectas.'},{status:401});
    await db`update public.admin_users set last_login_at=now() where id=${user.id}`;
    const token=await createSession({userId:user.id,email:user.email,fullName:user.full_name,role:user.role});const response=NextResponse.json({ok:true});response.cookies.set(SESSION_COOKIE,token,sessionCookieOptions);return response;
  }catch{return NextResponse.json({error:'Credenciales incorrectas.'},{status:401})}
}
