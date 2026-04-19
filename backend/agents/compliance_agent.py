# agents/compliance_agent.py
# Validates outreach emails against compliance rules (GDPR, CAN-SPAM, etc.)
# Uses BOTH rule-based string matching AND Claude for AI-powered analysis.

import os
import json
import re
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# ---------------------------------------------------------------------------
# Rule-based compliance definitions (always applied, no API needed)
# ---------------------------------------------------------------------------
BANNED_PHRASES: list[dict] = [
    {
        "flagged_phrase": "guaranteed returns",
        "rule": "CAN-SPAM / FTC: Claims of guaranteed financial returns are prohibited in commercial emails.",
        "suggested_replacement": "potential returns",
    },
    {
        "flagged_phrase": "100% safe",
        "rule": "FTC Act: Absolute safety claims that cannot be substantiated are deceptive.",
        "suggested_replacement": "designed with safety in mind",
    },
    {
        "flagged_phrase": "no risk",
        "rule": "FTC Act: Risk-free claims must be fully disclosed. Remove or qualify the statement.",
        "suggested_replacement": "low-risk approach",
    },
    {
        "flagged_phrase": "assured profit",
        "rule": "SEC / FTC: Assurance of profit is a prohibited misleading financial claim.",
        "suggested_replacement": "proven growth strategies",
    },
    {
        "flagged_phrase": "best returns",
        "rule": "FTC Act: Superlative claims ('best') require substantiation. Use qualified language.",
        "suggested_replacement": "strong returns",
    },
]


def _rule_based_check(email_text: str) -> list[dict]:
    """Scan email text for banned phrases (case-insensitive, exact match)."""
    email_lower = email_text.lower()
    flagged = []
    for rule in BANNED_PHRASES:
        if rule["flagged_phrase"].lower() in email_lower:
            flagged.append({
                "flagged_phrase": rule["flagged_phrase"],
                "rule": rule["rule"],
                "suggested_replacement": rule["suggested_replacement"],
            })
    return flagged


async def run_compliance_agent(email: str) -> dict:
    """
    Run compliance checks on an email body.

    Args:
        email: The full email body string.

    Returns:
        dict with keys: status ("pass"/"fail"), flagged_issues (list), ai_notes (str)
    """
    # Always run rule-based detection first
    rule_flagged = _rule_based_check(email)

    ai_flagged: list[dict] = []
    ai_notes: str = ""

    if GEMINI_API_KEY:
        prompt = f"""You are a compliance officer reviewing a B2B outreach email.

Check the email below for ANY of these compliance violations:
1. Misleading financial claims (e.g. "guaranteed returns", "assured profit", "best returns")
2. Absolute safety claims (e.g. "100% safe", "no risk", "zero risk")
3. Spam trigger phrases
4. Missing unsubscribe language
5. Deceptive subject lines

Email to check:
\"\"\"
{email}
\"\"\"

Return ONLY a valid JSON object with exactly these keys:
- flagged_issues (array): Each item must have: flagged_phrase, rule, suggested_replacement
- ai_notes (string): A brief summary of overall compliance status

No markdown, no code fences, just the JSON."""

        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
            )
            raw = response.text.strip()
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)

            ai_result = json.loads(raw)
            ai_flagged = ai_result.get("flagged_issues", [])
            ai_notes = ai_result.get("ai_notes", "")

        except Exception as e:
            print(f"[compliance_agent] Gemini error: {e}")
            ai_notes = "AI compliance check unavailable; rule-based check applied."

    # Merge: rule-based results take priority; add AI-only finds
    rule_phrases = {item["flagged_phrase"].lower() for item in rule_flagged}
    merged_issues = list(rule_flagged)
    for ai_item in ai_flagged:
        if ai_item.get("flagged_phrase", "").lower() not in rule_phrases:
            merged_issues.append(ai_item)

    status = "fail" if merged_issues else "pass"

    return {
        "status": status,
        "flagged_issues": merged_issues,
        "ai_notes": ai_notes or ("No compliance issues detected." if status == "pass" else "Review flagged phrases before sending."),
    }
