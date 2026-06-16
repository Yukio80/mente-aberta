import json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.agents.synthesis import SynthesisAgent
from app.database import get_db
from app.dependencies import get_current_user
from app.models.forum import Forum, Publication, Synthesis
from app.models.user import User
from app.schemas.forum import SynthesisResponse

router = APIRouter()
MAX_CHARS_PER_PUBLICATION = 4000


def build_synthesis_input(publications: list[Publication]) -> str:
    parts = []
    for i, pub in enumerate(publications, 1):
        t = pub.thought
        if not t:
            continue
        block = f"""--- PUBLICAÇÃO {i} ---
Título: {t.title}
Tese: {t.claim}
Evidências: {t.evidence or "(não fornecida)"}
Raciocínio: {t.reasoning or "(não fornecido)"}
Conclusão: {t.conclusion or "(não fornecida)"}"""

        if t.arguments:
            pros = [a for a in t.arguments if a.type == "pro"]
            cons = [a for a in t.arguments if a.type == "con"]
            if pros:
                block += "\nPrós: " + "; ".join(a.content for a in pros)
            if cons:
                block += "\nContras: " + "; ".join(a.content for a in cons)

        block += "\n"
        parts.append(block)

    return "\n".join(parts)


def summarize_chunk(chunk_text: str, agent: SynthesisAgent) -> str:
    summary_prompt = {
        "title": "Resumo Parcial para Síntese",
        "claim": "Resuma os pontos principais, divergências e temas emergentes deste grupo de publicações.",
        "evidence": chunk_text,
    }
    result = agent.analyze(summary_prompt)
    return result


@router.post("/{forum_id}/synthesize", response_model=SynthesisResponse)
def synthesize_forum(
    forum_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    forum = db.query(Forum).filter(Forum.id == forum_id).first()
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")

    publications = (
        db.query(Publication)
        .filter(Publication.forum_id == forum_id)
        .all()
    )

    if not publications:
        raise HTTPException(status_code=400, detail="No publications to synthesize")

    forum_input = build_synthesis_input(publications)
    agent = SynthesisAgent()

    if len(forum_input) > MAX_CHARS_PER_PUBLICATION * len(publications):
        chunks = []
        current_chunk = []
        current_size = 0
        for pub in publications:
            t = pub.thought
            if not t:
                continue
            pub_text = f"Título: {t.title}\nTese: {t.claim}\nEvidências: {t.evidence or ''}\nRaciocínio: {t.reasoning or ''}\nConclusão: {t.conclusion or ''}\n"
            if current_size + len(pub_text) > MAX_CHARS_PER_PUBLICATION * 5 and current_chunk:
                chunks.append("\n".join(current_chunk))
                current_chunk = []
                current_size = 0
            current_chunk.append(pub_text)
            current_size += len(pub_text)
        if current_chunk:
            chunks.append("\n".join(current_chunk))

        summaries = []
        for chunk in chunks:
            try:
                summary = summarize_chunk(chunk, agent)
                summaries.append(summary)
            except Exception:
                summaries.append(f"(resumo parcial não disponível para um grupo de {len(chunks)} publicações)")

        reduced_input = build_synthesis_input(publications)
        combined_summaries = "\n\n--- RESUMOS PARCIAIS ---\n\n" + "\n\n".join(summaries)
        reduced_input += combined_summaries

        try:
            content = agent.analyze({
                "title": forum.title,
                "claim": forum.topic,
                "evidence": reduced_input,
            })
        except Exception:
            raise HTTPException(status_code=500, detail="Synthesis failed. Check API key and try again.")
    else:
        try:
            content = agent.analyze({
                "title": forum.title,
                "claim": forum.topic,
                "evidence": forum_input,
            })
        except Exception:
            raise HTTPException(status_code=500, detail="Synthesis failed. Check API key and try again.")

    synthesis = Synthesis(
        id=uuid.uuid4(),
        forum_id=forum_id,
        content=content,
    )
    db.add(synthesis)
    db.commit()
    db.refresh(synthesis)

    return SynthesisResponse(
        id=synthesis.id,
        forum_id=synthesis.forum_id,
        content=synthesis.content,
        created_at=synthesis.created_at,
    )


@router.get("/{forum_id}", response_model=list[SynthesisResponse])
def list_syntheses(forum_id: uuid.UUID, db: Session = Depends(get_db)):
    forum = db.query(Forum).filter(Forum.id == forum_id).first()
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")

    syntheses = (
        db.query(Synthesis)
        .filter(Synthesis.forum_id == forum_id)
        .order_by(Synthesis.created_at.desc())
        .all()
    )
    return syntheses
