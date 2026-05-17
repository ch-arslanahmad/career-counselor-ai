# AGENTS.md — Career Counselor AI (feat/database branch)

## Project Context

University SE project: AI-powered career counseling web app. Current branch (`feat/database`) focuses on Phase 2: database integration.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JS (static forms)
- **Backend**: Python FastAPI
- **Database**: MariaDB (MySQL drop-in replacement)
- **ORM**: SQLAlchemy (pending setup)

## Key Commands

```bash
# Run both frontend + backend
./run.sh

# Manual backend (port 8001)
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8001

# Manual frontend (port 8000)
cd frontend && python3 -m http.server 8000
```

## Database (MariaDB)

- **DB name**: `career_counselor` (user asked to rename)
- **User**: `counselor_app` / pw: `counselor_pass`
- **Connect**: `mysql+pymysql://counselor_app:counselor_pass@localhost/career_counselor`
- **CLI**: `mariadb -u counselor_app -pcounselor_pass -D career_counselor`

## Branch Workflow

- `feat/database` — all DB work (this branch)
- Other AI agent handles: React migration, AI integration, other backend
- Commit convention: conventional commits (`feat:`, `fix:`, `chore:`)

## OpenCode Config

Uses `.opencode/` from `everything-claude-code` repo:
- Default agent: `build` (big-pickle model)
- Skills: TDD, security-review, frontend-patterns, backend-patterns, etc.
- Available agents: python-reviewer, code-reviewer, security-reviewer, tdd-guide

## Tasks Source

`tasks.csv` tracks all 5 sprints. Update both `tasks.csv` and `docs/todo.md` when changing task status.

## Frontend ↔ Backend Contract

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/options/skills` | GET | Form dropdown |
| `/options/interests` | GET | Form dropdown |
| `/options/industries` | GET | Form dropdown |
| `/options/locations` | GET | Form dropdown |
| `/api/careers` | GET | List all careers |
| `/api/careers/{id}/skills` | GET | Get career required/optional skills |
| `/api/careers/{id}/roadmap` | GET | Get career roadmap steps |
| `/recommend` | POST | Career recommendations (TODO) |
| `/roadmap` | POST | Roadmap generation (TODO) |

## Current Focus

Phase 2 (Database): Install MySQL → Schema design → ORM setup → Seed data → API integration.

## Notes

- CORS enabled for: `127.0.0.1:5500`, `localhost:8000`, `localhost:8001`
- Docs in `docs/`: ARCHITECTURE.md, REQUIREMENTS.md, plan.md, todo.md, se-deliverables.md
- Static HTML forms in `frontend/index.html`
- Backend API in `backend/main.py`