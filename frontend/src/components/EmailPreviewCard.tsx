'use client'

import { useMemo } from 'react'
import type { DraftData, ResearchData, FlaggedIssue } from '@/lib/api'

// ── Build segments with flagged phrases ────────────────────────────────────

interface Segment { text: string; flagged: boolean }

function buildSegments(
  body: string,
  phrases: string[],
  applied: Set<string>
): Segment[] {
  const active = phrases.filter((p) => !applied.has(p.toLowerCase()))
  if (!active.length) return [{ text: body, flagged: false }]

  const escaped = active.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')

  const segments: Segment[] = []
  let last = 0
  let m: RegExpExecArray | null

  while ((m = regex.exec(body)) !== null) {
    if (m.index > last) segments.push({ text: body.slice(last, m.index), flagged: false })
    segments.push({ text: m[0], flagged: true })
    last = m.index + m[0].length
  }
  if (last < body.length) segments.push({ text: body.slice(last), flagged: false })
  return segments
}

// ── Component ─────────────────────────────────────────────────────────────

interface EmailPreviewCardProps {
  research: ResearchData | null
  draft: DraftData | null
  flaggedIssues?: FlaggedIssue[]
  appliedFixes?: Set<string>
  editedEmailBody?: string | null
}

export default function EmailPreviewCard({
  research,
  draft,
  flaggedIssues = [],
  appliedFixes = new Set(),
  editedEmailBody,
}: EmailPreviewCardProps) {

  const displayBody = editedEmailBody ?? draft?.email_body ?? ''
  const phrases = flaggedIssues.map((f) => f.flagged_phrase)
  const segments = useMemo(
    () => buildSegments(displayBody, phrases, appliedFixes),
    [displayBody, phrases, appliedFixes]
  )

  const hasFlagged = phrases.some((p) => !appliedFixes.has(p.toLowerCase()))

  return (
    <div className="section-card border-t-0">
      <div className="section-header">
        <span className="section-number">3</span>
        <span className="section-title">Generated Email</span>
        {hasFlagged && (
          <span className="ml-auto text-xs font-semibold text-[#DC2626]">
            Compliance issues found — see below
          </span>
        )}
      </div>

      <div className="section-body">
        {/* Company context */}
        {research?.company_name && (
          <p className="mb-4 text-sm text-[#374151]">
            <span className="font-semibold">Company:</span> {research.company_name}
            {research.fallback && (
              <span className="ml-2 text-[#B45309] font-semibold">
                (Limited data available)
              </span>
            )}
          </p>
        )}

        {/* Email document */}
        <div
          className={[
            'border bg-white p-6',
            hasFlagged ? 'border-[#FECACA]' : 'border-[#D1D5DB]',
          ].join(' ')}
          aria-label="Generated email"
        >
          {/* Subject line */}
          <div className="mb-4 border-b border-[#E5E7EB] pb-3">
            <span className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">
              Subject:{' '}
            </span>
            <span className="text-base font-semibold text-[#111827]">
              {draft?.subject}
            </span>
          </div>

          {/* Body */}
          <pre
            className="whitespace-pre-wrap text-sm leading-relaxed text-[#111827]"
            style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
          >
            {segments.map((seg, i) =>
              seg.flagged ? (
                <mark key={i} className="phrase-flagged">
                  {seg.text}
                </mark>
              ) : (
                seg.text
              )
            )}
          </pre>

          {/* Word count */}
          <p className="mt-4 border-t border-[#F3F4F6] pt-2 text-right text-xs text-[#6B7280]">
            {draft?.word_count} words
          </p>
        </div>

        {/* Highlight legend */}
        {hasFlagged && (
          <p className="mt-2 text-xs text-[#374151]">
            Text highlighted in{' '}
            <mark className="phrase-flagged px-1">red</mark>{' '}
            contains compliance issues. See the Compliance Check section below.
          </p>
        )}
      </div>
    </div>
  )
}
