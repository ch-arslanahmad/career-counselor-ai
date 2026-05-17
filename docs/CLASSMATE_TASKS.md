# Classmate Task: UML Diagrams & Analysis

**Task Lead:** [Your Name Here]  
**Deadline:** May 19, 2026  
**Output:** UML diagrams + Feasibility Study + Test Cases

---

## What You're Doing

You're creating the **system design documentation** based on the locked specification. This shows how the system is structured and how it works.

**Read these files FIRST:**
- `docs/SPECIFICATION.md` — Complete system spec (what will be built)
- `docs/ARCHITECTURE.md` — Architecture layers (presentation, application, data)
- `frontend/index.html` — Current UI structure
- `backend/dummy_data.py` — Current data structure

---

## Task 1: UML Use Case Diagram

**What it shows:** Who uses the system and what they can do

**Create:** A diagram with:
- **Actor:** Student
- **Use Cases:**
  - Submit Career Intake Form
  - View Career Recommendations
  - Generate Learning Roadmap
  - Track Weekly Tasks
  - Re-assess Skills & Growth
  - View Skill Analysis

**Tool:** Use draw.io (free), Lucidchart, or even hand-drawn + scan

**Example structure:**
```
                Student
                  |
      _____|_____|_____|_____
      |   |   |   |   |   |
     [Submit Form]
     [View Recommendations]
     [Generate Roadmap]
     [Track Tasks]
     [Re-assess]
     [View Analysis]
```

**Deliverable:** `docs/uml/use_case_diagram.png`

---

## Task 2: UML Sequence Diagram

**What it shows:** Step-by-step interaction (what happens when student submits form)

**Create:** A sequence showing:
1. Student fills form → Frontend
2. Frontend validates → Shows errors if invalid
3. Frontend sends → Backend API
4. Backend queries → Database
5. Backend calls → Claude API
6. Claude returns → Reasoning/analysis
7. Backend returns → Career recommendations
8. Frontend renders → Shows results to student

**Tool:** draw.io has sequence diagram templates

**Deliverable:** `docs/uml/sequence_diagram.png`

---

## Task 3: UML Class Diagram

**What it shows:** Database entities and their relationships

**Create:** A diagram with these classes:
- **Career** (id, name, description, type, growth_outlook)
- **Skill** (id, name, category, description)
- **CareerSkill** (career_id, skill_id, proficiency_level, is_required)
- **StudentAssessment** (session_id, interests, skills, education_level)
- **RoadmapStep** (id, career_id, title, duration, step_order)
- **TaskProgress** (session_id, step_id, completed_at)

**Show relationships:**
- Career ←→ Skill (many-to-many via CareerSkill)
- StudentAssessment → Career (recommendations)
- Career → RoadmapStep (one-to-many)
- StudentAssessment → TaskProgress (tracks tasks)

**Tool:** draw.io or Lucidchart

**Deliverable:** `docs/uml/class_diagram.png`

---

## Task 4: UML Activity Diagram

**What it shows:** How a user flows through the system

**Create:** A flow showing:
```
Start
  ↓
Fill Intake Form
  ↓
Submit & Validate
  ↓
[Invalid?] → Show Errors → Back to Form
  ↓
Calculate Career Fit Scores
  ↓
Display Top 3 Careers with Match %
  ↓
User Chooses Career
  ↓
Generate Timeline-Aware Roadmap
  ↓
Display Weekly Tasks
  ↓
Track Progress (Mark Tasks Done)
  ↓
[After 4 weeks] Re-assess Skills
  ↓
Compare: Old Skills vs New Skills
  ↓
Show Growth Delta
  ↓
End
```

**Tool:** draw.io or Lucidchart has activity templates

**Deliverable:** `docs/uml/activity_diagram.png`

---

## Task 5: Feasibility Study

**What it is:** Assessment of whether this project is actually doable

**Write:** A 2-3 page document covering:

### 5.1 Technical Feasibility
```markdown
Can we build this with available tech?

- Database: MySQL (mature, well-supported)
- Backend: FastAPI (fast, modern)
- Frontend: Vanilla JS (no build tools needed)
- AI: Claude API (accessible via API)
- O*NET: Free public API (verified data source)

Risks: None identified. All technologies proven.
```

### 5.2 Operational Feasibility
```markdown
Can we get this done in the timeline?

- Deadline: May 19-20
- Team size: 1 developer + AI agents
- Scope: 11 features (locked)
- Parallel execution: 4 agents working simultaneously

Risks: Timeline is aggressive. Requires strict adherence to spec.
Mitigation: No scope changes after May 17.
```

### 5.3 Economic Feasibility
```markdown
Do we have resources?

- Infrastructure: Free tier available
  - MySQL: Free local installation
  - FastAPI: Free framework
  - Claude API: $$ cost (academic account eligible)
- Team cost: Already allocated
- No additional costs expected

Risks: Claude API quota limits. 
Mitigation: Use mock responses for demo if needed.
```

### 5.4 Schedule Feasibility
```markdown
Gantt-style timeline:

Day 1 (May 18):
  - Morning: Planning & setup (2 hrs)
  - Afternoon: Core implementation (6 hrs)
  - Evening: Integration & testing (4 hrs)

Day 2 (May 19):
  - Morning: Advanced features (4 hrs)
  - Afternoon: Testing & docs (4 hrs)
  - Evening: Final polish (2 hrs)

Day 3 (May 20):
  - Presentation (1 hr)
```

**Deliverable:** `docs/FEASIBILITY_STUDY.md`

---

## Task 6: Test Cases

**What it is:** Manual testing scenarios to verify the system works

**Format:** Create a table with columns:

| Test ID | Scenario | Steps | Expected Result | Actual Result | Pass/Fail |
|---------|----------|-------|-----------------|---------------|-----------|
| TC-001 | Career recommendation form validation | 1. Open form 2. Click submit without filling | Error message shown | — | — |
| TC-002 | Career recommendations display | 1. Fill form correctly 2. Click "Get Recommendations" | Show 3 career cards with scores | — | — |
| TC-003 | Roadmap generation | 1. Click career card 2. Select timeline | Show roadmap with adjusted duration | — | — |
| TC-004 | Task tracking | 1. Check first task 2. Reload page | Task remains checked | — | — |
| TC-005 | Re-assessment comparison | 1. Re-submit form with new skills 2. Compare | Show delta (skills gained/lost) | — | — |
| ... | (20+ more tests) | | | | |

**Write at least 20 test cases covering:**
- Form validation (3-4 tests)
- Career recommendations (3-4 tests)
- Roadmap generation (3-4 tests)
- Task tracking (3-4 tests)
- Re-assessment (3-4 tests)
- Error handling (2-3 tests)

**Deliverable:** `docs/TEST_CASES.md`

---

## Task 7: Sprint Report

**What it is:** Summary of what was built in this sprint

**Write:** A 1-2 page report:

```markdown
# Sprint 1 Report (May 18-19)

## Sprint Goal
Deliver MVP of Career Counselor AI with core features and full documentation.

## User Stories Completed
- [ ] As a student, I can submit an intake form (interests, skills, education)
- [ ] As a student, I can see 3+ career recommendations with fit scores
- [ ] As a student, I can generate a personalized roadmap
- [ ] As a student, I can track weekly tasks and mark progress
- [ ] As a student, I can re-assess and see growth delta

## Features Implemented
1. Career fit scoring (0-100)
2. Timeline-aware roadmaps
3. Task tracking with progress %
4. Skill snapshots + re-assessment
5. Growth outlook display (from O*NET)
6. Profile skill-gap analysis (no CV upload parsing in MVP)
7. Career type flags
8. Pakistan-specific careers
9. Database with cross-references
10. O*NET seed script
11. FastAPI endpoints

## Blockers / Issues
- None at this time

## Next Steps
- Phase 2: React migration (if time permits)
- Phase 3: Advanced AI features (follow-up questions)
- Phase 4: Production deployment
```

**Deliverable:** `docs/SPRINT_REPORT.md`

---

## Summary: What to Deliver

| Task | File | Format |
|------|------|--------|
| Task 1 | `docs/uml/use_case_diagram.png` | Image (PNG/PDF) |
| Task 2 | `docs/uml/sequence_diagram.png` | Image (PNG/PDF) |
| Task 3 | `docs/uml/class_diagram.png` | Image (PNG/PDF) |
| Task 4 | `docs/uml/activity_diagram.png` | Image (PNG/PDF) |
| Task 5 | `docs/FEASIBILITY_STUDY.md` | Markdown |
| Task 6 | `docs/TEST_CASES.md` | Markdown |
| Task 7 | `docs/SPRINT_REPORT.md` | Markdown |

---

## Timeline

- **May 18 morning:** Read spec + architecture
- **May 18 afternoon:** Create 4 UML diagrams
- **May 19 morning:** Write Feasibility Study + Test Cases
- **May 19 afternoon:** Write Sprint Report + final review

---

## Questions?

All answers in:
- `docs/SPECIFICATION.md` — What will be built
- `docs/ARCHITECTURE.md` — How it's structured
- `docs/AGENT_EXECUTION_PLAN.md` — Implementation plan

**Treat the spec document as your source of truth.**

---

Good luck! You're documenting a professional-grade software engineering project.
