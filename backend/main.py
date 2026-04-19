# main.py
# FastAPI application entry point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import leads

app = FastAPI(
    title="Blostem B2B AI Outreach Agent",
    description="AI-powered B2B outreach pipeline API",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # open for dev / hackathon demo
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(leads.router, prefix="/api/leads", tags=["leads"])


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["health"])
async def health_check():
    """Returns service health status."""
    return {"status": "ok", "service": "blostem-outreach-agent"}
