import nodemailer from "nodemailer";
import { db } from "@/infrastructure/database/postgres";
import { decryptSecret } from "@/lib/secret-vault";
import type { EmailTemplate, Inquiry, SiteSettings } from "@/core/domain/entities";

export type LegalMailKind = EmailTemplate["template_key"];

type StoredSmtp = {
  host: string; port: number; secure: boolean; username: string; password_encrypted: string;
  from_name: string; from_email: string; reply_to: string; enabled: boolean;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}

function formatAppointment(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "full", timeStyle: "short", timeZone: "America/Bogota" }).format(new Date(value));
}

function emailHtml({ settings, inquiry, template, kind, scheduledAt, notes }: {
  settings: SiteSettings; inquiry: Inquiry; template: EmailTemplate; kind: LegalMailKind; scheduledAt?: string | null; notes?: string;
}) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const detail = kind === "scheduled" && scheduledAt
    ? `<div style="margin:28px 0;padding:22px 24px;background:#f3efe6;border-left:3px solid ${settings.primary_color};"><div style="font:700 10px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#7c6848;margin-bottom:10px;">Fecha y hora</div><div style="font:500 20px Georgia,serif;color:#101311;">${escapeHtml(formatAppointment(scheduledAt))}</div></div>`
    : notes
      ? `<div style="margin:28px 0;padding:22px 24px;background:#f3efe6;border-left:3px solid ${settings.primary_color};"><div style="font:700 10px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#7c6848;margin-bottom:10px;">Observaciones del estudio</div><div style="font:14px/1.75 Arial,sans-serif;color:#343936;white-space:pre-line;">${escapeHtml(notes)}</div></div>`
      : "";
  const logo = settings.logo_url
    ? `<img src="${escapeHtml(settings.logo_url.startsWith("http") ? settings.logo_url : `${siteUrl}${settings.logo_url}`)}" alt="${escapeHtml(settings.short_name)}" style="display:block;max-height:54px;max-width:210px;object-fit:contain;" />`
    : `<div style="display:inline-block;border:1px solid #b9945a;padding:11px 13px;font:500 22px Georgia,serif;color:#b9945a;letter-spacing:-1px;">J · A</div>`;

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;background:#ece9e1;padding:34px 12px;font-family:Arial,sans-serif;color:#101311;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fbfaf6;border:1px solid #d9d4c9;"><tr><td style="background:#101311;padding:30px 38px;border-bottom:3px solid ${settings.primary_color};">${logo}</td></tr><tr><td style="padding:50px 38px 42px;"><div style="font:700 10px Arial,sans-serif;letter-spacing:2.4px;text-transform:uppercase;color:${settings.primary_color};margin-bottom:20px;">Comunicación privada</div><h1 style="margin:0 0 22px;font:500 38px/1.05 Georgia,serif;letter-spacing:-1px;color:#101311;">${escapeHtml(template.heading)}</h1><p style="margin:0 0 18px;font:15px/1.8 Arial,sans-serif;color:#4f5651;">Estimado/a ${escapeHtml(inquiry.full_name)},</p><p style="margin:0;font:15px/1.8 Arial,sans-serif;color:#4f5651;">${escapeHtml(template.message)}</p>${detail}<p style="margin:26px 0 0;font:13px/1.7 Arial,sans-serif;color:#666d68;">Referencia: ${escapeHtml(inquiry.matter)}</p></td></tr><tr><td style="padding:28px 38px;background:#f3efe6;border-top:1px solid #ddd7cc;"><div style="font:500 18px Georgia,serif;color:#101311;">${escapeHtml(settings.firm_name)}</div><div style="margin-top:9px;font:11px/1.7 Arial,sans-serif;color:#777d78;">${escapeHtml(settings.email)} · ${escapeHtml(settings.phone)}<br>${escapeHtml(settings.address)}</div><div style="margin-top:18px;font:10px/1.6 Arial,sans-serif;color:#979c98;">Este mensaje confirma una comunicación inicial. No constituye por sí mismo aceptación del caso ni crea una relación abogado-cliente.</div></td></tr></table></td></tr></table></body></html>`;
}

async function loadMailer() {
  const [smtp] = await db<StoredSmtp[]>`select host,port,secure,username,password_encrypted,from_name,from_email,reply_to,enabled from public.smtp_settings where id=true`;
  if (!smtp?.enabled) throw new Error("El envío SMTP no está habilitado.");
  if (!smtp.host || !smtp.from_email) throw new Error("La configuración SMTP está incompleta.");
  const password = decryptSecret(smtp.password_encrypted);
  const transporter = nodemailer.createTransport({ host: smtp.host, port: smtp.port, secure: smtp.secure, auth: smtp.username ? { user: smtp.username, pass: password } : undefined, connectionTimeout: 12000, greetingTimeout: 12000, socketTimeout: 18000 });
  return { smtp, transporter };
}

export async function sendInquiryEmail({ inquiry, kind, scheduledAt, notes }: { inquiry: Inquiry; kind: LegalMailKind; scheduledAt?: string | null; notes?: string }) {
  const [settings, template] = await Promise.all([
    db<SiteSettings[]>`select firm_name,short_name,eyebrow,hero_title,hero_description,about_title,about_text,primary_color,accent_color,logo_url,email,phone,whatsapp,address,instagram,linkedin from public.site_settings where id=true`.then((rows) => rows[0]),
    db<EmailTemplate[]>`select template_key,subject,heading,message from public.email_templates where template_key=${kind}`.then((rows) => rows[0]),
  ]);
  if (!template) throw new Error("No existe una plantilla para esta respuesta.");
  const { smtp, transporter } = await loadMailer();
  try {
    await transporter.sendMail({ from: { name: smtp.from_name, address: smtp.from_email }, to: inquiry.email, replyTo: smtp.reply_to || settings.email, subject: template.subject, html: emailHtml({ settings, inquiry, template, kind, scheduledAt, notes }), text: `${template.heading}\n\n${template.message}${scheduledAt ? `\n\nFecha y hora: ${formatAppointment(scheduledAt)}` : ""}${notes ? `\n\nObservaciones: ${notes}` : ""}\n\n${settings.firm_name}` });
    await db`insert into public.email_logs(inquiry_id,template_key,recipient,subject,success) values(${inquiry.id},${kind},${inquiry.email},${template.subject},true)`;
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Error SMTP desconocido";
    await db`insert into public.email_logs(inquiry_id,template_key,recipient,subject,success,error_message) values(${inquiry.id},${kind},${inquiry.email},${template.subject},false,${message})`;
    throw error;
  }
}

export async function verifyAndSendTestEmail(recipient: string) {
  const { smtp, transporter } = await loadMailer();
  await transporter.verify();
  await transporter.sendMail({ from: { name: smtp.from_name, address: smtp.from_email }, to: recipient, replyTo: smtp.reply_to || smtp.from_email, subject: "Prueba de correo · Estudio Jurídico Josué Álvarez", html: `<div style="background:#ece9e1;padding:32px"><div style="max-width:620px;margin:auto;background:#101311;color:#f3efe6;padding:42px;border-bottom:4px solid #b9945a"><div style="font:700 10px Arial;letter-spacing:2px;color:#b9945a;text-transform:uppercase">Configuración verificada</div><h1 style="font:500 36px Georgia;margin:18px 0">El canal SMTP está funcionando.</h1><p style="font:14px/1.7 Arial;color:#c7c7c2">Este correo confirma que las respuestas automáticas y las notificaciones de consultas están listas para enviarse.</p></div></div>` });
}
