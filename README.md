# 🏢 FinTrust — AI Outreach & Compliance Agent

![Hackathon Submission](https://img.shields.io/badge/Status-Hackathon_Submission-brightgreen.svg)
![Frontend](https://img.shields.io/badge/Frontend-Next.js_14+%7C_Tailwind-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI+%7C_Python-yellow)
![AI Models](https://img.shields.io/badge/AI-Google_Gemini_2.5_Flash-orange)
![Scraping](https://img.shields.io/badge/Data-Tavily_Search_API-blueviolet)

<p align="center">
  <b>A Government-Grade Outreach Engine designed for Financial Services & Enterprise BD.</b>
</p>

---

## 📖 Overview

**FinTrust** (originally codenamed Blostem Outreach Agent) solves a critical problem for B2B financial services: sending personalized outreach without accidentally violating strict compliance guidelines (like RBI, SEBI, FTC, or CAN-SPAM).

Instead of a typical flashy "AI SaaS", FinTrust is built like a **Government Portal**. It acts as an autonomous compliance officer that strictly monitors, flags, and suggests fixes for any risky language in outbound sales communications.

## ✨ Key Features

1. **Automated Intelligence Gathering**: Uses the **Tavily Extract API** to autonomously scrape and deeply analyze a prospect's website.
2. **Generative Drafter**: Uses **Google Gemini 2.5 Flash** to draft highly personalized outreach sequences based *strictly* on the scraped target data.
3. **Dual-Layer Compliance Scanner**:
   - **Rule-Based Engine**: Catches hard-coded violations instantly (e.g., "guaranteed returns", "zero risk").
   - **AI Context Engine**: Gemini analyzes the nuance of the email to flag subtle misleading claims or missing clauses (like unsubscribe links).
4. **Interactive "Apply Fix" UI**: A document-style visual interface allows BD professionals to fix flagged phrases in one click, enforcing compliance seamlessly before the email can ever be approved for sending.

---

## 🛠️ Tech Stack & Architecture

- **Frontend (`/frontend`)**: 
  - Next.js 14 App Router, React, Tailwind CSS, Zustand (State Management)
  - **Design Philosophy**: High-contrast, maximum readability, professional light theme, step-by-step vertical approval flow.
  
- **Backend (`/backend`)**:
  - FastAPI (Python)
  - `google-genai` SDK for language modeling
  - `tavily-python` SDK for live internet access and site scraping

---

## 🚀 Getting Started

To run this application locally, you will need to start both the Python backend and the Next.js frontend.

### 1. Backend Setup

```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

**Environment Variables**
Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

**Run the Server**
```bash
uvicorn main:app --reload
```
*The backend will run on `http://localhost:8000`*

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
*The frontend will run on `http://localhost:3000`*

---

## 🛡️ Pipeline Flow

1. **Input Phase**: User inputs a target company URL (e.g. `https://razorpay.com`).
2. **Scraper Agent**: Fetches raw text via Tavily. (Fails gracefully to internal-LLM fallback if scraping is blocked).
3. **Research Agent**: Analyzes the company, extracting pain points and exact product names.
4. **Drafter Agent**: Writes a concise, context-aware 150-word email.
5. **Compliance Agent**: Rigorously analyzes against strict financial compliance rules. The UI locks approval until ALL flagged issues are resolved via the provided suggested fixes.

*Built with ❤️ for the Blostem Hackathon.*
