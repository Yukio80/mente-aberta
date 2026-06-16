import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Uuid
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    thoughts = relationship("Thought", back_populates="user", cascade="all, delete-orphan")
