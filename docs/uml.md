# UML Diagrams and Modeling

This file specifies the UML diagrams required for SE deliverables, starting with the Use Case Diagram.

---

## 1. Use Case Diagram (Mandatory)

**Tool:** draw.io (https://www.drawio.com/)  
**Output files:**

- `use_case_diagram.drawio`
- `use_case_diagram.png` (for reports/slides)

### Diagram Content

#### Actor

- **Student** — Primary user interacting with the Career Counselor AI system

#### System Boundary

- **"Career Counselor AI"** — The complete system under design

#### Use Cases Inside Boundary

1. **Submit Career Intake Form** — Student provides personal info, interests, skills, education level
2. **Profile Skill Gap Analysis** — System analyzes student profile against career requirements (no CV file parsing in MVP)
3. **View Career Recommendations** — Student sees ranked career options with fit scores
4. **Generate Learning Roadmap** — System creates personalized step-by-step learning plan
5. **View "What to do right now"** — Student sees immediate next 3 actions/tasks
6. **Track Task Progress** — Student marks roadmap steps as complete and views progress %

#### Use Case Relationships (UML Behavior)

**View Career Recommendations**

- `<includes>` Profile Skill Gap Analysis  
  (Recommendation generation requires skill-gap analysis)

**Generate Learning Roadmap**

- `<includes>` Profile Skill Gap Analysis  
  (Roadmap tailoring uses skill gaps as input)
- derives from **View Career Recommendations**  
  (User chooses a career, then roadmap is generated)

**View "What to do right now"**

- `<extends>` Generate Learning Roadmap  
  (Optional first-view of roadmap: top 3 actions)

**Track Task Progress**

- `<extends>` Generate Learning Roadmap  
  (Optional: user explicitly clicks to track completed steps)

#### Connections

- **Student** is connected to:
  - Submit Career Intake Form (initiates flow)
  - View Career Recommendations (views results)
  - Generate Learning Roadmap (selects career)
  - View "What to do right now" (views quick summary)
  - Track Task Progress (tracks completion)
  - Profile Skill Gap Analysis (indirectly via includes)

---

## Quality Notes

### Formality Level: GOOD

- Uses proper UML terminology (`<includes>`, `<extends>`)
- Relationships are logically sound (skill gap **included** in recommendations and roadmap generation)
- Covers all 9 locked features from SPECIFICATION
- Actor and system boundary are clearly defined

### Skill Gap Analysis Placement (Important)

- Profile Skill Gap Analysis is **included** in both recommendations and roadmap flows
- It appears as a **use case** (not a separate form) because it's a backend service
- UI representation: results shown inline within career recommendations and roadmap, not as a separate form/tab
- No separate "Analyze CV" button for MVP — analysis happens automatically when recommendations/roadmap are generated
- MVP does **not** include CV/resume file upload parsing

### Diagram Completeness

- Covers all MVP features (Phase 1)
- Phase 2 features (React, LLM) are out of scope for this diagram
- All relationships map to API endpoints in SPECIFICATION.md

---

## 2. Remaining UML Diagrams (Planned)

| Diagram          | Status | Priority                |
| ---------------- | ------ | ----------------------- |
| Class Diagram    | To Do  | High (domain model)     |
| Sequence Diagram | To Do  | High (interaction flow) |
| Activity Diagram | To Do  | Medium (user workflow)  |

---

**Last Updated:** 2026-05-15  
**Status:** Use Case complete; ready for teammate to create in draw.io
