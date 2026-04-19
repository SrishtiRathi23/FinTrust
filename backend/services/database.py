# services/database.py
# Database access layer for persisting leads and pipeline results

# TODO: Configure async DB connection (e.g. SQLite via aiosqlite or PostgreSQL
#       via asyncpg / SQLAlchemy async).


async def save_lead(lead_data: dict) -> str:
    """Persist a lead record and return its ID."""
    # TODO: Implement insert logic
    raise NotImplementedError


async def get_lead(lead_id: str) -> dict:
    """Retrieve a single lead by ID."""
    # TODO: Implement fetch logic
    raise NotImplementedError


async def list_leads() -> list:
    """Return all persisted leads."""
    # TODO: Implement list logic
    raise NotImplementedError
