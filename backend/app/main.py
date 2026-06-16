from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import forum, thought, user
from app.routers import analysis as analysis_router
from app.routers import auth as auth_router
from app.routers import forums as forums_router
from app.routers import publications as publications_router
from app.routers import synthesis as synthesis_router
from app.routers import thoughts as thoughts_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mente Aberta", description="Thinking Lab + Cérebro Coletivo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(thoughts_router.router, prefix="/api/thoughts", tags=["thoughts"])
app.include_router(analysis_router.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(forums_router.router, prefix="/api/forums", tags=["forums"])
app.include_router(publications_router.router, prefix="/api/publications", tags=["publications"])
app.include_router(synthesis_router.router, prefix="/api/synthesis", tags=["synthesis"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
