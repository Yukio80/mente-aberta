import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.thought import Argument, Thought
from app.models.user import User
from app.schemas.thought import (
    ArgumentCreate,
    ArgumentResponse,
    ThoughtCreate,
    ThoughtListItem,
    ThoughtResponse,
    ThoughtUpdate,
)

router = APIRouter()


@router.get("", response_model=list[ThoughtListItem])
def list_thoughts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thoughts = (
        db.query(Thought)
        .filter(Thought.user_id == current_user.id)
        .order_by(Thought.created_at.desc())
        .all()
    )
    return thoughts


@router.post("", response_model=ThoughtResponse, status_code=201)
def create_thought(
    payload: ThoughtCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thought = Thought(
        id=uuid.uuid4(),
        user_id=current_user.id,
        title=payload.title,
        claim=payload.claim,
        evidence=payload.evidence,
        reasoning=payload.reasoning,
        conclusion=payload.conclusion,
        status="draft",
    )
    db.add(thought)
    db.commit()
    db.refresh(thought)
    return thought


@router.get("/{thought_id}", response_model=ThoughtResponse)
def get_thought(
    thought_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thought = (
        db.query(Thought)
        .filter(Thought.id == thought_id, Thought.user_id == current_user.id)
        .first()
    )
    if not thought:
        raise HTTPException(status_code=404, detail="Thought not found")
    return thought


@router.put("/{thought_id}", response_model=ThoughtResponse)
def update_thought(
    thought_id: uuid.UUID,
    payload: ThoughtUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thought = (
        db.query(Thought)
        .filter(Thought.id == thought_id, Thought.user_id == current_user.id)
        .first()
    )
    if not thought:
        raise HTTPException(status_code=404, detail="Thought not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(thought, key, value)
    thought.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(thought)
    return thought


@router.delete("/{thought_id}", status_code=204)
def delete_thought(
    thought_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thought = (
        db.query(Thought)
        .filter(Thought.id == thought_id, Thought.user_id == current_user.id)
        .first()
    )
    if not thought:
        raise HTTPException(status_code=404, detail="Thought not found")
    db.delete(thought)
    db.commit()


@router.post("/{thought_id}/arguments", response_model=ArgumentResponse, status_code=201)
def add_argument(
    thought_id: uuid.UUID,
    payload: ArgumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thought = (
        db.query(Thought)
        .filter(Thought.id == thought_id, Thought.user_id == current_user.id)
        .first()
    )
    if not thought:
        raise HTTPException(status_code=404, detail="Thought not found")

    argument = Argument(
        id=uuid.uuid4(),
        thought_id=thought_id,
        type=payload.type,
        content=payload.content,
        score=payload.score,
    )
    db.add(argument)
    db.commit()
    db.refresh(argument)
    return argument
