"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";

export function LoginClient() {
  const [configured,setConfigured]=useState<boolean|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{fetch('/api/auth/status').then(r=>r.json()).then(data=>setConfigured(data.configured)).catch(()=>setConfigured(true))},[]);
  async function submit(formData:FormData){setLoading(true);setError('');const response=await fetch(configured?'/api/auth/login':'/api/auth/bootstrap',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fullName:formData.get('fullName'),email:formData.get('email'),password:formData.get('password')})});const data=await response.json();if(response.ok){window.location.href='/admin'}else{setError(data.error||'No fue posible continuar.');setLoading(false)}}
  return <main className="auth-page">
    <section className="auth-brand"><BrandMark logoUrl="/api/brand/logo"/><div className="auth-quote">El control de su firma, <em>en un solo lugar.</em></div><span className="eyebrow" style={{color:'var(--gold)'}}>CMS privado · Acceso protegido</span></section>
    <section className="auth-panel"><div className="auth-box"><Link href="/" style={{display:'inline-flex',gap:8,alignItems:'center',fontSize:10,textTransform:'uppercase',letterSpacing:'.12em'}}><ArrowLeft size={13}/> Volver al sitio</Link>{configured===null?<div style={{padding:'80px 0',display:'grid',placeItems:'center'}}><LoaderCircle className="animate-spin"/></div>:<><span className="eyebrow" style={{color:'var(--gold)',marginTop:55}}><ShieldCheck size={15}/>{configured?'Acceso seguro':'Configuración inicial'}</span><h1>{configured?'Bienvenido.':'Crear propietario.'}</h1><p>{configured?'Ingrese sus credenciales para administrar el estudio.':'Esta primera cuenta tendrá control total sobre usuarios, contenido e identidad visual.'}</p><form className="auth-form" action={submit}>{!configured&&<div className="field"><label htmlFor="fullName">Nombre completo</label><input id="fullName" name="fullName" required autoComplete="name"/></div>}<div className="field"><label htmlFor="email">Correo</label><input id="email" name="email" type="email" required autoComplete="email"/></div><div className="field"><label htmlFor="password">Contraseña</label><input id="password" name="password" type="password" minLength={configured?1:10} required autoComplete={configured?'current-password':'new-password'}/></div>{error&&<p className="form-status" style={{color:'#9b3434'}}>{error}</p>}<button className="button-primary" disabled={loading}>{loading?<LoaderCircle className="animate-spin" size={15}/>:<ArrowRight size={15}/>} {configured?'Ingresar al panel':'Activar plataforma'}</button></form></>}</div></section>
  </main>
}
