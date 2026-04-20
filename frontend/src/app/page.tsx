'use client'

import { useState } from 'react'
import { usePipelineStore } from '@/store/pipelineStore'
import UrlInputBar from '@/components/UrlInputBar'
import PipelineLog from '@/components/PipelineLog'
import EmailPreviewCard from '@/components/EmailPreviewCard'
import ComplianceBadge from '@/components/ComplianceBadge'
import ResearchPanel from '@/components/ResearchPanel'
import Link from 'next/link'

// ── Main page ──────────────────────────────────────────────────────────────

export default function HomePage() {
  const [isApproved, setIsApproved] = useState(false)
  const [copied, setCopied] = useState(false)

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
                FinTrust — Outreach Email Generator
              </h1>
              <p className="text-sm text-[#93C5FD]">
                Generate and validate compliant outreach emails for fintech companies
              </p>
            </div>
            <div className="flex gap-4 items-center flex-wrap">
              <Link 
                href="/faq" 
                className="text-white hover:text-blue-300 text-sm font-semibold transition-colors underline object-contain"
              >
                FAQ
              </Link>
              <Link 
                href="/advisor" 
                className="bg-[#138808] hover:bg-[#0f6c06] text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
              >
                Launch B2C FD Advisor &rarr;
              </Link>

              {hasResult && !loading && (
                <button
                  onClick={reset}
                  className="border border-white px-4 py-2 text-sm font-semibold text-white hover:bg-white hover:text-[#1A2B49] transition-colors rounded-md"
                  aria-label="Start a new email generation"
                >
                  Start New
                </button>
              )}
            </div>
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

        {/* ── SECTION 5: Approved State (Final Draft Viewer) ─────────── */}
        {compliance && !loading && isApproved && (
          <div className="section-card border-t-0 bg-white">
            <div className="section-header !bg-[#F0FDF4] border-b border-[#BBF7D0]">
              <span className="section-number !bg-[#15803D]">✓</span>
              <span className="section-title text-[#14532D]">Final Email Draft Ready</span>
            </div>
            <div className="section-body">
              <p className="text-sm text-gray-600 mb-4">
                Your fully compliant email has been finalized. You can now copy and paste this directly into your email client.
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded p-5 mb-6 relative">
                <div className="text-sm text-gray-800 font-medium mb-3 pb-3 border-b border-gray-200">
                  <span className="font-bold uppercase tracking-wide text-gray-500 text-xs">Subject: </span>
                  {draft?.subject}
                </div>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {editedEmailBody ?? draft?.email_body}
                </pre>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
                <button
                  onClick={() => {
                    const textToCopy = `Subject: ${draft?.subject}\n\n${editedEmailBody ?? draft?.email_body}`;
                    navigator.clipboard.writeText(textToCopy);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`px-8 py-3 rounded text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={reset}
                  className="btn-secondary px-8 shadow-sm"
                >
                  Generate Another Email
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="border-t border-[#D1D5DB] pt-6 mt-8">
          <p className="text-center text-xs text-[#9CA3AF]">
            FinTrust AI Outreach Agent · Compliance checks reference RBI/SEBI guidelines ·
            Always review before sending
          </p>
        </div>

      </main>
    </div>
  )
}
