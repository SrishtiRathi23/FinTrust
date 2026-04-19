// src/store/pipelineStore.ts
// Zustand global state — matches TECH_STACK.md schema

import { create } from 'zustand'
import type { ResearchData, DraftData, ComplianceData } from '@/lib/api'
import { generateLead } from '@/lib/api'

// ── Types ──────────────────────────────────────────────────────────────────

export type PipelineStep =
  | 'idle'
  | 'scraping'
  | 'research'
  | 'draft'
  | 'compliance'
  | 'complete'
  | 'error'

export type LogStatus = 'active' | 'complete' | 'failed' | 'warning' | 'info'

export interface LogEntry {
  id: string
  timestamp: string   // "14:32:07"
  label: string       // "RESEARCH STARTED"
  status: LogStatus
  detail?: string
}

export interface PipelineState {
  // State
  url: string
  loading: boolean
  currentStep: PipelineStep
  logs: LogEntry[]
  research: ResearchData | null
  draft: DraftData | null
  compliance: ComplianceData | null
  error: string | null

  // Editable email body — updated by applyFix
  editedEmailBody: string | null
  // Set of applied fix phrases
  appliedFixes: Set<string>

  // Actions
  setUrl: (url: string) => void
  addLog: (label: string, status: LogStatus, detail?: string) => void
  clearLogs: () => void
  runPipeline: () => Promise<void>
  reset: () => void

  // ✨ Key interaction: replace flagged phrase with suggested fix
  applyFix: (flaggedPhrase: string, replacement: string) => void
}

// ── Helpers ────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

let logCounter = 0
function makeId(): string {
  return `log_${++logCounter}_${Date.now()}`
}

// ── Store ──────────────────────────────────────────────────────────────────

export const usePipelineStore = create<PipelineState>((set, get) => ({
  url: '',
  loading: false,
  currentStep: 'idle',
  logs: [],
  research: null,
  draft: null,
  compliance: null,
  error: null,
  editedEmailBody: null,
  appliedFixes: new Set(),

  setUrl: (url) => set({ url }),

  addLog: (label, status, detail) => {
    const entry: LogEntry = {
      id: makeId(),
      timestamp: now(),
      label,
      status,
      detail,
    }
    set((state) => ({ logs: [...state.logs, entry] }))
  },

  clearLogs: () => set({ logs: [] }),

  reset: () =>
    set({
      loading: false,
      currentStep: 'idle',
      logs: [],
      research: null,
      draft: null,
      compliance: null,
      error: null,
      editedEmailBody: null,
      appliedFixes: new Set(),
    }),

  // ── Apply Fix: replace flagged phrase inline ───────────────────────────
  applyFix: (flaggedPhrase, replacement) => {
    const { draft, editedEmailBody, appliedFixes } = get()
    const currentBody = editedEmailBody ?? draft?.email_body ?? ''

    // Case-insensitive global replacement
    const regex = new RegExp(
      flaggedPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'gi'
    )
    const newBody = currentBody.replace(regex, replacement)

    const newApplied = new Set(appliedFixes)
    newApplied.add(flaggedPhrase.toLowerCase())

    set({ editedEmailBody: newBody, appliedFixes: newApplied })
  },

  runPipeline: async () => {
    const { url, addLog } = get()
    if (!url.trim()) return

    set({
      loading: true,
      currentStep: 'scraping',
      logs: [],
      research: null,
      draft: null,
      compliance: null,
      error: null,
      editedEmailBody: null,
      appliedFixes: new Set(),
    })

    addLog('SCRAPING WEBSITE', 'active')
    set({ currentStep: 'research' })
    addLog('RESEARCH STARTED', 'active')
    addLog('DRAFT GENERATION STARTED', 'info')
    addLog('COMPLIANCE CHECK STARTED', 'info')

    try {
      const result = await generateLead(url)

      // Research
      addLog(
        result.research.fallback ? 'RESEARCH — FALLBACK MODE' : 'RESEARCH COMPLETE',
        result.research.fallback ? 'warning' : 'complete',
        result.research.fallback
          ? 'Limited data — site may have blocked scraper'
          : `Identified: ${result.research.company_name}`
      )

      set({ currentStep: 'draft', research: result.research })

      // Draft
      addLog('DRAFT COMPLETE', 'complete', `${result.draft.word_count} words · subject set`)

      set({ currentStep: 'compliance', draft: result.draft })

      // Compliance
      const isFail = result.compliance.status === 'fail'
      addLog(
        isFail ? 'COMPLIANCE FAILED' : 'COMPLIANCE PASSED',
        isFail ? 'failed' : 'complete',
        isFail
          ? `${result.compliance.flagged_issues.length} flagged phrase(s) detected`
          : '0 issues found'
      )

      set({
        currentStep: 'complete',
        compliance: result.compliance,
        loading: false,
      })
      addLog('PIPELINE COMPLETE', 'complete')
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? 'Unknown error'
      set({ loading: false, currentStep: 'error', error: message })
      addLog('PIPELINE FAILED', 'failed', message)
    }
  },
}))
