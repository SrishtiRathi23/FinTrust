# 🏢 FinTrust — The Complete AI Compliance & Outreach Engine

![Hackathon Submission](https://img.shields.io/badge/Status-Hackathon_Submission-brightgreen.svg)
![Frontend](https://img.shields.io/badge/Frontend-Next.js_14+%7C_Tailwind-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI+%7C_Python-yellow)
![AI Models](https://img.shields.io/badge/AI-Google_Gemini_2.5_Flash-orange)

<p align="center">
  <b>A unified suite for Financial Services encompassing Government-Grade B2B Outreach and Vernacular B2C Advisory (Track 1).</b>
</p>

---

## 📖 Overview

**FinTrust** fixes the communication gap in highly regulated environments. Whether you are a Business Development (BD) Manager trying to pitch a B2B API without triggering RBI compliance alarms, or a depositor in a Tier-2 city confused by banking jargon, FinTrust leverages LLMs to provide context, clarity, and uncompromising compliance.

FinTrust features two powerful, distinct modules built into a single dashboard:

1. **B2B Outreach Generator (Core):** Scrapes fintech websites autonomously, writes personalized emails, and validates them against strict compliance rule-sets.
2. **Vernacular FD Advisor (Track 1 Objective):** A bilingual (Hindi/English) B2C chat interface that simplifies complex financial jargon (like "12m Tenor", "p.a.", "SFB") into relatable analogies for Tier-3 depositors and seamlessly guides them through a mock FD booking flow.

---

## 🚀 How to Use FinTrust

FinTrust provides two distinct journeys you can test live from the single dashboard.

### Journey 1: The B2B Compliance Officer 
*Use case: You want to securely pitch financial APIs to a business.*

1. Open the app home page (`http://localhost:3000`).
2. Type in a target company's URL (e.g., `https://razorpay.com`) into the main input bar and hit **Analyze**.
3. **Watch the Pipeline:** The dashboard will sequentially light up as Tavily scrapes the page, the Research Agent identifies pain points, and the Drafter writes an email.
4. **Fix Compliance:** If the Drafter uses "banned" sales terms (like *guaranteed* or *zero risk*), the Compliance Module will highlight them in **RED**. Click the **Apply Fix** button to dynamically rewrite the sentence to a compliant state.
5. **Approve:** Once the panel turns green, click **Approve Email** to copy it.

### Journey 2: The B2C Vernacular FD Advisor (Track 1)
*Use case: A retail user in a non-metro city needs help understanding an FD offer.*

1. Open the app home page, and look at the top header area.
2. Click the green **"Launch B2C FD Advisor &rarr;"** button.
3. **Select Language:** On the Advisor page, use the top-right dropdown to choose your language (e.g., **हिंदी (Hindi)**).
4. **Ask a Jargon Question:** Click one of the suggested prompts (e.g., *"12M Tenor क्या होता है?"*). Watch the Gemini AI respond natively in Hindi, using simple layman analogies rather than banking terms.
5. **Trigger the Booking Flow:** Type intent-driven commands playfully: *"I want to invest"* or *"मुझे निवेश करना है"*.
6. **Book It:** The chatbot will seamlessly intercept your intent and render a slick **UI Booking Card** right in the chat window. Slide the investment sliders and click **Complete KYC** to finish!

---

## 🛠️ Startup Instructions 

To run this application locally, you will need to start both the Python backend and the Next.js frontend concurrently.

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
Create a `.env` file in the `backend/` directory with your live keys:
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

## 🧠 Architecture Stack

- **Frontend (`/frontend`)**: 
  - Next.js 14 App Router, React, Tailwind CSS
  - **Zustand** (Dual State Management for `pipelineStore` and `advisorStore`)
- **Backend (`/backend`)**:
  - FastAPI (Python)
  - **`google-genai` SDK:** Powers the multi-turn conversational history and strict language extraction.
  - **`tavily-python` SDK:** Used for scraping live B2B target websites instantly.

*Built with ❤️ for the Blostem Hackathon by FinTrust.*
