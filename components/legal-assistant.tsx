"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, MessageCircle, Mic, MicOff, Volume2, VolumeX, X } from "lucide-react";

type AssistantResult = { reply: string; intent: string; suggestions: string[]; link?: { href: string; label: string } };
type ChatMessage = { id: string; role: "assistant" | "user"; text: string; link?: AssistantResult["link"] };
type RecognitionResultEvent = { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> };
type RecognitionErrorEvent = { error: string };
type RecognitionInstance = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; stop: () => void; onresult: ((event: RecognitionResultEvent) => void) | null; onend: (() => void) | null; onerror: ((event: RecognitionErrorEvent) => void) | null };
type RecognitionConstructor = new () => RecognitionInstance;

const welcome: ChatMessage = { id: "welcome", role: "assistant", text: "Hola. Soy el asistente virtual del estudio. Puedo orientarle sobre servicios, profesionales, ubicación y cómo solicitar una consulta." };
const initialSuggestions = ["¿Qué servicios ofrecen?", "Quiero agendar una consulta", "¿Dónde están ubicados?"];

export function LegalAssistant() {
  const [open, setOpen] = useState(false); const [messages, setMessages] = useState<ChatMessage[]>([welcome]); const [suggestions, setSuggestions] = useState(initialSuggestions); const [draft, setDraft] = useState(""); const [busy, setBusy] = useState(false); const [listening, setListening] = useState(false); const [autoSpeak, setAutoSpeak] = useState(true);
  const recognition = useRef<RecognitionInstance | null>(null); const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);
  useEffect(() => () => { recognition.current?.stop(); window.speechSynthesis?.cancel(); }, []);

  function speak(text: string) { if (!("speechSynthesis" in window)) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "es-EC"; utterance.rate = .96; const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith("es")); if (voice) utterance.voice = voice; window.speechSynthesis.speak(utterance); }

  async function send(value: string) {
    const message = value.trim(); if (message.length < 2 || busy) return;
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", text: message }]); setDraft(""); setBusy(true); setSuggestions([]);
    try { const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) }); const result = await response.json() as AssistantResult & { error?: string }; const reply = response.ok ? result.reply : result.error || "No pude responder en este momento."; setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: reply, link: result.link }]); setSuggestions(result.suggestions || initialSuggestions); if (autoSpeak && response.ok) speak(reply); }
    catch { setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: "La conexión no está disponible. Puede utilizar la página de contacto para comunicarse con el estudio." }]); setSuggestions(initialSuggestions); }
    finally { setBusy(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void send(draft); }
  function toggleMicrophone() {
    if (listening) { recognition.current?.stop(); return; }
    const scope = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    const Constructor = scope.SpeechRecognition || scope.webkitSpeechRecognition;
    if (!Constructor) { setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: "Este navegador no ofrece reconocimiento de voz. Puede escribir su mensaje normalmente." }]); return; }
    const instance = new Constructor(); recognition.current = instance; instance.lang = "es-EC"; instance.interimResults = true; instance.continuous = false;
    instance.onresult = (event) => { let transcript = ""; for (let index = 0; index < event.results.length; index++) transcript += event.results[index][0].transcript; setDraft(transcript.trim()); };
    instance.onend = () => setListening(false); instance.onerror = () => setListening(false); setListening(true); instance.start();
  }

  return <div className={`legal-assistant ${open ? "open" : ""}`}>
    {open && <section className="assistant-panel" aria-label="Asistente virtual del estudio">
      <header className="assistant-header"><div className="assistant-identity"><span><Bot size={20} /></span><div><strong>Asistente del estudio</strong><small>Información conectada al CMS</small></div></div><div className="assistant-header-actions"><button onClick={() => setAutoSpeak((value) => !value)} aria-label={autoSpeak ? "Desactivar voz automática" : "Activar voz automática"}>{autoSpeak ? <Volume2 size={17} /> : <VolumeX size={17} />}</button><button onClick={() => setOpen(false)} aria-label="Cerrar asistente"><X size={18} /></button></div></header>
      <div className="assistant-messages" aria-live="polite">{messages.map((message) => <div className={`assistant-message ${message.role}`} key={message.id}><p>{message.text}</p>{message.link && <Link href={message.link.href}>{message.link.label}</Link>}{message.role === "assistant" && <button className="assistant-speak" onClick={() => speak(message.text)} aria-label="Escuchar respuesta"><Volume2 size={13} /></button>}</div>)}{busy && <div className="assistant-message assistant typing"><i /><i /><i /></div>}<div ref={endRef} /></div>
      {suggestions.length > 0 && <div className="assistant-suggestions">{suggestions.slice(0, 3).map((item) => <button key={item} onClick={() => void send(item)}>{item}</button>)}</div>}
      <form className="assistant-input" onSubmit={submit}><button type="button" className={listening ? "listening" : ""} onClick={toggleMicrophone} aria-label={listening ? "Detener dictado" : "Dictar mensaje"} title="El dictado depende de la compatibilidad del navegador">{listening ? <MicOff size={18} /> : <Mic size={18} />}</button><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={listening ? "Escuchando…" : "Escriba o dicte su consulta"} maxLength={800} aria-label="Mensaje para el asistente" /><button type="submit" disabled={busy || draft.trim().length < 2} aria-label="Enviar mensaje"><ArrowUp size={18} /></button></form>
      <p className="assistant-disclaimer">Orientación informativa. No sustituye asesoría jurídica ni evalúa casos.</p>
    </section>}
    <button className="assistant-launcher" onClick={() => setOpen((value) => !value)} aria-label={open ? "Cerrar asistente" : "Abrir asistente virtual"}>{open ? <X size={22} /> : <MessageCircle size={23} />}<span>Asistente</span></button>
  </div>;
}
