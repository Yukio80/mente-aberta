from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ThoughtCreate(BaseModel):
    title: str
    claim: str
    evidence: str = ""
    reasoning: str = ""
    conclusion: str = ""


class ThoughtUpdate(BaseModel):
    title: str | None = None
    claim: str | None = None
    evidence: str | None = None
    reasoning: str | None = None
    conclusion: str | None = None


class ArgumentCreate(BaseModel):
    type: str
    content: str
    score: float = 0.0


class ArgumentResponse(BaseModel):
    id: UUID
    type: str
    content: str
    score: float
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalysisResponse(BaseModel):
    id: UUID
    agent_type: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ThoughtResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    claim: str
    evidence: str
    reasoning: str
    conclusion: str
    status: str
    created_at: datetime
    updated_at: datetime
    analyses: list[AnalysisResponse] = []
    arguments: list[ArgumentResponse] = []

    model_config = {"from_attributes": True}


class ThoughtListItem(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    claim: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
