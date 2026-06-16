import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import relationship

from app.database import Base


class Thought(Base):
    __tablename__ = "thoughts"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    claim = Column(Text, nullable=False)
    evidence = Column(Text, default="")
    reasoning = Column(Text, default="")
    conclusion = Column(Text, default="")
    status = Column(String(20), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="thoughts")
    analyses = relationship("Analysis", back_populates="thought", cascade="all, delete-orphan")
    arguments = relationship("Argument", back_populates="thought", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    thought_id = Column(Uuid, ForeignKey("thoughts.id"), nullable=False)
    agent_type = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    thought = relationship("Thought", back_populates="analyses")


class Argument(Base):
    __tablename__ = "arguments"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    thought_id = Column(Uuid, ForeignKey("thoughts.id"), nullable=False)
    type = Column(String(10), nullable=False)
    content = Column(Text, nullable=False)
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    thought = relationship("Thought", back_populates="arguments")
