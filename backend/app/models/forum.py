import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import relationship

from app.database import Base


class Forum(Base):
    __tablename__ = "forums"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    topic = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    publications = relationship("Publication", back_populates="forum", cascade="all, delete-orphan")
    syntheses = relationship("Synthesis", back_populates="forum", cascade="all, delete-orphan")


class Publication(Base):
    __tablename__ = "publications"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    thought_id = Column(Uuid, ForeignKey("thoughts.id"), nullable=False)
    forum_id = Column(Uuid, ForeignKey("forums.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    thought = relationship("Thought", lazy="joined")
    forum = relationship("Forum", back_populates="publications")


class Synthesis(Base):
    __tablename__ = "syntheses"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    forum_id = Column(Uuid, ForeignKey("forums.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    forum = relationship("Forum", back_populates="syntheses")
