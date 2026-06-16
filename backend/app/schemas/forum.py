from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ForumCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(default="", max_length=2000)
    topic: str = Field(min_length=1, max_length=500)


class ForumResponse(BaseModel):
    id: UUID
    title: str
    description: str
    topic: str
    publication_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class PublicationResponse(BaseModel):
    id: UUID
    thought_id: UUID
    forum_id: UUID
    thought_title: str = ""
    thought_claim: str = ""
    created_at: datetime

    model_config = {"from_attributes": True}


class SynthesisResponse(BaseModel):
    id: UUID
    forum_id: UUID
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
