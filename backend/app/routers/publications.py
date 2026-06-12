from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.forum import Forum, Publication
from app.models.thought import Thought
from app.schemas.forum import PublicationResponse

router = APIRouter()


class PublishRequest(BaseModel):
    thought_id: UUID
    forum_id: UUID


@router.get("/forum/{forum_id}", response_model=list[PublicationResponse])
def list_publications(forum_id: UUID, db: Session = Depends(get_db)):
    forum = db.query(Forum).filter(Forum.id == forum_id).first()
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")

    publications = (
        db.query(Publication)
        .filter(Publication.forum_id == forum_id)
        .order_by(Publication.created_at.desc())
        .all()
    )

    result = []
    for pub in publications:
        result.append(PublicationResponse(
            id=pub.id,
            thought_id=pub.thought_id,
            forum_id=pub.forum_id,
            thought_title=pub.thought.title if pub.thought else "",
            thought_claim=pub.thought.claim if pub.thought else "",
            created_at=pub.created_at,
        ))
    return result


@router.post("", response_model=PublicationResponse, status_code=201)
def publish_thought(payload: PublishRequest, db: Session = Depends(get_db)):
    thought = db.query(Thought).filter(Thought.id == payload.thought_id).first()
    if not thought:
        raise HTTPException(status_code=404, detail="Thought not found")

    forum = db.query(Forum).filter(Forum.id == payload.forum_id).first()
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")

    existing = (
        db.query(Publication)
        .filter(
            Publication.thought_id == payload.thought_id,
            Publication.forum_id == payload.forum_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Thought already published in this forum")

    pub = Publication(
        id=uuid.uuid4(),
        thought_id=payload.thought_id,
        forum_id=payload.forum_id,
    )
    db.add(pub)
    db.commit()
    db.refresh(pub)

    return PublicationResponse(
        id=pub.id,
        thought_id=pub.thought_id,
        forum_id=pub.forum_id,
        thought_title=thought.title,
        thought_claim=thought.claim,
        created_at=pub.created_at,
    )


@router.delete("/{publication_id}", status_code=204)
def unpublish(publication_id: UUID, db: Session = Depends(get_db)):
    pub = db.query(Publication).filter(Publication.id == publication_id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    db.delete(pub)
    db.commit()
