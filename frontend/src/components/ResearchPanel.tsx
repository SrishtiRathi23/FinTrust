'use client'

import type { ResearchData } from '@/lib/api'

interface ResearchPanelProps {
  research: ResearchData
}

export default function ResearchPanel({ research }: ResearchPanelProps) {
  return (
    <div className="space-y-4 text-sm text-[#374151]">
      {/* Company name + description */}
      <div>
        <p className="font-bold text-[#1A2B49] text-base">{research.company_name}</p>
        <p className="mt-1">{research.description}</p>
      </div>

      {/* Existing products */}
      {research.existing_products.length > 0 && (
        <div>
          <p className="font-semibold text-[#111827] mb-1">Current Products:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {research.existing_products.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Identified gaps */}
      {research.identified_gaps.length > 0 && (
        <div>
          <p className="font-semibold text-[#111827] mb-1">
            Potential Gaps (Outreach Opportunities):
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {research.identified_gaps.map((g, i) => (
              <li key={i} className="text-[#1A2B49]">{g}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
