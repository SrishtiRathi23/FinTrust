# Application Flow Documentation
# Blostem Outreach Agent
**Version:** 2.0 — UI/UX Enhanced
**Matches:** PRD.md v2.0
**Last Updated:** April 2026

---

## 0. UI/UX Layout System

Before describing flows, the layout must be understood — because
the layout IS the flow. The app uses an asymmetric 2-column layout
on desktop (≥1024px) that breaks the standard "single column dashboard"
pattern entirely.

### Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: "BLOSTEM" wordmark left · "OUTREACH AGENT" muted   │
│  right-aligned: v1.0 · MVP badge in DM Mono                 │
├────────────────────────┬────────────────────────────────────┤
│  LEFT COLUMN (320px)   │  RIGHT COLUMN (flex-1)             │
│  ─────────────────     │  ────────────────────              │
│  URL INPUT BAR         │  [Empty on first visit]            │
│  (full-width of col)   │  [Research Panel when ready]       │
│                        │  [Email Preview Card when ready]   │
│  PIPELINE LOG          │  [Compliance Badge when ready]     │
│  ─────────────────     │                                    │
│  14:32:07 RESEARCH ⟳  │                                    │
│  14:32:19 RESEARCH ✓  │                                    │
│  14:32:20 DRAFT    ⟳  │                                    │
│  14:32:34 DRAFT    ✓  │                                    │
│  14:32:35 COMPLIANCE ⟳│                                    │
│  14:32:46 PASSED   ✓  │                                    │
│                        │                                    │
│  [Sticky — stays       │                                    │
│   visible while        │                                    │
│   scrolling right      │                                    │
│   column content]      │                                    │
├────────────────────────┴────────────────────────────────────┤
│  LEADS TABLE (full width, below both columns)               │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<1024px)
Single column. Pipeline log becomes a compact horizontal stepper.
All right-column content stacks below. Leads table at bottom.

### Color & Type Reminder (applies to all flows below)
- Background: `#0A0F1E`
- Card surfaces: `#111827` with `#1F2937` borders
- Pipeline log text: `DM Mono`, small, muted (`#64748B`)
- Active step: `DM Mono`, indigo (`#6366F1`)
- Complete step: `DM Mono`, green (`#22D3EE`)
- Failed step: `DM Mono`, red (`#F87171`)
- All timestamps: `DM Mono`

---

## 1. Entry Points

### Entry Point A: First Visit (Empty State)

**What user sees:**
- Dark header: "BLOSTEM" wordmark + "OUTREACH AGENT" subtitle
- Left column: URL input bar (prominent, indigo focus ring on load)
  + empty pipeline log area with placeholder text:
  `// pipeline log will appear here` in DM Mono muted
- Right column: centered empty state card:
  "No lead generated yet."
  Subtext: "Paste a company URL to get started."
- Full-width leads table below with empty state illustration

**User's only available action:** Type/paste into URL input bar

---

### Entry Point B: Returning Visit (Leads Exist)

**What user sees:**
- URL input bar ready (left column top)
- Pipeline log is empty (cleared between sessions) with hint:
  `// paste a URL above to start a new pipeline`
- Right column: shows most recently generated lead's email card
  (last session's result, read-only, with its compliance badge)
- Leads table populated, newest first

**User's available actions:**
- Paste new URL → triggers Flow 1
- Click any table row → triggers Flow 2

---

### Entry Point C: Deep Link to Lead Detail

**Route:** `/leads/[lead-id]`

**What user sees:**
- Full-page lead detail (same 2-column layout)
- Left column: pipeline log for that lead's run (historical,
  all steps complete, with real timestamps from when it ran)
- Right column: research panel + email card + compliance badge
- "← ALL LEADS" back link at top-left in DM Mono

---

## 2. Core User Flows

---

### Flow 1: Generate New Outreach Email

**Goal:** URL → compliance-safe personalized email in < 60 seconds.

---

#### Step 1.1 — URL Input & Submission

**Screen:** Dashboard left column — URL input

**Visual state:**
- Input field: dark bg `#111827`, border `#1F2937`
- On focus: border transitions to indigo `#6366F1` with subtle
  glow ring (`box-shadow: 0 0 0 3px rgba(99,102,241,0.2)`)
- Placeholder: `https://jupiter.money` in muted indigo
- Button: "RESEARCH & GENERATE" in DM Mono uppercase,
  solid indigo background

**On submit:**
- Input becomes read-only (opacity 0.6, cursor: not-allowed)
- Button label changes to "RUNNING PIPELINE..." with animated
  ellipsis (DM Mono, 3 dots cycling)
- Pipeline log appears in left column below input
- First log entry appears with typewriter effect:
  ```
  14:32:07  RESEARCH STARTED   ⟳
  ```
- Right column: faint shimmer loading skeleton appears

**→ Next:** Step 1.2

---

#### Step 1.2 — Research Agent Running

**Left column — Pipeline log:**
```
14:32:07  RESEARCH STARTED   ⟳  ← indigo text, spinning icon
```

**Right column:**
- Research panel placeholder with pulsing skeleton:
  ```
  ┌──────────────────────────────────┐
  │ ░░░░░░░░░░░  Company Name        │
  │ ░░░░░░░░░░░░░░░░░░░ description  │
  │ ░░░░░░  ░░░░░░  products         │
  │ ░░░░░░░░░░░░░  gaps              │
  └──────────────────────────────────┘
  ```

**On Research SUCCESS:**
- Pipeline log updates (typewriter, 100ms delay):
  ```
  14:32:07  RESEARCH STARTED   ⟳
  14:32:19  RESEARCH COMPLETE  ✓  ← cyan text
  14:32:20  DRAFTING STARTED   ⟳  ← new entry appears
  ```
- Right column: Research Summary Panel slides in (translateX
  from +20px, opacity 0→1, 200ms ease-out)
- Panel contents:
  ```
  ┌──────────────────────────────────────┐
  │ [B] BLOSTEM                   [^]   │ ← DM Mono header
  │                                      │
  │  Jupiter Money                       │ ← Cabinet Grotesk, large
  │  jupiter.money                       │ ← muted, small
  │                                      │
  │  Neo-banking platform targeting      │
  │  salaried millennials in India...    │
  │                                      │
  │  EXISTING PRODUCTS                   │ ← DM Mono label
  │  • Savings account (2.5% interest)  │
  │  • Instant personal loans           │
  │  • Mutual fund investments          │
  │                                      │
  │  GAPS IDENTIFIED ← OPPORTUNITY      │ ← indigo accent label
  │  ▌ No fixed deposit product         │ ← indigo left-border
  │  ▌ No fixed-income for risk-averse  │
  └──────────────────────────────────────┘
  ```

**On Research FAILURE:**
- Pipeline log:
  ```
  14:32:07  RESEARCH STARTED   ⟳
  14:32:28  RESEARCH FAILED    ✗  ← red text
             site blocked access
  ```
- Right column: Error panel with two action buttons
  (see Step 1.2E)

---

#### Step 1.2E — Research Error Recovery

**Left column pipeline log:**
```
14:32:28  RESEARCH FAILED    ✗
           Could not access site.
           [TRY AGAIN]  [USE DOMAIN ONLY →]
```
Buttons rendered inline in the log, DM Mono, small.

**"TRY AGAIN":** Resets pipeline log, restarts Step 1.2
**"USE DOMAIN ONLY →":** Log shows:
```
14:32:31  FALLBACK MODE      ⚠
           Using domain name only.
           Email will be less personalized.
14:32:32  DRAFTING STARTED   ⟳
```
Right column: Email panel appears with amber warning banner at top.

---

#### Step 1.3 — Drafter Agent Running

**Left column pipeline log:**
```
14:32:07  RESEARCH STARTED   ⟳
14:32:19  RESEARCH COMPLETE  ✓
14:32:20  DRAFTING STARTED   ⟳  ← active, indigo
```

**Right column:**
- Research Panel stays visible (collapsed to save space)
- Below it: Email Preview Card appears with skeleton:
  ```
  ┌──────────────────────────────────┐
  │ DRAFT                            │ ← DM Mono label
  │ ░░░░░░░░░░░░░░░░  subject line   │
  │ ────────────────────────────     │
  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░      │
  │ ░░░░░░░░░░░░░░░░░░░░░░░░         │
  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
  └──────────────────────────────────┘
  ```

**On Draft SUCCESS:**
- Log updates:
  ```
  14:32:34  DRAFT COMPLETE    ✓
  14:32:35  COMPLIANCE CHECK  ⟳
  ```
- Email body text fades in (opacity 0→1, 300ms) replacing skeleton
- Body is read-only at this stage (no edit button yet)
- "DRAFT" label in DM Mono top-left of card

---

#### Step 1.4 — Compliance Agent Running

**⭐ THE AHA MOMENT — most important step**

**Left column pipeline log:**
```
14:32:35  COMPLIANCE CHECK   ⟳  ← indigo, spinning
```

**Right column — Email card:**
- A thin indigo scanning line animates top-to-bottom across the
  email body (like a document scanner, 1.5s, one pass)
- Each paragraph gets a brief indigo left-border flash as the
  scan passes it (staggered, 100ms each)

**On Compliance PASS:**
- Log updates:
  ```
  14:32:46  COMPLIANCE PASSED ✓  ← phosphor green, DM Mono
            0 issues found
  ```
- A phosphor-green (`#22D3EE`) 3px bar sweeps left-to-right
  across the TOP of the email card (400ms ease-out)
- "COMPLIANCE PASSED" appears in DM Mono uppercase green
  below the bar
- Each email paragraph gets a permanent subtle green left-border
- Edit button (pencil icon) appears — email becomes editable
- "APPROVE" button appears at bottom of card (full width, green)

**On Compliance FAIL:**
- Log updates:
  ```
  14:32:46  COMPLIANCE FAILED ✗  ← red, DM Mono
            2 issues found
  ```
- A red 3px bar sweeps across the TOP of the email card
- "COMPLIANCE FAILED" in DM Mono uppercase red
- **THE AHA MOMENT:**
  Flagged phrases in email body pulse with red highlight
  animation (2 pulses × 150ms, then settle into permanent
  red underline + `#4F0E0E` background tint)
- Below the email card, compliance diff panel slides in:

```
┌────────────────────────────────────────────────────┐
│ COMPLIANCE ISSUES (2)               [HIDE ↑]       │ ← DM Mono header
├────────────────────────────────────────────────────┤
│ ISSUE 1 / 2                        CRITICAL        │
│                                                    │
│ FLAGGED:                                           │
│ ┌──────────────────────────────────────────────┐   │
│ │ "guaranteed high returns"                    │   │ ← DM Mono, red bg
│ └──────────────────────────────────────────────┘   │
│                                                    │
│ RULE: RBI Circular 2023-47                        │
│ Assured return language prohibited in             │
│ marketing materials for financial products.       │
│                                                    │
│ REPLACE WITH:                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ "up to X% p.a., subject to applicable terms" │   │ ← DM Mono, green bg
│ └──────────────────────────────────────────────┘   │
│                                             [APPLY →]│
├────────────────────────────────────────────────────┤
│ ISSUE 2 / 2                        CRITICAL        │
│ ... (same structure)                               │
├────────────────────────────────────────────────────┤
│                         [RE-CHECK COMPLIANCE →]    │
└────────────────────────────────────────────────────┘
```

**On "APPLY →" click:**
- Flagged phrase in email body fades out (100ms)
- Replacement fades in (100ms)
- Issue row shows "✓ FIXED" badge in green DM Mono
- When all issues fixed: "RE-CHECK →" button pulses once (indigo)

**On "RE-CHECK COMPLIANCE →" click:**
- Log adds new entry:
  ```
  14:33:58  RECHECK STARTED   ⟳
  ```
- Scan animation runs again on email card
- Returns to Step 1.4 compliance result

---

#### Step 1.5 — Review & Approve

**Right column — Email card (PASS state):**
```
┌────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  COMPLIANCE PASSED  ✓   │ ← 3px green top bar
│ DRAFT                              [EDIT ✏]   │
│ ──────────────────────────────────────────     │
│ Subject: Adding Fixed Returns to Jupiter's ... │
│ ──────────────────────────────────────────     │
│ ▌ Dear [Name],                                │ ← green left border
│ ▌                                             │
│ ▌ [email body...]                             │
│ ▌                                             │
│ ▌ [3 paragraphs]                              │
│ ▌                                             │
│ ▌ Best,                                       │
│                                               │
│ 214 words · ~1 min read          [REGENERATE] │
│ ─────────────────────────────────────────── │
│ [████████████  APPROVE  ████████████████████] │ ← full width button
└────────────────────────────────────────────────┘
```

**On "APPROVE" click:**
- Green fill sweeps left-to-right across button (500ms ease-in-out)
- Button label changes to "APPROVED ✓" (DM Mono, locked)
- Log updates:
  ```
  14:33:05  LEAD APPROVED     ✓
            Jupiter Money
  ```
- Toast slides in from top-right:
  ```
  ┌────────────────────────────────┐
  │ ▌  LEAD APPROVED              │ ← green left-border accent
  │    Jupiter Money               │
  │    14:33:05 · Apr 19           │ ← DM Mono timestamp
  └────────────────────────────────┘
  ```
- Leads table row updates badge immediately
- URL input re-enables, ready for next URL

**→ Flow 1 Complete.**

---

### Flow 2: View Lead History

#### Step 2.1 — Browse Leads Table

**Visual:**
- Dark table with alternating row backgrounds (`#0A0F1E` / `#111827`)
- Column headers in DM Mono uppercase, muted
- Compliance badges: pill-shaped, high contrast on dark bg
- Row hover: indigo 3px left-border appears + row bg lightens slightly
- "VIEW →" action: DM Mono text, indigo color, no border/box

| COMPANY | URL | GENERATED | COMPLIANCE | STATUS | |
|---------|-----|-----------|------------|--------|---|
| Jupiter | jupiter.money | Apr 19 · 14:33 | PASSED ✓ | APPROVED | VIEW → |
| Groww | groww.in | Apr 19 · 13:02 | FAILED ✗ | DRAFT | VIEW → |

---

#### Step 2.2 — Lead Detail View

**Route:** `/leads/[lead-id]`

**Layout:** Same 2-column layout as dashboard.
Left: historical pipeline log (all steps complete with real timestamps)
Right: research panel + email card + compliance badge

**Available actions by state:**

*Draft + Pass:* APPROVE button (green), EDIT (pencil), REGENERATE (ghost)
*Draft + Fail:* Compliance issues panel expanded, RE-CHECK, APPROVE ANYWAY
*Approved:* "APPROVED ✓" badge, COPY EMAIL button only (read-only)

---

### Flow 3: Error Recovery

#### Error 3A — Invalid URL

- Input border flashes red (150ms)
- Inline error in DM Mono below input:
  `// invalid URL — try: https://company.com`
- No pipeline starts

#### Error 3B — Mid-Pipeline Failure

- Pipeline log step turns red with ✗
- Error message in DM Mono inline in log:
  ```
  14:35:12  RESEARCH FAILED   ✗
             site blocked automated access
             [TRY AGAIN]  [USE DOMAIN ONLY →]
  ```

#### Error 3C — Rate Limit

- Pipeline halts
- Full-width amber banner at top of right column:
  ```
  ⚠ RATE LIMIT REACHED  —  retry in 00:47
  ```
  Countdown in DM Mono. Auto-dismisses when countdown hits zero.

#### Error 3D — Network Offline

- Persistent toast (bottom-left, red left-border):
  ```
  ▌ NO INTERNET CONNECTION
    changes may not be saved
  ```

---

## 3. Navigation Map

```
/ (Dashboard)
│
├── [Left column — URL Input + Pipeline Log]
│   └── URL submit → pipeline steps appear in log
│       └── Pipeline complete → Email card in right column
│           ├── APPROVE → updates table row (inline)
│           ├── EDIT → inline editing
│           └── RE-CHECK → runs compliance again (inline)
│
├── [Leads Table — full width below columns]
│   └── Click row / VIEW → → /leads/[lead-id]
│
└── /leads/[lead-id]
    ├── ← ALL LEADS → /
    ├── APPROVE (inline)
    ├── RE-CHECK (inline)
    └── COPY EMAIL (clipboard)

/404 → ← BACK TO DASHBOARD → /
```

---

## 4. Screen Inventory

### Screen 1: Dashboard (`/`)

**Key UI Zones:**
- Sticky header (14px height)
- Left column (320px, sticky): URL input + pipeline log
- Right column (flex-1): Research panel + Email card + Compliance badge
- Full-width leads table (below both columns)

**State variants:**

| State | Left Column | Right Column |
|-------|-------------|--------------|
| Empty | Input + placeholder log text | Empty state card |
| Research running | Log: RESEARCH ⟳ | Skeleton panels |
| Research complete | Log: RESEARCH ✓, DRAFT ⟳ | Research panel |
| Draft complete | Log: DRAFT ✓, COMPLIANCE ⟳ | Research + Email (read-only) |
| Pass | Log: PASSED ✓ | Email + green bar + APPROVE |
| Fail | Log: FAILED ✗ | Email + red bar + issues panel |
| Approved | Log: APPROVED ✓ | Email locked + copy button |
| Error | Log: FAILED ✗ + recovery buttons | Error message |

---

### Screen 2: Lead Detail (`/leads/[lead-id]`)

Same layout as Dashboard. Left column shows historical log
(all complete). Right column shows full lead detail.

Back link: `← ALL LEADS` in DM Mono top-left.

---

### Screen 3: 404

Centered on dark bg. DM Mono text:
```
// 404 — page not found
// this lead may have been deleted

[← BACK TO DASHBOARD]
```

---

## 5. Decision Points

(All logic from v1.0 preserved — UI states updated to match v2.0)

```
IF input is empty on submit
THEN flash input border red (150ms)
AND show DM Mono inline error below input
AND do not start pipeline

IF valid URL submitted
THEN disable input + button
AND show "RUNNING PIPELINE..." in button (DM Mono, animated dots)
AND start pipeline log in left column

IF Research SUCCESS
THEN log: "RESEARCH COMPLETE ✓" (cyan DM Mono)
AND slide in Research Panel (right column, 200ms)

IF Research FAILURE
THEN log: "RESEARCH FAILED ✗" (red DM Mono) + inline recovery buttons
AND halt pipeline

IF Compliance PASS
THEN log: "COMPLIANCE PASSED ✓" (cyan DM Mono)
AND sweep green bar across email card top (400ms)
AND add green left-borders to email paragraphs
AND show APPROVE button

IF Compliance FAIL
THEN log: "COMPLIANCE FAILED ✗" (red DM Mono) + issue count
AND sweep red bar across email card top (400ms)
AND pulse-highlight flagged phrases in email body (2 × 150ms)
AND slide in compliance diff panel below email card

IF "APPLY →" clicked on a flag
THEN crossfade flagged phrase → replacement in email body (200ms)
AND mark issue as "✓ FIXED" in diff panel

IF "APPROVE" clicked AND compliance = pass
THEN green fill sweeps button left-to-right (500ms)
AND button locks as "APPROVED ✓"
AND toast slides in top-right
AND lead row in table updates

IF rate limit hit (429)
THEN show amber countdown banner
AND disable all action buttons
WHEN countdown hits 0: re-enable, banner auto-dismisses
```

---

## 6. Error Handling

| Error ID | Trigger | UI Display | Recovery |
|----------|---------|------------|----------|
| E01 | Empty URL | Red input border + DM Mono error below | Correct and resubmit |
| E02 | Malformed URL | Same + "try: https://company.com" | Correct and resubmit |
| E03 | Site 404 | Log: FAILED ✗ + inline buttons | TRY AGAIN / DOMAIN ONLY |
| E04 | Site 403 | Log: FAILED ✗ + "blocked access" | TRY AGAIN / DOMAIN ONLY |
| E05 | Research timeout | Log: warning at 20s, fail at 30s | Same recovery options |
| E06 | Limited data | Amber warning on research panel | Pipeline continues |
| E07 | Draft failure | Log: DRAFT FAILED ✗ | RETRY DRAFT button in log |
| E08 | Draft timeout | Same | Same |
| E09 | Compliance unavailable | Log: UNAVAILABLE ⚠ | Approve with amber warning |
| E10 | Compliance timeout | Same | RE-CHECK button |
| E11 | Approve DB fail | Toast: "APPROVAL FAILED — RETRY" | Retry in toast |
| E12 | Table load fail | "// could not load leads" in table | Refresh button |
| E13 | Lead 404 | 404 screen | ← BACK TO DASHBOARD |
| E14 | Rate limit | Amber countdown banner | Auto-retry |
| E15 | Network offline | Red toast bottom-left (persistent) | Auto-recovery |
| E16 | Server error 500 | "// server error — try again" in log | Retry button |
| E17 | Duplicate URL | Inline warning below input in DM Mono | Generate Anyway / View |

---

## 7. Responsive Behavior

### Desktop (≥1024px) — Primary
- 2-column asymmetric layout (320px left / flex-1 right)
- Left column is position-sticky
- Pipeline log scrollable if many entries
- All animations and micro-interactions active

### Tablet (768px–1023px)
- Left column collapses to top: URL input full-width, then
  compact horizontal pipeline log (3 steps, DM Mono labels)
- Right column full-width below
- Animations preserved

### Mobile (<768px) — Basic Support
- Single column, full-width
- Pipeline log: minimal 3-dot stepper (no timestamps)
- Research panel: collapsed by default
- Email card: full width, scrollable
- Leads table: Company + Compliance + VIEW only (other cols hidden)
- APPROVE button: full width, 48px height minimum

---

*End of APP_FLOW.md v2.0*
