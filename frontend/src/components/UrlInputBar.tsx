'use client'

import { useState } from 'react'
import { usePipelineStore } from '@/store/pipelineStore'

function validateUrl(value: string): string | null {
  if (!value.trim()) return 'Please enter a company website URL'
  try {
    new URL(value)
    return null
  } catch {
    return 'Please enter a valid URL starting with https://'
  }
}

export default function UrlInputBar() {
  const { url, setUrl, loading, runPipeline } = usePipelineStore()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validateUrl(url)
    if (err) { setError(err); return }
    setError(null)
    await runPipeline()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="company-url"
          className="block text-sm font-semibold text-[#111827] mb-1"
        >
          Company Website URL
        </label>
        <input
          id="company-url"
          type="text"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(null) }}
          placeholder="https://example.com"
          disabled={loading}
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby={error ? 'url-error' : undefined}
          className={[
            'w-full border px-4 py-3 text-base text-[#111827] bg-white',
            'focus:outline-none focus:ring-2 focus:ring-[#1A2B49]',
            'disabled:bg-[#F3F4F6] disabled:cursor-not-allowed',
            error ? 'border-[#DC2626]' : 'border-[#D1D5DB]',
          ].join(' ')}
        />
        {error && (
          <p id="url-error" role="alert" className="mt-1 text-sm text-[#DC2626]">
            {error}
          </p>
        )}
        <p className="mt-1 text-xs text-[#6B7280]">
          Example: https://jupiter.money, https://razorpay.com
        </p>
      </div>

      <button
        type="submit"
        id="generate-btn"
        disabled={loading || !url.trim()}
        className="btn-primary"
        aria-label="Generate outreach email"
      >
        {loading ? 'Processing... Please wait' : 'Generate Email'}
      </button>
    </form>
  )
}
