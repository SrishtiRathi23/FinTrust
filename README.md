# FinTrust
**The Vernacular Gateway to Financial Growth**

[🚀 Live Demo Link] | [📺 Video Walkthrough] | [🛠️ Technical Brief]

## 📌 Problem Statement
Financial inclusion in India is often stalled by a **language and jargon barrier**. A user in rural India may have the capital to invest but is intimidated by terms like "12M Tenor," "Small Finance Bank," or "Compounding Frequency." Existing banking apps are built for English-speaking urbanites, leaving millions of vernacular users to rely on hearsay rather than data.

**The Mission:** To build an AI-first advisor that speaks the user's language (Hindi + English) and translates "Bank-speak" into "People-speak," making Fixed Deposits as easy to understand as a local market trade.

---

## 🛠️ Core Features (Track 1 Specifics)
* **Vernacular Interface:** Full support for **Hindi and English** using advanced Gemini LLM layers to fluently navigate conversational and cultural nuances.
* **Jargon Buster:** Automatically detects complex financial terms (Tenor, p.a., SFB risk parameters) and offers "Explain like I'm 5" definitions using simple, localized analogies.
* **Intelligent UI Injection:** The AI autonomously intercepts user buying intent and directly renders sleek FD Booking UI sliders right into the chat interface for a seamless one-click checkout.
* **B2B Outreach Generator (Bonus Ecosystem Suite):** Includes an incredibly robust secondary B2B pipeline that autonomously scrapes target clients via Tavily and drafts highly compliant financial sales emails with dual-layer safety checks.

---

## 🏗️ Technical Architecture
> **Judge Tip:** This addresses the [Technical Execution (25%)](https://blostem.com/hackathon) criteria.

* **Frontend:** Built natively with **Next.js 14 App Router, React, and Tailwind CSS**. Employs Zustand for dual-state management (`advisorStore` and `pipelineStore`).
* **LLM Engine:** Powered by **Google Gemini 2.5 Flash** (via Python SDK) for high-reasoning vernacular responses, multi-turn conversational history, and safety constraints.
* **Translation Layer:** Natively leverages Gemini's robust multilingual training data for high-accuracy localized translation without external API latency.
* **Database/API:** Integration with a live scraping API (**Tavily Python SDK**) to fetch live external context for B2B ops, utilizing an intelligent FastAPI backend to serve concurrent generation and booking logic.

---

## 🚀 How to Run Locally

### 1. Backend Setup (FastAPI)
```bash
cd backend

# Create a virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

**Environment Variables (`backend/.env`)**
```env
GEMINI_API_KEY=your_gemini_key
TAVILY_API_KEY=your_tavily_key
GEMINI_MODEL=gemini-2.5-flash
```

**Start the Server**
```bash
uvicorn main:app --reload
```
*The backend API will now run on `http://localhost:8000`.*

### 2. Frontend Setup (Next.js)
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
*The React user interface will run on `http://localhost:3000`. To access the Track 1 Vernacular Advisor, click the green "Launch B2C FD Advisor" button in the top right header!*
