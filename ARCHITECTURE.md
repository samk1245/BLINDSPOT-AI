# BLINDSPOT AI — System Architecture Specification

## 1. Executive Summary
**BLINDSPOT AI** is an intelligence platform designed to address the foundational vulnerability of automated research: generative models hallucinate and conflate what is stated with what is true, while failing to detect what is *missing*, *contradictory*, or *outdated*.

Rather than summarizing retrieved text uncritically, BLINDSPOT AI performs **Epistemic Intelligence**:
1. Decomposing research questions into mandatory verification criteria.
2. Ingesting and cryptographically fingerprinting heterogeneous sources (PDFs, public URLs, official portals).
3. Extracting atomized claims and exact evidence passages.
4. Detecting **Information Gaps**, **Temporal Decay**, and **Direct/Contextual Contradictions**.
5. Projecting findings onto an interactive **Evidence Traceability Graph**.
6. Formulating an actionable **Verification Checklist** and an explainable **Decision Readiness Index**.

---

## 2. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                              PRESENTATION TIER                                    |
|   React 19 / Vite / TypeScript / Tailwind CSS / Framer Motion / React Three Fiber  |
|                                                                                   |
|  [ Executive Dashboard ]   [ Investigation Engine ]   [ Evidence Graph (ReactFlow)]|
|  [ Gap Analysis Panel  ]   [ Verification Copilot ]   [ 3D Threat/Intel Globe     ]|
+-----------------------------------------+-----------------------------------------+
                                          | JSON over HTTPS (TLS 1.3)
                                          | Bearer JWT + CSRF Protection
+-----------------------------------------v-----------------------------------------+
|                               API GATEWAY & SECURITY                              |
|   FastAPI REST API / Security Middleware / Pydantic v2 / In-Memory & Redis Rate   |
|                                                                                   |
|  - Argon2id Auth & Session Tokens             - SSRF Protection Proxy Filter      |
|  - Role-Based Access Control (USER, ADMIN)     - Magic-Byte File Type Validator    |
|  - OWASP Secure Headers (CSP, HSTS, etc.)     - Content Sanitization Pipeline     |
+-----------------------------------------+-----------------------------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                                                   |
+-------v-------------------------+             +---------------------------v-------+
|        CORE INTELLIGENCE        |             |         DATA & PERSISTENCE        |
|                                 |             |                                   |
| - AI Goal Decomposer            |             | - SQLAlchemy Async ORM            |
| - Source Ingestion (PDF & Web)  |             | - SQLite (Dev/Demo) / PostgreSQL  |
| - Claim & Passage Extractor     |             | - Full Audit Logs & Change Events |
| - Gap & Blindspot Detection     |             | - Foreign-Key Isolation & IDOR    |
| - Multi-Source Contradiction    |             | - Content Hash De-duplication     |
| - Temporal Decay Analyzer       |             +-----------------------------------+
| - Decision Readiness Calculator |
+-------+-------------------------+
        |
+-------v-------------------------+
|      AI PROVIDER SUBSYSTEM      |
|                                 |
| - Google Gemini 2.5 Flash API   |
| - Structured JSON Schema Engine |
| - Offline Deterministic Fallback|
+---------------------------------+
```

---

## 3. Core Modules & Subsystems

### 3.1 Authentication & Multi-Tenancy (RBAC)
- **Password Security**: Argon2id (`time_cost=3`, `memory_cost=65536`, `parallelism=4`).
- **Token Lifecycle**: Short-lived Access Tokens (30m) + Stateful Refresh Tokens with rotation.
- **Tenant Isolation**: Every database query on resources (`Investigation`, `Source`, `Gap`, `Task`) strictly filters by authenticated `user_id`. Admin users hold elevated privileges logged via tamper-evident audit trails.

### 3.2 SSRF-Hardened Source Ingestion Engine
User-submitted URLs are verified through a multi-tier defense:
1. **Scheme Validation**: Whitelist strictly allows `http` and `https`.
2. **DNS & IP Resolution**: Domain is resolved ahead of request; private RFC1918 addresses (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopbacks (`127.0.0.0/8`, `::1`), link-local (`169.254.0.0/16`), and AWS/GCP metadata endpoints (`169.254.169.254`) are outright rejected.
3. **Redirect Protection**: Max redirects capped at 3; every redirect target is re-validated through the DNS filter.
4. **Bandwidth / Timeout Guards**: Content streams stop strictly at 10MB; 10s socket timeout.
5. **Cryptographic Fingerprinting**: SHA-256 hash computed for every ingested payload to detect tampering or duplicate sources.

### 3.3 Research Goal Decomposer
Translates free-form research questions into a structured lattice of requirements:
- `Requirement ID`: Unique reference.
- `Category`: `ELIGIBILITY`, `FINANCIAL`, `DOCUMENTATION`, `DEADLINES`, `PROCEDURES`, `EXCEPTIONS`.
- `Importance`: `CRITICAL`, `HIGH`, `MEDIUM`.
- `Expected Evidence`: Description of required official proof.
- `Coverage Status`: Evaluated dynamically as sources are analyzed.

### 3.4 Multi-Source Gap & Contradiction Detection Engine
1. **Passage Extraction**: Ingested content is segmented into numbered semantic passages with exact character offsets.
2. **Claim Extraction**: Extracts atomic assertions tied to source URL and passage ID.
3. **Contradiction Matrix**: Compares pairwise claims on overlapping semantic targets. Flags whether a divergence is a **Genuine Contradiction**, a **Temporal Difference** (older vs newer rule), or a **Scope Difference** (different demographic or geographic category).
4. **Gap Identification**: Compares established requirements against verified claims. Identifies:
   - `MISSING`: Zero supporting passages found across all sources.
   - `PARTIALLY_SUPPORTED`: Claim exists without official verification or missing critical parameters (e.g. income limit stated but renewal threshold omitted).
   - `POTENTIALLY_OUTDATED`: Stated in a document published over 12 months ago or referencing expired dates.
   - `CONFLICTING`: Mutually exclusive assertions between two or more sources.

### 3.5 Evidence Traceability Graph
A directed acyclic graph (DAG) exported to the React Flow frontend:
- **Root Node**: Research Objective.
- **Requirement Nodes**: Decomposed criteria.
- **Source Nodes**: Verified URLs and uploaded PDF files.
- **Claim Nodes**: Extracted claims with confidence scores.
- **Gap / Conflict Nodes**: Detected intelligence vulnerabilities.
- **Verification Task Nodes**: Action items resolved by the user.

Every edge represents explicit provenance. Clicking any node reveals its verbatim backing text.

### 3.6 Explainable Decision Readiness Index
Calculated via an open mathematical formula rather than an opaque score:
$$\text{Readiness} = \max\left(0, \min\left(100, W_{\text{req}} \cdot C_{\text{req}} + W_{\text{src}} \cdot Q_{\text{src}} - P_{\text{conf}} \cdot N_{\text{conf}} - P_{\text{gap}} \cdot N_{\text{gaps}} - P_{\text{time}} \cdot N_{\text{outdated}}\right)\right)$$
The dashboard surfaces exact sub-score components, allowing researchers to see precisely why readiness was penalized.

---

## 4. Technology Stack Specification
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, React Flow (`@xyflow/react`), Recharts, Three.js (`@react-three/fiber`, `@react-three/drei`), TanStack Query.
- **Backend**: Python 3.14+, FastAPI, SQLAlchemy (AsyncIO), Pydantic v2, HTTPX, Argon2-cffi, PyPDF, BeautifulSoup4.
- **Database**: Async SQLite for portable zero-setup operation; seamless PostgreSQL + asyncpg compatibility via standard SQLAlchemy dialects.
- **AI Integration**: Google Gemini 2.5 Flash API with fallback to deterministic heuristics engine for testing and disconnected environments.
