# Project Plan

Build static form-based system → Migrate to React → Enhance with AI → Add optional follow-up support.

Current is a 5-Phase Plan:

## Phase 1: Static MVP (HTML/CSS/JS + Python Backend)

**Frontend (Static):**
- HTML forms for Career path recommendation
- HTML form for Roadmap generation
- HTML form for interest finding
- Styling with plain CSS (your existing knowledge)
- Vanilla JavaScript for form validation and API calls

**Backend:**
- Python (FastAPI preferred, Flask acceptable)
- API endpoints returning dummy data (no database yet)
- Define request/response structure for all forms

**Why Static HTML First:**
1. Faster MVP delivery - no build tools or component overhead
2. Your existing HTML/CSS/JS knowledge is sufficient
3. Clear API contract - forms define exactly what data frontend sends/receives
4. Gradual migration path - can switch to React when chatbot features needed
5. No wasted work - HTML form fields map directly to React state variables later

## Phase 2: Database Integration

- Install MySQL server locally
- Create database schema (career_paths, degree_programs, subjects, roadmap_steps)
- Seed data population (career paths, programs, subjects, roadmaps)
- Backend ORM setup (SQLAlchemy)
- Connect static frontend to database-backed API

## Phase 3: React Migration (Optional PoC)

**When to migrate:** When adding complex interactive features

**What changes:**
- Convert HTML forms to React components
- Add state management with `useState`
- *Future: Optional follow-up question support may be added*
- Reuse response card components
- Keep plain CSS (no CSS Modules)

**Why React Later (Not Static HTML):**
1. ARCHITECTURE.md specifies React - follows own tech stack docs
2. State management for interactive features - React's `useState`/`useReducer` handles complex state
3. Optional follow-up support scales from React forms, no full rewrite
4. Component reusability for response cards
5. Your programming background (Java/Python/C++) transfers to React concepts
6. Industry standard for interactive web apps

## Phase 4: AI Enhancement

- LLM integration (OpenAI/Anthropic)
- Intent detection and entity extraction
- AI-powered recommendation engine
- Roadmap generation with reasoning
- Optional: Follow-up question support for deeper exploration

## Phase 5: Advanced Features

- Skills gap analysis and assessment matching
- Comparison outputs
- User accounts and session history
- Exportable reports (PDF, CSV)

---


