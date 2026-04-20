# main.py
# FastAPI application entry point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from routers.leads import router as leads_router
from routers.advisor import router as advisor_router

app = FastAPI(
    title="FinTrust B2B AI Outreach Agent",
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
app.include_router(leads_router, prefix="/api/leads", tags=["leads"])
app.include_router(advisor_router, prefix="/api/advisor", tags=["advisor"])


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["health"])
async def health_check():
    """Returns service health status."""
    return {"status": "ok", "service": "blostem-outreach-agent"}
