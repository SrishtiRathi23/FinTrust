import Link from 'next/link'

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-[#1A2B49] text-white">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">FinTrust — FAQ</h1>
            <p className="text-sm text-[#93C5FD]">
              Understanding our AI Workflow & Compliance Engine
            </p>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <Link 
              href="/" 
              className="text-white hover:text-blue-300 text-sm font-semibold transition-colors underline"
            >
              Back to Dashboard
            </Link>
            <Link 
              href="/advisor" 
              className="bg-[#138808] hover:bg-[#0f6c06] text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
            >
              Launch B2C FD Advisor &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* ── FAQ Content ───────────────────────────────────────────── */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="bg-white p-8 sm:p-10 rounded-xl border border-[#D1D5DB] shadow-md">
          <h2 className="text-3xl font-bold text-[#1A2B49] mb-8 text-center border-b pb-6 border-gray-100">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#1A2B49] flex items-center gap-2">
                <span className="text-[#138808]">1.</span> What exactly is FinTrust?
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-700 mt-2">
                FinTrust is a comprehensive AI engine for financial services. It automatically drafts and rigorously checks B2B outreach emails against financial regulations, and features a Vernacular B2C chatbot for non-English speakers.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#1A2B49] flex items-center gap-2">
                <span className="text-[#138808]">2.</span> How does the Scraping & Research workflow operate?
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-700 mt-2">
                When you input a URL into the tracker on the main dashboard, our AI (via Tavily) visits the webpage to extract core company details, target audience, and business context. This completely shapes the personalized B2B email to ensure hyper-relevant financial outreach.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#1A2B49] flex items-center gap-2">
                <span className="text-[#138808]">3.</span> What happens when I click "Generate Email"?
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-700 mt-2">
                Clicking "Generate Email" activates our Drafter Agent. It uses the research context to write a professional B2B email. Next, the draft is instantly passed to our Compliance Agent, which scans the body against RBI and SEBI marketing rules before it is shown to you.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#1A2B49] flex items-center gap-2">
                <span className="text-[#138808]">4.</span> What does the "Compliance Layer" do?
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-700 mt-2">
                Our dual-layer module catches dangerous financial claims (like "guaranteed returns" or "zero risk") and uses semantic AI context recognition to flag subtle misleading points. It then offers one-click "Apply Fix" alternatives to seamlessly rewrite your email securely.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#1A2B49] flex items-center gap-2">
                <span className="text-[#138808]">5.</span> How does "Approve Email" work?
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-700 mt-2">
                Once all compliance flags are successfully resolved, the "Approve Email" button unlocks. Clicking it finalizes your draft into a clean, ready-to-copy viewer where a "Copy to Clipboard" button lets you smoothly transport the final text directly into Gmail or Outlook.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#1A2B49] flex items-center gap-2">
                <span className="text-[#138808]">6.</span> Who is the B2C Vernacular FD Advisor for?
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-700 mt-2">
                It is a built-in multilingual chat module designed for Tier-2 and Tier-3 city depositors. It explains complicated banking jargon (e.g., "p.a.", "Tenor") through simple local analogies and guides them through an interactive mock FD booking process.
              </p>
            </div>

          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="pt-10 pb-6">
          <p className="text-center text-xs text-[#9CA3AF]">
            FinTrust AI Agent · Compliance checks reference RBI/SEBI guidelines
          </p>
        </div>
      </main>
    </div>
  )
}
