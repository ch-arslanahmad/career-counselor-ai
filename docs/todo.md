# Career Counselor AI - Project Todo

Last Updated: 2026-05-06

---

## Task Tracking

**Source of Truth:** `tasks.csv` (not committed to repo - local only)

**Use `tasks.csv` for:**
- Notion board import
- Sprint reports (Gantt charts, staff allocation tables)
- Activity bar charts for deliverables

**Markdown version:** This file mirrors `tasks.csv` for GitHub viewing. Update both when tasks change.

**Task Claiming Rules (No Pre-Assignment):**
- Checkbox Status:
  - `[ ]` - Task is pending (not started)
  - `[-]` - Task is in progress
  - `[x]` - Task is completed

Workflow:
- Before starting a task, mark it `[-]` and add your name + date
- Example: `- [-] Initialize React project structure - Arslan (2026-05-06)`
- When done, switch to `[x]` and keep name + completion date
- If blocked, keep `[-]` and append `Blocked:` with reason
- If you stop working on it, return to `[ ]` so others can pick it

No tasks are pre-assigned. Claim tasks by adding your name + date when you start.

---

## Phase1: Static Front-End (HTML/CSS/JS)

- [ ] **Static HTML Forms**
  - [ ] Build Career Recommendation form
     - Fields: interests, background, education level, goals
     - Style with plain CSS
     - Vanilla JS for form validation and API calls
  - [ ] Build Interest Finding form
     - Fields: personality questions, preferences, skills
     - Style with plain CSS
  - [ ] Build Roadmap Generation form
     - Fields: selected career, timeline preferences, current status
     - Style with plain CSS

- Output for each form in structured data and do not make a new page (for now).

- [ ] **Response Cards UI**
  - [ ] Recommendation card (career suggestions + match reasoning)
  - [ ] Subject list card (course/subject recommendations)
  - [ ] Roadmap steps card (step-by-step learning plan)
  - [ ] Comparison output card between options of recommendations (optional MVP enhancement)

- [ ] **Frontend Validation and States**
  - [ ] Add basic input validation for all forms
  - [ ] Add loading/error/empty states for API responses
  - [ ] Add reusable UI components for consistent response display

---

## Phase2: Database

- [ ] **Database Setup**
  - [ ] Install MySQL server locally
    - [ ] Create a doc for it like guide/learnings
  - [ ] Create database schema and user credentials
  - [ ] Test database connectivity from backend

- [ ] **Schema Design and Creation**
  - [ ] Define tables based on requirements (to be decided in Sprint 2)
  - [ ] Create SQL migration files or ORM models

- [ ] **ORM Setup (SQLAlchemy)**
  - [ ] Install SQLAlchemy and database driver (pymysql or mysqlclient)
  - [ ] Create database models matching schema
  - [ ] Set up Alembic for database migrations (optional but recommended)
  - [ ] Create database initialization script

- [ ] **Seed Data Creation**
  - [ ] Populate tables with initial data (career paths, programs, subjects, roadmap steps)
  - [ ] Write seed script to populate database
  - [ ] Verify seed data through direct queries

- [ ] **Database Integration**
  - [ ] Create repository/DAO layer for database queries
  - [ ] Implement CRUD operations for all tables
  - [ ] Add query methods for recommendation engine
  - [ ] Add error handling for database operations

---

## Phase3: React Migration (Optional PoC)

### Why React Later (Not Static HTML)?

- [ ] **React Project Setup**
  - [ ] Initialize React project with Vite
  - [ ] Set up project structure (components/, pages/, styles/)

- [ ] **Convert Static Forms to React Components**
  - [ ] Migrate Career Recommendation form to React
  - [ ] Migrate Interest Finding form to React
  - [ ] Migrate Roadmap Generation form to React
  - [ ] Implement state management

- [ ] **Response Cards UI (React)**
  - [ ] Recommendation card (career suggestions + match reasoning)
  - [ ] Subject list card (course/subject recommendations)
  - [ ] Roadmap steps card (step-by-step learning plan)
  - [ ] Comparison output card (optional enhancement)

- [ ] **Frontend Validation and States (React)**
  - [ ] Add basic input validation for all forms
  - [ ] Add loading/error/empty states for API responses
  - [ ] Add reusable UI components for consistent response display

---

## Phase4: AI Enhancement

- [ ] **LLM Integration**
  - [ ] Add LLM provider abstraction (OpenAI/Anthropic compatible)
  - [ ] Add prompt template loader from data/config
  - [ ] Add fallback behavior when LLM is unavailable

- [ ] **AI Core Modules**
  - [ ] Implement AI Intent Detector
  - [ ] Implement AI Entity Extractor
  - [ ] Enhance Recommendation Engine with AI reasoning
  - [ ] Enhance Roadmap Generator with AI

- [ ] **Follow-up Question Support (Optional)**
  - [ ] Implement follow-up question handling for deeper exploration
  - [ ] Add context management for follow-up queries

---

## Phase5: Advanced Features

- [ ] Skills gap analysis and assessment matching
- [ ] Comparison outputs
- [ ] Export Data - CSV format (basic)

---

### Shared Tasks (Either Can Do)

- [ ] **API Contract Alignment (Frontend + Backend)**
  - [ ] Define request/response schemas for all MVP endpoints
  - [ ] Agree on error response format
  - [ ] Document field-level validation rules

- [ ] **Integration Tasks (Static → React)**
  - [ ] Connect static HTML forms to Python API endpoints (Phase1)
  - [ ] Migrate static form integration to React components (Phase3)
  - [ ] Verify response cards render correctly for each endpoint
  - [ ] Validate end-to-end MVP flow for 3 user scenarios

- [ ] **Documentation Updates**
  - [ ] Update `docs/ARCHITECTURE.md` with selected backend framework (FastAPI or Flask)
  - [ ] Add API contract section (or separate API doc)
  - [ ] Add local setup instructions for Static HTML, React, Python backend, and MySQL
  - [ ] Keep claim/status current in this file

---

### Shared Tasks (Either Can Do)

- [ ] **Testing & Quality Assurance**
  - [ ] Unit Testing
  - [ ] Integration Testing
  - [ ] System Testing
  - [ ] Test Report

- [ ] **Project Management Activities**
  - [ ] Software Licensing Document (add reasoning for license choice in repo)
  - [ ] Activity Chart and Staff Allocation
  - [ ] Final Report
  - [ ] Presentation Slides
  - [ ] Source Code Submission

---

## Learning Resources

- **React Docs**: https://react.dev/learn
- **Vite Guide**: https://vitejs.dev/guide/
- **Static HTML/CSS/JS**: Your existing knowledge
- **Vanilla JS**: MDN Web Docs https://developer.mozilla.org/en-US/docs/Web/JavaScript
