import Link from "next/link";
import type { SiteSettings } from "@/core/domain/entities";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="public-footer">
      <div className="container-shell">
        <div className="footer-grid">
          <div>
            <BrandMark logoUrl={settings.logo_url} shortName={settings.short_name} />
            <p className="footer-statement">Estrategia jurídica con criterio, presencia y propósito.</p>
          </div>
          <div>
            <p className="footer-heading">Explorar</p>
            <div className="footer-links">
              <Link href="/nosotros">Quiénes somos</Link><Link href="/servicios">Áreas de práctica</Link><Link href="/equipo">Nuestro equipo</Link>
              <Link href="/editorial">Editorial</Link><Link href="/contacto">Contacto</Link>
            </div>
          </div>
          <div>
            <p className="footer-heading">Contacto</p>
            <div className="footer-links">
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>
              <span>{settings.address}</span>
              <Link href="/login">Acceso privado</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {settings.firm_name}</span>
          <span>La información publicada no constituye asesoría jurídica.</span>
        </div>
      </div>
    </footer>
  );
}
