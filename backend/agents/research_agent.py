# agents/research_agent.py
# Extracts key company signals from scraped content using Claude

import os
import json
import re
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


async def run_research_agent(url: str, content: str) -> dict:
    """
    Analyse scraped company content and extract structured research signals.

    Args:
        url:     The company website URL.
        content: Raw text scraped from the site.

    Returns:
        dict with keys: company_name, description, existing_products, identified_gaps
    """
    fallback = {
        "company_name": "Unknown Company",
        "description": "Could not retrieve company information.",
        "existing_products": [],
        "identified_gaps": [],
        "fallback": True,
    }

    if not content.strip():
        print("[research_agent] No content — using fallback mode.")
        fallback["company_name"] = url.split("//")[-1].split("/")[0].replace("www.", "").split(".")[0].capitalize()
        return fallback

    if not GEMINI_API_KEY:
        print("[research_agent] WARNING: GEMINI_API_KEY not set — fallback mode.")
        return fallback

    prompt = f"""You are a B2B research analyst. Analyse the following website content for the company at {url}.

Return ONLY a valid JSON object with exactly these keys:
- company_name (string): The company's name
- description (string): A 2-3 sentence summary of what the company does
- existing_products (array of strings): Their main products or services (max 5)
- identified_gaps (array of strings): Pain points or gaps where AI/tech could help (max 3)

Website content:
\"\"\"
{content}
\"\"\"

Return ONLY the JSON object, no markdown, no explanation."""

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
        result["fallback"] = False
        return result

    except json.JSONDecodeError as e:
        print(f"[research_agent] JSON parse error: {e}")
        return fallback
    except Exception as e:
        print(f"[research_agent] ERROR: {e}")
        return fallback
