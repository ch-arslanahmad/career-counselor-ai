# SRS Document Handoff Instructions

**For:** Team Member Creating SRS Document  
**Deadline:** May 19, 2026  
**Format:** Microsoft Word (.docx) — Not markdown, not PDF  
**Why Word?** Easier for non-technical stakeholders and consistent with organizational standards

---

## What You're Creating

A **Software Requirements Specification (SRS)** document that formally specifies:
- What the system does (functional requirements)
- How it should perform (non-functional requirements)
- Constraints and assumptions
- Success criteria

This is **NOT a design document** — it's a requirements document. Focus on **WHAT**, not HOW.

---

## Step 1: Gather Source Files (Read In This Order)

| File | Purpose | Read First? |
|------|---------|------------|
| `docs/REQUIREMENTS.md` | START HERE — Functional + non-functional requirements | YES |
| `docs/SPECIFICATION.md` | THEN READ THIS — Locked features, API contracts, success metrics | YES |
| `docs/ARCHITECTURE.md` | Reference only — system design (for context, not for SRS) | Optional |
| `frontend/index.html` | Reference only — current UI structure | Optional |

**Total reading time:** 30-45 minutes

---

## Step 2: Create Word Document Structure

Open **Microsoft Word** and create a document with the following structure:

```
COVER PAGE (your university letterhead if applicable)
TABLE OF CONTENTS (auto-generated in Word)
1. INTRODUCTION
2. OVERALL DESCRIPTION
3. FUNCTIONAL REQUIREMENTS
4. NON-FUNCTIONAL REQUIREMENTS
5. SYSTEM INTERFACES
6. ASSUMPTIONS AND CONSTRAINTS
```

---

## Step 3: Fill Each Section (Copy-Paste from Source Files)

### 1. INTRODUCTION (from REQUIREMENTS.md)

**Heading:** `1. Introduction`

**Content to include:**
- Problem statement (WHY we need this system)
- Project objectives
- Scope statement
- Definitions, acronyms, abbreviations

**Source file:** `docs/REQUIREMENTS.md` — Lines 1-50 (Introduction section)

**Copy this exact text:**
```
1.1 Purpose

[Copy "Problem Statement" section from REQUIREMENTS.md]

1.2 Project Objectives

[Copy "Objectives" section from REQUIREMENTS.md]

1.3 Scope

[Copy "Scope" section from REQUIREMENTS.md]

1.4 Definitions & Abbreviations

- MVP: Minimum Viable Product
- API: Application Programming Interface
- UI: User Interface
- SRS: Software Requirements Specification
```

---

### 2. OVERALL DESCRIPTION (from REQUIREMENTS.md)

**Heading:** `2. Overall Description`

**Content to include:**
- Product perspective (how it fits in the ecosystem)
- Product features (high-level)
- User classes and characteristics
- Operating environment

**Source file:** `docs/REQUIREMENTS.md` — Lines 50-150 (Product Overview section)

**Create subsections:**
```
2.1 Product Perspective

[Copy "Product Context" from REQUIREMENTS.md]

2.2 Product Features (High-Level)

[Copy from REQUIREMENTS.md Feature List, but OMIT technical details]

Example:
- Feature 1: Career Recommendation Engine
  Students input their interests and skills; system returns ranked career options
  
- Feature 2: Learning Roadmap Generator
  System creates personalized step-by-step learning plans
  
[... continue for all 9 MVP features ...]

2.3 User Classes

- Primary: Students (ages 18+) seeking career guidance
- Secondary: Academic advisors (who may view student results)

2.4 Operating Environment

- Frontend: Web browser (Chrome, Firefox, Safari)
- Backend: Linux server with Python runtime
- Database: MySQL 8.0+
- External APIs: Claude/OpenAI LLM
```

---

### 3. FUNCTIONAL REQUIREMENTS (from SPECIFICATION.md)

**Heading:** `3. Functional Requirements`

**Content source:** `docs/SPECIFICATION.md` — Section 2 (Feature Set: 9 locked features)

**Create one subsection per feature. Format:**

```
3.1 Career Fit Scoring (Feature #1)

Requirement ID: FR-001
Description: System shall calculate a compatibility score (0-100) for each career based on 
student skills vs. required skills.

Success Criteria:
- Score = (# matching skills / # required skills) × 100
- Display scores as percentage in UI
- Show "Why this career?" explanation with top 3 matching skills

Source: SPECIFICATION.md, Feature #1, Line [XX]

---

3.2 Timeline-Aware Roadmaps (Feature #2)

Requirement ID: FR-002
Description: System shall generate learning roadmaps with variable duration (3/6/12 months) 
based on user input.

Success Criteria:
- Roadmaps adjust step count based on timeline
- 3-month: 10-12 steps
- 6-month: 15-18 steps
- 12-month: 20-25 steps

Source: SPECIFICATION.md, Feature #2, Line [XX]

---

[Continue for FR-003 through FR-009]
```

**Copy all 9 features from SPECIFICATION.md Section 2:**
- FR-001: Career Fit Scoring
- FR-002: Timeline-Aware Roadmaps
- FR-003: Task Tracking
- FR-004: Skill Re-assessment
- FR-005: Growth Delta Display
- FR-006: Profile Skill Gap Analysis (no CV upload parsing in MVP)
- FR-007: Career Type Flags
- FR-008: Pakistan-Specific Careers
- FR-009: Data-backed career catalog

**Do NOT include technical implementation details** (e.g., database schema, API code) — only WHAT the system does.

---

### 4. NON-FUNCTIONAL REQUIREMENTS (from REQUIREMENTS.md)

**Heading:** `4. Non-Functional Requirements`

**Content source:** `docs/REQUIREMENTS.md` — Non-Functional Requirements section

**Create subsections:**

```
4.1 Performance

- API response time: < 2 seconds
- Page load time: < 3 seconds
- Support 100+ concurrent users

4.2 Security

- No hardcoded passwords or API keys
- Use environment variables for secrets
- HTTPS for all API calls

4.3 Usability

- Forms must be fillable in < 2 minutes
- Results must be understandable by non-technical users
- Mobile-responsive design

4.4 Reliability

- System uptime: 95%+
- Fallback to local seed data if the database is unavailable

4.5 Maintainability

- Code must follow style guide
- Database must be normalized (3NF+)
- Documentation for all public APIs

4.6 Portability

- Works on Chrome, Firefox, Safari
- Works on Windows, macOS, Linux
- Frontend runs without build tools

4.7 Compatibility

- Python 3.9+
- MySQL 8.0+
- FastAPI 0.100+
```

---

### 5. SYSTEM INTERFACES (from SPECIFICATION.md Section 3)

**Heading:** `5. System Interfaces`

**Content source:** `docs/SPECIFICATION.md` — Section 3 (API Endpoints)

**Format:**

```
5.1 REST API Endpoints

All endpoints return JSON responses.

5.1.1 POST /api/assess

Request:
{
  "name": "string",
  "interests": ["string"],
  "skills": ["string"],
  "education_level": "string",
  "goals": ["string"],
  "industry": "string",
  "location": "string"
}

Response:
{
  "session_id": "uuid",
  "careers": [
    {
      "career_id": "int",
      "title": "string",
      "description": "string",
      "match_score": "0-100",
      "reasoning": "string"
    }
  ]
}

Success Criteria:
- Returns top 5 careers ranked by match score
- Match scores in descending order
- Reasoning explains top 3 matching skills

---

5.1.2 POST /api/roadmap

[Copy API spec from SPECIFICATION.md]

---

[Continue for all 6 endpoints: assess, roadmap, careers, careers/{id}/skills, tasks, skill-gap-analysis]
```

---

### 6. ASSUMPTIONS & CONSTRAINTS (from REQUIREMENTS.md)

**Heading:** `6. Assumptions and Constraints`

**Content:**

```
6.1 Assumptions

- Users have internet connectivity
- Users are familiar with web forms
- Local seed data is available (fallback if the database is not ready)
- Users will provide honest information about their skills

6.2 Constraints

- MVP uses vanilla JavaScript (no React)
- No user authentication in Phase 1
- Limited to 50 careers in initial seed
- API response time limited by local backend and model latency
- Development deadline: May 20, 2026

6.3 Open Issues

- None at this time
```

---

## Step 4: Document Checklist

Before submitting, verify:

- Cover page has proper title and date
- Table of Contents is auto-generated (not manual)
- All 6 sections present with proper heading hierarchy
- All 9 features documented in Section 3
- All 6 API endpoints documented in Section 5
- No technical code snippets (except API schemas, which are OK)
- All cross-references to source documents are correct
- Document is saved as .docx (Microsoft Word format)
- Spelling and grammar checked
- Page numbers added
- Total length: 8-12 pages (typical SRS length)

---

## Step 5: Export & Store

Final file location: `docs/SRS_Document.docx`
Keep markdown version? Yes — also save as `docs/SRS_DOCUMENT.md` for version control

---

## Quick Tips

DO:
- Copy text directly from source files (reduces errors)
- Use clear, formal language ("The system SHALL...")
- Number all requirements (FR-001, FR-002, etc.)
- Include actual API schemas
- Format lists consistently

DON'T:
- Add design decisions (save for design docs)
- Include code snippets (except API JSON)
- Write casual language ("the app is cool")
- Invent new requirements not in SPECIFICATION.md
- Use inconsistent numbering

---

## Questions? Reference These

| Question | Answer In |
|----------|-----------|
| What are the features? | `docs/SPECIFICATION.md` Section 2 |
| What are the APIs? | `docs/SPECIFICATION.md` Section 3 |
| What are the requirements? | `docs/REQUIREMENTS.md` |
| How does it work? | `docs/ARCHITECTURE.md` (reference only) |

---

Status: Ready for team member
Last Updated: 2026-05-15
