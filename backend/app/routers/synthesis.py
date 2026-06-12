import json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.agents.synthesis import SynthesisAgent
from app.database import get_db
from app.models.forum import Forum, Publication, Synthesis
from app.schemas.forum import SynthesisResponse

router = APIRouter()


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

    forum_data = "\n".join(parts)
    return forum_data


@router.post("/{forum_id}/synthesize", response_model=SynthesisResponse)
def synthesize_forum(forum_id: uuid.UUID, db: Session = Depends(get_db)):
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
    try:
        content = agent.analyze({"title": forum.title, "claim": forum.topic, "evidence": forum_input})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {str(e)}")

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
