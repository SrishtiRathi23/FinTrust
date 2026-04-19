# services/scraper.py
# Fetches cleaned website content via Tavily Extract API

import os
from dotenv import load_dotenv

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")


async def scrape_website(url: str) -> str:
    """
    Use Tavily AsyncTavilyClient.extract() to pull clean text from a URL.

    Returns:
        Cleaned text string (max 8000 chars). Empty string on failure.
    """
    if not TAVILY_API_KEY:
        print("[scraper] WARNING: TAVILY_API_KEY not set — returning empty content.")
        return ""

    try:
        from tavily import AsyncTavilyClient

        client = AsyncTavilyClient(api_key=TAVILY_API_KEY)
        response = await client.extract(
            urls=[url],
            extract_depth="basic",
            format="text",
        )

        results = response.get("results", [])
        if not results:
            print(f"[scraper] No content extracted from {url}")
            return ""

        raw_content = results[0].get("raw_content", "") or ""
        # Collapse whitespace and cap length
        cleaned = " ".join(raw_content.split())
        return cleaned[:8000]

    except Exception as e:
        print(f"[scraper] ERROR scraping {url}: {e}")
        return ""
