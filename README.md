# BLINDSPOT AI 👁️
### AI-Powered Information Gap Detection & Evidence Intelligence Platform
> *"Don't Just Find Answers. Discover What's Missing."*

---

## 🌟 Overview
**BLINDSPOT AI** is a production-grade research intelligence system built to protect researchers, policy analysts, students, and enterprise decision-makers from the hidden dangers of automated research: **hallucinations, missing stipulations, conflicting requirements, and outdated information**.

Traditional search and generative AI engines synthesize what they find into plausible-sounding summaries. BLINDSPOT AI takes an **adversarial epistemic approach**:
1. **Decomposes** goals into mandatory verification requirements.
2. **Ingests** multiple sources (official portals, PDFs, secondary guides) with cryptographic hashing and strict SSRF defenses.
3. **Pinpoints Gaps**: Identifies what *should* be there but is missing.
4. **Detects Contradictions**: Discriminates between true contradictions and differences in scope or publication date.
5. **Audits Temporal Freshness**: Flags stale dates, superseded rules, and missing timestamps.
6. **Constructs an Interactive Traceability Graph**: Every claim traces directly back to verifiable source passages.
7. **Calculates Decision Readiness**: An explainable score showing when you have sufficient verifiable facts to act.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Python 3.14+ / FastAPI (high-concurrency asynchronous REST API)
- **Database ORM**: SQLAlchemy 2.0 (AsyncIO) with SQLite (zero-setup default) & PostgreSQL/pgvector compatibility
- **Security & Cryptography**: Argon2id password hashing, PyJWT HMAC-SHA256 tokens, SHA-256 source hashing
- **Intelligence Providers**: Google Gemini API (`gemini-2.5-flash`) with structured JSON schema + built-in offline heuristics engine
- **Document & Web Parsing**: PyPDF, BeautifulSoup4, HTTPX with DNS SSRF filtering

### Frontend
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (Dark Navy & Graphite theme with Electric Blue & Violet accents)
- **3D & Visualizations**: Three.js, React Three Fiber, React Three Drei
- **Evidence Graph**: React Flow (`@xyflow/react`)
- **State & Forms**: TanStack Query, React Hook Form, Zod
- **Icons & Motion**: Lucide React, Framer Motion

---

## 🔒 Security Architecture
BLINDSPOT AI was engineered with defense-in-depth security:
- **SSRF Immunity**: Dedicated pre-flight DNS resolver blocks access to private IP subnets (`127.0.0.1`, RFC1918) and cloud metadata (`169.254.169.254`).
- **Object-Level Multi-Tenancy (IDOR Protection)**: Every query on private records strictly enforces authenticated ownership.
- **Argon2id Key Derivation**: Modern memory-hard hashing preventing GPU/ASIC brute-force cracking.
- **Magic-Byte File Validation**: PDF uploads are validated by header signature (`%PDF-`), size-capped at 15MB, and stored outside static web roots with UUID naming.
- **OWASP Secure Headers**: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
- **Sliding-Window Rate Limiting**: Protects authentication and expensive AI endpoints from denial of service.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+ (Tested on 3.14)
- Node.js 18+ (Tested on 25.9)
- npm or pnpm

### 1. Clone & Configure Environment
```bash
cp .env.example .env
# Edit .env to set your GEMINI_API_KEY if desired.
# Note: The platform includes a complete deterministic offline engine that runs with full fidelity even without an API key!
```

### 2. Run Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation will be available at `http://localhost:8000/docs`.

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend web application will run at `http://localhost:5173`.

---

## 🎓 Hackathon Showcase Scenario: The Scholarship Dilemma
Click **"Load Scholarship Demo"** on the research screen to see an instant live demonstration:
1. Research Question: *"What should I verify before applying for a government scholarship?"*
2. System decomposes requirements: Income thresholds, renewal criteria, documentation, deadline.
3. Multiple sources are cross-referenced (Official 2026 Portal vs 2023 Secondary Guide).
4. System discovers:
   - **Missing Information**: Renewal CGPA criteria omitted in portal summary.
   - **Contradiction**: Secondary guide quotes \$50,000 income limit; official portal quotes \$65,000.
   - **Temporal Staleness**: Flags the secondary guide as published in 2023.
   - **Traceability Graph**: Explore nodes and highlight verbatim source excerpts.
   - **Verification Copilot**: Actionable tasks to confirm renewal policy with the admissions office.

---

## 📄 License
MIT License. Developed for hackathon demonstration with production-ready security engineering.
