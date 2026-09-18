# Sentinel Research — Secure Enterprise Intelligence Prototype

> **The central security principle:**  
> *“The AI can reason over what an employee is allowed to know — but it can never decide what the employee is allowed to know.”*

Sentinel Research is a functional enterprise AI web application prototype designed to solve **"The Employee Who Asked For Too Much"**. In modern enterprises, employees query internal intelligence models to synthesize answers across thousands of confidential records. However, querying LLMs directly with retrieved unauthorized context creates catastrophic data exfiltration risks.

Sentinel Research solves this via a **deterministic pre-LLM Authorization Gate** coupled with a **10-agent multi-agent pipeline**, strictly guaranteeing that **unauthorized documents never enter the LLM context, prompt, chunks, embeddings, citations, or audit logs**.

---

## 🏛️ System Architecture

```
[ USER LOGIN ]
      ↓
[ AGENT 1: IDENTITY VERIFICATION AGENT ]  <-- Cross-checks Company Employee Directory
      ↓                                       (Raises ⚠ PROFILE MISMATCH on discrepancies)
[ USER ROLE + DEPARTMENT + CLEARANCE ]
      ↓
[ NATURAL LANGUAGE QUESTION ]
      ↓
[ AGENT 2: QUERY UNDERSTANDING AGENT ]    <-- Extracts Intent, Timeframe, Keywords & Target Topics
      ↓
╔════════════════════════════════════════════════════════════════════════════╗
║  AGENT 3: DETERMINISTIC AUTHORIZATION ENGINE (SECURITY GATE - FIRST)       ║
║  - Check Account Active & Authenticated                                   ║
║  - Compare Clearance (Public: 0 <= Internal: 1 <= Conf: 2 <= Restr: 3)   ║
║  - Validate Department Scoping                                            ║
║  - Validate Role Entitlements                                             ║
║  - Deterministic ALLOW or DENY (Fail Closed)                              ║
╚════════════════════════════════════════════════════════════════════════════╝
      ↓
╔════════════════════════════════════════════════════════════════════════════╗
║  AGENT 4: DOCUMENT RETRIEVAL AGENT (LATER - AUTHORIZED ONLY)               ║
║  - ALLOWED: Fetches document content from storage into memory buffer       ║
║  - DENIED:  WITHHOLDS RETRIEVAL completely (Zero Memory/DB Ingestion)      ║
║  - Shows Badge: "🚫 BLOCKED BEFORE AI (ZERO RETRIEVAL)"                    ║
╚════════════════════════════════════════════════════════════════════════════╝
      ↓
[ AGENT 5: SECURITY GUARDRAIL AGENT ]     <-- Detects & neutralizes prompt injections
      ↓
[ AGENT 6: EVIDENCE ANALYSIS AGENT ]      <-- Extracts facts from AUTHORIZED docs only
      ↓
[ AGENT 7: VERSION & CONFLICT AGENT ]     <-- Reconciles newer versions (v2.0 > v1.0)
      ↓
[ AGENT 8: ANSWER SYNTHESIS AGENT ]       <-- Grounded answer or safe fallback message
      ↓
[ AGENT 9: CITATION AGENT ]               <-- Builds citations only for authorized evidence
      ↓
[ AGENT 10: AUDIT AGENT ]                 <-- Appends to immutable compliance ledger
```

---

## 🤖 The 10 Logical Agents

1. **Identity Verification Agent (`backend/agents/identity_agent.py`)**: Authenticates credentials against the authoritative Company Employee Directory. Performs anti-tamper cross-checks; if user claims a different department (e.g. Marketing instead of Finance), halts and triggers `⚠ PROFILE MISMATCH`.
2. **Query Understanding Agent (`backend/agents/query_agent.py`)**: Parses natural language, extracts temporal bounds (e.g. "Q4"), entity targets ("Revenue"), and discovers candidate catalog metadata without fetching full contents.
3. **Authorization Engine (`backend/agents/authorization_agent.py`)**: The deterministic security gate executed FIRST. Evaluates clearance rankings, departmental permissions, role allowances, and document lifecycle statuses before retrieval. Fail-closed.
4. **Document Retrieval Agent (`backend/agents/retrieval_agent.py`)**: Decides whether to retrieve each document based on the authorization gate check. Fetches content only for permitted documents; completely withholds unauthorized documents.
5. **Security Guardrail Agent (`backend/agents/guardrail_agent.py`)**: Scans user prompts and document contents for adversarial prompt injections (`IGNORE ALL SECURITY RULES`, `OVERRIDE-999`, etc.). Neutralizes malicious payloads.
6. **Evidence Analysis Agent (`backend/agents/evidence_agent.py`)**: Extracts structured propositions and metrics strictly from authorized documents.
7. **Version & Conflict Agent (`backend/agents/version_conflict_agent.py`)**: Compares version numbers and effective dates (`2026-09-01` vs `2026-06-01`), establishing authoritative supersession (e.g. DOC-302 supersedes DOC-301).
8. **Answer Agent (`backend/agents/answer_agent.py`)**: Generates answers strictly within the authorized boundary. Emits the safe response (`"Access restricted: You do not have the required clearance, departmental, or role permissions to view the requested document(s). Please contact your administrator for access elevation."`) when no authorized source exists. Never leaks secret figures.
9. **Citation Agent (`backend/agents/citation_agent.py`)**: Formats verifiable citations with title, version, classification, and effective date.
10. **Audit Agent (`backend/agents/audit_agent.py`)**: Generates unique `REQ-YYYYMMDD-XXXXX` identifier, logs millisecond timeline, records decisions and evidence used. Never persists unauthorized document text.

---

## 🚀 Quick Start & Launch

### Prerequisites
- Python 3.10+ (FastAPI, Uvicorn, Pydantic)

### Running the Application
Windows (PowerShell / Command Prompt):
```cmd
.\run.bat
```
*(Or run `python run.py`)*

The application starts on `http://127.0.0.1:8000` and automatically opens your web browser.

### Running Automated Test Suite
```powershell
python -m unittest tests/test_security_pipeline.py -v
```

---

## 👥 Demo Accounts & Pre-seeded Documents

### Authoritative Employee Directory
| Employee ID | Name | Department | Role | Clearance | Demo Purpose |
|-------------|------|------------|------|-----------|--------------|
| **U102** | Aarav Sharma | Finance | Finance | Internal | Test Case A (Authorized ₹120 crore) |
| **U205** | Priya Patel | Marketing | Marketing | Internal | Test Case B (Security Denial Demo) |
| **U301** | Rohan Verma | Finance | Finance | Internal | Test Case C (Version Conflict Demo) |
| **A901** | Sarah Chen | Executive | Executive | Restricted | Admin Audit & Full Clearance |
| **E404** | David Miller | Engineering | Engineer | Internal | Suspended Account Check |

*Initial temporary password for all accounts:* `XYZ@2026`

### Enterprise Document Collection
| Document ID | Title | Classification | Allowed Dept / Role | Version | Effective Date | Content Summary |
|-------------|-------|----------------|---------------------|---------|----------------|-----------------|
| **DOC-101** | Q4 Revenue Forecast | Internal | Finance / Finance | 2.0 | 2026-09-01 | Q4 projected revenue is 120 crore. |
| **DOC-102** | Engineering Roadmap | Internal | Engineering / Engineer | 1.0 | 2026-08-01 | Next platform release planned for October. |
| **DOC-201** | Q4 Revenue Forecast | Restricted | Executive / Executive | 3.0 | 2026-09-01 | Q4 projected revenue is 145 crore. |
| **DOC-301** | Q4 Forecast | Internal | Finance / Finance | 1.0 | 2026-06-01 | Q4 projected revenue is 110 crore. |
| **DOC-302** | Q4 Forecast | Internal | Finance / Finance | 2.0 | 2026-09-01 | Q4 projected revenue is 125 crore. |
| **DOC-001** | Sentinel Global Code | Public | `*` / `*` | 1.0 | 2026-01-01 | Transparent access control & ethics charter. |
| **DOC-999** | Adversarial Probe | Confidential | Security / Security Officer | 1.0 | 2026-09-10 | Contains active prompt injection strings. |

---

## 🎬 Hackathon Presentation Walkthrough

Follow this 5-step script during your hackathon demo:

### Step 1: Futuristic Anime-Inspired Cyber Workspace & Login
1. Open `http://127.0.0.1:8000`.
2. Observe the animated anime-style futuristic corporate research laboratory background (depth-of-field glass, glowing server blade arrays, floating cyber particles).
3. Point out the glassmorphic login panel with security indicators: `● Secure connection` and `● Company identity verification enabled`.
4. Click preset **"U102 • Finance"** (Aarav Sharma) with password `XYZ@2026`.
5. Observe the temporary password change flow.

### Step 2: Test Case A — Standard Authorized Query
1. On the dashboard, observe the **Employee Verified ✓** card showing official synchronization from Company Employee Directory.
2. Click **"Test Case A: Standard Authorized Query"** preset button.
3. Query: *"What is the Q4 revenue forecast?"*
4. Click **ASK SENTINEL**.
5. Watch the 10 agents execute in real time.
6. Observe:
   - DOC-101 is retrieved and **ALLOWED**.
   - Answer: **"Q4 projected revenue is ₹120 crore."**
   - Verified citation to **DOC-101 (v2.0, Effective September 1, 2026)**.

### Step 3: Test Case B — Security Denial Demonstration (The Star Feature)
1. Click **"Switch User"** in the top right.
2. Select **U205 (Marketing, Internal)**.
3. Observe the dashboard update: U205's department is Marketing.
4. Click **"Test Case B: Security Gate Block Demo"** preset button.
5. Ask the **EXACT SAME QUESTION**: *"What is the Q4 revenue forecast?"*
6. Watch the pipeline:
   - Candidate DOC-201 and DOC-101 are retrieved.
   - The Authorization Gate identifies:
     - DOC-201: Restricted clearance required (U205 is Internal).
     - DOC-101: Finance department required (U205 is Marketing).
   - The UI lights up with:  
     `🛡️ ACCESS DENIED → 🚫 BLOCKED BEFORE AI (ZERO CONTEXT INGESTION)`
   - Safe Response emitted: **"I couldn't find an accessible document containing the requested information."**
   - **Crucial:** The AI never discloses the ₹145 crore figure or even that DOC-201 exists.

### Step 4: Test Case C — Version Conflict Resolution
1. Switch user to **U301 (Finance, Internal)**.
2. Click **"Test Case C: Version Conflict Resolution"** preset button.
3. Query: *"What is the latest Q4 revenue forecast?"*
4. Click **ASK SENTINEL**.
5. The system finds DOC-301 (v1.0, 110 crore) and DOC-302 (v2.0, 125 crore).
6. The Version & Conflict Agent compares versions and effective dates, determining that DOC-302 supersedes DOC-301.
7. Answer: **"The latest authorized Q4 revenue forecast is ₹125 crore."**
8. Citation points to **DOC-302 (Version 2.0, Effective September 1, 2026)**.

### Step 5: Compliance Audit Trail & Profile Mismatch Defense
1. Open the **"Admin Audit"** tab (or switch to **A901 Executive/Admin**).
2. Inspect the request ledger showing all requests with status badges (`SUCCESS`, `ACCESS LIMITED`).
3. Click **"Inspect"** on U205's request:
   - Show the visual request execution timeline with millisecond precision.
   - Point out that **zero unauthorized document content was saved in the audit log**.
4. Click **"Test Profile Mismatch Simulator"**:
   - Enter `U102` claiming `Marketing` department.
   - The system halts with:  
     `⚠ PROFILE MISMATCH: The department entered by the employee does not match the organization's employee record. Access verification failed.`
   - Shows that employee records are untouchable by user input.
