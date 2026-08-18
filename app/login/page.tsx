import type { Metadata } from "next";
import { LoginClient } from "@/components/admin/login-client";
export const metadata:Metadata={title:'Acceso administrativo',robots:{index:false,follow:false}};
export default function LoginPage(){return <LoginClient/>}
