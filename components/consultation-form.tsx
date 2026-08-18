"use client";

import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

export function ConsultationForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailSent, setEmailSent] = useState(false);

  async function submit(formData: FormData) {
    setStatus("sending");
    try {
      const response = await fetch("/api/inquiries", { method: "POST", body: formData });
      const result = await response.json().catch(() => ({}));
      setEmailSent(Boolean(result.emailSent));
      setStatus(response.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <div className="form-card"><span className="eyebrow">Solicitud recibida</span><h2 className="font-display" style={{ fontSize: 48, lineHeight: 1, margin: "24px 0 18px" }}>Gracias por confiar en nosotros.</h2><p className="form-status">{emailSent ? "Enviamos una confirmación profesional a su correo. El equipo revisará la información y se pondrá en contacto con usted de manera confidencial." : "El equipo revisará la información y se pondrá en contacto con usted de manera confidencial."}</p></div>;
  }

  return (
    <form className="form-card" action={submit}>
      <div className="form-grid">
        <div className="field"><label htmlFor="full_name">Nombre completo</label><input id="full_name" name="full_name" required autoComplete="name" /></div>
        <div className="field"><label htmlFor="email">Correo</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
        <div className="field"><label htmlFor="phone">Teléfono</label><input id="phone" name="phone" autoComplete="tel" /></div>
        <div className="field"><label htmlFor="matter">Tipo de asunto</label><select id="matter" name="matter" required defaultValue=""><option value="" disabled>Seleccione una opción</option><option>Consulta civil</option><option>Asunto corporativo</option><option>Litigio</option><option>Familia y patrimonio</option><option>Otro</option></select></div>
        <div className="field full"><label htmlFor="message">Cuéntenos brevemente</label><textarea id="message" name="message" required /></div>
        <div className="field full"><button className="button-primary" disabled={status === "sending"}>{status === "sending" ? <LoaderCircle className="animate-spin" size={15} /> : <ArrowRight size={15} />} Solicitar evaluación</button></div>
      </div>
      {status === "error" && <p className="form-status">No pudimos registrar la solicitud. Inténtelo nuevamente.</p>}
    </form>
  );
}
