# Technology Stack Documentation
# Blostem Outreach Agent
**Version:** 2.0 — UI/UX Enhanced
**Constraint:** 100% Free Tier — Zero paid dependencies
**Last Updated:** April 2026

---

## 0. UI/UX Tech Additions

This version adds specific frontend dependencies and configuration
required to implement the "Dark Editorial" design direction from
PRD v2.0. These additions are binding — the visual design depends
on them.

### New Frontend Dependencies Added

```json
// Added to package.json dependencies:
"@fontsource/dm-mono": "^5.0.0",        // Monospace font for compliance labels,
                                          // timestamps, pipeline log, flagged phrases
"@fontsource-variable/cabinet-grotesk": "^5.0.0", // Display font for headings
"framer-motion": "^11.0.0",             // Compliance fail pulse animation,
                                          // approve button fill sweep,
                                          // panel slide-in transitions
"react-hot-toast": "^2.4.1"             // Toast notifications (top-right)
```

### Why Framer Motion (not CSS-only)

The compliance fail animation sequence (scan line → phrase pulse →
settle into underline) and the approve button fill sweep require
orchestrated multi-step animations that are cleanly handled by
Framer Motion's `variants` and `animate` APIs. CSS-only transitions
would require significant hack-arounds.

### Why DM Mono

Every piece of "system output" in the UI — pipeline log entries,
timestamps, compliance labels, flagged phrases, suggested replacements,
word counts, error codes — must render in a monospace font. This
creates the "terminal/command center" feel that differentiates this
tool from a generic SaaS dashboard. DM Mono is loaded via
`@fontsource/dm-mono` (no Google Fonts request, GDPR-friendly).

### Why Cabinet Grotesk

Company names, page headings, and section titles use Cabinet Grotesk
(a distinctive geometric sans with personality). Avoids the Inter/
Space Grotesk trap. Loaded via `@fontsource-variable/cabinet-grotesk`.

---

## 1. Stack Overview

### Architecture Pattern
**Decoupled Full-Stack (Separate Frontend + Backend)**

Frontend (Next.js) and Backend (FastAPI) deployed independently.
No monorepo — two separate folders: `/frontend` and `/backend`.

### Why Decoupled (Not Next.js Full-Stack)?
Next.js API routes time out at 10 seconds on Vercel's free tier.
The AI pipeline takes up to 60 seconds. FastAPI on Render runs as
a persistent server — no timeout constraint.

### Data Flow
```
User Browser (Next.js on Vercel)
    │
    │  POST /api/leads/generate
    │  GET  /api/leads
    │  PATCH /api/leads/:id
    ▼
FastAPI Server (Render)
    │
    ├──► Tavily API (web scraping)
    ├──► Anthropic API (Claude — 3 agent calls)
    └──► Supabase (PostgreSQL — read/write leads)
```

### Deployment
```
GitHub Repo (main branch)
├── /frontend  → Auto-deployed to Vercel on push to main
└── /backend   → Auto-deployed to Render on push to main
```

---

## 2. Frontend Stack

### Framework — Next.js 14.2.3

- App Router, file-based routing, TypeScript support
- Zero config deployment on Vercel
- **Free Tier:** Vercel Hobby — unlimited deployments, 100GB bandwidth

**next.config.ts:**
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

export default nextConfig
```

---

### Language — TypeScript 5.4.5

Type safety for API response handling. Critical for mapping agent
outputs (Research JSON, Compliance JSON) to UI components.

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### Styling — Tailwind CSS 3.4.1

Utility-first CSS. Extended heavily for the dark design system.
**Do not use default Tailwind colors** — all colors come from the
custom design tokens defined below.

**tailwind.config.ts:**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      // ── Design System Colors ───────────────────────────
      colors: {
        // Backgrounds (dark layers)
        'bg-base':    '#0A0F1E',   // Page background
        'bg-surface': '#111827',   // Card surfaces
        'bg-raised':  '#1F2937',   // Elevated elements, borders
        'bg-overlay': '#263244',   // Hover states

        // Brand
        'brand-indigo':  '#6366F1',  // Primary CTA, active steps
        'brand-indigo-dim': '#4338CA', // Hover state
        'brand-indigo-glow': 'rgba(99,102,241,0.2)', // Focus glow

        // Compliance semantic
        'compliance-pass':     '#22D3EE',  // Phosphor cyan — PASS
        'compliance-pass-bg':  '#0E2E33',  // PASS badge background
        'compliance-fail':     '#F87171',  // Alert red — FAIL
        'compliance-fail-bg':  '#2D0E0E',  // FAIL badge background
        'compliance-warn':     '#FBBF24',  // Amber — ADVISORY
        'compliance-warn-bg':  '#2D1E05',  // ADVISORY badge background

        // Text
        'text-primary':   '#F8FAFC',  // Main text (on dark bg)
        'text-secondary': '#94A3B8',  // Muted text
        'text-muted':     '#475569',  // Very muted (pipeline log hints)
        'text-indigo':    '#818CF8',  // Indigo-tinted text

        // Highlight (compliance flagging)
        'flag-red-bg':   '#4F0E0E',  // Flagged phrase background
        'flag-red-text': '#FECACA',  // Flagged phrase text
        'fix-green-bg':  '#0A2E1A',  // Suggested replacement background
        'fix-green-text':'#86EFAC',  // Suggested replacement text

        // shadcn/ui mapping (light mode mappings overridden for dark)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },

      // ── Typography ─────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-cabinet)', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },

      // ── Border Radius ──────────────────────────────────
      borderRadius: {
        none: '0px',
        sm:   '2px',   // badges, chips
        DEFAULT: '4px',
        md:   '6px',   // buttons, inputs
        lg:   '8px',   // cards, panels
        xl:   '12px',  // modals
        full: '9999px',
        // Override shadcn defaults
        'shadcn-lg': 'var(--radius)',
        'shadcn-md': 'calc(var(--radius) - 2px)',
        'shadcn-sm': 'calc(var(--radius) - 4px)',
      },

      // ── Custom Box Shadows (dark-mode) ─────────────────
      boxShadow: {
        'card':       '0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.4)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.5)',
        'indigo-glow':'0 0 0 3px rgba(99,102,241,0.25)',
        'red-glow':   '0 0 0 3px rgba(248,113,113,0.25)',
        'green-glow': '0 0 0 3px rgba(34,211,238,0.2)',
        'focus-ring': '0 0 0 2px #0A0F1E, 0 0 0 4px #6366F1',
      },

      // ── Keyframe Animations ────────────────────────────
      keyframes: {
        // Compliance fail: phrase pulse
        'flag-pulse': {
          '0%':   { backgroundColor: 'transparent' },
          '50%':  { backgroundColor: '#4F0E0E' },
          '100%': { backgroundColor: '#4F0E0E' },
        },
        // Compliance sweep bar (pass/fail)
        'sweep-right': {
          '0%':   { width: '0%' },
          '100%': { width: '100%' },
        },
        // Approve button fill
        'approve-fill': {
          '0%':   { backgroundSize: '0% 100%' },
          '100%': { backgroundSize: '100% 100%' },
        },
        // Pipeline log entry appear
        'log-entry': {
          '0%':   { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // Panel slide-in from right
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // Accordion
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'flag-pulse':     'flag-pulse 0.15s ease-in-out 2',
        'sweep-right':    'sweep-right 0.4s ease-out forwards',
        'approve-fill':   'approve-fill 0.5s ease-in-out forwards',
        'log-entry':      'log-entry 0.15s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.2s ease-out forwards',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

---

### State Management — Zustand 4.5.2

Manages pipeline state (current step, lead data, errors) across
the 2-column layout. Critical because left column (log) and right
column (panels) both react to the same pipeline state.

**Store Structure:**
```typescript
// src/store/pipelineStore.ts
import { create } from 'zustand'

type PipelineStep = 'idle' | 'research' | 'draft' |
                    'compliance' | 'complete' | 'error'

interface LogEntry {
  timestamp: string     // "14:32:07" — DM Mono format
  step: string          // "RESEARCH STARTED"
  status: 'active' | 'complete' | 'failed' | 'warning'
  detail?: string       // inline error or note
}

interface PipelineStore {
  currentStep: PipelineStep
  currentUrl: string
  logEntries: LogEntry[]            // Left column pipeline log
  researchSummary: ResearchSummary | null
  generatedEmail: GeneratedEmail | null
  complianceResult: ComplianceResult | null
  currentLeadId: string | null
  error: PipelineError | null
  setStep: (step: PipelineStep) => void
  addLogEntry: (entry: LogEntry) => void
  setResearch: (data: ResearchSummary) => void
  setEmail: (email: GeneratedEmail) => void
  setCompliance: (result: ComplianceResult) => void
  setError: (error: PipelineError) => void
  reset: () => void
}
```

---

### HTTP Client — Axios 1.6.8

70s timeout (pipeline max 60s + buffer). Intercepts 429 for rate
limit handling. X-Admin-Key header on all requests.

```typescript
// src/lib/api.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 70000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Key': process.env.NEXT_PUBLIC_ADMIN_KEY ?? '',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after']
      return Promise.reject({ type: 'RATE_LIMIT', retryAfter })
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ type: 'TIMEOUT' })
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

---

### UI Components — shadcn/ui

Radix UI primitives, customized heavily for dark design system.
The default shadcn light theme is entirely overridden in globals.css.

**Components to install:**
```bash
npx shadcn@latest init
npx shadcn@latest add button input card badge toast dialog
npx shadcn@latest add table textarea separator collapsible alert progress
```

---

### Animation — Framer Motion 11.0.0

Used for the following specific interactions:
- Compliance fail: flagged phrase pulse animation
- Compliance sweep bar (pass/fail)
- Approve button fill sweep
- Panel slide-in from right column
- Log entry staggered appearance

**NOT used for:** Simple CSS transitions (hover states, color
changes, accordion) — those remain Tailwind classes.

---

### Toast — react-hot-toast 2.4.1

Positioned top-right. Custom dark styling matching design system.
Replaces shadcn/ui Toast for simpler API.

```typescript
// src/lib/toast.ts
import toast from 'react-hot-toast'

export const showApproveToast = (companyName: string) => {
  toast.custom((t) => (
    <div className={`
      flex items-start gap-3 rounded-lg border border-bg-raised
      bg-bg-surface px-4 py-3 shadow-card
      border-l-4 border-l-compliance-pass
      ${t.visible ? 'animate-slide-in-right' : 'opacity-0'}
    `}>
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-compliance-pass">
          LEAD APPROVED
        </p>
        <p className="mt-0.5 text-sm font-medium text-text-primary">
          {companyName}
        </p>
        <p className="font-mono text-xs text-text-muted">
          {new Date().toLocaleTimeString('en-IN', { hour12: false })}
        </p>
      </div>
    </div>
  ), { position: 'top-right', duration: 4000 })
}
```

---

### Icons — Lucide React 0.363.0

Consistent, tree-shakeable icon set. Used throughout. In the
dark design system, icons default to `text-text-secondary`
(muted) unless actively communicating state.

---

## 3. Backend Stack

### Runtime — Python 3.11.9
### Framework — FastAPI 0.109.2
### ASGI Server — Uvicorn 0.27.1
### AI/LLM — Anthropic Python SDK 0.21.3
**Model:** `claude-sonnet-4-20250514`

### Web Scraping — Tavily Python SDK 0.3.3
1,000 API calls/month free — sufficient for hackathon.

### Database — Supabase (PostgreSQL 15)
500MB free storage. Pauses after 7 days inactivity — visit weekly.

### Data Validation — Pydantic 2.6.4
### HTTP Client — httpx 0.27.0
### Environment Variables — python-dotenv 1.0.1

*(All backend choices unchanged from v1.0 — backend is not
affected by the UI/UX design direction change)*

---

## 4. DevOps & Infrastructure

### Frontend Hosting — Vercel (Hobby)
### Backend Hosting — Render (Free)
**Cold start risk:** 30s wake-up after 15min inactivity.
Mitigation: UptimeRobot (free) pings backend every 14 minutes.

### Database — Supabase
### Version Control — GitHub

### Repo Structure
```
blostem-outreach-agent/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css          ← Dark design tokens
│   │   │   ├── layout.tsx           ← Root layout (dark bg)
│   │   │   ├── page.tsx             ← Dashboard (2-col layout)
│   │   │   └── leads/[id]/page.tsx  ← Lead detail
│   │   ├── components/
│   │   │   ├── PipelineLog.tsx      ← Left column log
│   │   │   ├── UrlInputBar.tsx
│   │   │   ├── ResearchPanel.tsx
│   │   │   ├── EmailPreviewCard.tsx
│   │   │   ├── ComplianceBadge.tsx  ← THE AHA MOMENT
│   │   │   ├── LeadsTable.tsx
│   │   │   └── ui/                  ← shadcn components
│   │   ├── store/
│   │   │   └── pipelineStore.ts     ← Zustand
│   │   └── lib/
│   │       ├── api.ts               ← Axios client
│   │       └── toast.ts             ← Custom toasts
│   ├── package.json
│   └── tailwind.config.ts
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
└── docs/
    ├── PRD.md
    ├── APP_FLOW.md
    ├── TECH_STACK.md
    ├── FRONTEND_GUIDELINES.md
    ├── BACKEND_STRUCTURE.md
    └── IMPLEMENTATION_PLAN.md
```

---

## 5. Development Tools

### ESLint 8.57.0 — unchanged from v1.0
### Prettier 3.2.5 — unchanged from v1.0
### Ruff 0.3.4 (Python) — unchanged from v1.0

---

## 6. Environment Variables

### Frontend (.env.local) — unchanged from v1.0
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ADMIN_KEY=your_admin_key_here
```

### Backend (.env) — unchanged from v1.0
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
TAVILY_API_KEY=tvly-...
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
ADMIN_API_KEY=your_admin_key_here
FRONTEND_URL=http://localhost:3000
PIPELINE_TIMEOUT_SECONDS=55
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

---

## 7. Package.json (Frontend) — Updated

```json
{
  "name": "blostem-outreach-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json}\"",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "axios": "1.6.8",
    "zustand": "4.5.2",
    "lucide-react": "0.363.0",
    "framer-motion": "^11.0.0",
    "react-hot-toast": "^2.4.1",
    "@fontsource/dm-mono": "^5.0.0",
    "@fontsource-variable/cabinet-grotesk": "^5.0.0",
    "class-variance-authority": "0.7.0",
    "clsx": "2.1.0",
    "tailwind-merge": "2.2.2",
    "tailwindcss-animate": "1.0.7",
    "@radix-ui/react-dialog": "1.0.5",
    "@radix-ui/react-collapsible": "1.0.3",
    "@radix-ui/react-separator": "1.0.3",
    "@radix-ui/react-progress": "1.0.3"
  },
  "devDependencies": {
    "typescript": "5.4.5",
    "@types/node": "20.12.5",
    "@types/react": "18.3.1",
    "@types/react-dom": "18.3.0",
    "tailwindcss": "3.4.1",
    "postcss": "8.4.38",
    "autoprefixer": "10.4.19",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.3",
    "prettier": "3.2.5"
  }
}
```

---

## 8. requirements.txt (Backend) — Unchanged

```txt
fastapi==0.109.2
uvicorn==0.27.1
pydantic==2.6.4
pydantic-settings==2.2.1
anthropic==0.21.3
tavily-python==0.3.3
supabase==2.4.0
httpx==0.27.0
python-dotenv==1.0.1
python-multipart==0.0.9
ruff==0.3.4
```

---

## 9. CORS Configuration — Unchanged from v1.0

(FastAPI CORS setup, admin key middleware, Axios config —
all identical to v1.0)

---

## 10. Security Considerations — Unchanged from v1.0

(API key management, prompt injection mitigation,
Supabase RLS, rate limiting — all identical to v1.0)

---

## 11. Free Tier Limits — Quick Reference

| Service | Free Limit | Our Usage | Risk |
|---------|-----------|-----------|------|
| Vercel Hobby | 100GB bandwidth/month | ~1MB/deploy | ✅ None |
| Render Web Service | 750 hrs/month | ~720 hrs | ⚠ Monitor |
| Render Cold Start | Sleeps after 15min | Use UptimeRobot | ⚠ Demo risk |
| Supabase | 500MB storage | ~5MB for demo | ✅ None |
| Supabase | Pauses after 7 days | Visit weekly | ⚠ Note |
| Anthropic API | ~$5 free credits | ~$0.003/run | ✅ ~1,600 runs |
| Tavily API | 1,000 searches/month | 1/pipeline run | ✅ None |
| GitHub | Unlimited private repos | 1 repo | ✅ None |
| UptimeRobot | 50 monitors free | 1 monitor | ✅ None |

---

*End of TECH_STACK.md v2.0*
