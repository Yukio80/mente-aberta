import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.forum import Forum
from app.schemas.forum import ForumCreate, ForumResponse

router = APIRouter()


@router.get("", response_model=list[ForumResponse])
def list_forums(db: Session = Depends(get_db)):
    forums = db.query(Forum).order_by(Forum.created_at.desc()).all()
    result = []
    for forum in forums:
        result.append(ForumResponse(
            id=forum.id,
            title=forum.title,
            description=forum.description,
            topic=forum.topic,
            publication_count=len(forum.publications),
            created_at=forum.created_at,
        ))
    return result


@router.post("", response_model=ForumResponse, status_code=201)
def create_forum(payload: ForumCreate, db: Session = Depends(get_db)):
    forum = Forum(
        id=uuid.uuid4(),
        title=payload.title,
        description=payload.description,
        topic=payload.topic,
    )
    db.add(forum)
    db.commit()
    db.refresh(forum)
    return ForumResponse(
        id=forum.id,
        title=forum.title,
        description=forum.description,
        topic=forum.topic,
        publication_count=0,
        created_at=forum.created_at,
    )


@router.get("/{forum_id}", response_model=ForumResponse)
def get_forum(forum_id: uuid.UUID, db: Session = Depends(get_db)):
    forum = db.query(Forum).filter(Forum.id == forum_id).first()
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")
    return ForumResponse(
        id=forum.id,
        title=forum.title,
        description=forum.description,
        topic=forum.topic,
        publication_count=len(forum.publications),
        created_at=forum.created_at,
    )
