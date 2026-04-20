import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from agents.advisor_agent import run_advisor_agent

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class AdvisorRequest(BaseModel):
    messages: List[ChatMessage]
    language: str

class AdvisorResponse(BaseModel):
    message: str
    trigger_booking: bool

@router.post("/chat", response_model=AdvisorResponse)
async def chat_with_advisor(request: AdvisorRequest):
    try:
        # Convert Pydantic models to dicts for the agent
        history = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Run local agent
        result = await run_advisor_agent(history, request.language)
        
        return AdvisorResponse(
            message=result.get("message", "I apologize, but I could not understand. Please try again."),
            trigger_booking=result.get("trigger_booking", False)
        )
    except Exception as e:
        print(f"[router/advisor] Error: {e}")
        raise HTTPException(status_code=500, detail="Advisor chat processing failed")
