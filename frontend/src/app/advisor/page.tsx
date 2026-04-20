'use client'

import { useState, useRef, useEffect } from 'react'
import { useAdvisorStore } from '@/store/advisorStore'
import Link from 'next/link'

const HINDI_PROMPTS = [
  "Suryoday में 8.50% p.a. का क्या मतलब है?",
  "12M Tenor क्या होता है?",
  "क्या Small Finance Bank सुरक्षित हैं?"
]

const ENGLISH_PROMPTS = [
  "What does 8.50% p.a. at Suryoday mean?",
  "Can you explain a 12M Tenor?",
  "Are Small Finance Banks safe?"
]

export default function AdvisorPage() {
  const { 
    language, setLanguage, 
    messages, addMessage, 
    loading, setLoading, 
    bookingTriggered, reset 
  } = useAdvisorStore()
  
  const [inputText, setInputText] = useState('')
  const [kycComplete, setKycComplete] = useState(false)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, bookingTriggered, kycComplete])

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return

    addMessage({ role: 'user', content: text })
    setInputText('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: text }],
          language: language
        })
      })
      
      const data = await response.json()
      addMessage({ role: 'assistant', content: data.message })
      
      if (data.trigger_booking) {
        useAdvisorStore.getState().setBookingTriggered(true)
      }
    } catch (error) {
      addMessage({ role: 'assistant', content: "Network error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const prompts = language === 'Hindi' ? HINDI_PROMPTS : ENGLISH_PROMPTS

  return (
    <div className="flex h-screen flex-col bg-[#F3F4F6] font-sans">
      {/* Header */}
      <header className="bg-[#1A2B49] text-white px-4 py-3 shadow-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-300 hover:text-white" onClick={reset}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold">FinTrust Advisor</h1>
            <p className="text-xs text-blue-200">
              {language === 'Hindi' ? 'आपकी स्थानीय भाषा में सहायता' : 'Bilingual Support (Gorakhpur region)'}
            </p>
          </div>
        </div>
        
        <select 
          className="bg-[#2D3748] text-white text-sm rounded-md px-2 py-1 border border-gray-600 focus:outline-none"
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value as 'English' | 'Hindi')
            reset()
          }}
        >
          <option value="Hindi">हिंदी (Hindi)</option>
          <option value="English">English</option>
        </select>
      </header>
      
      {/* Accent Stripe */}
      <div className="flex h-1 shrink-0">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
        
        {/* Empty State / Welcome */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center max-w-md border border-gray-200">
              <div className="w-16 h-16 bg-[#1A2B49] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">💰</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {language === 'Hindi' ? 'नमस्ते! मैं आपका बैंक सलाहकार हूँ।' : 'Hello! I am your Bank Advisor.'}
              </h2>
              <p className="text-gray-600 text-sm">
                {language === 'Hindi' 
                  ? 'FD (Fixed Deposit) के बारे में कोई भी कठिन शब्द या ऑफर समझ में नहीं आ रहा है? मुझसे पूछें!' 
                  : 'Confused by FD jargon or a complex bank offer? Ask me below in plain terms.'}
              </p>
            </div>
            
            <div className="w-full max-w-md flex flex-col gap-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider pl-1 font-mono">
                {language === 'Hindi' ? 'सुझाए गए प्रश्न:' : 'Suggested Prompts:'}
              </p>
              {prompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="text-left bg-white border border-[#D1D5DB] rounded-lg p-3 text-sm text-[#1A2B49] font-medium hover:bg-gray-50 shadow-sm transition-all"
                >
                  &ldquo;{p}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((m, idx) => (
           <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
             <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm ${
               m.role === 'user' 
                 ? 'bg-[#1A2B49] text-white rounded-br-none' 
                 : 'bg-white border border-[#D1D5DB] text-gray-800 rounded-bl-none'
             }`}>
               <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
             </div>
           </div>
        ))}

        {loading && (
          <div className="flex justify-start w-full">
            <div className="bg-white border border-[#D1D5DB] rounded-2xl rounded-bl-none p-4 shadow-sm flex gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        )}

        {/* Booking Card Injection */}
        {bookingTriggered && !loading && (
          <div className="flex justify-start w-full mt-2">
            <div className="max-w-[90%] sm:max-w-md w-full bg-white border-2 border-[#138808] rounded-xl shadow-md overflow-hidden">
               <div className="bg-[#138808] text-white px-4 py-2 text-sm font-bold flex justify-between items-center">
                 <span>{language === 'Hindi' ? 'FD बुकिंग शुरू करें' : 'Start FD Booking'}</span>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                 </svg>
               </div>
               
               {kycComplete ? (
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {language === 'Hindi' ? 'बधाई हो!' : 'Congratulations!'}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {language === 'Hindi' ? 'आपकी FD सफलतापूर्वक बुक हो गई है।' : 'Your FD has been successfully booked.'}
                    </p>
                  </div>
               ) : (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {language === 'Hindi' ? 'निवेश राशि (रु)' : 'Investment Amount (₹)'}
                      </label>
                      <input type="range" min="5000" max="100000" step="5000" defaultValue="10000" className="w-full accent-[#1A2B49]" />
                      <div className="flex justify-between text-xs text-gray-400 font-mono mt-1">
                        <span>₹5,000</span>
                        <span>₹1,00,000</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {language === 'Hindi' ? 'अवधि (Tenor)' : 'Duration (Tenor)'}
                      </label>
                      <select className="w-full border border-gray-300 rounded p-2 text-sm text-gray-800">
                        <option>6 Months (6.5%)</option>
                        <option selected>12 Months (8.5%)</option>
                        <option>3 Years (7.0%)</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={() => setKycComplete(true)}
                        className="w-full bg-[#FF9933] hover:bg-[#e68a2e] text-white font-bold py-3 px-4 rounded-lg transition-colors"
                      >
                        {language === 'Hindi' ? 'KYC पूरा करें और बुक करें' : 'Complete KYC & Book'}
                      </button>
                    </div>
                  </div>
               )}
            </div>
          </div>
        )}

        <div ref={endOfMessagesRef} />
      </main>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 sm:p-4 shrink-0">
        <form 
          className="max-w-4xl mx-auto flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(inputText)
          }}
        >
          <input
            type="text"
            className="flex-1 bg-gray-100 border border-gray-300 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B49] text-gray-800"
            placeholder={language === 'Hindi' ? 'अपना प्रश्न यहाँ लिखें...' : 'Type your question here...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="bg-[#1A2B49] text-white rounded-full p-3 w-12 h-12 flex items-center justify-center hover:bg-[#2c4068] disabled:opacity-50 transition-colors"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>

    </div>
  )
}
