"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";

const links = [
  ["/", "Inicio"], ["/nosotros", "Nosotros"], ["/servicios", "Servicios"], ["/equipo", "Equipo"],
  ["/editorial", "Editorial"], ["/contacto", "Contacto"],
];

export function SiteHeader({ logoUrl, shortName }: { logoUrl?: string | null; shortName?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="public-header">
        <div className="container-shell public-header-inner">
          <Link href="/" className="focus-ring"><BrandMark logoUrl={logoUrl} shortName={shortName} /></Link>
          <nav className="desktop-nav" aria-label="Navegación principal">
            {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
            <Link href="/contacto" className="header-cta">Consulta privada</Link>
          </nav>
          <button className="menu-button focus-ring" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Cerrar menú" : "Abrir menú"}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>
      {open && (
        <nav className="mobile-menu" aria-label="Navegación móvil">
          {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link href="/login" className="button-ghost" onClick={() => setOpen(false)}>Acceso administrativo</Link>
        </nav>
      )}
    </>
  );
}
