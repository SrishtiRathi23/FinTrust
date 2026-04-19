# routers/leads.py
# API routes for the B2B outreach pipeline

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl

from services.pipeline import run_pipeline

router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class GenerateRequest(BaseModel):
    company_url: HttpUrl


class GenerateResponse(BaseModel):
    company_url: str
    research: dict
    draft: dict
    compliance: dict


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/generate", response_model=GenerateResponse, summary="Run full outreach pipeline")
async def generate_lead(payload: GenerateRequest):
    """
    Accepts a company URL, runs the full AI pipeline
    (scrape → research → draft → compliance) and returns the result.
    """
    url = str(payload.company_url)
    try:
        result = await run_pipeline(url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

    return GenerateResponse(
        company_url=url,
        research=result["research"],
        draft=result["draft"],
        compliance=result["compliance"],
    )
