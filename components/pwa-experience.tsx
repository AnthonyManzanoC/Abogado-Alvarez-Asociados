"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function PwaExperience() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null); const [installed, setInstalled] = useState(() => typeof window !== "undefined" && Boolean(window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone)); const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const onPrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt); window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);
  async function install() { if (!prompt) return; await prompt.prompt(); const choice = await prompt.userChoice; if (choice.outcome === "accepted") setInstalled(true); setPrompt(null); }
  if (installed || dismissed || !prompt) return null;
  return <aside className="pwa-install" aria-label="Instalar aplicación"><button className="pwa-install-main" onClick={install}><Download size={16} /><span><strong>Instalar aplicación</strong><small>Acceso directo y experiencia PWA</small></span></button><button className="pwa-install-close" onClick={() => setDismissed(true)} aria-label="Cerrar"><X size={14} /></button></aside>;
}
