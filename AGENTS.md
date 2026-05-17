# Career Counselor AI - Agent Instructions

## Core Mandate: Teaching > Doing

**This is a learning project.** The primary goal is for the owner (Arslan) to master software architecture, patterns, and implementation through active practice.

**Guard the learning loop**: Resist "Do It For Me" requests. Offer high-level plans, code skeletons, or architectural guidance first. Full implementations only if the user has attempted, is genuinely stuck on a technical hurdle, or the task is pure boilerplate.

---

## Session Startup (Must Do First)

1. **Read** `docs/SPECIFICATION.md` (source of truth: 9 locked features, 7 DB tables, 6 API endpoints, O*NET strategy)
2. **Read** `docs/AGENT_EXECUTION_PLAN.md` (if working in parallel, check agent assignments and deliverables)
3. **Check** `docs/todo.md` for current task status, claim your task by marking `[-] Name (Date)`
4. **Consult** `.github/skills/git-workflow.md` before any commit (branch strategy: `main` → `dev` → `feature/*`)
5. **Review** this file for critical gotchas below

---

## Quick Start / Commands

| Action | Command |
|---|---|
| Start frontend | `cd frontend && python3 -m http.server 8000` → open `http://localhost:8000` |
| Start backend | `cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload` |
| Run both | Use `./run.sh` (shell script in repo root) |
| Database setup | `backend/scripts/seed_onet.py` (fetches O*NET API, fallback to `backend/seeds/onet_fallback.json`) |
| Tests | None configured yet (Phase 2 deliverable) |

---

## Architecture at a Glance

```
Frontend (Vanilla JS)  →  FastAPI Backend  →  MySQL Database (O*NET + Custom)
```

- **Frontend**: `frontend/index.html` (2 forms: Career Assessment + Roadmap) + `frontend/js/main.js` (form logic, API calls) + `frontend/css/style.css`
- **Backend**: `backend/main.py` (FastAPI) + `backend/services/` (business logic, AI integration) + `backend/database.py` (SQLAlchemy ORM)
- **Database**: 7 tables defined in SPECIFICATION.md Section 1 (careers, skills, career_skills, roadmap_steps, student_assessments, career_fits, task_progress) — all cross-referenced for accurate fit scoring
- **Data Source**: O*NET public API (services.onetcenter.org) + manual Pakistan career curation + hardcoded fallback seed if API fails
- **API Endpoints**: Defined in SPECIFICATION.md Section 3 (exact request/response schemas subject to change during implementation, but feature set is locked)

---

## Critical Gotchas (Read These!)

### 1. Specification is Locked
**What:** `docs/SPECIFICATION.md` freezes all 11 features, DB schema, and API contracts as of May 2026.  
**Why:** No mid-implementation scope creep. All decisions documented with rationale.  
**Agent action:** If user asks for new features, reference SPECIFICATION.md and push back politely. Defer to Phase 2.

### 2. O*NET is Ground Truth, Not the Recommendation Engine
**What:** Database uses verified O*NET occupation data (skills, growth outlook, education requirements, relationships) — but O*NET itself does NOT provide recommendations. Your code must build the matching algorithm on top.  
**Why:** O*NET = annotated job encyclopedia. Your scoring logic = takes user profile + O*NET data → ranks careers. Claude/OpenAI = explains results in natural language.  
**Common mistake:** Treating O*NET as a "recommendation system" when it's actually "structured data for building one."  
**Agent action:** Career fit scoring (SPECIFICATION.md Feature #1) requires comparing user skills ↔ career required skills (from career_skills table). Use `skill_match` calculation (% of required skills user has) as the core algorithm. Fallback to hardcoded seed if O*NET API unavailable.

### 3. Database Schema is Complex (Cross-Referenced)
**What:** 8 tables with multi-level relationships (careers → skills via junction table, roadmap_steps linked to career_id, etc.).  
**Why:** Enables accurate matching and tracking.  
**Agent action:** Before touching database queries, read schema diagram in SPECIFICATION.md. Common mistake: querying careers without joining career_skills.

### 4. Frontend Must Call Backend API (Not Mock Data)
**What:** `frontend/js/main.js` must POST to `/api/assess`, `/api/roadmap`, `/api/cv-analyze` (defined in SPECIFICATION.md Section 4).  
**Why:** Single source of truth. Mock data only for fallback if API is down.  
**Agent action:** Frontend tests should use real backend or mock API responses (not hardcoded data).

### 5. Session-Based Tracking (No User Accounts Yet)
**What:** Each form submission generates a UUID session_id (no login required for MVP).  
**Why:** Phase 1 simplicity. User accounts deferred to Phase 2.  
**Agent action:** All API responses must include and return session_id. Task progress tied to session, not user ID.

### 6. Vanilla JS Only (React is Phase 2)
**What:** MVP uses plain HTML/CSS/JavaScript — no build tools, no npm, no React.  
**Why:** Faster delivery, easier to remove for teacher presentation.  
**Agent action:** Do not introduce build tools or frameworks. If frontend gets complex, document Phase 2 refactor (not in ARCHITECTURE.md, reference SPECIFICATION.md Phase 2 section).

### 7. Two Execution Modes: Sequential or Parallel
**What:** If one agent, complete all tasks sequentially. If 4 agents, assign per AGENT_EXECUTION_PLAN.md.  
**Why:** Coordination matters. DB schema must exist before backend queries. Frontend must know API contracts before coding.  
**Agent action:** Check if other agents are working in parallel. If yes, sync on DB schema and API contracts first.

### 8. ENV Variables (Not in Repo)
**What:** `backend/.env` must define `DATABASE_URL`, `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`, `ONET_API_TIMEOUT`.  
**Why:** Security (no secrets in git) + portability.  
**Agent action:** Use `backend/.env.example` as template. Do not commit `.env`.

---

## Directory Structure (Current)

```
career-counselor-ai/
├── frontend/
│   ├── index.html              # 2 forms (Career Assessment, Roadmap Generation)
│   ├── js/
│   │   └── main.js             # Form logic, API calls, tab switching
│   └── css/
│       └── style.css           # Tabs, chips, cards, spinner, error states
├── backend/
│   ├── main.py                 # FastAPI app, CORS, API endpoints (see SPECIFICATION.md Section 3)
│   ├── database.py             # SQLAlchemy models (8 tables)
│   ├── requirements.txt         # fastapi, sqlalchemy, mysql-connector-python, etc.
│   ├── .env.example            # Environment template
│   ├── services/
│   │   ├── ai_service.py       # Claude/OpenAI wrapper (get_ai_response)
│   │   ├── career_service.py   # Fit scoring, roadmap generation logic
│   │   └── task_service.py     # Task CRUD + progress tracking
│   ├── scripts/
│   │   └── seed_onet.py        # O*NET population script (fetches API or uses fallback)
│   ├── seeds/
│   │   └── onet_fallback.json  # Hardcoded occupations + skills (backup if API fails)
│   └── __pycache__/
├── docs/
│   ├── SPECIFICATION.md        # **SOURCE OF TRUTH** (11 features, DB schema, API contracts, O*NET strategy)
│   ├── AGENT_EXECUTION_PLAN.md # Day-by-day parallel execution (4 agents, May 18-20)
│   ├── ARCHITECTURE.md         # Updated: DB design, O*NET integration, React as Phase 2
│   ├── IMPLEMENTATION_READY.md # Checklist: what changed, risks, success metrics
│   ├── CLASSMATE_TASKS.md      # Tasks for non-tech classmates (UML, Feasibility, Test cases, Sprint report)
│   ├── todo.md                 # Task tracking (mirrors tasks.csv)
│   ├── REQUIREMENTS.md         # SRS (functional + non-functional)
│   ├── VISION.md               # Long-term product vision
│   ├── plan.md                 # 5-phase plan (outdated; see SPECIFICATION.md instead)
│   └── adr/                    # Architecture Decision Records (empty, Phase 2+)
├── .github/
│   └── skills/
│       ├── README.md           # Skill index + usage flow
│       ├── git-workflow.md     # Branch strategy, commit conventions, PR workflow (READ BEFORE COMMIT)
│       ├── task-delegation.md  # Role boundaries, task claiming, file ownership
│       ├── documentation.md    # Doc writing standards
│       └── team-collaboration.md
├── .env                        # SECRET — not in repo (use .env.example as template)
├── run.sh                      # Shell script to start frontend + backend
├── AGENTS.md                   # This file
├── README.md                   # Project overview, tech stack, problem statement
├── REACT_LEARNING.md           # Self-contained React learning guide (Phase 2 reference)
├── things.md                   # Developer scratchpad (UI ideas, not spec)
└── tasks.csv                   # Sprint tracking (user updates, agents mirror to docs/todo.md)
```

---

## Key Documentation Links

| Document | Purpose | When to Read |
|---|---|---|
| `docs/SPECIFICATION.md` | **Source of truth:** 9 locked features, 7 DB tables, API contracts, O*NET strategy | Every session start |
| `docs/AGENT_EXECUTION_PLAN.md` | Parallel agent assignments, deliverables, timeline (May 18-20) | If working in parallel |
| `docs/ARCHITECTURE.md` | 3-layer design (Presentation/Application/Data), O*NET justification, Phase 2 React notes | Before major refactors |
| `.github/skills/git-workflow.md` | Branch strategy (`dev` integration branch), commit conventions | Before every commit |
| `docs/CLASSMATE_TASKS.md` | Templates for non-tech teammates (UML, Feasibility, Test Cases, Sprint Report) | If distributing docs work |
| `docs/IMPLEMENTATION_READY.md` | What changed from original plan, risk assessment, success metrics | Before Day 1 execution (May 18) |
| `env/SESSION_SUMMARY.md` | Previous session recap (decisions locked, next steps) | Reference for context |

---

## Git Workflow (Mandatory Before Commit)

**Branch Strategy:**
- `main` = production-ready only
- `dev` = integration branch (current team work location)
- `feature/*` = isolated work (only if multiple agents or high-risk changes)

**Daily Routine:**
```bash
# Start of session
git checkout dev
git pull origin dev

# Work on assigned scope, commit frequently
git add <your-files>
git commit -m "feat(scope): concise change description"

# Before push, always sync
git pull origin dev
git push origin dev
```

**Commit Message Format:**
- `feat(backend): add career fit scoring endpoint`
- `fix(frontend): correct tab switching logic`
- `docs(spec): update feature list`
- `refactor(database): normalize skills table`

See `.github/skills/git-workflow.md` for full conventions.

---

## Success Criteria (What Does Done Look Like?)

By May 20, 9am:

1. **Backend runs** without errors: `uvicorn backend.main:app --reload`
2. **Database seeded**: O*NET data populated (50+ careers, 100+ skills, cross-referenced)
3. **All API endpoints respond**: Endpoints defined in SPECIFICATION.md Section 3 (6 endpoints: assess, roadmap, careers, careers/{id}/skills, tasks, cv-analyze). Exact schemas subject to change, but feature set is locked
4. **Frontend submits forms** to backend (not mock data)
5. **Results display** in output sections (career fits with scores, roadmap steps with tasks)
6. **SE deliverables complete**: UML diagrams (4), Feasibility Study, Test Cases, Sprint Report (from CLASSMATE_TASKS.md)
7. **Code quality**: All commits follow git workflow, docs updated in same PR, no secrets in git
8. **Presentation ready**: Can demo end-to-end flow, explain architecture, discuss O*NET integration

---

## Anti-Patterns (Do NOT Do This)

| Anti-Pattern | Why It's Bad | Do This Instead |
|---|---|---|
| Hardcode mock careers in frontend JS | DB is source of truth; mock data only if API fails | Fetch `/api/careers` on page load |
| Skip reading SPECIFICATION.md | Leads to scope creep and wrong API contracts | Read it first, reference throughout |
| Commit `.env` or secrets | Security risk | Use `.env.example` as template, add `.env` to `.gitignore` |
| Work on `main` branch | Breaks production | Always branch from or push to `dev` (or `feature/*`) |
| Create new features not in SPECIFICATION.md | Scope creep, missed deadline | Defer to Phase 2, add to todo.md as `(Phase 2)` |
| Frontend calls hardcoded Python functions | Violates 3-layer architecture | Frontend calls FastAPI endpoints via HTTP |
| React/TypeScript/Webpack setup | Violates MVP constraint (Vanilla JS) | Use plain HTML/CSS/JS only |
| Ignore O*NET schema | Leads to inaccurate fit scoring | Ensure career_skills junction table is populated |

---

## Common Questions

**Q: The frontend is slow. Can we use React?**  
A: No. React is Phase 2 (documented in ARCHITECTURE.md). MVP uses Vanilla JS. If performance is truly critical, optimize JS/CSS first (caching, lazy loading).

**Q: What if the O*NET API is down?**  
A: Fallback to `backend/seeds/onet_fallback.json` (hardcoded 50+ occupations + skills). Seed script handles this automatically.

**Q: Do we need unit tests for the MVP?**  
A: No. Tests are Phase 2. For MVP, manual testing + integration tests (does API respond correctly when frontend calls it?).

**Q: Can we add user authentication?**  
A: No. MVP uses session-based tracking (UUID, no login). User accounts are Phase 2.

**Q: What's the Pakistan careers strategy?**  
A: Manual curation (20-30 careers) + O*NET base (other roles). Decided during implementation, not pre-locked.

**Q: Can we change the DB schema after May 17?**  
A: No. Schema is locked in SPECIFICATION.md. Changes require 2 days to re-seed, re-test, re-document.

---

## Help & Feedback

- **Stuck?** Check `docs/SPECIFICATION.md` Section 4 (API contracts) or Section 5 (DB schema)
- **Unclear architecture?** Read `docs/ARCHITECTURE.md` (why 3 layers, why O*NET matters)
- **Git issues?** Consult `.github/skills/git-workflow.md` (branch strategy, commit format)
- **Report bugs/feedback?** https://github.com/anomalyco/opencode (OpenCode issues) or update `docs/todo.md` (project tasks)

---

**Last Updated:** May 2026  
**Status:** Ready for May 18 execution
