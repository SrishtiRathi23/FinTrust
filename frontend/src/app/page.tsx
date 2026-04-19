'use client'

import { useState } from 'react'
import { usePipelineStore } from '@/store/pipelineStore'
import UrlInputBar from '@/components/UrlInputBar'
import PipelineLog from '@/components/PipelineLog'
import EmailPreviewCard from '@/components/EmailPreviewCard'
import ComplianceBadge from '@/components/ComplianceBadge'
import ResearchPanel from '@/components/ResearchPanel'

// ── Main page ──────────────────────────────────────────────────────────────

export default function HomePage() {
  const [isApproved, setIsApproved] = useState(false)

  const {
    logs,
    research,
    draft,
    compliance,
    loading,
    currentStep,
    reset: storeReset,
    editedEmailBody,
    appliedFixes,
  } = usePipelineStore()

  const reset = () => {
    setIsApproved(false)
    storeReset()
  }


  const hasResult = draft !== null
  const flaggedIssues = compliance?.flagged_issues ?? []

  const allFixed =
    compliance?.status === 'fail' &&
    compliance.flagged_issues.every((f) =>
      appliedFixes.has(f.flagged_phrase.toLowerCase())
    )

  return (
    <div className="min-h-screen bg-[#F8F9FA]">

      {/* ── Header bar ──────────────────────────────────────────────── */}
      <header className="bg-[#1A2B49] text-white">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">
                Blostem — Outreach Email Generator
              </h1>
              <p className="text-sm text-[#93C5FD]">
                Generate and validate compliant outreach emails for fintech companies
              </p>
            </div>
            {hasResult && !loading && (
              <button
                onClick={reset}
                className="border border-white px-4 py-2 text-sm font-semibold text-white hover:bg-white hover:text-[#1A2B49] transition-colors"
                aria-label="Start a new email generation"
              >
                Start New
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Accent stripe (Saffron + Green — India flag colors) ─────── */}
      <div className="flex h-1">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* ── Content — single column, max-width ──────────────────────── */}
      <main className="mx-auto max-w-3xl px-6 py-8 space-y-0" id="main-content">

        {/* ── SECTION 1: Input ─────────────────────────────────────── */}
        <div className="section-card">
          <div className="section-header">
            <span className="section-number">1</span>
            <span className="section-title">Enter Company Website</span>
          </div>
          <div className="section-body">
            {!hasResult && !loading && (
              <p className="mb-4 text-sm text-[#374151]">
                Enter a fintech company website URL. The system will research
                the company, generate a personalised outreach email, and check
                it for compliance with RBI/SEBI regulations.
              </p>
            )}
            <UrlInputBar />
          </div>
        </div>

        {/* ── SECTION 2: Processing Status ─────────────────────────── */}
        {(logs.length > 0 || loading) && (
          <PipelineLog entries={logs} loading={loading} />
        )}

        {/* ── Research summary (collapsed, not a full section) ─────── */}
        {research && !loading && (
          <div className="section-card border-t-0">
            <div className="section-header">
              <span className="section-number" style={{ background: '#F0FDF4', borderColor: '#138808' }}>i</span>
              <span className="section-title">Company Research Summary</span>
              {research.fallback && (
                <span className="ml-auto text-xs font-semibold text-[#B45309]">
                  Limited data available
                </span>
              )}
            </div>
            <div className="section-body">
              <ResearchPanel research={research} />
            </div>
          </div>
        )}

        {/* ── SECTION 3: Generated Email ───────────────────────────── */}
        {(draft || currentStep === 'draft') && (
          <EmailPreviewCard
            research={research}
            draft={draft}
            flaggedIssues={flaggedIssues}
            appliedFixes={appliedFixes}
            editedEmailBody={editedEmailBody}
          />
        )}

        {/* ── SECTION 4: Compliance Check ──────────────────────────── */}
        {compliance && !loading && (
          <ComplianceBadge compliance={compliance} />
        )}

        {/* ── SECTION 5: Final Action ───────────────────────────────── */}
        {compliance && !loading && !isApproved && (
          <div className="section-card border-t-0">
            <div className="section-header">
              <span className="section-number">5</span>
              <span className="section-title">Final Action</span>
            </div>
            <div className="section-body">
              {compliance.status === 'fail' && !allFixed ? (
                <p className="mb-4 text-sm text-[#374151]">
                  Please apply all compliance fixes in Section 4 before approving
                  this email.
                </p>
              ) : (
                <p className="mb-4 text-sm text-[#374151]">
                  This email is ready to send. Click &ldquo;Approve Email&rdquo; to confirm.
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <button
                  disabled={compliance.status === 'fail' && !allFixed}
                  className="btn-success sm:flex-1"
                  aria-label="Approve this email for sending"
                  onClick={() => setIsApproved(true)}
                >
                  Approve Email
                </button>
                <button
                  onClick={reset}
                  className="btn-secondary sm:flex-1"
                  aria-label="Discard and start over"
                >
                  Discard &amp; Start Over
                </button>
              </div>

              {compliance.status === 'fail' && !allFixed && (
                <p className="mt-2 text-xs text-[#DC2626]">
                  Approval is disabled until all compliance issues are resolved.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 5: Approved State ─────────────────────────────── */}
        {compliance && !loading && isApproved && (
          <div className="section-card border-t-0 !bg-[#F0FDF4] !border-[#BBF7D0]">
            <div className="section-body text-center py-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#15803D] mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#14532D] mb-2">Email Approved</h3>
              <p className="text-[#15803D] mb-8 font-medium">
                The compliant content has been securely saved and scheduled for sending.
              </p>
              <button
                onClick={reset}
                className="btn-secondary px-8 shadow-sm"
              >
                Generate Another Email
              </button>
            </div>
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="border-t border-[#D1D5DB] pt-6 mt-8">
          <p className="text-center text-xs text-[#9CA3AF]">
            Blostem AI Outreach Agent · Compliance checks reference RBI/SEBI guidelines ·
            Always review before sending
          </p>
        </div>

      </main>
    </div>
  )
}
