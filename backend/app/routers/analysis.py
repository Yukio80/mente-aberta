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
from app.models.thought import Analysis, Thought
from app.schemas.thought import AnalysisResponse

router = APIRouter()


@router.post("/{thought_id}/analyze", response_model=list[AnalysisResponse])
def analyze_thought(thought_id: uuid.UUID, db: Session = Depends(get_db)):
    thought = db.query(Thought).filter(Thought.id == thought_id).first()
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
                results_map[name] = future.result()
            except Exception as e:
                results_map[name] = json.dumps({"error": str(e)}, ensure_ascii=False)

    results = []
    for agent in agents:
        analysis = Analysis(
            id=uuid.uuid4(),
            thought_id=thought_id,
            agent_type=agent.name,
            content=results_map[agent.name],
        )
        db.add(analysis)
        results.append(analysis)

    thought.status = "completed"
    thought.updated_at = datetime.utcnow()
    db.commit()

    for r in results:
        db.refresh(r)

    return results


@router.get("/{thought_id}", response_model=list[AnalysisResponse])
def list_analysis(thought_id: uuid.UUID, db: Session = Depends(get_db)):
    thought = db.query(Thought).filter(Thought.id == thought_id).first()
    if not thought:
        raise HTTPException(status_code=404, detail="Thought not found")

    analyses = db.query(Analysis).filter(Analysis.thought_id == thought_id).all()
    return analyses
