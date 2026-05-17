# Career Counselor AI - Agent Execution Plan

**Deadline:** May 19 (testing), May 20 (presentation)  
**Scope:** 11 features + DB + API + O*NET + Documentation  
**Execution Strategy:** Parallel AI agents + human review

---

## Overview

Instead of building sequentially, we parallelize:
- **Agent 1:** Backend API + O*NET seed script
- **Agent 2:** Database schema + migrations
- **Agent 3:** Frontend HTML/JS + API integration
- **Agent 4:** Documentation (SRS, UML, Feasibility, Test cases)
- **You:** Review + integrate + test + present

---

## Agent Assignments

### Agent 1: Backend API Development
**Responsibility:** FastAPI endpoints + Claude integration

**Deliverables:**
1. `backend/main.py` — FastAPI app with all endpoints
   - `POST /api/assess` (career fit scoring)
    - `POST /api/roadmap` (roadmap generation)
    - `GET /api/careers` (career listing)
    - `GET /api/careers/{id}/skills` (skills per career)
    - `POST /api/tasks` (task management)
    - `GET /api/tasks/{session_id}` (progress view)
    - `POST /api/skill-gap-analysis` (profile skill-gap analysis; no CV upload parsing in MVP)

2. `backend/services/ai_service.py` — Claude API wrapper
   - Single function: `get_ai_response(prompt, context={})`
   - Handles: fit reasoning, roadmap personalization, profile skill-gap analysis
   - Fallback: rule-based responses if API unavailable

3. `backend/services/career_service.py` — Business logic
   - Career fit scoring algorithm
   - Roadmap generation (timeline adjustment)
   - Skill matching logic

4. `backend/requirements.txt` — Dependencies
   - `fastapi`, `uvicorn`, `sqlalchemy`, `mysql-connector-python`, `python-dotenv`, `anthropic` (or `openai`)

**Time Estimate:** 12-14 hours  
**Dependencies:** Database schema (Agent 2)  
**Testing:** Unit test all endpoints with mock data

---

### Agent 2: Database & O*NET Integration
**Responsibility:** Database schema + seed script

**Deliverables:**
1. `backend/database.py` — SQLAlchemy models & setup
   - Define all 8 tables as SQLAlchemy models
   - Session management
   - Connection pooling

2. `backend/scripts/seed_onet.py` — O*NET population script
   - Fetch from O*NET API (services.onetcenter.org)
   - Parse occupation data
   - Populate careers, skills, career_skills tables
   - Fallback: Use `backend/seeds/onet_fallback.json` if API fails

3. `backend/seeds/onet_fallback.json` — Hardcoded seed data
   - 50+ occupations (tech, business, creative, healthcare)
   - Skills per occupation
   - Growth outlook, education requirements

4. `backend/migrations/` — Optional Alembic migrations
   - Schema versioning (if needed)

5. `backend/.env.example` — Environment template
   ```
   DATABASE_URL=mysql+mysqlconnector://user:password@localhost/career_counselor
   CLAUDE_API_KEY=sk-...
   ONET_USERNAME=your_username (if required)
   ```

**Time Estimate:** 10-12 hours  
**Dependencies:** None (independent)  
**Testing:** Run seed script, verify DB populated

---

### Agent 3: Frontend Development
**Responsibility:** HTML/CSS/JS UI + API integration

**Deliverables:**
1. `frontend/index.html` — Multi-page SPA
   - Page 1: Intake form (name, interests, skills, education, goals, location)
   - Page 2: Career recommendations (cards with fit scores, growth outlook)
   - Page 3: Roadmap + task tracking (weekly tasks, mark complete)
   - Page 4: Re-assessment flow (show delta from previous)

2. `frontend/js/main.js` — Application logic
   - Form validation
   - API integration (fetch calls to all endpoints)
   - Dynamic UI rendering
   - Session management (UUID local storage)
   - Task tracking UI (checkboxes + progress bar)

3. `frontend/css/style.css` — Styling (updated)
   - Modern, clean design
   - Multi-page navigation
   - Responsive layout
   - Dark/light mode support (optional)

4. `frontend/js/api-client.js` — API client wrapper
   ```javascript
    const API = {
      assess: (data) => fetch('/api/assess', {method: 'POST', body: JSON.stringify(data)}),
      roadmap: (data) => fetch('/api/roadmap', {method: 'POST', body: JSON.stringify(data)}),
      tasks: {...},
      cvAnalyze: {...},
      ...
    }
   ```

**Time Estimate:** 14-16 hours  
**Dependencies:** Backend API (Agent 1)  
**Testing:** Manual UI testing, verify all forms work

---

### Agent 4: Documentation Generation
**Responsibility:** All project documentation

**Deliverables:**

1. **REQUIREMENTS.md** (Enhanced SRS)
   - Overview, scope, functions
   - Functional requirements (11 features)
   - Non-functional requirements (performance, usability, reliability)
   - Requirement prioritization (MoSCoW)

2. **UML Diagrams** (4 types)
   - Use Case Diagram: Student, Forms, Assessments, Task Tracking
   - Sequence Diagram: Form submission → API → Response flow
   - Class Diagram: Career, Skill, Student, Roadmap entities
   - Activity Diagram: User workflow (intake → recommendations → optional task tracking)

3. **FEASIBILITY STUDY**
   - Technical feasibility (architecture, APIs, database)
   - Operational feasibility (timeline, team)
   - Economic feasibility (resources, costs)
   - Risks & mitigation

4. **TEST CASES** (20+ manual test scenarios)
   - Format: Test ID | Scenario | Steps | Expected | Actual | Pass/Fail
   - Cover: Form validation, career recommendations, task tracking, re-assessment

5. **SPRINT REPORT**
   - Sprint goal, user stories completed
   - Screenshots of features
   - Version control history
   - Challenges & solutions

6. **FINAL REPORT** (2-3 pages)
   - Executive summary
   - What was built
   - Architecture overview
   - Features implemented
   - Future roadmap

**Time Estimate:** 12-14 hours  
**Dependencies:** Final code (from Agents 1-3)  
**Output:** All docs in `docs/` + formatted for presentation

---

## Parallel Execution Timeline

### Day 1 (May 18) — Morning

| Time | Agent 1 (API) | Agent 2 (DB) | Agent 3 (Frontend) | You |
|------|---|---|---|---|
| 9am-12pm | Define endpoint structure, set up FastAPI skeleton | Define SQLAlchemy models, schema | Structure HTML pages, setup CSS | Review SPECIFICATION.md, coordinate |
| 12pm-1pm | — | — | — | **LUNCH BREAK** |
| 1pm-5pm | Implement first 4 endpoints | O*NET seed script structure, fallback JSON | Intake form + validation, JS scaffolding | Review Agent outputs, merge code |

### Day 1 — Evening

| Time | Agent 1 | Agent 2 | Agent 3 | Agent 4 |
|------|---|---|---|---|
| 5pm-9pm | Implement remaining endpoints, Claude integration | Run seed script, populate DB test | Recommendations page UI, API integration | Start SRS, list features |
| 9pm-10pm | Unit test endpoints | Verify DB schema | Manual UI testing | — |

### Day 2 (May 19) — Morning

| Time | Agent 1 | Agent 2 | Agent 3 | Agent 4 |
|------|---|---|---|---|
| 9am-12pm | Debug, fix endpoint issues | Optimize queries, handle errors | Roadmap + task tracking UI | Create UML diagrams (4 types) |
| 12pm-1pm | — | — | — | **LUNCH BREAK** |
| 1pm-5pm | Final testing, documentation | Backup DB, verify seed script | Full API integration, test all flows | Write feasibility study, test cases |

### Day 2 — Evening

| Time | What | Who |
|------|------|-----|
| 5pm-6pm | **Code Review & Integration** | You + all agents |
| 6pm-7pm | **End-to-End Testing** | You + Agent 3 |
| 7pm-8pm | **Fix Critical Bugs** | You + Agent 1 |
| 8pm-9pm | **Final Documentation Pass** | Agent 4 |
| 9pm-10pm | **Presentation Prep** | You |

### Day 3 (May 20) — Presentation Day

| Time | Activity |
|------|----------|
| 10am-11am | Final bug fixes (if any) |
| 11am-12pm | Presentation rehearsal |
| 12pm-1pm | **LUNCH BREAK** |
| 1pm-2pm | **LIVE PRESENTATION** |

---

## Quality Checkpoints

### Checkpoint 1: End of Day 1
- [ ] All 4 agents have working code
- [ ] Database populated with seed data
- [ ] At least 2 API endpoints functional
- [ ] Frontend intake form works

### Checkpoint 2: Morning of Day 2
- [ ] All API endpoints functional
- [ ] Frontend fully integrated with API
- [ ] Task tracking working
- [ ] Re-assessment logic implemented

### Checkpoint 3: Evening of Day 2
- [ ] All features tested and working
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Ready for presentation

---

## What Each Agent Delivers (File List)

### Agent 1 Deliverables
```
backend/
├── main.py
├── services/
│   ├── ai_service.py
│   └── career_service.py
├── requirements.txt
└── .env.example
```

### Agent 2 Deliverables
```
backend/
├── database.py
├── scripts/
│   └── seed_onet.py
└── seeds/
    └── onet_fallback.json
```

### Agent 3 Deliverables
```
frontend/
├── index.html (updated)
├── js/
│   ├── main.js
│   └── api-client.js
└── css/
    └── style.css (updated)
```

### Agent 4 Deliverables
```
docs/
├── REQUIREMENTS.md (enhanced)
├── UML/
│   ├── use_case_diagram.png
│   ├── sequence_diagram.png
│   ├── class_diagram.png
│   └── activity_diagram.png
├── FEASIBILITY_STUDY.md
├── TEST_CASES.md
├── SPRINT_REPORT.md
└── FINAL_REPORT.md
```

---

## Critical Success Factors

1. **Agents work independently** — No blocking dependencies
2. **You review daily** — Catch issues early
3. **Integration early** — Merge code by evening Day 1
4. **Test constantly** — Don't wait until end
5. **Document as you build** — Don't leave for last minute
6. **Communicate clearly** — Use spec document as source of truth

---

## Contingency Plans

| Risk | Mitigation |
|------|-----------|
| API fails to populate DB | Use fallback JSON seed data |
| Claude API rate limits | Use mock responses for demo |
| Frontend doesn't finish in time | Use static HTML prototype for presentation |
| Agents get stuck | You unblock with direct implementation |

---

## Success Definition

Working demo (all 11 features functional)  
All documentation complete  
Presentation slides ready  
Code deployed locally (runs without errors)  
Team can explain each component  

---

**EXECUTION STARTS IMMEDIATELY.**  
**NO SCOPE CHANGES AFTER THIS PLAN.**
