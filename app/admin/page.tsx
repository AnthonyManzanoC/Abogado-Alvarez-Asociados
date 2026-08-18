import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/admin/dashboard-client";
import { SESSION_COOKIE,verifySession } from "@/lib/auth";
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Panel administrativo',robots:{index:false,follow:false}};
export default async function AdminPage(){const session=await verifySession((await cookies()).get(SESSION_COOKIE)?.value);if(!session)redirect('/login');return <DashboardClient/>}
