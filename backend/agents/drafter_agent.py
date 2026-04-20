# agents/drafter_agent.py
# Generates personalised B2B outreach emails from research context using Claude

import os
import json
import re
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


async def run_drafter_agent(research_data: dict) -> dict:
    """
    Generate a personalised outreach email based on research context.

    Args:
        research_data: Output dict from run_research_agent()

    Returns:
        dict with keys: subject, email_body, word_count
    """
    company_name = research_data.get("company_name", "your company")
    description = research_data.get("description", "")
    products = research_data.get("existing_products", [])
    gaps = research_data.get("identified_gaps", [])

    products_str = ", ".join(products) if products else "your core offerings"
    gaps_str = "; ".join(gaps) if gaps else "operational efficiency"

    fallback_body = (
        f"Hi {company_name} team,\n\n"
        f"I came across {company_name} and was impressed by your work with {products_str}.\n\n"
        f"We help companies like yours address challenges around {gaps_str} using our AI-powered B2B outreach platform.\n\n"
        f"Would you be open to a 20-minute call this week to explore how we can help?\n\n"
        f"Best regards,\nFinTrust AI"
    )

    fallback = {
        "subject": f"Helping {company_name} Scale with AI-Powered Outreach",
        "email_body": fallback_body,
        "word_count": len(fallback_body.split()),
    }

    if not GEMINI_API_KEY:
        print("[drafter_agent] WARNING: GEMINI_API_KEY not set — using template fallback.")
        return fallback

    prompt = f"""You are an expert B2B sales copywriter. Write a short, personalised cold outreach email.

Company details:
- Name: {company_name}
- Description: {description}
- Products/Services: {products_str}
- Identified gaps/pain points: {gaps_str}

Requirements:
1. Subject line must mention the company name
2. Body must reference at least one specific product or service
3. Include a clear CTA (call-to-action) to schedule a call or meeting
4. Keep it under 150 words
5. Professional but conversational tone
6. Sign off as "FinTrust AI Team"

Return ONLY a valid JSON object with exactly these keys:
- subject (string): The email subject line
- email_body (string): The full email body including greeting and sign-off

No markdown, no code fences, just the JSON object."""

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
        )
        raw = response.text.strip()

        # Strip markdown code fences if present
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        result = json.loads(raw)
        result["word_count"] = len(result.get("email_body", "").split())
        return result

    except json.JSONDecodeError as e:
        print(f"[drafter_agent] JSON parse error: {e}")
        return fallback
    except Exception as e:
        print(f"[drafter_agent] ERROR: {e}")
        return fallback
