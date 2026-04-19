'use client'

import type { ComplianceData, FlaggedIssue } from '@/lib/api'
import { usePipelineStore } from '@/store/pipelineStore'

// ── Single issue block ─────────────────────────────────────────────────────

function IssueBlock({
  flag,
  index,
  isApplied,
  onApply,
}: {
  flag: FlaggedIssue
  index: number
  isApplied: boolean
  onApply: () => void
}) {
  return (
    <div
      className={[
        'border p-4 mb-3',
        isApplied ? 'border-[#BBF7D0] bg-[#F0FDF4]' : 'border-[#FECACA] bg-[#FEF2F2]',
      ].join(' ')}
      aria-label={`Issue ${index + 1}`}
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#6B7280]">
        Issue {index + 1}
        {isApplied && (
          <span className="ml-2 text-[#15803D]">— Fixed</span>
        )}
      </p>

      {/* Flagged */}
      <div className="mb-3">
        <p className="text-xs font-bold text-[#DC2626] mb-1">Flagged phrase:</p>
        <p className="border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm font-mono text-[#991B1B]">
          &ldquo;{flag.flagged_phrase}&rdquo;
        </p>
      </div>

      {/* Rule */}
      <div className="mb-3">
        <p className="text-xs font-bold text-[#374151] mb-1">Rule violated:</p>
        <p className="text-sm text-[#374151] bg-white border border-[#E5E7EB] px-3 py-2">
          {flag.rule}
        </p>
      </div>

      {/* Fix */}
      <div className="mb-4">
        <p className="text-xs font-bold text-[#15803D] mb-1">Suggested replacement:</p>
        <p className="border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-sm font-mono text-[#14532D]">
          &ldquo;{flag.suggested_replacement}&rdquo;
        </p>
      </div>

      {/* Apply Fix button */}
      {!isApplied ? (
        <button
          onClick={onApply}
          id={`apply-fix-${index}`}
          className="btn-fix"
          aria-label={`Apply fix for issue ${index + 1}`}
        >
          Apply Fix
        </button>
      ) : (
        <p className="text-sm font-semibold text-[#15803D]">
          ✓ Fix applied — email has been updated
        </p>
      )}
    </div>
  )
}

// ── Main compliance component ──────────────────────────────────────────────

interface ComplianceBadgeProps {
  compliance: ComplianceData
}

export default function ComplianceBadge({ compliance }: ComplianceBadgeProps) {
  const { appliedFixes, applyFix } = usePipelineStore()

  const isPassed = compliance.status === 'pass'
  const allFixed =
    !isPassed &&
    compliance.flagged_issues.every((f) =>
      appliedFixes.has(f.flagged_phrase.toLowerCase())
    )
  const fixedCount = compliance.flagged_issues.filter((f) =>
    appliedFixes.has(f.flagged_phrase.toLowerCase())
  ).length

  return (
    <div className="section-card border-t-0">
      <div className="section-header">
        <span className="section-number">4</span>
        <span className="section-title">Compliance Check</span>
      </div>

      <div className="section-body space-y-4">
        {/* Status line */}
        <div className="border border-[#D1D5DB] bg-[#F9FAFB] px-5 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#6B7280] mb-1">
                Status
              </p>
              {isPassed ? (
                <p className="text-xl font-bold text-[#15803D]">PASSED</p>
              ) : allFixed ? (
                <p className="text-xl font-bold text-[#B45309]">
                  PASSED AFTER FIXES
                </p>
              ) : (
                <p className="text-xl font-bold text-[#DC2626]">FAILED</p>
              )}
            </div>
            <div className="text-right">
              {isPassed ? (
                <span className="badge-pass">No issues found</span>
              ) : (
                <span className={allFixed ? 'badge-pass' : 'badge-fail'}>
                  {fixedCount} of {compliance.flagged_issues.length} issue
                  {compliance.flagged_issues.length !== 1 && 's'} fixed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI notes */}
        {compliance.ai_notes && (
          <p className="text-sm text-[#374151] border-l-4 border-[#D1D5DB] pl-3">
            {compliance.ai_notes}
          </p>
        )}

        {/* Issues */}
        {!isPassed && compliance.flagged_issues.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-semibold text-[#111827]">
              The following issues must be fixed before sending:
            </p>
            {compliance.flagged_issues.map((flag, i) => (
              <IssueBlock
                key={`${flag.flagged_phrase}-${i}`}
                flag={flag}
                index={i}
                isApplied={appliedFixes.has(flag.flagged_phrase.toLowerCase())}
                onApply={() => applyFix(flag.flagged_phrase, flag.suggested_replacement)}
              />
            ))}
          </div>
        )}

        {/* Passed state */}
        {isPassed && (
          <p className="text-sm text-[#374151]">
            This email has been checked and no compliance violations were found.
            It is ready to review and send.
          </p>
        )}

        {/* All fixed notice */}
        {allFixed && !isPassed && (
          <div className="border border-[#D1D5DB] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
            All issues have been fixed. Please review the updated email before
            approving and sending.
          </div>
        )}
      </div>
    </div>
  )
}
