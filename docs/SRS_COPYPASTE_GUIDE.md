# SRS Document - Exact Copy-Paste Instructions

For your teammate: **Do NOT make anything up.** Copy exactly from these locations.

---

## SRS Section 1: INTRODUCTION

**Open:** docs/REQUIREMENTS.md

**Copy this exact text:**
Lines 1-10 (Problem statement)
Lines 15-24 (Scope)

**Paste into Word section:** "1. Introduction"

**Text to copy:**
```
This system is designed to provide a detailed solution for students to get advice on:
- Career paths
- Courses (with subjects)

Allowing students to explore and discover various career paths and courses that align 
with their interests and goals, enabling them to make informed decisions about their 
education and future careers.

The system features an intuitive interface that allows natural queries, guiding students 
to pick career paths and recommending relevant courses to them.

SCOPE:
The Career Counselor AI System is a web-based platform that enables:
- Students to receive personalized career guidance through an intuitive interface
- Discovery of career paths aligned with student interests and goals
- Course recommendations with detailed subject information
- Learning roadmaps for different career paths
- Query-based interaction (form-based currently)
```

---

## SRS Section 2: OVERALL DESCRIPTION

**Open:** docs/REQUIREMENTS.md

**Copy these sections:**
Lines 29-31 (Product Perspective)
Lines 33-40 (Product Functions)

**Paste into Word section:** "2. Overall Description"

**Text to copy:**
```
PRODUCT PERSPECTIVE:
A fully-featured web application easily accessible through a modern browser, providing 
AI-powered career counseling to help students make informed decisions about their 
education and future careers.

PRODUCT FUNCTIONS:
- Interface for career guidance
- Personalized career path recommendations
- Course and subject recommendations based on career goals
- Learning roadmaps with step-by-step guidance
- Educational resource suggestions
- Skills assessment and gap analysis
```

---

## SRS Section 3: FUNCTIONAL REQUIREMENTS

**Open:** docs/REQUIREMENTS.md
**ALSO Open:** docs/SPECIFICATION.md

**From REQUIREMENTS.md, copy lines 47-57:**
```
Student Requirements:
- Submit queries via forms or natural language input
- Ask questions about career paths and opportunities
- Receive personalized career path recommendations
- Get course and subject recommendations based on interests
- View learning roadmaps for specific careers
- Explore required skills and qualifications for careers
- Get guidance on educational paths and timelines
- Discover resources for learning specific subjects
- Optionally ask follow-up questions for deeper exploration
```

**From SPECIFICATION.md, copy lines 9-17:**
```
Career Counselor AI is a student progress tracking and career guidance system that:
1. Assesses student skills and interests via intake form
2. Recommends matching careers with fit scores using database-backed career data
3. Generates personalized learning roadmaps with timeline adjustment
4. Optionally tracks skill progress through roadmap completion
5. Provides contextual analysis of student profiles against career requirements

Core Innovation: Database-backed career taxonomy + AI personalization layer 
= accurate, maintainable, scalable guidance.
```

**Paste into Word section:** "3. Functional Requirements"

---

## SRS Section 4: NON-FUNCTIONAL REQUIREMENTS

**Open:** docs/REQUIREMENTS.md

**Copy lines 59-65:**
```
NON-FUNCTIONAL REQUIREMENTS:

- Performance: Query responses should be delivered quickly (< 3 seconds)
- Usability: The web interface should be intuitive and user-friendly for students of all backgrounds
- Availability: System should be available 24/7 for student access
- Reliability: Career and course recommendations must be accurate and up-to-date
- Scalability: System should handle multiple concurrent sessions
```

**Paste into Word section:** "4. Non-Functional Requirements"

---

## SRS Section 5: SYSTEM INTERFACES (API ENDPOINTS)

**Open:** docs/SPECIFICATION.md

**Copy lines 130-250 (all API endpoints):**

Start from: `## 3. API Endpoints (FastAPI)`

Copy all 6 endpoints:
1. POST /api/assess (lines 135-159)
2. POST /api/roadmap (lines 161-183)
3. GET /api/careers (lines 185-198)
4. GET /api/careers/{id}/skills (lines 200-?)
5. POST /api/skill-gap-analysis (profile skill-gap analysis; no CV upload parsing in MVP)
6. POST /api/tasks (find this endpoint)

**Note:** The exact line numbers may vary. Search for "POST /api" and "GET /api" in SPECIFICATION.md.

**Paste into Word section:** "5. System Interfaces"

---

## SRS Section 6: ASSUMPTIONS & CONSTRAINTS

**Open:** docs/SPECIFICATION.md

**Copy lines 437-444 (from "9. Key Constraints & Assumptions"):**

```
CONSTRAINTS:
- No user accounts in MVP — session-based (UUID) only
- Vanilla JS frontend — no build tools, no React in Phase 1
- Local seed dependency — fallback to hardcoded seed if unavailable
- 9 locked features — no new features until Phase 2

ASSUMPTIONS:
- Users have internet for API calls
- Database is local MySQL (Phase 1)
- Student can dedicate 5-30 hours/week for learning
- Career taxonomy is pre-computed (not AI-generated)
```

**Paste into Word section:** "6. Assumptions and Constraints"

---

## FINAL CHECKLIST

Before sending the document:

□ Introduction section has problem statement + scope
□ Overall Description section has product perspective + functions
□ Functional Requirements section has 9+ requirements listed
□ Non-Functional Requirements section has 5 requirements
□ System Interfaces section has all 6 API endpoints with request/response schemas
□ Assumptions & Constraints section has 4 constraints + 4 assumptions
□ Document saved as .docx (Microsoft Word)
□ No made-up content — only copied from source files
□ Spelling and grammar checked (use Word's spell check)
□ Page numbers added (Word: Insert → Page Numbers)

---

**That's it. Just copy-paste. Do not add anything else.**

If section is missing from source files, ask before making it up.

Questions? Show this file to your lead.
