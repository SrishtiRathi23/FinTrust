'use client'

import type { LogEntry, LogStatus } from '@/store/pipelineStore'

const STATUS_LABEL: Record<LogStatus, string> = {
  active:   'PROCESSING',
  complete: 'DONE',
  failed:   'FAILED',
  warning:  'WARNING',
  info:     'INFO',
}

interface PipelineLogProps {
  entries: LogEntry[]
  loading: boolean
}

export default function PipelineLog({ entries, loading }: PipelineLogProps) {
  if (entries.length === 0 && !loading) return null

  return (
    <div className="section-card border-t-0">
      <div className="section-header">
        <span className="section-number">2</span>
        <span className="section-title">Processing Status</span>
        {loading && (
          <span className="ml-auto badge-running text-xs">
            Processing...
          </span>
        )}
      </div>
      <div className="section-body">
        <div
          className="bg-[#F9FAFB] border border-[#E5E7EB] p-4"
          role="log"
          aria-label="Processing status"
          aria-live="polite"
        >
          {entries.map((entry) => (
            <p
              key={entry.id}
              className={`log-line status-${entry.status}`}
            >
              [{entry.timestamp}] {STATUS_LABEL[entry.status]}{' '}
              — {entry.label}
              {entry.detail ? ` (${entry.detail})` : ''}
            </p>
          ))}
          {loading && (
            <p className="log-line status-running animate-pulse">
              [...] Waiting for response...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
