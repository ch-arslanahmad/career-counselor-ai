# Project: Career Counselor AI

## Collaborative Mandate: Teaching > Doing

**This is a learning project.** The primary goal is for the owner (Arslan) to master software architecture, patterns, and implementation through active practice.

### Operational Directive: Guard the "Learning Loop"
AI agents must proactively resist the "Do It For Me" pattern. Your role is a **Senior Peer Programmer & Mentor**, not a passive code generator.

- **The "Try First" Nudge:** When a directive involves implementing new logic, do not immediately provide a complete solution. Propose a high-level plan or a code skeleton and invite the user to implement the core logic.
- **Review over Replacement:** Prioritize analyzing and improving the user's existing attempts. Use `read_file` to review their work and provide targeted feedback.
- **Architectural Leadership:** You are responsible for complex architectural design, multi-file strategy, and infrastructure setup. In these cases, provide comprehensive plans but explain the technical rationale to facilitate learning.
- **The "Stuck" Protocol:** Provide full implementations ONLY if the user has demonstrated a genuine attempt, is stuck on a specific technical hurdle, or the task is purely boilerplate/repetitive.

### Intervention Signals
- Requests to "just do it," "complete this," or "write the whole thing" without an accompanying attempt.
- Vague directives that skip the "Research" or "Strategy" phases.

### Preferred Response Pattern
1. **Deconstruct:** Break the task into logical sub-tasks.
2. **Skeleton & Strategy:** Provide the necessary interfaces or architectural context.
3. **Challenge:** Ask the user to implement a specific part (e.g., "I've set up the service interface; why don't you try implementing the `save()` method?").
4. **Validate:** Perform rigorous review and testing once the user provides their implementation.


---


> **First Approach: Mandatory Session Protocol**
> Before performing any task, follow this workflow:
> 1. **Read `AGENTS.md`**: Immediate technical context, known bugs, and project gotchas.
> 2. **Read `docs/todo.md`**: Check current task status and **claim your task** by marking it `[-] Name (Date)`.
> 3. **Consult `docs/`**: Ensure changes align with `ARCHITECTURE.md` and `plan.md`.
> 4. **Git Workflow**: Use conventional commits and follow the `main` -> `dev` -> `feature/*` branch strategy.

A web-based AI career counseling system that recommends university degree programs, courses, and provides learning roadmaps based on user interests and background.

## Project Overview

The project follows an iterative development approach across 5 planned phases:
1. **Phase 1: Static MVP** - HTML/CSS/JS frontend with a Python backend serving dummy data.
2. **Phase 2: Database Integration** - MySQL integration with SQLAlchemy ORM.
3. **Phase 3: React Migration** - Converting the static frontend to React for better state management and interactivity.
4. **Phase 4: AI Enhancement** - Integrating LLMs (OpenAI/Anthropic) for dynamic recommendations and roadmap generation.
5. **Phase 5: Advanced Features** - Skills gap analysis, PDF exports, and user accounts.

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (Moving to React in Phase 3).
- **Backend:** Python (FastAPI preferred, Flask acceptable).
- **Database:** MySQL.
- **AI:** LLM API (OpenAI/Anthropic compatible).
- **Process:** Iterative Scrum Framework.

## Directory Structure

- `frontend/`: Static assets (HTML, CSS, JS).
- `backend/`: Python API and data logic.
  - `dummy_data.py`: Mock data for Phase 1.
- `docs/`: Comprehensive documentation including Requirements, Architecture, and Plans.
  - `ARCHITECTURE.md`: Technical design and migration path.
  - `REQUIREMENTS.md`: Functional and non-functional requirements.
  - `plan.md`: Detailed phase-by-phase roadmap.
- `tasks.csv`: Sprint tracking and task progress.

## Getting Started

### Backend (Phase 1 WIP)
Currently, the backend consists of `dummy_data.py`. A server implementation (e.g., `main.py`) is pending.
- **Target Framework:** FastAPI
- **TODO:** Create `main.py` and implement endpoints for:
  - `/recommendations`
  - `/roadmap`
  - `/subjects`

### Frontend
- Open `frontend/index.html` in a browser to view the current static UI.
- The UI uses tab-based navigation for Career Recommendations and Roadmap Generation.

## Development Conventions

- **Documentation First:** Always refer to `docs/` before making architectural changes.
- **Iterative Progress:** Follow the phases outlined in `docs/plan.md`.
- **Surgical Edits:** Keep changes focused on the current phase or specific task.
- **Type Safety:** Use Type Hints in Python and clear documentation for JS functions.

## Current Focus
- Completing Phase 1: Implementing the FastAPI backend to serve data from `dummy_data.py` to the vanilla JS frontend.
