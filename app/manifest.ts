import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Estudio Jurídico Ab. Josué Álvarez",
    short_name: "Josué Álvarez",
    description: "Servicios legales, directorio profesional, editorial y consultas privadas.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#101311",
    theme_color: "#101311",
    lang: "es-EC",
    categories: ["business", "legal", "productivity"],
    icons: [
      { src: "/api/brand/app-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/brand/app-icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Solicitar consulta", short_name: "Consulta", url: "/contacto" },
      { name: "Directorio de abogados", short_name: "Equipo", url: "/equipo" },
    ],
  };
}
