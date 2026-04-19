# services/pipeline.py
# Orchestrates the full outreach pipeline:
#   scrape → research → draft → compliance

from services.scraper import scrape_website
from agents.research_agent import run_research_agent
from agents.drafter_agent import run_drafter_agent
from agents.compliance_agent import run_compliance_agent


async def run_pipeline(url: str) -> dict:
    """
    End-to-end outreach pipeline.

    Args:
        url: Target company website URL.

    Returns:
        {
            "research":   { company_name, description, existing_products, identified_gaps, fallback },
            "draft":      { subject, email_body, word_count },
            "compliance": { status, flagged_issues, ai_notes }
        }
    """
    # Step 1: Scrape
    print(f"[pipeline] Step 1/4 — Scraping {url}")
    content = await scrape_website(url)

    # Step 2: Research
    print("[pipeline] Step 2/4 — Running research agent")
    research = await run_research_agent(url=url, content=content)

    # Step 3: Draft
    print("[pipeline] Step 3/4 — Running drafter agent")
    draft = await run_drafter_agent(research_data=research)

    # Step 4: Compliance
    print("[pipeline] Step 4/4 — Running compliance agent")
    email_body = draft.get("email_body", "")
    compliance = await run_compliance_agent(email=email_body)

    print(f"[pipeline] Done. Compliance status: {compliance['status']}")

    return {
        "research": research,
        "draft": draft,
        "compliance": compliance,
    }
