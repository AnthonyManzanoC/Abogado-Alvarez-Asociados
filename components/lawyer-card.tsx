import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Lawyer } from "@/core/domain/entities";

function initials(name: string) {
  return name.replace(/Ab\.\s*/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("");
}

export function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  return (
    <Link href={`/equipo/${lawyer.slug}`} className="lawyer-card focus-ring">
      <div className="lawyer-portrait">
        {lawyer.photo_media_id ? <img src={`/api/media/${lawyer.photo_media_id}`} alt={`Retrato profesional de ${lawyer.full_name}`} /> : <span className="lawyer-initials">{initials(lawyer.full_name)}</span>}
      </div>
      <div className="lawyer-card-body">
        <span className="lawyer-role">{lawyer.title}</span>
        <h3>{lawyer.full_name}</h3>
        <p>{lawyer.summary}</p>
        <span className="lawyer-link">Ver perfil <ArrowUpRight size={13} /></span>
      </div>
    </Link>
  );
}
