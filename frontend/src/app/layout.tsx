import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FinTrust — Outreach Email Generator',
  description:
    'Generate and validate compliant outreach emails for fintech companies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-[#F8F9FA] text-[#111827] antialiased">
        {children}
      </body>
    </html>
  )
}
