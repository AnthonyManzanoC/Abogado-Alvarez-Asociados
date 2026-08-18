import type { ReactNode } from "react";
import type { SiteSettings } from "@/core/domain/entities";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LegalAssistant } from "@/components/legal-assistant";
import { PwaExperience } from "@/components/pwa-experience";

export function PublicShell({ settings, children }: { settings: SiteSettings; children: ReactNode }) {
  const colors = { "--gold": settings.primary_color, "--sage": settings.accent_color } as React.CSSProperties;
  return <div style={colors}><SiteHeader logoUrl={settings.logo_url} shortName={settings.short_name} />{children}<SiteFooter settings={settings} /><PwaExperience /><LegalAssistant /></div>;
}
