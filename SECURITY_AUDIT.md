# BLINDSPOT AI — Security Audit & Threat Modeling Report

**Audit Date:** 2026-10-31  
**Target:** BLINDSPOT AI Core Intelligence Platform  
**Auditor:** Automated Diagnostic Suite & Lead Security Architecture  

---

## 1. Initial State Assessment & Environment Audit
- **Repository Cleanliness**: Brand new workspace initialized; zero committed secrets found.
- **Git History Integrity**: Verified clean git tree at commit initialization; `.gitignore` rigorously blocks `.env`, database binaries, temporary artifacts, and credential caches.
- **System Environment**:
  - Python: 3.14.3 (MSC v.1944 64-bit AMD64)
  - Node.js: v25.9.0 / npm: 11.12.1
  - OS: Windows 11 Enterprise (OneDrive reparse-point filesystem permissions inspected and corrected for unprivileged write operation).

---

## 2. Threat Modeling (STRIDE Methodology)

| Threat Category | Potential Attack Vector | Applied Mitigation in BLINDSPOT AI | Verification Status |
|---|---|---|---|
| **Spoofing** | Forged user identity or session hijacking | Argon2id password hashing, Cryptographic HMAC-SHA256 JWT tokens, Refresh token rotation with database invalidation | Enforced |
| **Tampering** | Ingested source alteration or SQL injection | SHA-256 source content fingerprinting; SQLAlchemy 2.0 parameterized queries exclusively; no dynamic SQL concatenation | Enforced |
| **Repudiation** | Denying administrative actions or updates | Append-only `AuditLogs` database model tracking IP, user ID, target entity, timestamp, and action detail | Enforced |
| **Information Disclosure** | Secret leakage, IDOR, SSRF cloud metadata theft | Strict object-level tenant isolation (`WHERE user_id = :current_user`), SSRF IP blocklist (`169.254.169.254`, `127.0.0.1`, RFC1918), sanitized error logs | Enforced |
| **Denial of Service** | Oversized payloads, recursive URL scraping, regex bombs | Content size clamp (10MB HTTP, 15MB PDF), max 3 redirects, sliding-window rate limiting, scraping timeouts (10s) | Enforced |
| **Elevation of Privilege** | Normal user requesting admin dashboard or bypassing role | Backend-enforced dependency injection checking `role == "ADMIN"`, frontend route shields treated as purely UX layer | Enforced |

---

## 3. Vulnerability Analysis & Hardening Controls

### 3.1 Server-Side Request Forgery (SSRF) Defense
- **Risk**: Attackers feed URLs like `http://169.254.169.254/latest/meta-data/` or `http://192.168.1.1/admin` to inspect cloud or internal network resources.
- **Defense Mechanism**:
  1. Parse URL with standard URL parser.
  2. Reject all protocols except `http:` and `https:`.
  3. Perform asynchronous DNS resolution to retrieve target IPv4/IPv6 addresses.
  4. Compare resolved IP against reserved, loopback, multicast, and link-local CIDR ranges (`ipaddress.ip_network`).
  5. Abort before any HTTP connection is attempted if an IP belongs to a forbidden network.
  6. Re-evaluate destination on each HTTP redirect (maximum 3 redirects).

### 3.2 Insecure Direct Object References (IDOR)
- **Risk**: A user requests `GET /api/v1/investigations/999` to view another organization's confidential research.
- **Defense Mechanism**:
  - All resource queries include mandatory filter `Investigation.user_id == current_user.id` unless the user holds validated `ADMIN` privileges.
  - Returns `404 Not Found` rather than `403 Forbidden` to prevent object existence enumeration.

### 3.3 File Upload Security (PDF Ingestion)
- **Risk**: Malicious binaries or executable scripts uploaded masquerading as `.pdf`.
- **Defense Mechanism**:
  1. Content-Type and file extension verification.
  2. Magic-byte inspection: File must start with `%PDF-` bytes.
  3. Server-side randomized UUID filename assignment to prevent directory traversal or file overwrite.
  4. File stored in isolated storage outside the web server's static document root.
  5. Maximum file size enforced at 15 MB.

### 3.4 Cross-Site Scripting (XSS) & Content Security Policy (CSP)
- **Risk**: Ingested web pages or extracted claims inject `<script>` tags or malicious attributes into the dashboard or graph.
- **Defense Mechanism**:
  - React automatic JSX string escaping for all rendered evidence passages.
  - Complete avoidance of `dangerouslySetInnerHTML`.
  - Pydantic v2 input sanitization and schema coercion.
  - Security headers applied on all HTTP responses:
    - `Content-Security-Policy`: Restricts scripts to trusted origins while supporting WebGL/Three.js canvases.
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `Referrer-Policy: strict-origin-when-cross-origin`

### 3.5 Brute-Force & Credential Stuffing Protection
- **Rate Limiting**:
  - Auth routes: 5 attempts per minute per IP.
  - AI Research Analysis: 10 requests per minute per user.
  - URL Scrape: 20 requests per minute per user.
- **Password Complexity**:
  - Minimum 8 characters, requiring mixed case, numbers, and special symbols.

---

## 4. Execution Check Summary

| Security Check | Tool / Standard | Result | Evidence / Action |
|---|---|---|---|
| Secret Scanning | Git / regex pattern audit | PASSED | Zero secrets tracked; `.env` excluded |
| SSRF Mitigation | Custom IP Validator & Unit Tests | PASSED | Blocks loopback, RFC1918, cloud metadata |
| SQL Injection Prevention | SQLAlchemy Async ORM Core | PASSED | Parameterized queries exclusively |
| Insecure Upload Handling | Magic Bytes + UUID Sanitizer | PASSED | Restricts strictly to valid `%PDF-` |
| Tenant Isolation (IDOR) | Scoped Async DB Queries | PASSED | Foreign key isolation enforced on all CRUD |
| Password Security | Argon2id (RFC 9106) | PASSED | Memory-hard key derivation |
| Rate Limiting | In-Memory Sliding-Window Cache | PASSED | Enforced on all sensitive endpoints |
