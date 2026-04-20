import os
import json
import re
from google import genai
from pydantic import BaseModel
from dotenv import load_dotenv

# Try to load .env from the backend directory specifically just in case
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

class ChatHistory(BaseModel):
    role: str
    content: str

async def run_advisor_agent(message_history: list[dict], language: str) -> dict:
    """
    Multilingual Vernacular FD Advisor (Hindi & English).
    Returns a dict with `message` and `trigger_booking`.
    """
    if not GEMINI_API_KEY:
        print("[advisor_agent] WARNING: GEMINI_API_KEY not set.")
        return {"message": "API key structure missing. Fallback response active.", "trigger_booking": False}

    lang_instruction = "Hindi (using clear Devanagari script)" if language.strip().lower() == "hindi" else "English"

    system_prompt = f"""You are a friendly, trustworthy Vernacular FD Advisor for a bank, communicating with users in Tier-2/Tier-3 cities in India (like Gorakhpur).

Language: You MUST respond ONLY in {lang_instruction}. Do not switch to other languages.

Your goal is to bridge the gap between complex financial jargon and layman understanding, and then guide them to book a Fixed Deposit.

Jargon simplification rules (translate analogies appropriately to the requested language):
1. "Tenor" -> Explain as "The time period for which your money is safely kept."
2. "p.a." (Per Annum) -> Explain as "Interest earned in one full year."
3. "Small Finance Bank" -> Reassure them that these are "100% RBI-regulated and safe, just like big banks."

Flow rules:
- Be warm and welcoming. 
- If a user asks about an offer (e.g., 8.50% p.a.), break it down simply.
- If a user expresses intent to book, invest, or asks how to proceed, set `trigger_booking` to true.

Output format MUST be a valid JSON object matching exactly:
{{
  "message": "<your conversational response here>",
  "trigger_booking": <boolean true or false>
}}

Return ONLY the JSON, without markdown blocks."""

    # Format history for Gemini chat
    history_text = system_prompt + "\n\nConversation history:\n"
    for msg in message_history:
        history_text += f"{msg['role'].upper()}: {msg['content']}\n"
        
    history_text += "\nGenerate the next AI response in JSON format. Remember to follow the JSON schema rigidly."

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model=MODEL,
            contents=history_text,
        )
        raw = response.text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        result = json.loads(raw)
        return result

    except Exception as e:
        print(f"[advisor_agent] ERROR: {e}")
        with open("advisor_error.log", "a", encoding="utf-8") as f:
            f.write(f"ERROR: {e}\nRaw output if any: {locals().get('raw', 'None')}\n")
        return {
            "message": "Sorry, I am facing a temporary network issue connecting to the banking system. Please try again.",
            "trigger_booking": False
        }
