import json
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.agents.bias import BiasDetectorAgent
from app.agents.devil import DevilAdvocateAgent
from app.agents.socratic import SocraticAgent
from app.database import get_db
from app.dependencies import get_current_user
from app.models.thought import Analysis, Thought
from app.models.user import User
from app.schemas.thought import AnalysisResponse

router = APIRouter()


@router.post("/{thought_id}/analyze", response_model=list[AnalysisResponse])
def analyze_thought(
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

    thought_dict = {
        "title": thought.title,
        "claim": thought.claim,
        "evidence": thought.evidence,
        "reasoning": thought.reasoning,
        "conclusion": thought.conclusion,
    }

    agents = [
        SocraticAgent(),
        DevilAdvocateAgent(),
        BiasDetectorAgent(),
    ]

    agent_map = {agent.name: agent for agent in agents}

    with ThreadPoolExecutor(max_workers=len(agents)) as executor:
        fut_map = {executor.submit(agent.analyze, thought_dict): agent.name for agent in agents}
        results_map: dict[str, str] = {}
        for future in as_completed(fut_map):
            name = fut_map[future]
            try:
                analysis_text = future.result()
                results_map[name] = analysis_text
                analysis_record = Analysis(
                    id=uuid.uuid4(),
                    thought_id=thought_id,
                    agent_type=name,
                    content=analysis_text,
                )
                db.add(analysis_record)
                db.commit()
            except Exception as e:
                results_map[name] = json.dumps({"error": str(e)}, ensure_ascii=False)

    thought.status = "completed"
    thought.updated_at = datetime.utcnow()
    db.commit()

    analyses = (
        db.query(Analysis)
        .filter(Analysis.thought_id == thought_id)
        .all()
    )
    return analyses


@router.get("/{thought_id}", response_model=list[AnalysisResponse])
def list_analysis(
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

    analyses = (
        db.query(Analysis)
        .filter(Analysis.thought_id == thought_id)
        .order_by(Analysis.created_at.asc())
        .all()
    )
    return analyses


@router.get("/{thought_id}/status")
def analysis_status(
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

    analyses = (
        db.query(Analysis)
        .filter(Analysis.thought_id == thought_id)
        .all()
    )
    completed_types = {a.agent_type for a in analyses}
    all_types = {"socratic", "devil", "bias"}
    pending_types = all_types - completed_types

    return {
        "completed_types": list(completed_types),
        "pending_types": list(pending_types),
        "total": len(all_types),
        "completed": len(completed_types),
    }
