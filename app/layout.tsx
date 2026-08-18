import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Estudio Jurídico Ab. Josué Álvarez",
    template: "%s · Josué Álvarez",
  },
  description: "Estrategia legal, defensa rigurosa y acompañamiento directo para decisiones que no admiten improvisación.",
  icons: { icon: "/api/brand/logo", shortcut: "/api/brand/logo", apple: "/api/brand/app-icon" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Josué Álvarez" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    title: "Estudio Jurídico Ab. Josué Álvarez",
    description: "Estrategia legal. Criterio que trasciende.",
    images: [{ url: "/og.png", width: 1734, height: 908, alt: "Estudio Jurídico Josué Álvarez" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Estudio Jurídico Ab. Josué Álvarez",
    description: "Estrategia legal. Criterio que trasciende.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = { themeColor: "#101311", colorScheme: "dark light", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
