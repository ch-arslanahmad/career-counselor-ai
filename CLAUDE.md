# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web-based AI career counseling system that recommends career paths, degree programs, and learning roadmaps. Students fill out forms to get personalized recommendations. Currently in **Phase 1 (Static MVP)** with HTML/CSS/JS frontend and Python dummy data backend.

## Commands

No build tools, package managers, or CI configured yet. No tests or linting set up.

| Action | Command |
|--------|---------|
| Serve frontend | `cd frontend && python3 -m http.server 8000` then open `http://localhost:8000` |
| Run backend | `cd backend && uvicorn main:app --reload` (once implemented) |
| Install Python deps | `cd backend && pip install -r requirements.txt` (once created) |

## Architecture

### Layer Structure

```
Presentation (HTML/CSS/JS)  →  Application (Python FastAPI)  →  Data (MySQL later, dummy now)
```

### Frontend

Single HTML page (`frontend/index.html`) with two tabbed forms:
- **Career Recommendation** (8 fields): name, interests (chips), skills (chips), education_level (select), goals (select), industry (chips), location (select), notes (textarea)
- **Roadmap Generation** (4 fields): career_topic (text), timeline (select), current_status (select), notes (textarea)

Output sections are hidden by default (`style="display:none"`), shown after form submit.

CSS class patterns: `.field`, `.chips`, `.chip`, `.card`, `.tab-content`, `.output-section`, `.match-score`, `.spinner`, `.error`

Color scheme: Blue primary (`#3498db`), dark text (`#2c3e50`), green match scores (`#27ae60`)

### Backend (Phase 1)

`backend/dummy_data.py` contains 5 data structures:
- `CAREER_PATHS` - 3 careers with skills, salary, growth outlook
- `DEGREE_PROGRAMS` - 2 programs linked to career paths via `career_paths_id: list[int]`
- `SUBJECTS` - 4 subjects with semester, credit_hours
- `ROADMAP_STEPS` - 3 steps with `step_order`
- `PROMPT_TEMPLATES` - 1 template with `{interests}` and `{background}` placeholders

### API Contract (for when backend is built)

| Method | Endpoint | Request | Response |
|--------|----------|----------|----------|
| GET | `/api/options` | -- | `{ interests: [], skills: [], industries: [], locations: [] }` |
| POST | `/api/career/recommend` | `{ interests, skills, education_level, goals, industry, location }` | `{ careers: [{ title, description, match_score, reasoning }] }` |
| POST | `/api/roadmap/generate` | `{ career_topic, timeline, current_status }` | `{ steps: [{ title, description, duration }] }` |

## Development Phases

| Phase | What | Status |
|-------|------|--------|
| 1 | Static HTML/CSS/JS + Python dummy data | **In progress (current)** |
| 2 | MySQL database + SQLAlchemy ORM | Not started |
| 3 | React migration (Vite, components, useState) | Optional |
| 4 | LLM integration (OpenAI/Anthropic) | Not started |
| 5 | Testing, licensing, final report | Not started |

## Naming Conventions

- **HTML**: kebab-case IDs/classes (`career-form`, `career-cards`, `match-score`)
- **CSS**: descriptive class names (`.field`, `.chip`, `.tab.active`, `.card`, `.spinner`)
- **JS**: camelCase functions (`generateMockRecommendations`, `createRecommendationCard`)
- **Python**: snake_case variables (`CAREER_PATHS`, `DEGREE_PROGRAMS`)
- **Branches**: `feature/<short-description>`, `fix/<issue-description>`

## Known Bugs / Gotchas

1. **Script src path is wrong** - `index.html:201` has `<script src="main.js">` but file is at `frontend/js/main.js`. Should be `<script src="js/main.js">`.

2. **No CSS `<link>` in index.html** - `frontend/css/style.css` exists with complete styling but `index.html` has no `<link>` tag. Add `<link rel="stylesheet" href="css/style.css">` in `<head>`.

3. **CSS class mismatch** - CSS targets `.form-section.active` but HTML uses `section.tab-content.active`. These selectors don't match - tab switching won't work with current CSS.

4. **main.js is incomplete** - Only defines `generateMockRecommendations()` and `createRecommendationCard()`. Missing: tab switching logic, dynamic chip population, location dropdown population, form submission handlers for both forms, roadmap mock data + rendering, output section show/hide.

5. **Dynamic vs Static Fields** - Fields marked `<!-- todo: add data dynamically via JS -->` in HTML (interests chips, skills chips, industry chips, location dropdown) must be rendered by JS, not hardcoded. Hardcoded static fields (education level, career goals, timeline, current status) are safe in HTML.

6. **Interest Finding Form removed** - Originally 3 forms existed. Only 2 remain: Career Recommendation + Roadmap Generation. Do NOT recreate the Interest Finding form.

7. **tasks.csv workflow** - `tasks.csv` is the source-of-truth for the user's Notion/exports. Agents should only update `docs/todo.md` to mirror changes. Do NOT edit `tasks.csv` unless explicitly asked.

## Task Tracking

| File | Purpose | Who Updates |
|------|----------|-------------|
| `tasks.csv` | Source of truth (Notion import, sprint reports) | **User only** |
| `docs/todo.md` | Markdown mirror for GitHub viewing | **Agents update this** |

Mark tasks with `[-]` when starting (include name+date), `[x]` when done. Use `Blocked:` suffix if stuck.

## Git Workflow

- **Branch strategy**: `main` (production) + `dev` (integration) + `feature/*` branches
- **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- **No emojis in docs** - professional, plain-text only
- **Doc updates in same commit as code changes**
- **Pull before starting work, pull again before pushing**

## Learning Mandate

This is a learning project. The primary goal is for the owner (Arslan) to master software architecture and implementation through active practice. When implementing new logic, provide high-level plans or code skeletons and invite the user to implement core logic. Provide full implementations only when the user is stuck on a technical hurdle or the task is purely boilerplate.

## Key Files to Read First

- `docs/ARCHITECTURE.md` - 3-layer architecture details
- `docs/REQUIREMENTS.md` - SRS, functional/non-functional requirements
- `docs/todo.md` - Current task status
- `AGENTS.md` - Detailed agent instructions and Phase 1 playbook
- `.github/skills/` - Team collaboration rules (read `task-delegation.md` and `git-workflow.md`)
