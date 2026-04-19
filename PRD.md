# Product Requirements Document (PRD)
# Blostem B2B AI Outreach Agent
**Version:** 2.0 — UI/UX Enhanced
**Owner:** Solo Hackathon Build
**Last Updated:** April 2026

---

## 0. UI/UX Design Mandate

This PRD now includes a binding UI/UX design directive. Every screen,
component, and interaction must follow this mandate. No generic SaaS
aesthetics. No default Tailwind look. No blue/purple gradient dashboards.

### Design Philosophy: "Compliance Command Center"

The UI must feel like it was purpose-built for a BD professional in
a regulated fintech company — not a generic dashboard template.

The user (Arjun, BD Manager) operates in a high-stakes environment:
wrong phrasing = regulatory risk. The UI must communicate that
**this tool takes compliance seriously**. It should feel like a
precision instrument, not a productivity app.

**Chosen Design Direction: Dark Editorial with Sharp Compliance Contrast**

- **Background:** Deep navy-charcoal (`#0A0F1E`) — not pure black,
  not generic dark grey. The depth of a Bloomberg terminal meets
  the precision of a legal document.
- **Primary Surface:** `#111827` cards with `#1F2937` borders —
  layered depth without gradients.
- **Brand Accent:** Electric indigo `#6366F1` used surgingly —
  only on primary CTAs and active pipeline steps.
- **Compliance Pass:** Phosphor green `#22D3EE` (not typical green)
  — clinical, precise, unambiguous.
- **Compliance Fail:** Alert red `#F87171` with a red-tinted
  background wash — impossible to miss.
- **Typography:** `DM Mono` for all compliance phrases, flagged
  text, and code-like content. `Cabinet Grotesk` or `Sora` for
  headings — not Inter. The font choice signals this is a
  purpose-built tool, not a template.
- **Layout:** Left-anchored pipeline tracker (vertical, not
  horizontal stepper) on desktop — like a terminal log. Email
  and research panels on the right. Breaks the "navbar + cards"
  pattern entirely.

### 3 Design Directions Evaluated

**Option A: Dark Editorial (CHOSEN)**
- Style: Dark modern + editorial precision
- Palette: `#0A0F1E` bg, `#6366F1` accent, `#22D3EE` pass,
  `#F87171` fail
- Typography: Cabinet Grotesk headings + DM Mono for compliance
- Interactions: Sharp, instant. No bouncy animations. Pipeline
  steps "click" into place with 150ms transitions.
- Why it fits: BD managers in fintech trust dark, precise UIs
  (Bloomberg, trading terminals). The compliance check result
  feels weighty — not casual. Stakes feel real.

**Option B: Brutalist Operator (REJECTED)**
- Style: Raw, high-contrast, newspaper-inspired
- Palette: Off-white `#F5F0E8`, black `#0D0D0D`, yellow `#FFE500`
- Typography: Space Mono + loud display sans
- Why rejected: Too unconventional for a tool being judged by
  a fintech company. Would distract from the compliance story.

**Option C: Glassmorphism Light (REJECTED)**
- Style: Frosted glass, light and airy
- Why rejected: Overused in SaaS. Does not communicate the
  gravity of a compliance tool. Feels consumer, not enterprise.

### Visual Uniqueness Requirements (Mandatory)

The following must be implemented — not optional:

1. **Custom Layout:** Vertical pipeline tracker on the left,
   content panels on the right (2-column asymmetric layout on
   desktop). NOT the standard "navbar + single column" pattern.

2. **Compliance Moment Animation:** When FAIL is returned, the
   flagged phrases in the email body flash with a red highlight
   animation (150ms pulse, 2 cycles) before settling into a
   static red underline. This is the "Aha moment" made visceral.

3. **Non-Standard Progress Indicator:** The pipeline steps are
   displayed as a vertical "log" on the left sidebar — each
   step appears sequentially like a terminal output, with a
   monospace timestamp. Not a horizontal stepper with circles.

4. **Typography Contrast:** All flagged compliance phrases are
   rendered in `DM Mono` font inside red-bordered code blocks.
   Suggested replacements are in `DM Mono` inside green-bordered
   code blocks. The visual language of "old code / new code"
   makes the fix immediately scannable.

5. **Micro-interaction:** The "Approve" button has a 500ms fill
   animation on click — a green progress fill sweeps left-to-right
   across the button before it locks into "Approved ✓" state.

---

## 1. Problem Statement

Blostem's BD and sales team is manually researching Indian fintech
companies, identifying relevant decision-makers, and writing
RBI/SEBI-compliant outreach emails from scratch — every single time.

This process takes an average of **4–6 hours per lead**:
- 1–2 hours researching the target company's existing products and gaps
- 1–2 hours writing a personalized email that maps Blostem's FD APIs
  to those gaps
- 1–2 hours reviewing the email for regulatory compliance

With a target outreach list of 10+ companies per week, the team wastes
**40+ hours/week** on work that is largely repetitive, templatable,
and automatable.

The secondary problem: emails written under time pressure often contain
non-compliant phrasing, creating regulatory risk for Blostem as a
licensed fintech infrastructure provider operating under RBI/SEBI
frameworks.

**Core Pain:** High-effort, compliance-risky, manually written B2B
outreach is the single biggest bottleneck in Blostem's enterprise
sales cycle.

---

## 2. Goals & Objectives

### Business Goals

**G1 — Speed:** Reduce time-to-outreach-email from 4–6 hours to under
60 seconds per lead.

**G2 — Compliance Safety:** Achieve a compliance auto-check pass rate
of ≥ 90% on first generation.

**G3 — Sales Volume:** Enable the BD team to increase weekly outreach
from ~5 leads/week to 50+ leads/week using the same headcount.

**G4 — Personalization at Scale:** Ensure 100% of generated emails
contain at least 3 company-specific details.

### User Goals

**G5 — Confidence:** BD managers can approve and send outreach emails
without needing a legal/compliance review step.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| End-to-end pipeline time | < 60 seconds | Timer from URL input to compliance result |
| Compliance auto-pass rate | ≥ 90% | % passing on first generation |
| Company-specific details | ≥ 3 per email | Manual review of 10 samples |
| Research accuracy | ≥ 85% factual | Cross-check vs company website |
| Flagged phrase detection | 100% on 5 test phrases | Input known phrases, verify caught |
| Dashboard load time | < 2 seconds | Browser performance tab |
| Pipeline error rate | < 5% | Failed runs / total runs |

---

## 4. Target Personas

### Persona 1: Arjun Mehta — Blostem BD Manager

- **Age:** 28–35
- **Role:** Business Development Manager at Blostem
- **Location:** Mumbai / Bengaluru
- **Technical Proficiency:** Medium — comfortable with SaaS dashboards
- **Daily Reality:** Researching fintechs on LinkedIn, writing emails,
  in compliance back-and-forth
- **Pain Points:**
  - Outreach emails take too long to write properly
  - Afraid to send emails with wrong phrasing
  - Hard to track which companies have been contacted
- **Goals:**
  - Send 10 quality outreach emails before lunch
  - Never have a compliance rejection again
- **Quote:** *"I know what to say, I just don't have time to say it
  correctly for every company."*

### UI Implication for Arjun:
The tool must feel **fast and authoritative**. Dark, precise UI
signals "professional tool" not "startup app." The compliance result
must be impossible to miss — it is the single most important moment
in his workflow. Every micro-interaction should reinforce the feeling
that Arjun is operating a powerful system, not filling out a form.

---

### Persona 2: Priya Sharma — Email Recipient

- **Age:** 30–40
- **Role:** VP Partnerships / CTO at Series A–C Indian fintech
- **What Makes Her Open an Email:**
  - References her actual product by name
  - Identifies a real gap in her offering
  - Sounds human, not templated
- **Quote:** *"If you haven't looked at our app before emailing me,
  don't bother."*

---

## 5. Features & Requirements

### P0 — Must Have (MVP)

#### Feature 1: URL Input Bar

**UI Specification:**
- Full-width input with dark background (`#111827`)
- Placeholder text in muted indigo: "https://jupiter.money"
- Left icon: magnifying glass (indigo, transitions to spinner on submit)
- Border: `#1F2937` default → `#6366F1` on focus (indigo glow ring)
- Error state: red border + inline error in `DM Mono` font
- Submit button: solid indigo `#6366F1`, sharp corners (`rounded-md`),
  transitions to "Running Pipeline..." with animated dots

**Acceptance Criteria:**
- [ ] Accepts any valid URL format (http/https)
- [ ] Rejects empty submission: "Please enter a valid URL"
- [ ] Rejects malformed URLs: "Invalid URL format. Try: https://company.com"
- [ ] Button disabled while pipeline is running
- [ ] Input cleared and ready after pipeline completes

---

#### Feature 2: Research Agent

**UI Specification:**
- Appears as a new "log entry" in the left vertical pipeline tracker
- Timestamp appears in `DM Mono` (`14:32:07`)
- Research Summary Panel slides in from the right (not top)
- Panel uses `#111827` background with `#1F2937` border
- "Gaps Identified" section has a subtle indigo left-border accent
  and indigo-tinted background (`#6366F1` at 8% opacity)
- Company name rendered in `Cabinet Grotesk` bold, large

**Acceptance Criteria:**
- [ ] Displays company name, description, existing products, gaps
- [ ] Completes within 20 seconds
- [ ] Collapsible with chevron icon (DM Mono label "RESEARCH")
- [ ] Saves to database

---

#### Feature 3: Drafter Agent

**UI Specification:**
- Email Preview Card appears to the right of the pipeline tracker
- Card header: dark (`#111827`) with "DRAFT" label in `DM Mono`
  uppercase, muted color
- Subject line has a distinct visual treatment: larger text,
  lighter color, monospace feel
- Email body in `text-base` with `leading-relaxed`
- Read-only until compliance check completes
- Word count shown as a small monospace badge bottom-right

**Acceptance Criteria:**
- [ ] Contains target company name
- [ ] References ≥ 1 specific product/feature
- [ ] Mentions ≥ 1 Blostem API or capability
- [ ] 150–300 words
- [ ] Subject line, greeting, 3-paragraph body, CTA, sign-off
- [ ] Completes within 20 seconds

---

#### Feature 4: Compliance Agent ⭐ THE AHA MOMENT

**UI Specification — This is the centerpiece interaction:**

**PASS State:**
- A phosphor-green bar sweeps across the top of the Email
  Preview Card (not just a badge — a full-width green accent
  line, 3px thick)
- "COMPLIANCE PASSED" label in `DM Mono` uppercase green
- Each line of the email that was checked gets a subtle
  green left-border (2px) — visual confirmation of review

**FAIL State (The Aha Moment):**
- A red bar sweeps across the top of the Email Preview Card
- "COMPLIANCE FAILED" in `DM Mono` uppercase red
- The flagged phrases in the email body pulse with a red
  highlight animation (2 pulses at 150ms each) then settle
  into a permanent red underline with red background tint
- Compliance Issues Panel slides in BELOW the email card
  (not overlaid — fully visible without scrolling past email)
- Each issue displayed as a "diff block":
  ```
  FLAGGED:     "guaranteed high returns"          ← DM Mono, red bg
  RULE:        RBI Circular 2023 — Assured return language prohibited
  REPLACE WITH: "up to X% p.a., subject to applicable terms"  ← DM Mono, green bg
  [APPLY →]
  ```
- "Apply" button uses an arrow symbol (→) to signal replacement
- After applying: flagged phrase fades out, replacement fades in
  (200ms crossfade in the email body)

**Acceptance Criteria:**
- [ ] Pass: green accent, "COMPLIANCE PASSED" in DM Mono
- [ ] Fail: red accent, flagged phrases highlighted with pulse animation
- [ ] 5 test phrases always flagged (guaranteed returns, 100% safe,
  best returns in the market, no risk, assured profit)
- [ ] Each flag shows: phrase, rule, source citation, replacement
- [ ] "Apply Suggestion" replaces phrase inline with crossfade
- [ ] "Re-check Compliance" available after any edit
- [ ] Result saved to database

---

#### Feature 5: Lead Dashboard

**UI Specification:**
- Table uses dark alternating rows (`#0A0F1E` / `#111827`)
- Column headers in `DM Mono` uppercase, small, muted
- Compliance badges are pill-shaped with high-contrast colors:
  - PASS: `#22D3EE` text on `#0E4F4F` bg (cyan-teal, clinical)
  - FAIL: `#F87171` text on `#4F0E0E` bg (red, alarming)
  - PENDING: `#94A3B8` text on `#1E293B` bg (neutral, waiting)
- Hover state: row gets a subtle indigo left-border (3px)
  and very slight bg lighten — directional, not flat highlight
- "View" button is minimal: just text + arrow icon, no border

**Acceptance Criteria:**
- [ ] Columns: Company, URL, Generated At, Compliance, Status, Actions
- [ ] Sorted by Generated At (newest first)
- [ ] Empty state with pointer arrow
- [ ] Loads < 2 seconds with up to 100 rows

---

#### Feature 6: Approve & Send (Simulated)

**UI Specification:**
- Approve button: full-width at bottom of Email Preview Card
- On click: green fill sweeps left-to-right across button (500ms)
- Then transitions to "APPROVED ✓" locked state
- Toast slides in from top-right: dark background, green accent
  left-border, "DM Mono" label "LEAD APPROVED"
- Leads table row updates badge immediately (optimistic UI)

**Acceptance Criteria:**
- [ ] Visible on lead detail view
- [ ] Click → status "Approved" in DB + UI
- [ ] Button → "Approved ✓" (disabled, green)
- [ ] Toast notification appears
- [ ] Leads table badge updates
- [ ] Timestamp logged in DB

---

### P1 — Should Have

#### Feature 7: Inline Email Editor
- Textarea activates on "Edit" click
- Dark textarea with indigo focus ring
- Character count in DM Mono, bottom right
- Auto-saved on blur

#### Feature 8: Lead History & Persistence
- All data persisted to Supabase
- Survives browser refresh

#### Feature 9: Re-run Compliance Check
- After editing, "RE-CHECK →" button available
- Shows visual diff between previous and new result

---

### P2 — Nice to Have

#### Feature 10: Bulk URL Input
#### Feature 11: Export to CSV
#### Feature 12: Slack Notification on Approval
#### Feature 13: Regenerate Email

---

## 6. Explicitly OUT OF SCOPE

1. Real email sending
2. User authentication / login system
3. Mobile application
4. CRM integration
5. Automated email scheduling
6. Multi-user / team collaboration
7. Payment or billing system
8. Contact/decision-maker lookup
9. Real-time web monitoring
10. White-labelling or multi-tenant architecture

---

## 7. User Scenarios

### Scenario 1: Happy Path

Arjun opens the dark dashboard. He sees the URL input prominently
centered at top. He pastes `https://smallcase.com`. The vertical
pipeline tracker on the left starts logging:

```
14:32:07  RESEARCH STARTED   ⟳
14:32:19  RESEARCH COMPLETE  ✓
14:32:20  DRAFTING STARTED   ⟳
14:32:34  DRAFT COMPLETE     ✓
14:32:35  COMPLIANCE CHECK   ⟳
14:32:46  COMPLIANCE PASSED  ✓
```

The email card on the right shows a green accent line at top.
"COMPLIANCE PASSED" in phosphor green DM Mono. Arjun clicks Approve.
The button fills green, locks. Toast appears. Done in 39 seconds.

---

### Scenario 2: The Aha Moment

Pipeline runs for `https://jupiter.money`. Compliance step returns FAIL.

The email card's top border flashes red. "COMPLIANCE FAILED" appears.
Two phrases in the email body pulse red — impossible to miss. The
diff panel below shows exactly what's wrong and how to fix it.

Arjun clicks "APPLY →" on both issues. The phrases crossfade to their
replacements inline. He clicks "RE-CHECK →". 12 seconds later:
"COMPLIANCE PASSED" in green. He approves.

This moment — seeing the AI catch a compliance issue and fix it — is
what the judges will remember.

---

### Scenario 3: Error Recovery

Research fails on a blocked site. The pipeline log shows:

```
14:35:12  RESEARCH FAILED    ✗
          Site blocked automated access.
          [TRY AGAIN]  [USE DOMAIN NAME ONLY →]
```

Arjun clicks "USE DOMAIN NAME ONLY →". Pipeline continues. Yellow
warning banner on the email card: "⚠ LIMITED DATA — less personalized."
He proceeds anyway.

---

## 8. Non-Functional Requirements

### Performance
- Full pipeline < 60 seconds for 95% of runs
- Dashboard initial load < 2 seconds
- API response for lead list < 500ms
- Compliance re-check < 20 seconds

### Security
- No PII stored in MVP
- API keys in server-side env vars only
- `X-Admin-Key` header protection
- Supabase RLS enabled
- Prompt injection mitigation on URL inputs

### Accessibility
- WCAG 2.1 Level AA
- All interactive elements have `aria-label`
- Color badges always have text labels (color never sole indicator)
- Keyboard navigation for all core flows
- Focus states visible on all interactive elements
- Minimum contrast: 4.5:1 for body text

### UI Consistency Rules (Binding)
- No generic SaaS template look
- No default Tailwind blue (#3B82F6) used anywhere
- No rounded-full on rectangular UI elements
- DM Mono used consistently for: timestamps, compliance labels,
  flagged phrases, word counts, pipeline log entries
- Cabinet Grotesk (or Sora) used for: headings, company names,
  page titles
- Inter or system font for: body text, email content only

---

*End of PRD v2.0*
