# BLINDSPOT AI — Phased Implementation Plan

## Phase Overview

```
[Phase 1] Environment & Security Docs  ===> COMPLETED
[Phase 2] Backend Core & Security API  ===> IN PROGRESS
[Phase 3] AI & Intelligence Engines   ===> NEXT
[Phase 4] Automated Backend Tests     ===> UPCOMING
[Phase 5] Modern React Frontend (Vite) ===> UPCOMING
[Phase 6] 3D Hero & React Flow Graph  ===> UPCOMING
[Phase 7] End-to-End Demo & Packaging ===> UPCOMING
```

---

## Detailed Task Breakdown

### Phase 1: Environment & Security Documentation (DONE)
- [x] Initialized Git repository with comprehensive `.gitignore`.
- [x] Resolved Windows NTFS reparse point attribute on workspace.
- [x] Authored `ARCHITECTURE.md`, `SECURITY_AUDIT.md`, `IMPLEMENTATION_PLAN.md`, and `README.md`.
- [x] Created `.env.example` with zero sensitive credentials.

### Phase 2: Backend Architecture & Security Core
- [ ] Configure `backend/` directory structure.
- [ ] Implement settings via `pydantic-settings` with strict validation.
- [ ] Define SQLAlchemy Async ORM models:
  - `User`, `UserRole`, `SessionToken`, `Investigation`, `ResearchRequirement`, `Source`, `ExtractedClaim`, `EvidencePassage`, `InformationGap`, `Conflict`, `VerificationTask`, `InvestigationReport`, `AuditLog`.
- [ ] Build Security Services:
  - `Argon2id` hasher with secure parameters.
  - JWT token manager (HMAC-SHA256, access + refresh tokens).
  - Dependency injectors for user authentication and `require_admin`.
  - SSRF protection validator (DNS resolution + private/metadata IP blocker).
  - Rate limiting middleware (in-memory token bucket / sliding window).
  - Security headers middleware (CSP, X-Content-Type-Options, etc.).
- [ ] Implement Endpoints:
  - `/api/v1/auth`: Register, Login, Refresh, Me.
  - `/api/v1/investigations`: CRUD with user ownership filtering.
  - `/api/v1/sources`: Safe URL ingestion, safe PDF upload with magic byte check.
  - `/api/v1/admin`: User management and audit logs.

### Phase 3: AI & Intelligence Engines
- [ ] Build Provider Abstraction:
  - Google Gemini API client (`gemini-2.5-flash`).
  - Offline Deterministic Heuristics Engine (enables 100% full testing and fallback without external API dependency).
- [ ] Goal Decomposer: Converts research objective into structured criteria with categories and verification expectations.
- [ ] Gap Detection Engine: Identifies missing requirements, partial coverage, and unverified assertions.
- [ ] Contradiction Engine: Pairs claims across sources, analyzing true contradiction vs differences in scope, eligibility, or temporal period.
- [ ] Temporal Decay Engine: Detects expired dates, missing publication timestamps, and superseded guidelines.
- [ ] Decision Readiness Calculator: Computes explainable 0-100 score with mathematical penalty breakdown.
- [ ] Report Generator: Creates structured JSON and formatted printable intelligence reports.

### Phase 4: Automated Testing & Verification
- [ ] Write pytest test suite:
  - Password hashing and verification.
  - Auth flow (login, token validation, token rejection).
  - Cross-user data access isolation (IDOR defense).
  - SSRF protection (loopback, RFC1918, cloud metadata blocked; public domains allowed).
  - Magic byte PDF file validation.
  - Goal decomposition and gap detection logic.
- [ ] Run test suite and confirm 100% pass rate.

### Phase 5: Modern Enterprise Frontend (React + Vite + TypeScript)
- [ ] Scaffold `frontend/` using Vite, React 19, TypeScript, Tailwind CSS.
- [ ] Configure UI theme: Dark navy / graphite palette, electric blue and violet glowing accents.
- [ ] Implement Pages & Features:
  - **Landing Page**: 3D interactive hero, feature overview, security highlights.
  - **Auth**: Modern login, registration, and quick "Load Demo" toggle.
  - **Executive Dashboard**: Real metrics, activity timeline, recent investigations.
  - **Investigation Studio**: Topic, complex research question, URL ingestion list, PDF upload dropzone, pre-loaded scholarship demo.
  - **Requirements & Gap Analysis**: Interactive matrix of findings, severity badges, supporting passages.
  - **Contradiction Comparator**: Side-by-side claim analysis with date awareness and scope difference notes.
  - **Interactive Evidence Graph**: React Flow canvas linking objectives, requirements, sources, claims, and gaps.
  - **Verification Copilot**: Interactive checklist with status toggle and official recommendation.
  - **Decision Readiness Index**: Visual score dial with factor breakdown.
  - **Investigation Reports**: Exportable executive reports (JSON / Print to PDF).
  - **Admin Panel**: User listing and tamper-evident audit log viewer.

### Phase 6: 3D Visualization & Performance Hardening
- [ ] Implement Three.js / React Three Fiber evidence globe with node constellations.
- [ ] Ensure low-power mode, WebGL fallback for low-spec devices, zero layout shifts.
- [ ] Audit bundle size, code-splitting, and memoization.

### Phase 7: Hackathon Demo & Acceptance Verification
- [ ] Execute full scholarship demo scenario end-to-end.
- [ ] Verify all 24 acceptance criteria.
- [ ] Provide Docker configuration and deployment guide.
