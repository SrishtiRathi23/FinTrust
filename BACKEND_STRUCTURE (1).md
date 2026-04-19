# Backend Structure Documentation
# Blostem Outreach Agent
**Version:** 1.0
**Stack:** FastAPI 0.109.2 + Python 3.11.9 + Supabase (PostgreSQL 15)
**Matches:** PRD.md v2.0 · APP_FLOW.md v2.0 · TECH_STACK.md v2.0
**Last Updated:** April 2026   

-- 

## 1. Architecture Overview

### Pattern: RESTful API + Server-Sent Events (SSE)

The backend is a **persistent FastAPI server** deployed on Render's
free tier. It is NOT serverless — this is the critical architectural
decision that allows the 60-second AI pipeline to run without timeout.

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                │
│                                                                 │
│  Next.js Frontend (Vercel)                                      │
│       │                                                         │
│       │  POST /api/leads/generate   ← SSE stream               │
│       │  GET  /api/leads            ← JSON response            │
│       │  GET  /api/leads/{id}       ← JSON response            │
│       │  PATCH /api/leads/{id}      ← JSON response            │
│       │  POST /api/leads/{id}/regenerate ← SSE stream          │
│       ▼                                                         │
│  FastAPI Server (Render — persistent, no timeout)               │
│       │                                                         │
│       ├──► Tavily API                                           │
│       │    └── scrapes target company URL                       │
│       │    └── returns: clean text content                      │
│       │                                                         │
│       ├──► Anthropic API (Claude)                               │
│       │    ├── Agent 1: Research Agent                          │
│       │    │   └── input: scraped content                       │
│       │    │   └── output: structured research JSON             │
│       │    ├── Agent 2: Drafter Agent                           │
│       │    │   └── input: research JSON + Blostem context       │
│       │    │   └── output: personalized email string            │
│       │    └── Agent 3: Compliance Agent                        │
│       │        └── input: generated email draft                 │
│       │        └── output: compliance result JSON               │
│       │                                                         │
│       └──► Supabase (PostgreSQL 15)                             │
│            ├── leads table (primary data store)                 │
│            └── pipeline_runs table (step-level audit log)       │
└─────────────────────────────────────────────────────────────────┘
```

### Authentication

MVP uses a single hardcoded admin key sent as a request header.
No user sessions, no JWT, no OAuth.

```
Header:  X-Admin-Key: <ADMIN_API_KEY>
```

Every non-health endpoint requires this header. Requests without
it or with an incorrect key receive `401 Unauthorized`.

### Streaming Strategy

`POST /api/leads/generate` and `POST /api/leads/{id}/regenerate`
return **Server-Sent Events (SSE)** — not a single JSON response.

This allows the frontend to update the pipeline log in real time
as each agent completes, rather than waiting 60 seconds for a
single response.

SSE event stream format:
```
data: {"event": "step_start", "step": "research", "timestamp": "14:32:07"}

data: {"event": "step_complete", "step": "research", "data": {...researchSummary}}

data: {"event": "step_start", "step": "draft", "timestamp": "14:32:20"}

data: {"event": "step_complete", "step": "draft", "data": {...emailDraft}}

data: {"event": "step_start", "step": "compliance", "timestamp": "14:32:34"}

data: {"event": "step_complete", "step": "compliance", "data": {...complianceResult}}

data: {"event": "pipeline_complete", "lead_id": "uuid", "data": {...fullLeadObject}}
```

On error at any step:
```
data: {"event": "step_error", "step": "research", "error": {"code": "RESEARCH_FAILED", "message": "..."}}
```

---

## 2. Folder Structure

```
backend/
├── main.py                    ← FastAPI app init, CORS, middleware, router registration
├── requirements.txt           ← Pinned dependencies
├── render.yaml                ← Render deploy config
├── .env                       ← Local env vars (never committed)
├── .env.example               ← Template (committed)
├── ruff.toml                  ← Python linter config
│
├── routers/
│   └── leads.py               ← All /api/leads/* endpoints
│
├── agents/
│   ├── __init__.py
│   ├── research_agent.py      ← Agent 1: URL → structured research JSON
│   ├── drafter_agent.py       ← Agent 2: research JSON → email string
│   └── compliance_agent.py    ← Agent 3: email → compliance result JSON
│
├── services/
│   ├── __init__.py
│   ├── pipeline.py            ← Orchestrates 3-agent pipeline + SSE emission
│   ├── scraper.py             ← Tavily API wrapper
│   └── database.py            ← Supabase client wrapper (CRUD helpers)
│
├── models/
│   ├── __init__.py
│   ├── lead.py                ← Pydantic models for Lead + LeadCreate + LeadUpdate
│   ├── pipeline.py            ← Pydantic models for pipeline events
│   └── compliance.py          ← Pydantic models for ComplianceResult + ComplianceFlag
│
├── middleware/
│   ├── __init__.py
│   ├── auth.py                ← X-Admin-Key verification (FastAPI Depends)
│   └── rate_limit.py          ← In-memory rate limiter
│
└── utils/
    ├── __init__.py
    ├── sanitize.py            ← URL sanitization + prompt injection prevention
    └── timestamps.py          ← Timestamp formatting helpers
```

---

## 3. Database Schema

All tables use Supabase's managed PostgreSQL 15.
All tables have `id`, `created_at`, `updated_at`.
Row Level Security (RLS) is enabled on all tables.

---

### Table: `leads`

Primary data store. One row per pipeline run result.

```sql
CREATE TABLE leads (
  -- ── Identity ──────────────────────────────────────────────
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── Input ─────────────────────────────────────────────────
  company_url       TEXT          NOT NULL,
  company_name      TEXT,                           -- Extracted by Research Agent

  -- ── Agent Outputs ─────────────────────────────────────────
  research_summary  TEXT,                           -- Plain text summary from Research Agent
  research_json     JSONB,                          -- Full structured JSON from Research Agent
  generated_email   TEXT,                           -- Raw email from Drafter Agent
  final_email       TEXT,                           -- User-edited version (may equal generated_email)

  -- ── Compliance ────────────────────────────────────────────
  compliance_status TEXT          NOT NULL
                    DEFAULT 'pending'
                    CHECK (compliance_status IN (
                      'pending',
                      'pass',
                      'fail',
                      'advisory',
                      'unavailable'
                    )),
  compliance_notes  JSONB,                          -- Array of flagged phrases + suggestions

  -- ── Lead Lifecycle ────────────────────────────────────────
  lead_status       TEXT          NOT NULL
                    DEFAULT 'draft'
                    CHECK (lead_status IN (
                      'draft',
                      'approved',
                      'approved_with_warnings',
                      'failed'
                    )),
  approved_at       TIMESTAMPTZ,                    -- Set when lead_status → 'approved'

  -- ── Pipeline Metadata ─────────────────────────────────────
  pipeline_duration_ms  INTEGER,                    -- Total end-to-end time
  research_duration_ms  INTEGER,
  draft_duration_ms     INTEGER,
  compliance_duration_ms INTEGER,
  is_fallback_research  BOOLEAN   DEFAULT FALSE,    -- TRUE if domain-name-only fallback used

  -- ── Timestamps ────────────────────────────────────────────
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX leads_created_at_idx      ON leads (created_at DESC);
CREATE INDEX leads_compliance_status_idx ON leads (compliance_status);
CREATE INDEX leads_lead_status_idx     ON leads (lead_status);
CREATE INDEX leads_company_url_idx     ON leads (company_url);
```

**Column reference:**

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| company_url | TEXT | NO | — | Raw URL as submitted |
| company_name | TEXT | YES | NULL | Extracted by Research Agent |
| research_summary | TEXT | YES | NULL | Human-readable summary |
| research_json | JSONB | YES | NULL | Full structured research output |
| generated_email | TEXT | YES | NULL | Raw Drafter Agent output |
| final_email | TEXT | YES | NULL | Post-edit version (PATCH endpoint) |
| compliance_status | TEXT | NO | 'pending' | Enum via CHECK constraint |
| compliance_notes | JSONB | YES | NULL | Array of ComplianceFlag objects |
| lead_status | TEXT | NO | 'draft' | Enum via CHECK constraint |
| approved_at | TIMESTAMPTZ | YES | NULL | Set on approval |
| pipeline_duration_ms | INTEGER | YES | NULL | Total pipeline time |
| research_duration_ms | INTEGER | YES | NULL | Research step time |
| draft_duration_ms | INTEGER | YES | NULL | Draft step time |
| compliance_duration_ms | INTEGER | YES | NULL | Compliance step time |
| is_fallback_research | BOOLEAN | NO | FALSE | Domain-only fallback flag |
| created_at | TIMESTAMPTZ | NO | NOW() | Auto-set |
| updated_at | TIMESTAMPTZ | NO | NOW() | Auto-updated via trigger |

---

### Table: `pipeline_runs`

Step-level audit log. One row per agent execution. Enables
debugging, retry logic, and per-step timing.

```sql
CREATE TABLE pipeline_runs (
  -- ── Identity ──────────────────────────────────────────────
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── Foreign Key ───────────────────────────────────────────
  lead_id     UUID          NOT NULL
              REFERENCES leads(id)
              ON DELETE CASCADE,

  -- ── Step Info ─────────────────────────────────────────────
  step        TEXT          NOT NULL
              CHECK (step IN ('research', 'draft', 'compliance', 'regenerate')),

  status      TEXT          NOT NULL
              CHECK (status IN ('running', 'completed', 'failed', 'skipped')),

  -- ── Output ────────────────────────────────────────────────
  output      JSONB,                    -- Full agent output (for debugging)
  error       JSONB,                    -- Error details if status = 'failed'

  -- ── Timing ────────────────────────────────────────────────
  duration_ms INTEGER,                  -- Step execution time in milliseconds
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ── Timestamps ────────────────────────────────────────────
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER pipeline_runs_updated_at
  BEFORE UPDATE ON pipeline_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX pipeline_runs_lead_id_idx ON pipeline_runs (lead_id);
CREATE INDEX pipeline_runs_step_idx    ON pipeline_runs (step);
CREATE INDEX pipeline_runs_status_idx  ON pipeline_runs (status);
```

**Column reference:**

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| lead_id | UUID | NO | — | FK → leads.id, CASCADE delete |
| step | TEXT | NO | — | 'research' / 'draft' / 'compliance' / 'regenerate' |
| status | TEXT | NO | — | 'running' / 'completed' / 'failed' / 'skipped' |
| output | JSONB | YES | NULL | Full agent output for debugging |
| error | JSONB | YES | NULL | Error details on failure |
| duration_ms | INTEGER | YES | NULL | Step execution milliseconds |
| started_at | TIMESTAMPTZ | NO | NOW() | When step started |
| created_at | TIMESTAMPTZ | NO | NOW() | Auto-set |
| updated_at | TIMESTAMPTZ | NO | NOW() | Auto-updated via trigger |

---

### JSONB Schemas

**`compliance_notes` (in leads table)**

```json
[
  {
    "id": "flag_001",
    "flagged_phrase": "guaranteed high returns",
    "rule_violated": "Assured return language prohibited in marketing materials",
    "rule_source": "RBI Circular RBI/2023-24/47",
    "suggested_replacement": "up to X% p.a. returns, subject to applicable terms and bank policies",
    "severity": "critical",
    "is_fixed": false
  },
  {
    "id": "flag_002",
    "flagged_phrase": "100% safe investment",
    "rule_violated": "Misleading safety claims — no financial instrument is unconditionally safe",
    "rule_source": "SEBI LODR Regulations 2015 — Schedule III",
    "suggested_replacement": "capital protection subject to scheme terms and conditions",
    "severity": "critical",
    "is_fixed": true
  }
]
```

**`research_json` (in leads table)**

```json
{
  "company_name": "Jupiter Money",
  "company_url": "https://jupiter.money",
  "description": "Neo-banking platform targeting salaried millennials in India with savings accounts, instant loans, and investment products.",
  "existing_products": [
    "Savings account (2.5% interest via Federal Bank)",
    "Instant personal loans up to ₹5L",
    "Mutual fund investments",
    "UPI payments and expense tracking"
  ],
  "identified_gaps": [
    "No fixed deposit product for risk-averse users",
    "No fixed-income option for users wanting predictable returns",
    "No bank-backed FD booking flow within the app"
  ],
  "target_users": "Salaried urban millennials aged 22-35",
  "recent_news": "Raised Series C of $86M in 2021. Focused on credit products in 2024.",
  "tech_stack_hints": "React Native mobile app, API-first architecture",
  "decision_maker_hints": [
    "CTO / VP Engineering (API integration decision)",
    "Head of Product (feature roadmap decision)",
    "CFO / Head of Partnerships (commercial decision)"
  ],
  "data_confidence": "high",
  "scrape_fallback_used": false
}
```

**`output` (in pipeline_runs table)**

For step = 'compliance':
```json
{
  "status": "fail",
  "flagged_count": 2,
  "flagged_phrases": ["guaranteed high returns", "100% safe"],
  "model_used": "claude-sonnet-4-20250514",
  "prompt_tokens": 842,
  "completion_tokens": 391,
  "total_tokens": 1233
}
```

---

### Supabase RLS Policies

```sql
-- Enable RLS
ALTER TABLE leads         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

-- Service role (backend uses SERVICE_ROLE key) — full access
CREATE POLICY "Service role full access on leads"
  ON leads FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on pipeline_runs"
  ON pipeline_runs FOR ALL
  USING (auth.role() = 'service_role');

-- Block all anonymous access
-- (No permissive anon policies = anon blocked by default)
```

---

## 4. Pydantic Models

```python
# models/compliance.py
from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime

class ComplianceFlag(BaseModel):
    id: str
    flagged_phrase: str
    rule_violated: str
    rule_source: str
    suggested_replacement: str
    severity: Literal["critical", "warning"]
    is_fixed: bool = False

class ComplianceResult(BaseModel):
    status: Literal["pass", "fail", "advisory", "unavailable"]
    flags: list[ComplianceFlag] = []
    checked_at: str


# models/lead.py
from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional, Literal
from datetime import datetime
import uuid

class LeadCreate(BaseModel):
    company_url: str

    @field_validator("company_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("company_url is required")
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        try:
            from urllib.parse import urlparse
            result = urlparse(v)
            if not result.netloc:
                raise ValueError("Invalid URL format")
        except Exception:
            raise ValueError("Invalid URL format. Example: https://company.com")
        return v

class LeadUpdate(BaseModel):
    final_email: Optional[str] = None
    compliance_status: Optional[Literal[
        "pending", "pass", "fail", "advisory", "unavailable"
    ]] = None
    lead_status: Optional[Literal[
        "draft", "approved", "approved_with_warnings", "failed"
    ]] = None

    model_config = {"extra": "forbid"}  # Reject unknown fields

class LeadResponse(BaseModel):
    id: str
    company_url: str
    company_name: Optional[str]
    research_summary: Optional[str]
    research_json: Optional[dict]
    generated_email: Optional[str]
    final_email: Optional[str]
    compliance_status: str
    compliance_notes: Optional[list[dict]]
    lead_status: str
    approved_at: Optional[datetime]
    pipeline_duration_ms: Optional[int]
    is_fallback_research: bool
    created_at: datetime
    updated_at: datetime

class LeadListResponse(BaseModel):
    leads: list[LeadResponse]
    total: int
    page: int
    limit: int
    has_more: bool


# models/pipeline.py
from pydantic import BaseModel
from typing import Literal, Optional, Any

class PipelineEvent(BaseModel):
    event: Literal[
        "step_start",
        "step_complete",
        "step_error",
        "step_warning",
        "pipeline_complete",
        "pipeline_error"
    ]
    step: Optional[Literal["research", "draft", "compliance"]] = None
    timestamp: str                # "14:32:07" — DM Mono format for frontend
    data: Optional[Any] = None
    error: Optional[dict] = None
    lead_id: Optional[str] = None
```

---

## 5. API Endpoints

### Base URL

```
Local:      http://localhost:8000
Production: https://blostem-outreach-backend.onrender.com
```

### Auth Header (required on all non-health endpoints)

```
X-Admin-Key: <value from ADMIN_API_KEY env var>
```

---

### `POST /api/leads/generate`

**Purpose:** Accept a fintech company URL, run the full 3-agent
pipeline, and stream step-by-step progress back to the frontend.

**Auth:** Required (`X-Admin-Key`)

**Rate Limit:** 10 requests / 60 seconds per IP

**Request Body:**
```json
{
  "company_url": "https://jupiter.money"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `company_url` | Required. Must be non-empty string. Must start with `http://` or `https://`. Must have valid domain. Max 2048 characters. |

**Response:** `200 OK` — `text/event-stream` (SSE)

**SSE Event Stream:**

```
// Event 1 — Research starts
data: {"event": "step_start", "step": "research", "timestamp": "14:32:07", "data": {"url": "https://jupiter.money"}}

// Event 2 — Research completes
data: {"event": "step_complete", "step": "research", "timestamp": "14:32:19", "data": {
  "company_name": "Jupiter Money",
  "description": "Neo-banking platform for salaried millennials...",
  "existing_products": ["Savings account", "Instant loans", "Mutual funds"],
  "identified_gaps": ["No fixed deposit product", "No fixed-income option"],
  "target_users": "Salaried urban millennials aged 22-35",
  "data_confidence": "high"
}}

// Event 3 — Draft starts
data: {"event": "step_start", "step": "draft", "timestamp": "14:32:20", "data": null}

// Event 4 — Draft completes
data: {"event": "step_complete", "step": "draft", "timestamp": "14:32:34", "data": {
  "subject": "Adding Fixed Returns to Jupiter's Product Suite — Blostem FD API",
  "body": "Hi [Name],\n\nI came across Jupiter Money recently and was impressed by...",
  "word_count": 214
}}

// Event 5 — Compliance starts
data: {"event": "step_start", "step": "compliance", "timestamp": "14:32:35", "data": null}

// Event 6 — Compliance completes (PASS)
data: {"event": "step_complete", "step": "compliance", "timestamp": "14:32:46", "data": {
  "status": "pass",
  "flags": [],
  "checked_at": "14:32:46"
}}

// Event 7 — Pipeline complete
data: {"event": "pipeline_complete", "lead_id": "3f8a9c2e-...", "timestamp": "14:32:46", "data": {
  "id": "3f8a9c2e-4b1d-4f3a-a8c9-2e3f4a5b6c7d",
  "company_url": "https://jupiter.money",
  "company_name": "Jupiter Money",
  "research_summary": "Neo-banking platform...",
  "generated_email": "Subject: Adding Fixed Returns...\n\n...",
  "compliance_status": "pass",
  "compliance_notes": [],
  "lead_status": "draft",
  "pipeline_duration_ms": 39000,
  "created_at": "2026-04-19T14:32:07Z",
  "updated_at": "2026-04-19T14:32:46Z"
}}
```

**SSE Event Stream (FAIL path):**

```
// ... step_start events same as above ...

// Compliance fails
data: {"event": "step_complete", "step": "compliance", "timestamp": "14:32:46", "data": {
  "status": "fail",
  "flags": [
    {
      "id": "flag_001",
      "flagged_phrase": "guaranteed high returns",
      "rule_violated": "Assured return language prohibited in marketing materials",
      "rule_source": "RBI Circular RBI/2023-24/47",
      "suggested_replacement": "up to X% p.a. returns, subject to applicable terms and bank policies",
      "severity": "critical",
      "is_fixed": false
    }
  ],
  "checked_at": "14:32:46"
}}

data: {"event": "pipeline_complete", "lead_id": "...", "data": { ...lead with compliance_status: "fail"... }}
```

**Error Events:**

```
// Research fails
data: {"event": "step_error", "step": "research", "timestamp": "14:32:28", "error": {
  "code": "RESEARCH_FAILED",
  "message": "Could not retrieve data from this URL. The site may be unavailable.",
  "recoverable": true,
  "recovery_options": ["retry", "use_domain_only"]
}}

// Draft fails
data: {"event": "step_error", "step": "draft", "timestamp": "14:32:55", "error": {
  "code": "DRAFT_FAILED",
  "message": "Email drafting failed. Please try again.",
  "recoverable": true,
  "recovery_options": ["retry_draft"]
}}
```

**HTTP Error Responses (before stream opens):**

```json
// 400 Bad Request — validation failure
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid URL format. Example: https://company.com",
    "field": "company_url"
  }
}

// 401 Unauthorized
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing admin key"
  }
}

// 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Max 10 requests per 60 seconds. Try again later.",
    "retry_after": 47
  }
}
```

**Side Effects:**
- Creates 1 row in `leads` table at pipeline start (status: 'pending')
- Creates 3 rows in `pipeline_runs` table (one per step)
- Updates `leads` row incrementally as each agent completes
- If pipeline fails partway, the `leads` row is saved with
  `lead_status = 'failed'` and the partial data that was collected

---

### `GET /api/leads`

**Purpose:** Return paginated list of all leads, sorted newest first.

**Auth:** Required (`X-Admin-Key`)

**Rate Limit:** 60 requests / 60 seconds per IP

**Query Parameters:**

| Param | Type | Default | Validation | Description |
|-------|------|---------|------------|-------------|
| `page` | integer | 1 | ≥ 1 | Page number |
| `limit` | integer | 20 | 1–100 | Results per page |
| `status` | string | — | One of: 'draft', 'approved', 'approved_with_warnings', 'failed' | Filter by lead_status |
| `compliance` | string | — | One of: 'pass', 'fail', 'advisory', 'pending', 'unavailable' | Filter by compliance_status |

**Example Request:**
```
GET /api/leads?page=1&limit=20&status=draft
```

**Response: `200 OK`**
```json
{
  "leads": [
    {
      "id": "3f8a9c2e-4b1d-4f3a-a8c9-2e3f4a5b6c7d",
      "company_url": "https://jupiter.money",
      "company_name": "Jupiter Money",
      "research_summary": "Neo-banking platform targeting salaried millennials...",
      "generated_email": "Subject: Adding Fixed Returns...\n\nHi [Name],\n\n...",
      "final_email": null,
      "compliance_status": "pass",
      "compliance_notes": [],
      "lead_status": "draft",
      "approved_at": null,
      "pipeline_duration_ms": 39000,
      "is_fallback_research": false,
      "created_at": "2026-04-19T14:32:07Z",
      "updated_at": "2026-04-19T14:32:46Z"
    }
  ],
  "total": 47,
  "page": 1,
  "limit": 20,
  "has_more": true
}
```

**Error Responses:**

```json
// 400 — Invalid query param
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid status filter. Must be one of: draft, approved, approved_with_warnings, failed",
    "field": "status"
  }
}

// 401 — Missing/invalid auth
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing admin key"
  }
}

// 500 — Database error
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Could not load leads. Please try again."
  }
}
```

**Side Effects:** None (read-only)

---

### `GET /api/leads/{id}`

**Purpose:** Return full detail of a single lead by UUID.

**Auth:** Required (`X-Admin-Key`)

**Rate Limit:** 60 requests / 60 seconds per IP

**Path Parameters:**

| Param | Type | Validation |
|-------|------|------------|
| `id` | string (UUID) | Must be valid UUID v4 format |

**Example Request:**
```
GET /api/leads/3f8a9c2e-4b1d-4f3a-a8c9-2e3f4a5b6c7d
```

**Response: `200 OK`**
```json
{
  "id": "3f8a9c2e-4b1d-4f3a-a8c9-2e3f4a5b6c7d",
  "company_url": "https://jupiter.money",
  "company_name": "Jupiter Money",
  "research_summary": "Neo-banking platform targeting salaried millennials in India...",
  "research_json": {
    "company_name": "Jupiter Money",
    "description": "Neo-banking platform...",
    "existing_products": ["Savings account", "Instant loans", "Mutual funds"],
    "identified_gaps": ["No fixed deposit product", "No fixed-income option"],
    "target_users": "Salaried urban millennials aged 22-35",
    "recent_news": "Raised Series C of $86M in 2021.",
    "decision_maker_hints": ["CTO / VP Engineering", "Head of Product"],
    "data_confidence": "high",
    "scrape_fallback_used": false
  },
  "generated_email": "Subject: Adding Fixed Returns to Jupiter's Product Suite — Blostem FD API\n\nHi [Name],\n\n...",
  "final_email": null,
  "compliance_status": "fail",
  "compliance_notes": [
    {
      "id": "flag_001",
      "flagged_phrase": "guaranteed high returns",
      "rule_violated": "Assured return language prohibited in marketing materials",
      "rule_source": "RBI Circular RBI/2023-24/47",
      "suggested_replacement": "up to X% p.a. returns, subject to applicable terms and bank policies",
      "severity": "critical",
      "is_fixed": false
    }
  ],
  "lead_status": "draft",
  "approved_at": null,
  "pipeline_duration_ms": 41000,
  "research_duration_ms": 12000,
  "draft_duration_ms": 14000,
  "compliance_duration_ms": 11000,
  "is_fallback_research": false,
  "created_at": "2026-04-19T14:32:07Z",
  "updated_at": "2026-04-19T14:32:46Z"
}
```

**Error Responses:**

```json
// 400 — Invalid UUID format
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid lead ID format. Must be a valid UUID.",
    "field": "id"
  }
}

// 401 — Auth
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing admin key"
  }
}

// 404 — Not found
{
  "error": {
    "code": "LEAD_NOT_FOUND",
    "message": "No lead found with this ID."
  }
}

// 500 — Database
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Could not retrieve lead. Please try again."
  }
}
```

**Side Effects:** None (read-only)

---

### `PATCH /api/leads/{id}`

**Purpose:** Update a lead's email content and/or status. Used for:
- Approve action (sets `lead_status` → `'approved'`)
- Inline email edits (sets `final_email`)
- Approve with warnings (sets `lead_status` → `'approved_with_warnings'`)

**Auth:** Required (`X-Admin-Key`)

**Rate Limit:** 30 requests / 60 seconds per IP

**Path Parameters:**

| Param | Type | Validation |
|-------|------|------------|
| `id` | string (UUID) | Must be valid UUID v4 format |

**Request Body:**
```json
{
  "final_email": "Subject: Adding Fixed Returns...\n\nHi [Name],\n\nEdited version...",
  "compliance_status": "pass",
  "lead_status": "approved"
}
```

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `final_email` | Optional. String. Max 10,000 characters. Cannot be empty string if provided. |
| `compliance_status` | Optional. Must be one of: 'pending', 'pass', 'fail', 'advisory', 'unavailable' |
| `lead_status` | Optional. Must be one of: 'draft', 'approved', 'approved_with_warnings', 'failed' |

At least one field must be present. All fields are optional but
sending an empty body returns `400`.

**Response: `200 OK`**
```json
{
  "id": "3f8a9c2e-4b1d-4f3a-a8c9-2e3f4a5b6c7d",
  "company_url": "https://jupiter.money",
  "company_name": "Jupiter Money",
  "final_email": "Subject: Adding Fixed Returns...\n\nEdited version...",
  "compliance_status": "pass",
  "lead_status": "approved",
  "approved_at": "2026-04-19T14:35:12Z",
  "updated_at": "2026-04-19T14:35:12Z"
}
```

**Error Responses:**

```json
// 400 — Empty body
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "At least one field must be provided for update."
  }
}

// 400 — Invalid status value
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid lead_status. Must be one of: draft, approved, approved_with_warnings, failed",
    "field": "lead_status"
  }
}

// 400 — Email too long
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "final_email exceeds maximum length of 10,000 characters.",
    "field": "final_email"
  }
}

// 400 — Cannot un-approve
{
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot change lead_status from 'approved' back to 'draft'."
  }
}

// 401 — Auth
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing admin key"
  }
}

// 404 — Not found
{
  "error": {
    "code": "LEAD_NOT_FOUND",
    "message": "No lead found with this ID."
  }
}

// 500 — Database
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Could not update lead. Please try again."
  }
}
```

**Side Effects:**
- If `lead_status` is set to `'approved'` or `'approved_with_warnings'`,
  `approved_at` is automatically set to `NOW()` in the database.
- If `final_email` is provided, it is saved separately from
  `generated_email` (original draft is always preserved).

---

### `POST /api/leads/{id}/regenerate`

**Purpose:** Re-run only the Drafter Agent + Compliance Agent for
an existing lead, skipping the research step. Uses the cached
`research_json` from the original run.

Useful when the user wants a different tone, angle, or shorter email.

**Auth:** Required (`X-Admin-Key`)

**Rate Limit:** 10 requests / 60 seconds per IP

**Path Parameters:**

| Param | Type | Validation |
|-------|------|------------|
| `id` | string (UUID) | Must be valid UUID v4 format |

**Request Body:** Empty `{}` or omitted entirely.

**Response:** `200 OK` — `text/event-stream` (SSE)

**SSE Event Stream:**

```
// Skips research — starts at draft
data: {"event": "step_start", "step": "draft", "timestamp": "14:38:02", "data": {"regeneration": true}}

data: {"event": "step_complete", "step": "draft", "timestamp": "14:38:16", "data": {
  "subject": "Unlocking Fixed Income for Jupiter Users — Blostem FD API",
  "body": "Hi [Name],\n\nJupiter has done an impressive job...",
  "word_count": 198
}}

data: {"event": "step_start", "step": "compliance", "timestamp": "14:38:17", "data": null}

data: {"event": "step_complete", "step": "compliance", "timestamp": "14:38:28", "data": {
  "status": "pass",
  "flags": [],
  "checked_at": "14:38:28"
}}

data: {"event": "pipeline_complete", "lead_id": "3f8a9c2e-...", "data": { ...updated lead object... }}
```

**HTTP Error Responses (before stream opens):**

```json
// 400 — Lead has no research data (can't regenerate without it)
{
  "error": {
    "code": "NO_RESEARCH_DATA",
    "message": "Cannot regenerate — this lead has no research data. Run the full pipeline instead."
  }
}

// 400 — Lead is already approved (cannot regenerate)
{
  "error": {
    "code": "LEAD_ALREADY_APPROVED",
    "message": "Cannot regenerate an approved lead."
  }
}

// 401, 404, 429, 500 — same format as other endpoints
```

**Side Effects:**
- `generated_email` in `leads` table is **overwritten** with new draft
- `final_email` is **cleared** (set to NULL) — user must re-edit/approve
- `compliance_status` is reset to 'pending', then updated to new result
- `compliance_notes` is overwritten with new compliance result
- New rows created in `pipeline_runs` for the 'draft' and 'compliance' steps
- Research data (`research_json`, `research_summary`) is untouched

---

### `GET /health`

**Purpose:** Health check for Render's uptime monitoring and
UptimeRobot ping (prevents cold start).

**Auth:** None required

**Response: `200 OK`**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-04-19T14:32:07Z"
}
```

---

## 6. Agent Prompts

All three agents use `claude-sonnet-4-20250514` via the Anthropic API.
All return structured JSON output.

---

### Agent 1: Research Agent

**File:** `agents/research_agent.py`

**Input:**
- `url`: The sanitized company URL
- `scraped_content`: Raw text returned by Tavily API
- `fallback_mode`: Boolean — True if Tavily failed and only domain name is available

**System Prompt:**

```
You are a B2B market research analyst specializing in Indian fintech companies.

Your job is to analyze a target company and produce a structured research summary
that a business development manager can use to write a personalized sales email.

You will be given either:
(A) Scraped content from the company's website, or
(B) Just the company domain name (fallback mode — limited data available)

OUTPUT FORMAT:
You must respond ONLY with a valid JSON object. No preamble, no explanation,
no markdown code fences. Raw JSON only.

The JSON must match this exact schema:
{
  "company_name": "string — official company name (infer from URL if not found)",
  "description": "string — 1-2 sentence summary of what the company does",
  "existing_products": ["array of strings — each product or service offered"],
  "identified_gaps": ["array of strings — each gap that Blostem FD API could fill"],
  "target_users": "string — who the company's customers are",
  "recent_news": "string — any funding rounds, expansions, or notable events, or null",
  "tech_stack_hints": "string — any visible tech stack information, or null",
  "decision_maker_hints": ["array of strings — likely decision-maker roles for API partnerships"],
  "data_confidence": "string — one of: high, medium, low",
  "scrape_fallback_used": boolean
}

RESEARCH INSTRUCTIONS:

1. COMPANY NAME: Extract the official company name from the website title,
   logo alt text, or prominent headings. Do not use the domain name alone
   unless no other option exists.

2. EXISTING PRODUCTS: List every financial product or service the company
   currently offers. Be specific — include product names, interest rates,
   or limits if mentioned.

3. IDENTIFIED GAPS — THIS IS THE MOST IMPORTANT FIELD:
   Identify 2-4 specific gaps in the company's product suite that
   Blostem's Fixed Deposit API could fill. Focus on:
   - Absence of fixed deposit or fixed-income products
   - Lack of bank-backed FD booking capability
   - No interest rate comparison for deposits
   - Missing KYC integration for banking products
   - Absence of fixed-return options for risk-averse users
   Each gap should be phrased as an opportunity, e.g.,
   "No fixed deposit product for risk-averse users seeking predictable returns"

4. DATA CONFIDENCE:
   - "high": Found company name, products list, and at least 2 clear gaps
   - "medium": Found company name and description but product list is incomplete
   - "low": Only domain name available or site returned minimal content

5. FALLBACK MODE: If scrape_fallback_used is true, set data_confidence to "low"
   and populate only company_name (from domain) and identified_gaps with
   generic FD API gaps. Leave other fields as null.

IMPORTANT CONSTRAINTS:
- Never invent specific financial figures (revenue, user counts) unless
  explicitly stated in the scraped content
- Never claim a company does NOT have a product unless you have clear
  evidence — phrase gaps as "No [product] visible in current offering"
- Keep descriptions factual and concise
- identified_gaps must always contain at least 1 item
```

**User Prompt Template:**

```python
def build_research_prompt(url: str, scraped_content: str, fallback_mode: bool) -> str:
    if fallback_mode:
        return f"""
FALLBACK MODE: Website scraping failed for this URL.
URL: {url}
Domain: {urlparse(url).netloc}

Since no website content is available, generate a research summary using
only the domain name as context. Set scrape_fallback_used to true and
data_confidence to "low". Populate identified_gaps with generic FD API
opportunities relevant to Indian fintech companies.
"""
    return f"""
TARGET COMPANY URL: {url}

SCRAPED WEBSITE CONTENT:
{scraped_content[:8000]}

Analyze the above content and return the research JSON as instructed.
Focus especially on identifying GAPS that Blostem's Fixed Deposit API could fill.
"""
```

---

### Agent 2: Drafter Agent

**File:** `agents/drafter_agent.py`

**Input:**
- `research_json`: Output from Research Agent (dict)
- `is_fallback`: Boolean — whether research used fallback mode

**Blostem Context (hardcoded in system prompt):**

```
Blostem provides white-label Fixed Deposit APIs for Indian fintech companies.

Core products and capabilities:
- FD Booking API: Allows fintechs to offer bank-backed FD investment directly
  within their app — users never leave the fintech interface
- Interest Rate Comparison: Real-time comparison of FD rates across 20+ partner
  banks — helps fintechs offer best-in-class rates to their users
- KYC Integration: Pre-built KYC flow compatible with Aadhaar, PAN, and
  V-CIP — eliminates the need for fintechs to build banking KYC from scratch
- Portfolio Management: API for tracking a user's FD portfolio, maturity dates,
  interest accrual, and auto-renewal settings
- Compliance Layer: All FDs are with RBI-licensed banks — Blostem handles
  the regulatory compliance, not the fintech partner

Business model: Blostem charges a revenue share or platform fee per FD booked.
Integration: RESTful APIs with comprehensive documentation and sandbox environment.
Typical integration time: 2-4 weeks for a production-ready FD feature.
Current partners include early-stage and Series A-B fintech companies in India.
```

**System Prompt:**

```
You are a senior business development writer specializing in B2B fintech sales.

Your task is to write a personalized, concise, and professional cold outreach
email on behalf of Blostem — a Fixed Deposit API provider for Indian fintechs.

The email will be sent to a senior decision-maker (CTO, VP Product, or Head of
Partnerships) at the target company. They receive 20+ cold emails per day and
ignore generic ones immediately.

BLOSTEM CONTEXT:
Blostem provides white-label Fixed Deposit APIs for Indian fintech companies.
Core capabilities:
- FD Booking API: Bank-backed FD investment directly within the fintech app
- Interest Rate Comparison: Real-time rates across 20+ partner banks
- KYC Integration: Aadhaar/PAN/V-CIP compatible, fully compliant
- Portfolio Management: FD tracking, maturity, auto-renewal via API
- Compliance Layer: All FDs with RBI-licensed banks — Blostem handles regulation

EMAIL REQUIREMENTS:
1. LENGTH: 150-280 words total (subject line not counted). This is firm.
   Busy executives do not read long emails.

2. STRUCTURE:
   - Subject line: Specific, mentions their product or company name, under 10 words
   - Greeting: "Hi [First Name]," (use [First Name] as placeholder)
   - Paragraph 1 (2-3 sentences): Show you understand their product. Reference
     something specific from their app or business. Establish credibility.
   - Paragraph 2 (2-3 sentences): Identify the specific gap. Frame it as an
     opportunity, not a criticism. Connect the gap to their users' needs.
   - Paragraph 3 (2-3 sentences): Introduce Blostem's relevant API capability.
     Be specific — name the exact API feature that solves their gap.
     Mention a concrete benefit (e.g., "2-4 week integration", "20+ bank partners").
   - CTA (1 sentence): Ask for a short 20-minute call. Specific and low-friction.
   - Sign-off: "Best,\n[Your Name]\nBlostem | [email@blostem.in]"

3. PERSONALIZATION (MANDATORY):
   - Must reference the target company's name at least once
   - Must reference at least 1 specific product or feature from their portfolio
   - Must connect to at least 1 specific gap identified in the research

4. TONE: Professional but human. Confident but not pushy. Write like a person,
   not a template. Avoid buzzwords like "synergy", "leverage", "seamless",
   "robust", "cutting-edge", "innovative".

5. COMPLIANCE PRE-CHECK (apply before outputting):
   Do NOT include any of the following:
   - "guaranteed returns" or any variant
   - "100% safe" or "risk-free"
   - "best returns in the market" or superlative claims without data
   - "assured profit" or "assured income"
   - Any promise of specific return percentages without qualifiers
   Instead use qualified language: "up to X% p.a.", "subject to applicable terms",
   "returns vary by bank and tenure"

OUTPUT FORMAT:
Return ONLY a valid JSON object with this exact schema. No preamble, no explanation.

{
  "subject": "string — email subject line",
  "body": "string — full email body including greeting and sign-off, newlines as \\n",
  "word_count": integer,
  "company_references": ["array of strings — company-specific details used"],
  "blostem_capabilities_mentioned": ["array of strings — which Blostem APIs were referenced"]
}
```

**User Prompt Template:**

```python
def build_draft_prompt(research_json: dict, is_fallback: bool) -> str:
    fallback_warning = ""
    if is_fallback:
        fallback_warning = """
NOTE: Research data for this company is limited (website scraping failed).
The email will be less personalized than usual. Use only the information
provided and do not invent specific details about the company.
"""
    return f"""
TARGET COMPANY RESEARCH:
{json.dumps(research_json, indent=2)}
{fallback_warning}
Write the personalized outreach email as instructed.
Ensure all company-specific details come only from the research JSON above.
Do not invent or assume any product names, features, or metrics not present in the research.
"""
```

---

### Agent 3: Compliance Agent

**File:** `agents/compliance_agent.py`

**Input:**
- `email_subject`: Subject line string
- `email_body`: Email body string

**System Prompt:**

```
You are a regulatory compliance officer specializing in RBI and SEBI
marketing guidelines for Indian financial products and services.

Your job is to review a B2B sales email written on behalf of a fintech
infrastructure company (Blostem) and check it against Indian financial
marketing regulations.

COMPLIANCE RULES TO CHECK:

RULE 1 — GUARANTEED RETURNS LANGUAGE (Critical)
Source: RBI Circular RBI/2023-24/47 — Prohibition on assured return language
Trigger phrases (check for all variants):
- "guaranteed returns", "guaranteed income", "guaranteed profit"
- "assured returns", "assured income", "assured profit"
- "100% returns", "certain returns"
- Any phrase implying returns are guaranteed without qualification
Safe alternatives: "up to X% p.a.", "returns subject to applicable terms",
"interest rates as offered by partner banks"

RULE 2 — SAFETY CLAIMS (Critical)
Source: SEBI LODR Regulations 2015 — Schedule III — Prohibition on misleading claims
Trigger phrases:
- "100% safe", "completely safe", "fully safe", "risk-free", "no risk"
- "absolutely safe", "zero risk", "loss-proof"
Safe alternatives: "capital protection subject to scheme terms",
"fixed deposits with RBI-licensed banks", "bank-backed deposits"

RULE 3 — SUPERLATIVE CLAIMS WITHOUT DATA (Warning)
Source: ASCI Guidelines + SEBI Advertising Code
Trigger phrases:
- "best returns in the market", "highest returns", "best rates"
- "market-leading", "unbeatable rates", "lowest fees in India"
- Any superlative claim (best, highest, most, largest, only) without
  a cited data source and date
Safe alternative: Add qualifier — "among the highest rates available"
or cite a source

RULE 4 — MISLEADING COMPARISONS (Warning)
Source: SEBI Circular SEBI/HO/IMD/2021 — Comparative advertising guidelines
Trigger: Comparing Blostem's rates or products to specific competitors
by name without objective, dated data
Safe approach: Remove competitor names or add "as per [source], [date]"

RULE 5 — MISSING RISK DISCLAIMER FOR INVESTMENT PRODUCTS (Warning)
Source: SEBI LODR Regulations 2015
This is a B2B email selling API services, NOT a direct investment product.
Therefore, a full risk disclaimer is NOT required in a B2B outreach email.
However, flag if the email makes any direct investment performance claims
to end consumers (this would be out of scope for a B2B sales email).

OUTPUT FORMAT:
Return ONLY a valid JSON object. No preamble, no explanation, no markdown.

{
  "status": "pass" | "fail" | "advisory",
  "flagged_phrases": [
    {
      "id": "flag_001",
      "flagged_phrase": "exact phrase from the email",
      "rule_violated": "human-readable rule description",
      "rule_source": "exact regulation citation",
      "suggested_replacement": "exact compliant replacement phrase",
      "severity": "critical" | "warning"
    }
  ],
  "overall_notes": "string — 1 sentence summary of compliance result",
  "checked_at": "string — current time in HH:MM:SS format"
}

STATUS LOGIC:
- "pass": No flagged phrases found. Email is compliant.
- "fail": One or more "critical" severity flags found. Email must be fixed.
- "advisory": Only "warning" severity flags found. Email can be sent but
  improvements are recommended.

IMPORTANT:
- If the email contains NONE of the trigger phrases, return status: "pass"
  with an empty flagged_phrases array.
- Only flag phrases that are actually present in the provided email.
- Do not flag phrases that don't exist in the email.
- Be precise — extract the exact flagged phrase as it appears in the email.
- The suggested_replacement must be a drop-in replacement that fits
  grammatically in the same sentence.

MANDATORY TEST CASES (these phrases MUST always be flagged if present):
1. "guaranteed returns" → CRITICAL → Rule 1
2. "100% safe investment" → CRITICAL → Rule 2
3. "best returns in the market" → WARNING → Rule 3
4. "no risk" → CRITICAL → Rule 2
5. "assured profit" → CRITICAL → Rule 1
```

**User Prompt Template:**

```python
def build_compliance_prompt(subject: str, body: str) -> str:
    return f"""
Review the following B2B sales email for regulatory compliance.

EMAIL SUBJECT:
{subject}

EMAIL BODY:
{body}

Check the email against all 5 compliance rules and return the JSON result.
Be precise — only flag phrases that are actually present in this email.
"""
```

---

## 7. Pipeline Orchestration

**File:** `services/pipeline.py`

The pipeline service coordinates the 3 agents and emits SSE events.

```python
# Simplified structure — full implementation in services/pipeline.py

import time
import json
from datetime import datetime
from typing import AsyncGenerator

import asyncio

async def retry_async(func, *args, retries=3, timeout=20, **kwargs):
    last_exception = None

    for attempt in range(retries):
        try:
            return await asyncio.wait_for(func(*args, **kwargs), timeout=timeout)
        except Exception as e:
            last_exception = e

            if attempt == retries - 1:
                raise last_exception

            await asyncio.sleep(1)

from agents.research_agent import run_research_agent
from agents.drafter_agent import run_drafter_agent
from agents.compliance_agent import run_compliance_agent
from services.scraper import scrape_url
from services.database import (
    create_lead,
    update_lead,
    create_pipeline_run,
    update_pipeline_run
)
from utils.sanitize import sanitize_url_for_prompt
from utils.timestamps import pipeline_timestamp

async def run_pipeline(company_url: str) -> AsyncGenerator[str, None]:
    """
    Runs the full 3-agent pipeline and yields SSE-formatted events.
    Creates and updates leads + pipeline_runs rows throughout.
    """
    pipeline_start = time.time()
    PIPELINE_TIMEOUT = 55

    # ── Create initial lead row ────────────────────────────
    lead = await create_lead({"company_url": company_url, "lead_status": "draft"})
    lead_id = lead["id"]

    # ── STEP 1: RESEARCH ──────────────────────────────────

    yield sse_event("step_start", step="research",
                    data={"url": company_url})

    research_run = await create_pipeline_run(lead_id, "research", "running")
    step_start = time.time()

    try:
        # Scrape the URL
        scraped_content = await scrape_url(company_url)
        fallback_mode = scraped_content is None

        # Run Research Agent
       research_result = await retry_async(
    run_research_agent,
    url=company_url,
    scraped_content=scraped_content or "",
    fallback_mode=fallback_mode
)

        research_ms = int((time.time() - step_start) * 1000)

        # Save research to lead
        await update_lead(lead_id, {
            "company_name": research_result["company_name"],
            "research_summary": research_result["description"],
            "research_json": research_result,
            "research_duration_ms": research_ms,
            "is_fallback_research": fallback_mode
        })

        await update_pipeline_run(research_run["id"], {
            "status": "completed",
            "output": research_result,
            "duration_ms": research_ms
        })

        yield sse_event("step_complete", step="research",
                        data=research_result)
if time.time() - pipeline_start > PIPELINE_TIMEOUT:
    raise Exception("Pipeline timeout exceeded")

    except Exception as e:
        await update_pipeline_run(research_run["id"], {
            "status": "failed",
            "error": {"message": str(e), "type": type(e).__name__}
        })
        await update_lead(lead_id, {"lead_status": "failed"})

        yield sse_event("step_error", step="research",
                        error={
                            "code": "RESEARCH_FAILED",
                            "message": "Could not retrieve company data. The website may be down or blocking access.",
                            "recoverable": True,
                            "recovery_options": ["retry", "use_domain_only"]
                        })
        return  # Stop the generator

    # ── STEP 2: DRAFT ─────────────────────────────────────

    yield sse_event("step_start", step="draft")

    draft_run = await create_pipeline_run(lead_id, "draft", "running")
    step_start = time.time()

    try:
        draft_result = await retry_async(
    run_drafter_agent,
    research_json=research_result,
    is_fallback=fallback_mode
)

        draft_ms = int((time.time() - step_start) * 1000)

        full_email = f"Subject: {draft_result['subject']}\n\n{draft_result['body']}"

        await update_lead(lead_id, {
            "generated_email": full_email,
            "draft_duration_ms": draft_ms
        })

        await update_pipeline_run(draft_run["id"], {
            "status": "completed",
            "output": draft_result,
            "duration_ms": draft_ms
        })

        yield sse_event("step_complete", step="draft", data=draft_result)
if time.time() - pipeline_start > PIPELINE_TIMEOUT:
    raise Exception("Pipeline timeout exceeded")

    except Exception as e:
        await update_pipeline_run(draft_run["id"], {
            "status": "failed",
            "error": {"message": str(e)}
        })
        yield sse_event("step_error", step="draft",
                        error={
                            "code": "DRAFT_FAILED",
                           "message": "Failed to generate email draft due to AI processing issue."
                            "recoverable": True,
                            "recovery_options": ["retry_draft"]
                        })
        return

    # ── STEP 3: COMPLIANCE ────────────────────────────────

    yield sse_event("step_start", step="compliance")

    compliance_run = await create_pipeline_run(lead_id, "compliance", "running")
    step_start = time.time()

    try:
        compliance_result = await retry_async(
    run_compliance_agent,
    subject=draft_result["subject"],
    body=draft_result["body"]
)

        compliance_ms = int((time.time() - step_start) * 1000)
        total_ms = int((time.time() - pipeline_start) * 1000)

        await update_lead(lead_id, {
            "compliance_status": compliance_result["status"],
            "compliance_notes": compliance_result["flagged_phrases"],
            "compliance_duration_ms": compliance_ms,
            "pipeline_duration_ms": total_ms
        })

        await update_pipeline_run(compliance_run["id"], {
            "status": "completed",
            "output": compliance_result,
            "duration_ms": compliance_ms
        })

        yield sse_event("step_complete", step="compliance",
                        data=compliance_result)

    except Exception as e:
        await update_pipeline_run(compliance_run["id"], {
            "status": "failed",
            "error": {"message": str(e)}
        })
       await update_lead(lead_id, {
    "compliance_status": "unavailable",
    "compliance_notes": []
})

        # Compliance failure is non-blocking — pipeline still completes
        yield sse_event("step_warning", step="compliance",
                        data={
                            "code": "COMPLIANCE_UNAVAILABLE",
                            "message": "Compliance check unavailable. Manual review required."
                        })

    # ── PIPELINE COMPLETE ─────────────────────────────────

    final_lead = await get_lead(lead_id)
    yield sse_event("pipeline_complete", lead_id=lead_id, data=final_lead)


def sse_event(event: str, step: str = None, data=None,
              error: dict = None, lead_id: str = None) -> str:
    """Format a server-sent event string."""
    payload = {
        "event": event,
        "timestamp": pipeline_timestamp(),
    }
    if step:     payload["step"] = step
    if data:     payload["data"] = data
    if error:    payload["error"] = error
    if lead_id:  payload["lead_id"] = lead_id

    return f"data: {json.dumps(payload)}\n\n"
```

---

## 8. Error Response Format

All HTTP errors (non-SSE) follow this standardized structure:

```json
{
  "error": {
    "code": "ERROR_CODE_IN_SCREAMING_SNAKE_CASE",
    "message": "Human-readable message for the UI to display",
    "field": "field_name_if_validation_error",
    "retry_after": 47
  }
}
```

| Field | Present When | Description |
|-------|-------------|-------------|
| `code` | Always | Machine-readable error code |
| `message` | Always | User-facing message |
| `field` | Validation errors only | Which request field caused the error |
| `retry_after` | Rate limit (429) only | Seconds until retry is allowed |

**All Error Codes:**

| Code | HTTP Status | When Used |
|------|-------------|-----------|
| `VALIDATION_ERROR` | 400 | Request field failed validation |
| `INVALID_STATE_TRANSITION` | 400 | Attempted invalid status change |
| `NO_RESEARCH_DATA` | 400 | Regenerate called with no research |
| `LEAD_ALREADY_APPROVED` | 400 | Regenerate called on approved lead |
| `UNAUTHORIZED` | 401 | Missing or invalid X-Admin-Key |
| `LEAD_NOT_FOUND` | 404 | UUID not in database |
| `RATE_LIMIT_EXCEEDED` | 429 | Per-IP rate limit hit |
| `RESEARCH_FAILED` | — | SSE event only (not HTTP) |
| `DRAFT_FAILED` | — | SSE event only (not HTTP) |
| `COMPLIANCE_UNAVAILABLE` | — | SSE event only (non-blocking) |
| `DATABASE_ERROR` | 500 | Supabase read/write failure |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 9. Rate Limiting

**Implementation:** In-memory (per Render instance).
Sufficient for MVP — single server, single tenant.

```python
# middleware/rate_limit.py
from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import Request, HTTPException
from typing import Callable

request_log: dict[str, list] = defaultdict(list)

def rate_limit(max_requests: int, window_seconds: int) -> Callable:
    """
    FastAPI dependency for per-IP rate limiting.

    Usage:
        @router.post("/api/leads/generate",
            dependencies=[Depends(rate_limit(max_requests=10, window_seconds=60))])
    """
    async def limiter(request: Request):
        client_ip = request.client.host
        now = datetime.now()
        window_start = now - timedelta(seconds=window_seconds)

        # Purge old entries outside the window
        request_log[client_ip] = [
            ts for ts in request_log[client_ip]
            if ts > window_start
        ]

        if len(request_log[client_ip]) >= max_requests:
            # Calculate seconds until oldest request falls outside window
            oldest = request_log[client_ip][0]
            retry_after = int((oldest + timedelta(seconds=window_seconds) - now).total_seconds()) + 1

            raise HTTPException(
                status_code=429,
                detail={
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": f"Max {max_requests} requests per {window_seconds}s. Try again later.",
                        "retry_after": retry_after
                    }
                },
                headers={"Retry-After": str(retry_after)}
            )

        request_log[client_ip].append(now)

    return limiter
```

**Limits by endpoint:**

| Endpoint | Max Requests | Window | Rationale |
|----------|-------------|--------|-----------|
| `POST /api/leads/generate` | 10 | 60s | Pipeline is expensive (LLM + scraping) |
| `POST /api/leads/{id}/regenerate` | 10 | 60s | Same cost as generate |
| `PATCH /api/leads/{id}` | 30 | 60s | DB writes only — more lenient |
| `GET /api/leads` | 60 | 60s | Read-only — generous limit |
| `GET /api/leads/{id}` | 60 | 60s | Read-only — generous limit |
| `GET /health` | Unlimited | — | Used by UptimeRobot pinger |

---

## 10. CORS Configuration

```python
# main.py — CORS setup (must be added BEFORE route registration)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Blostem Outreach Agent API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

ALLOWED_ORIGINS = [
    # Local development
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Production Vercel deployment
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    # Vercel preview deployments (if needed during dev)
    # "https://*.vercel.app",  # Uncomment if using Vercel preview URLs
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-Admin-Key",      # Custom auth header
        "Cache-Control",
        "Accept",
        "Accept-Encoding",
        "Last-Event-ID",    # Required for SSE reconnection
    ],
    expose_headers=[
        "Content-Type",     # Required for SSE
        "X-Request-ID",
    ],
    max_age=600,            # Cache preflight for 10 minutes
)
```

**SSE-specific headers** (set on the `/generate` and `/regenerate` route responses):

```python
# In the route handler for SSE endpoints:
return StreamingResponse(
    run_pipeline(company_url),
    media_type="text/event-stream",
    headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",  # Disables Nginx buffering on Render
    }
)
```

---

## 11. Auth Middleware

```python
# middleware/auth.py
from fastapi import Request, HTTPException, Depends
import os

ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")

async def verify_admin_key(request: Request) -> None:
    """
    FastAPI dependency for X-Admin-Key verification.

    Usage:
        @router.get("/api/leads",
            dependencies=[Depends(verify_admin_key)])
    """
    api_key = request.headers.get("X-Admin-Key")

    if not api_key:
        raise HTTPException(
            status_code=401,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Missing X-Admin-Key header"
                }
            }
        )

    if api_key != ADMIN_API_KEY:
        raise HTTPException(
            status_code=401,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Invalid admin key"
                }
            }
        )
```

---

## 12. Environment Variables

```bash
# backend/.env (never commit — use .env.example as template)

# ── Anthropic ─────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# ── Tavily ────────────────────────────────────────────────────
TAVILY_API_KEY=tvly-...

# ── Supabase ──────────────────────────────────────────────────
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ── Admin Auth ────────────────────────────────────────────────
# Generate: openssl rand -hex 32
ADMIN_API_KEY=your_64_char_hex_string_here

# ── CORS ──────────────────────────────────────────────────────
# Production Vercel URL (update after first deploy)
FRONTEND_URL=https://blostem-outreach-agent.vercel.app

# ── Pipeline Config ───────────────────────────────────────────
PIPELINE_TIMEOUT_SECONDS=55
```

---

## 13. Supabase Client Wrapper

```python
# services/database.py
from supabase import create_client, Client
from pydantic_settings import BaseSettings
import os

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

async def create_lead(data: dict) -> dict:
    result = supabase.table("leads").insert(data).execute()
    return result.data[0]

async def get_lead(lead_id: str) -> dict | None:
    result = supabase.table("leads").select("*").eq("id", lead_id).execute()
    return result.data[0] if result.data else None

async def get_leads(page: int = 1, limit: int = 20,
                    status_filter: str = None,
                    compliance_filter: str = None) -> dict:
    query = supabase.table("leads").select("*", count="exact")
    if status_filter:
        query = query.eq("lead_status", status_filter)
    if compliance_filter:
        query = query.eq("compliance_status", compliance_filter)
    query = query.order("created_at", desc=True)
    query = query.range((page - 1) * limit, page * limit - 1)
    result = query.execute()
    return {
        "leads": result.data,
        "total": result.count,
        "page": page,
        "limit": limit,
        "has_more": (result.count > page * limit)
    }

async def update_lead(lead_id: str, data: dict) -> dict:
    result = supabase.table("leads").update(data).eq("id", lead_id).execute()
    return result.data[0]

async def create_pipeline_run(lead_id: str, step: str, status: str) -> dict:
    result = supabase.table("pipeline_runs").insert({
        "lead_id": lead_id,
        "step": step,
        "status": status,
    }).execute()
    return result.data[0]

async def update_pipeline_run(run_id: str, data: dict) -> dict:
    result = supabase.table("pipeline_runs").update(data).eq("id", run_id).execute()
    return result.data[0]
```

---

*End of BACKEND_STRUCTURE.md v1.0*
*Next document to generate: IMPLEMENTATION_PLAN.md*
