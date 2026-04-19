# Frontend Design System \& Guidelines

# Blostem Outreach Agent

**Version:** 2.0 — UI/UX Enhanced
**Stack:** Next.js 14 + Tailwind CSS 3.4.1 + shadcn/ui + Framer Motion
**Design Direction:** Dark Editorial — Compliance Command Center
**Last Updated:** April 2026

\---

## 0\. Design Direction Summary

This is NOT a generic SaaS dashboard. It is a precision compliance
tool for a BD professional in a regulated fintech company.

**Chosen Style: Dark Editorial**
A Bloomberg terminal meets a legal document. Dark, authoritative,
precise. Every design decision reinforces that this tool takes
compliance seriously.

**The One Thing Someone Will Remember:**
The compliance FAIL state — watching the AI catch a bad phrase,
highlight it in red, and offer an exact fix. That moment must be
visceral, unmissable, and visually satisfying to resolve.

**What Makes This Unforgettable:**

1. The vertical pipeline log on the left (looks like a terminal)
2. The red phrase pulse animation on compliance fail
3. The "diff block" UI for flagged vs. fixed phrases
4. The green sweep animation on approve
5. DM Mono everywhere system output appears

\---

## 1\. Design Principles

### P1 — Clarity Over Cleverness

Every element earns its place. No decorative UI. BD managers
use this on their first visit with zero onboarding.

### P2 — Trust Through Precision

This is a compliance tool for a regulated industry. Precise
language. Exact timestamps in DM Mono. Specific error messages.
Ambiguity destroys trust in fintech.

### P3 — Status Is Always Visible

The user never wonders: "Did it work?" The pipeline log on the
left is always visible during runs. Every state communicates.

### P4 — Friction Only Where It Protects

Compliance failures? Surface them dramatically. Approve with
unresolved issues? Require confirmation. Safe actions? Zero friction.

### P5 — Dark = Authoritative (New in v2.0)

Light UIs feel consumer. Dark UIs feel professional and precise.
A BD manager trusting this tool with compliance decisions needs
to feel they are operating a serious instrument.

\---

## 2\. Design Tokens

### globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/\* ── Font Imports ─────────────────────────────────────────── \*/
@import '@fontsource/dm-mono/400.css';
@import '@fontsource/dm-mono/500.css';
@import '@fontsource-variable/cabinet-grotesk';

@layer base {
  :root {
    /\* ── Background Layers (dark) ───────────────────── \*/
    --bg-base:    #0A0F1E;   /\* Page background \*/
    --bg-surface: #111827;   /\* Card surfaces \*/
    --bg-raised:  #1F2937;   /\* Borders, dividers, raised elements \*/
    --bg-overlay: #263244;   /\* Hover states \*/

    /\* ── Brand ──────────────────────────────────────── \*/
    --brand-indigo:     #6366F1;
    --brand-indigo-dim: #4338CA;
    --brand-indigo-glow: rgba(99, 102, 241, 0.2);

    /\* ── Compliance Semantic ────────────────────────── \*/
    --compliance-pass:     #22D3EE;  /\* Phosphor cyan — clinical \*/
    --compliance-pass-bg:  #0E2E33;
    --compliance-fail:     #F87171;  /\* Alert red \*/
    --compliance-fail-bg:  #2D0E0E;
    --compliance-warn:     #FBBF24;  /\* Amber — advisory \*/
    --compliance-warn-bg:  #2D1E05;

    /\* ── Text ───────────────────────────────────────── \*/
    --text-primary:   #F8FAFC;
    --text-secondary: #94A3B8;
    --text-muted:     #475569;
    --text-indigo:    #818CF8;

    /\* ── Compliance Diff Blocks ─────────────────────── \*/
    --flag-red-bg:    #4F0E0E;
    --flag-red-text:  #FECACA;
    --flag-red-border: #7F1D1D;
    --fix-green-bg:   #0A2E1A;
    --fix-green-text: #86EFAC;
    --fix-green-border: #14532D;

    /\* ── shadcn/ui (dark mode) ──────────────────────── \*/
    --background:         222 47% 8%;    /\* #0A0F1E \*/
    --foreground:         210 40% 98%;
    --card:               222 47% 8%;
    --card-foreground:    210 40% 98%;
    --popover:            222 47% 8%;
    --popover-foreground: 210 40% 98%;
    --primary:            239 84% 67%;   /\* #6366F1 \*/
    --primary-foreground: 210 40% 98%;
    --secondary:          217 33% 17%;   /\* #1F2937 \*/
    --secondary-foreground: 210 40% 98%;
    --muted:              217 33% 17%;
    --muted-foreground:   215 16% 47%;
    --accent:             217 33% 17%;
    --accent-foreground:  210 40% 98%;
    --destructive:        0 63% 71%;     /\* #F87171 \*/
    --destructive-foreground: 210 40% 98%;
    --border:             217 33% 17%;
    --input:              217 33% 17%;
    --ring:               239 84% 67%;
    --radius:             0.375rem;
  }

  /\* ── Base Reset ───────────────────────────────────── \*/
  \* { @apply border-border; }

  html { color-scheme: dark; }

  body {
    background-color: var(--bg-base);
    color: var(--text-primary);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /\* DM Mono for system output \*/
  .font-mono,
  code,
  pre,
  \[data-system-text] {
    font-family: 'DM Mono', 'JetBrains Mono', monospace;
  }

  /\* Cabinet Grotesk for headings \*/
  h1, h2, h3,
  \[data-display] {
    font-family: 'Cabinet Grotesk Variable', system-ui, sans-serif;
    font-variation-settings: 'wght' 700;
  }

  /\* ── Scrollbar (dark) ─────────────────────────────── \*/
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg-base); }
  ::-webkit-scrollbar-thumb {
    background: var(--bg-raised);
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover { background: var(--bg-overlay); }

  /\* ── Reduced Motion ───────────────────────────────── \*/
  @media (prefers-reduced-motion: reduce) {
    \*, \*::before, \*::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

/\* ── Utility Classes ──────────────────────────────────────── \*/
@layer utilities {
  /\* Pipeline log entry \*/
  .log-entry {
    @apply font-mono text-xs;
    animation: log-entry 0.15s ease-out forwards;
  }

  /\* Compliance diff blocks \*/
  .diff-flagged {
    background-color: var(--flag-red-bg);
    color: var(--flag-red-text);
    border: 1px solid var(--flag-red-border);
    @apply rounded px-3 py-2 font-mono text-sm;
  }

  .diff-fixed {
    background-color: var(--fix-green-bg);
    color: var(--fix-green-text);
    border: 1px solid var(--fix-green-border);
    @apply rounded px-3 py-2 font-mono text-sm;
  }

  /\* Inline flagged phrase (in email body) \*/
  .phrase-flagged {
    background-color: var(--flag-red-bg);
    color: var(--flag-red-text);
    border-bottom: 2px solid var(--compliance-fail);
    @apply rounded-sm px-0.5;
  }

  .phrase-flagged-pulse {
    animation: flag-pulse 0.15s ease-in-out 2 forwards;
  }

  /\* Compliance sweep bar \*/
  .sweep-bar {
    @apply absolute top-0 left-0 h-\[3px] w-0;
    animation: sweep-right 0.4s ease-out forwards;
  }

  /\* Indigo glow focus \*/
  .focus-glow:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--brand-indigo);
  }
}
```

\---

## 3\. Typography System

### Font Roles

|Font|Role|Used For|
|-|-|-|
|`Cabinet Grotesk`|Display|Page headings, company names, section titles|
|`DM Mono`|System|Pipeline log, timestamps, compliance labels, flagged phrases, word counts, error codes, badges|
|`Inter`|Body|Email content, descriptions, body text, table content|

### Type Scale

|Token|rem|px|Font|Usage|
|-|-|-|-|-|
|`text-xs`|0.75|12|DM Mono|Timestamps, labels, muted info|
|`text-sm`|0.875|14|Inter/DM Mono|Table content, secondary info|
|`text-base`|1.0|16|Inter|Email body, descriptions|
|`text-lg`|1.125|18|Cabinet Grotesk|Card headings|
|`text-xl`|1.25|20|Cabinet Grotesk|Section headings|
|`text-2xl`|1.5|24|Cabinet Grotesk|Page sub-headings|
|`text-3xl`|1.875|30|Cabinet Grotesk|Company name (hero)|

### Typography Rules (Binding)

```
✅ DM Mono MUST be used for:
   - All pipeline log entries
   - All timestamps
   - "RESEARCH COMPLETE", "COMPLIANCE PASSED" etc. labels
   - Flagged phrases (red diff block)
   - Suggested replacements (green diff block)
   - Word count / read time
   - Error codes
   - Button labels that are ALL CAPS system actions

✅ Cabinet Grotesk MUST be used for:
   - Page title ("Outreach Agent")
   - Company names in research panel and email card
   - Dashboard section headings

✅ Inter MUST be used for:
   - Email body content
   - Research summary descriptions
   - Persona descriptions
   - All prose body text

❌ NEVER use these fonts:
   - Inter for headings (looks generic SaaS)
   - System fonts for anything visible
   - Cabinet Grotesk for body text (too heavy for reading)
```

\---

## 4\. Color System

### Core Palette

```
Background Layers (dark, layered):
  #0A0F1E  bg-base      Page background
  #111827  bg-surface   Cards, panels
  #1F2937  bg-raised    Borders, dividers
  #263244  bg-overlay   Hover states

Brand:
  #6366F1  indigo       Primary CTA, active pipeline steps
  #4338CA  indigo-dim   Hover on indigo
  #818CF8  indigo-light Indigo-tinted text, secondary elements

Compliance Semantic:
  #22D3EE  pass         Phosphor cyan — "COMPLIANCE PASSED"
  #0E2E33  pass-bg      PASS badge/bar background
  #F87171  fail         Alert red — "COMPLIANCE FAILED"
  #2D0E0E  fail-bg      FAIL background wash
  #FBBF24  warn         Amber — ADVISORY
  #2D1E05  warn-bg      ADVISORY background

Text:
  #F8FAFC  primary      Main text on dark bg
  #94A3B8  secondary    Muted text
  #475569  muted        Very muted (placeholder hints)
  #818CF8  indigo-text  Accent text in indigo

Compliance Diff Blocks:
  #4F0E0E / #FECACA / #7F1D1D   Red (flagged)
  #0A2E1A / #86EFAC / #14532D   Green (replacement)
```

### Contrast Ratios (WCAG AA)

```
#F8FAFC on #0A0F1E:  21:1   ✅ AAA
#22D3EE on #0E2E33:   7.2:1 ✅ AA
#F87171 on #2D0E0E:   5.8:1 ✅ AA
#6366F1 on #111827:   4.6:1 ✅ AA (borderline — always pair with text)
#94A3B8 on #0A0F1E:   5.1:1 ✅ AA
#818CF8 on #111827:   4.8:1 ✅ AA
```

### Color Usage Rules

```
✅ #6366F1 (indigo) ONLY for:
   - Primary action buttons
   - Active pipeline step
   - Focus rings
   - "Gaps Identified" section accent

✅ #22D3EE (cyan) ONLY for:
   - COMPLIANCE PASSED labels
   - Complete pipeline steps
   - Approved lead status

✅ #F87171 (red) ONLY for:
   - COMPLIANCE FAILED labels
   - Failed pipeline steps
   - Flagged phrases
   - Error messages

✅ #FBBF24 (amber) ONLY for:
   - ADVISORY compliance
   - Limited data warnings
   - Rate limit banners

❌ NEVER use:
   - Default Tailwind blue (#3B82F6) anywhere
   - White backgrounds
   - Any gradient (except the approve button fill sweep)
   - Purple (#8B5CF6) — conflicts with indigo identity
```

\---

## 5\. Layout System

### 2-Column Asymmetric Layout (Desktop ≥1024px)

```tsx
// src/app/page.tsx — Dashboard layout
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-\[#0A0F1E]">

      {/\* ── Header ────────────────────────────────── \*/}
      <header className="sticky top-0 z-40 border-b border-\[#1F2937] bg-\[#0A0F1E]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-\[#6366F1]">
              <span className="font-mono text-\[10px] font-bold text-white">B</span>
            </div>
            <span className="font-\['Cabinet\_Grotesk\_Variable'] text-sm font-bold text-white tracking-tight">
              BLOSTEM
            </span>
            <span className="text-\[#475569] text-sm">
              Outreach Agent
            </span>
          </div>
          <span className="font-mono text-\[10px] uppercase tracking-widest text-\[#475569]">
            v1.0 · MVP
          </span>
        </div>
      </header>

      {/\* ── Main 2-column layout ──────────────────── \*/}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex gap-6">

          {/\* LEFT COLUMN — 320px, sticky \*/}
          <aside className="w-\[320px] shrink-0">
            <div className="sticky top-\[3.5rem] space-y-4">
              {/\* URL Input Bar \*/}
              {/\* Pipeline Log \*/}
            </div>
          </aside>

          {/\* RIGHT COLUMN — flexible \*/}
          <main className="min-w-0 flex-1 space-y-4" id="main-content">
            {/\* Research Panel \*/}
            {/\* Email Preview Card \*/}
            {/\* Compliance Badge + Issues \*/}
          </main>

        </div>

        {/\* LEADS TABLE — full width below both columns \*/}
        <div className="mt-6">
          {/\* Leads Table \*/}
        </div>
      </div>

    </div>
  )
}
```

### Mobile Layout (<1024px)

Single column. Left column becomes top section. Pipeline log
becomes compact horizontal stepper.

\---

## 6\. Component Library

### A. URL Input Bar

```tsx
// src/components/UrlInputBar.tsx
'use client'

import { useState } from 'react'
import { Search, Loader2, AlertCircle } from 'lucide-react'

export function UrlInputBar({ onSubmit, isLoading, error, disabled }) {
  const \[url, setUrl] = useState('')
  const \[touched, setTouched] = useState(false)

  const validateUrl = (value: string) => {
    if (!value.trim()) return 'Please enter a URL'
    try { new URL(value); return null }
    catch { return 'Invalid URL — try: https://company.com' }
  }

  const inlineError = touched ? validateUrl(url) : null
  const displayError = error || inlineError

  return (
    <div className="space-y-2">

      {/\* Label \*/}
      <label className="font-mono text-\[10px] uppercase tracking-widest text-\[#475569]">
        TARGET COMPANY URL
      </label>

      {/\* Input + Button \*/}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          {/\* Left icon \*/}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {isLoading
              ? <Loader2 className="h-4 w-4 animate-spin text-\[#6366F1]" />
              : <Search className={`h-4 w-4 ${displayError ? 'text-\[#F87171]' : 'text-\[#475569]'}`} />
            }
          </div>

          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setTouched(false) }}
            onBlur={() => setTouched(true)}
            placeholder="https://jupiter.money"
            disabled={disabled || isLoading}
            className={`
              w-full rounded-md border py-2.5 pl-9 pr-3
              bg-\[#111827] font-mono text-sm text-\[#F8FAFC]
              placeholder:text-\[#475569]
              transition-all duration-150
              focus:outline-none
              disabled:cursor-not-allowed disabled:opacity-50
              ${displayError
                ? 'border-\[#F87171] focus:border-\[#F87171] focus:shadow-\[0\_0\_0\_3px\_rgba(248,113,113,0.2)]'
                : 'border-\[#1F2937] focus:border-\[#6366F1] focus:shadow-\[0\_0\_0\_3px\_rgba(99,102,241,0.2)]'
              }
            `}
          />
        </div>

        <button
          type="submit"
          disabled={disabled || isLoading || !url.trim()}
          className={`
            flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5
            font-mono text-xs font-medium uppercase tracking-wider text-white
            transition-all duration-150
            focus:outline-none focus:shadow-\[0\_0\_0\_2px\_#0A0F1E,\_0\_0\_0\_4px\_#6366F1]
            disabled:cursor-not-allowed
            ${isLoading
              ? 'bg-\[#4338CA] cursor-not-allowed'
              : 'bg-\[#6366F1] hover:bg-\[#4338CA] active:bg-\[#3730A3]'
            }
          `}
        >
          {isLoading ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> RUNNING...</>
          ) : (
            <><Search className="h-3.5 w-3.5" /> RESEARCH \&amp; GENERATE</>
          )}
        </button>
      </form>

      {/\* Error \*/}
      {displayError \&\& (
        <div className="flex items-center gap-1.5 font-mono text-xs text-\[#F87171]">
          <AlertCircle className="h-3 w-3" />
          // {displayError}
        </div>
      )}

      {/\* Hint \*/}
      {!displayError \&\& (
        <p className="font-mono text-\[10px] text-\[#475569]">
          // paste any Indian fintech company URL
        </p>
      )}
    </div>
  )
}
```

\---

### B. Pipeline Log (Left Column)

```tsx
// src/components/PipelineLog.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Loader2, AlertTriangle } from 'lucide-react'

export interface LogEntry {
  id: string
  timestamp: string     // "14:32:07"
  label: string         // "RESEARCH COMPLETE"
  status: 'active' | 'complete' | 'failed' | 'warning' | 'info'
  detail?: string
  actions?: { label: string; onClick: () => void }\[]
}

const statusConfig = {
  active:   { icon: <Loader2 className="h-3 w-3 animate-spin" />, color: '#6366F1' },
  complete: { icon: <Check className="h-3 w-3" />, color: '#22D3EE' },
  failed:   { icon: <X className="h-3 w-3" />, color: '#F87171' },
  warning:  { icon: <AlertTriangle className="h-3 w-3" />, color: '#FBBF24' },
  info:     { icon: null, color: '#475569' },
}

export function PipelineLog({ entries }: { entries: LogEntry\[] }) {
  return (
    <div className="rounded-md border border-\[#1F2937] bg-\[#111827] p-4">

      {/\* Header \*/}
      <p className="mb-3 font-mono text-\[10px] uppercase tracking-widest text-\[#475569]">
        PIPELINE LOG
      </p>

      {/\* Empty state \*/}
      {entries.length === 0 \&\& (
        <p className="font-mono text-xs text-\[#475569]">
          // log will appear here
        </p>
      )}

      {/\* Log entries \*/}
      <div className="space-y-1.5">
        <AnimatePresence>
          {entries.map((entry) => {
            const config = statusConfig\[entry.status]
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="space-y-1"
              >
                {/\* Main entry line \*/}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-\[10px] text-\[#475569] tabular-nums">
                    {entry.timestamp}
                  </span>
                  <span style={{ color: config.color }}>
                    {config.icon}
                  </span>
                  <span
                    className="font-mono text-xs font-medium"
                    style={{ color: config.color }}
                  >
                    {entry.label}
                  </span>
                </div>

                {/\* Detail line \*/}
                {entry.detail \&\& (
                  <p className="pl-\[4.5rem] font-mono text-\[10px] text-\[#475569]">
                    {entry.detail}
                  </p>
                )}

                {/\* Inline action buttons \*/}
                {entry.actions \&\& entry.actions.length > 0 \&\& (
                  <div className="flex gap-2 pl-\[4.5rem]">
                    {entry.actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={action.onClick}
                        className="font-mono text-\[10px] text-\[#6366F1] underline hover:text-\[#818CF8] focus:outline-none"
                      >
                        \[{action.label}]
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

\---

### C. Compliance Badge ⭐ The Aha Moment

```tsx
// src/components/ComplianceBadge.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export interface ComplianceFlag {
  id: string
  flaggedPhrase: string
  ruleViolated: string
  ruleSource: string
  suggestedReplacement: string
  severity: 'critical' | 'warning'
  isFixed?: boolean
}

export interface ComplianceResult {
  status: 'pass' | 'fail' | 'advisory' | 'unavailable'
  flags: ComplianceFlag\[]
  checkedAt: string
}

export function ComplianceBadge({ result, onApplySuggestion, onRecheck, isRechecking }) {

  const statusBar = {
    pass: { color: '#22D3EE', label: 'COMPLIANCE PASSED', detail: '0 issues found' },
    fail: { color: '#F87171', label: 'COMPLIANCE FAILED', detail: `${result.flags.length} issue${result.flags.length !== 1 ? 's' : ''} found` },
    advisory: { color: '#FBBF24', label: 'ADVISORY', detail: 'non-blocking — review suggested' },
    unavailable: { color: '#475569', label: 'UNAVAILABLE', detail: 'manual review required' },
  }\[result.status]

  return (
    <div className="overflow-hidden rounded-md border border-\[#1F2937] bg-\[#111827]">

      {/\* Sweep bar \*/}
      <div className="relative h-\[3px] w-full bg-\[#1F2937]">
        <motion.div
          className="absolute left-0 top-0 h-full"
          style={{ backgroundColor: statusBar.color }}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/\* Status header \*/}
      <div className="flex items-center gap-3 px-4 py-3">
        <span
          className="font-mono text-sm font-medium"
          style={{ color: statusBar.color }}
        >
          {statusBar.label}
        </span>
        <span className="font-mono text-xs text-\[#475569]">
          — {statusBar.detail}
        </span>
        <span className="ml-auto font-mono text-\[10px] text-\[#475569]">
          {result.checkedAt}
        </span>
      </div>

      {/\* Issues panel (FAIL / ADVISORY) \*/}
      <AnimatePresence>
        {(result.status === 'fail' || result.status === 'advisory') \&\&
          result.flags.length > 0 \&\& (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="border-t border-\[#1F2937]">

              {/\* Issues header \*/}
              <div className="border-b border-\[#1F2937] px-4 py-2">
                <span className="font-mono text-\[10px] uppercase tracking-widest text-\[#475569]">
                  COMPLIANCE ISSUES ({result.flags.length})
                </span>
              </div>

              {/\* Each issue — diff block style \*/}
              {result.flags.map((flag, i) => (
                <div
                  key={flag.id}
                  className={`
                    border-b border-\[#1F2937] px-4 py-4 space-y-3
                    ${flag.isFixed ? 'opacity-50' : ''}
                  `}
                >
                  {/\* Issue header \*/}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-\[10px] text-\[#475569]">
                      ISSUE {i + 1} / {result.flags.length}
                    </span>
                    <span className={`
                      font-mono text-\[10px] px-1.5 py-0.5 rounded
                      ${flag.severity === 'critical'
                        ? 'bg-\[#4F0E0E] text-\[#F87171]'
                        : 'bg-\[#2D1E05] text-\[#FBBF24]'
                      }
                    `}>
                      {flag.severity.toUpperCase()}
                    </span>
                    {flag.isFixed \&\& (
                      <span className="font-mono text-\[10px] bg-\[#0A2E1A] text-\[#86EFAC] px-1.5 py-0.5 rounded">
                        ✓ FIXED
                      </span>
                    )}
                  </div>

                  {/\* FLAGGED block \*/}
                  <div className="space-y-1">
                    <p className="font-mono text-\[10px] uppercase tracking-wider text-\[#475569]">
                      FLAGGED:
                    </p>
                    <div className="diff-flagged">
                      "{flag.flaggedPhrase}"
                    </div>
                  </div>

                  {/\* RULE \*/}
                  <div className="space-y-1">
                    <p className="font-mono text-\[10px] uppercase tracking-wider text-\[#475569]">
                      RULE:
                    </p>
                    <p className="text-sm text-\[#94A3B8]">{flag.ruleViolated}</p>
                    <p className="font-mono text-\[10px] text-\[#475569]">
                      Source: {flag.ruleSource}
                    </p>
                  </div>

                  {/\* REPLACE WITH block \*/}
                  <div className="space-y-1">
                    <p className="font-mono text-\[10px] uppercase tracking-wider text-\[#475569]">
                      REPLACE WITH:
                    </p>
                    <div className="diff-fixed">
                      "{flag.suggestedReplacement}"
                    </div>
                  </div>

                  {/\* Apply button \*/}
                  {!flag.isFixed \&\& (
                    <button
                      onClick={() => onApplySuggestion(flag.id, flag.suggestedReplacement)}
                      className="
                        flex items-center gap-2 rounded border border-\[#6366F1]/30
                        bg-\[#6366F1]/10 px-3 py-1.5
                        font-mono text-xs text-\[#6366F1]
                        hover:bg-\[#6366F1]/20 hover:border-\[#6366F1]/50
                        transition-all duration-150
                        focus:outline-none focus:shadow-\[0\_0\_0\_2px\_#0A0F1E,\_0\_0\_0\_4px\_#6366F1]
                      "
                    >
                      APPLY →
                    </button>
                  )}
                </div>
              ))}

              {/\* Re-check button \*/}
              {result.status === 'fail' \&\& onRecheck \&\& (
                <div className="px-4 py-3">
                  <button
                    onClick={onRecheck}
                    disabled={isRechecking}
                    className="
                      flex items-center gap-2 rounded border border-\[#1F2937]
                      bg-\[#0A0F1E] px-4 py-2
                      font-mono text-xs text-\[#94A3B8]
                      hover:border-\[#263244] hover:text-\[#F8FAFC]
                      transition-all duration-150
                      disabled:cursor-not-allowed disabled:opacity-50
                    "
                  >
                    {isRechecking
                      ? <><Loader2 className="h-3 w-3 animate-spin" /> CHECKING...</>
                      : 'RE-CHECK COMPLIANCE →'
                    }
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

\---

### D. Email Preview Card

```tsx
// Key visual specs for EmailPreviewCard.tsx

// Card container:
className="rounded-md border border-\[#1F2937] bg-\[#111827] overflow-hidden"

// Card header:
className="flex items-center justify-between border-b border-\[#1F2937] bg-\[#0A0F1E]/50 px-4 py-3"

// "DRAFT" label:
className="font-mono text-\[10px] uppercase tracking-widest text-\[#475569]"

// Subject line container:
className="border-b border-\[#1F2937] px-4 py-3"

// Subject label:
className="mb-1 font-mono text-\[10px] uppercase tracking-wider text-\[#475569]"

// Subject text:
className="text-sm font-medium text-\[#F8FAFC] font-\['Cabinet\_Grotesk\_Variable']"

// Body container:
className="px-4 py-4"

// Body text (read-only):
className="whitespace-pre-wrap text-sm leading-relaxed text-\[#94A3B8]"
// Note: when compliance PASS, add green left-borders to paragraphs

// Word count:
className="mt-2 font-mono text-\[10px] text-\[#475569] tabular-nums"

// Edit textarea:
className="w-full resize-y rounded border border-\[#1F2937] bg-\[#0A0F1E]
  px-3 py-2 font-sans text-sm leading-relaxed text-\[#94A3B8]
  focus:border-\[#6366F1] focus:outline-none
  focus:shadow-\[0\_0\_0\_3px\_rgba(99,102,241,0.15)]"

// Footer:
className="flex items-center justify-between border-t border-\[#1F2937] px-4 py-3"

// APPROVE button (green, with fill animation):
// Uses Framer Motion for the left-to-right fill sweep on click
```

\---

### E. Leads Table

```tsx
// Key visual specs for LeadsTable.tsx

// Table wrapper:
className="overflow-hidden rounded-md border border-\[#1F2937] bg-\[#111827]"

// Table header row:
className="border-b border-\[#1F2937] bg-\[#0A0F1E]/50"

// TH cells:
className="px-4 py-3 text-left font-mono text-\[10px] uppercase tracking-widest text-\[#475569]"

// TR default:
className="border-b border-\[#0A0F1E] transition-all duration-100 cursor-pointer"

// TR hover: add indigo left-border + bg lighten
className="hover:bg-\[#263244]/40 hover:border-l-2 hover:border-l-\[#6366F1]"

// TD cells:
className="px-4 py-3 text-sm text-\[#94A3B8]"

// Company name TD:
className="font-medium text-\[#F8FAFC]"

// PASS badge:
className="inline-flex items-center gap-1.5 rounded px-2 py-0.5
  font-mono text-\[10px] font-medium
  bg-\[#0E2E33] text-\[#22D3EE]"

// FAIL badge:
className="inline-flex items-center gap-1.5 rounded px-2 py-0.5
  font-mono text-\[10px] font-medium
  bg-\[#2D0E0E] text-\[#F87171]"

// APPROVED status badge:
className="inline-flex items-center gap-1.5 rounded px-2 py-0.5
  font-mono text-\[10px] font-medium
  bg-\[#0A2E1A] text-\[#86EFAC]"

// DRAFT status badge:
className="font-mono text-\[10px] text-\[#475569]"

// VIEW → action:
className="font-mono text-\[10px] text-\[#6366F1] hover:text-\[#818CF8]
  transition-colors duration-100"

// Empty state:
className="py-16 text-center"
// Empty state text:
className="font-mono text-sm text-\[#475569]"
// "// no leads yet. paste a URL above to get started."
```

\---

## 7\. Animation Specifications

### Compliance Fail — Phrase Pulse (The Aha Moment)

```tsx
// In EmailPreviewCard, when compliance result = 'fail':
// Each flagged phrase in email body gets:

<motion.span
  className="phrase-flagged"
  animate={{
    backgroundColor: \['transparent', '#4F0E0E', '#4F0E0E'],
  }}
  transition={{
    duration: 0.15,
    repeat: 1,        // 2 pulses total
    repeatType: 'mirror',
  }}
>
  {flaggedPhraseText}
</motion.span>

// After animation settles, permanently styled as:
className="phrase-flagged"  // red bg, red underline
```

### Compliance Sweep Bar

```tsx
// Top of EmailPreviewCard after compliance result arrives:
<motion.div
  className="h-\[3px] w-full"
  style={{ backgroundColor: result.status === 'pass' ? '#22D3EE' : '#F87171' }}
  initial={{ scaleX: 0, transformOrigin: 'left' }}
  animate={{ scaleX: 1 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
/>
```

### Approve Button Fill

```tsx
// Approve button on click:
<motion.button
  onClick={handleApprove}
  className="relative overflow-hidden rounded-md ..."
>
  {/\* Fill layer \*/}
  <motion.div
    className="absolute inset-0 bg-green-500 origin-left"
    initial={{ scaleX: 0 }}
    animate={isApproving ? { scaleX: 1 } : { scaleX: 0 }}
    transition={{ duration: 0.5, ease: 'easeInOut' }}
  />
  {/\* Button text \*/}
  <span className="relative z-10">
    {isApproved ? 'APPROVED ✓' : 'APPROVE'}
  </span>
</motion.button>
```

### Panel Slide-In

```tsx
// Research Panel and Email Card appearing:
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
  {/\* panel content \*/}
</motion.div>
```

### Rules

```
✅ Approved durations:
   - 150ms  micro-interactions (hover color changes)
   - 200ms  panel transitions, opacity changes
   - 300ms  accordion open/close
   - 400ms  compliance sweep bar
   - 500ms  approve button fill

❌ NEVER:
   - bounce or spring easings
   - scale transforms (except fill animations)
   - transitions > 500ms
   - animations on text content
   - rotate animations (except spinner)
```

\---

## 8\. Accessibility

All WCAG 2.1 AA requirements from v1.0 are preserved and updated
for the dark theme:

* All interactive elements: `focus:outline-none focus:shadow-\[0\_0\_0\_2px\_#0A0F1E,\_0\_0\_0\_4px\_#6366F1]`
* Compliance badges always include text (never color alone)
* Pipeline log uses `aria-live="polite"` for screen readers
* All DM Mono labels that are ALL CAPS include readable `aria-label` lowercase equivalents
* Reduced motion: all animations skip to final state when `prefers-reduced-motion: reduce`

Skip link:

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2
    focus:z-50 focus:rounded focus:bg-\[#6366F1] focus:px-4 focus:py-2
    focus:font-mono focus:text-xs focus:text-white focus:uppercase"
>
  Skip to main content
</a>
```

\---

## 9\. What NOT To Do (Binding Rules)

```
❌ No white or light backgrounds anywhere
❌ No default Tailwind blue (#3B82F6)
❌ No purple gradients
❌ No Inter for headings
❌ No generic card-based layouts (use the 2-column log layout)
❌ No horizontal progress stepper on desktop (use vertical log)
❌ No generic pill badges without DM Mono
❌ No animations without Framer Motion for the 5 specified moments
❌ No overuse of indigo — it's reserved for CTAs and active states
❌ No rounded-full on buttons (use rounded-md — sharp, precise)
❌ No shadows on dark backgrounds (use borders instead)
```

\---

*End of FRONTEND\_GUIDELINES.md v2.0*

