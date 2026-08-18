export function BrandMark({ compact = false, logoUrl, shortName = "Josué Álvarez" }: { compact?: boolean; logoUrl?: string | null; shortName?: string }) {
  return (
    <span className="brand" aria-label={`Estudio Jurídico ${shortName}`}>
      {logoUrl ? <span className="brand-logo-image"><img src={logoUrl} alt={`Logotipo ${shortName}`} /></span> : <span className="brand-monogram" aria-hidden="true"><span>J</span><i>·</i><span>A</span></span>}
      {!compact && <span className="brand-copy"><span className="brand-name">{shortName}</span><span className="brand-kicker">Estudio jurídico</span></span>}
    </span>
  );
}
