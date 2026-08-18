import Link from "next/link";

export default function OfflinePage() {
  return <main className="offline-page"><div className="offline-mark"><span>J</span><i>·</i><span>A</span></div><span className="eyebrow" style={{ color: "var(--gold)" }}>Modo sin conexión</span><h1>El estudio sigue a un toque de distancia.</h1><p>No hay conexión disponible. Las páginas visitadas anteriormente pueden seguir funcionando; vuelva a intentarlo cuando recupere internet.</p><Link href="/" className="button-primary">Intentar nuevamente</Link></main>;
}
