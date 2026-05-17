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

---

## 2. Class Diagram (Domain Model)

**Tool:** draw.io  
**Output files:**
- `class_diagram.drawio`
- `class_diagram.png`

### Classes & Relationships

#### Class 1: Career
```
Career
├─ Attributes:
│  ├─ id: int (Primary Key)
│  ├─ title: string
│  ├─ description: string
│  ├─ type: string (Tech/Business/Arts/Healthcare)
│  ├─ salary_range: string
│  ├─ growth_outlook: string (0-100%)
│  ├─ education_requirements: string
│  ├─ onet_code: string (O*NET identifier)
│  └─ pakistan_relevant: boolean
├─ Methods:
│  ├─ getMatchScore(student): number
│  ├─ getRequiredSkills(): Skill[]
│  └─ getDescription(): string
└─ Relationships:
   ├─ 1:M → RoadmapStep (one career has many roadmap steps)
   └─ M:M → Skill (via CareerSkill junction)
```

#### Class 2: Skill
```
Skill
├─ Attributes:
│  ├─ id: int (Primary Key)
│  ├─ name: string
│  ├─ category: string (Technical/Soft/Domain)
│  └─ description: string
└─ Relationships:
   ├─ M:M → Career (via CareerSkill)
   └─ 1:M ← CareerSkill
```

#### Class 3: CareerSkill (Junction Table)
```
CareerSkill
├─ Attributes:
│  ├─ career_id: int (Foreign Key → Career)
│  ├─ skill_id: int (Foreign Key → Skill)
│  ├─ required: boolean
│  └─ proficiency_level: int (1-5)
└─ Purpose: Resolves M:M relationship between Career and Skill
```

#### Class 4: StudentAssessment
```
StudentAssessment
├─ Attributes:
│  ├─ session_id: string (Primary Key, UUID)
│  ├─ name: string
│  ├─ interests: string[] (JSON array)
│  ├─ skills: string[] (JSON array)
│  ├─ education_level: string
│  ├─ career_goals: string[] (JSON)
│  ├─ industries: string[] (JSON)
│  ├─ location: string
│  ├─ notes: string
│  └─ created_at: datetime
└─ Relationships:
   ├─ 1:M → TaskProgress (one assessment has many task records)
   └─ M:M → Career (recommendations)
```

#### Class 5: RoadmapStep
```
RoadmapStep
├─ Attributes:
│  ├─ id: int (Primary Key)
│  ├─ career_id: int (Foreign Key → Career)
│  ├─ title: string
│  ├─ description: string
│  ├─ duration: string (e.g., "2 months")
│  ├─ step_order: int
│  └─ resources: string[] (URLs/references)
└─ Relationships:
   ├─ M:1 ← Career (many steps belong to one career)
   └─ 1:M → TaskProgress (one step has many progress entries)
```

#### Class 6: TaskProgress
```
TaskProgress
├─ Attributes:
│  ├─ session_id: string (Foreign Key → StudentAssessment)
│  ├─ step_id: int (Foreign Key → RoadmapStep)
│  ├─ completed_at: datetime (null if not done)
│  └─ marked_by_user: boolean
└─ Relationships:
   ├─ M:1 ← StudentAssessment
   └─ M:1 ← RoadmapStep
```

### Cardinality Summary

| From | To | Type | Cardinality | Meaning |
|------|----|----|-------------|---------|
| Career | RoadmapStep | 1:M | 1..* | One career has many roadmap steps |
| Career | Skill | M:M | *..* | Many careers require many skills (via CareerSkill junction) |
| Skill | CareerSkill | 1:M | 1..* | One skill used in many CareerSkill entries |
| StudentAssessment | TaskProgress | 1:M | 1..* | One assessment generates many task progress records |
| RoadmapStep | TaskProgress | 1:M | 1..* | One roadmap step has many progress records |
| StudentAssessment | Career | M:M | *..* | One assessment relates to multiple recommendation careers |

---

## 3. Sequence Diagram (Career Assessment Flow)

**Tool:** draw.io  
**Output files:**
- `sequence_diagram.drawio`
- `sequence_diagram.png`

### Lifelines (Vertical Columns)
1. **Student** (Actor)
2. **Frontend** (JavaScript in browser)
3. **Backend API** (FastAPI server)
4. **Database** (MySQL)
5. **Claude AI** (LLM API)

### Message Flow (11 Steps)

| Step | From | To | Message | Description |
|------|------|----|----|---|
| 1 | Student | Frontend | Fill form (interests, skills, education, goals, industry, location) | User inputs data |
| 2 | Student | Frontend | Click "Get Recommendations" button | Trigger submission |
| 3 | Frontend | Frontend | Validate form (client-side) | Check not empty, proper format |
| 4 | Frontend | Frontend | Show spinner "Analyzing..." | Display loading indicator |
| 5 | Frontend | Backend | POST /api/assess with form data | Send JSON payload |
| 6 | Backend | Database | SELECT careers, skills, career_skills | Query career database |
| 7 | Database | Backend | Return careers + skills + relationships | Database response |
| 8 | Backend | Backend | Calculate skill_match % for each career | For each career: (matched ÷ required) × 100 |
| 9 | Backend | Claude AI | Call AI with student profile + top 5 careers | Send prompt template |
| 10 | Claude AI | Backend | Return reasoning/explanation text | AI response with reasoning |
| 11 | Backend | Frontend | Return 200 OK with career_fits array | Response with top 3-8 careers sorted by fit_score |
| 12 | Frontend | Frontend | Parse response, create career cards | Build DOM elements |
| 13 | Frontend | Frontend | Render: title, fit%, matched skills, missing skills, description | Display cards |
| 14 | Frontend | Frontend | Hide spinner, scroll to results | UX polish |
| 15 | Student | Frontend | See 8-12 career recommendation cards | Final result |

### Response Structure
```json
{
  "career_fits": [
    {
      "career_name": "Software Engineer",
      "fit_score": 85,
      "matched_skills": ["Python", "JavaScript"],
      "missing_skills": ["Go", "Rust"],
      "reasoning": "Your skills align well with...",
      "type": "Tech",
      "growth_outlook": "12%"
    }
  ],
  "top_3_careers": [...],
  "session_id": "uuid-string"
}
```

---

## 4. Activity Diagram (Complete User Workflow)

**Tool:** draw.io  
**Output files:**
- `activity_diagram.drawio`
- `activity_diagram.png`

### Main Flow

```
START
  ↓
Fill Career Intake Form (name, interests, skills, education level, goals, industry, location)
  ↓
Click "Get Recommendations" Button
  ↓
Validate Form ◆─────► Invalid? ──YES──► Show Error Messages ──► Back to Form ──┐
  │                                                                             │
  NO                                                                            │
  │                                                                             │
  ├────────────────────────────────────────────────────────────────────────────┘
  ↓
Calculate Skill Match Scores (0-100%) for Each Career
  ↓
Call Claude AI for Career Fit Reasoning (8-15 second wait)
  ↓
Generate Top 3 Careers Sorted by fit_score
  ↓
Display Results (8-12 Career Recommendation Cards)
  ├─ Career title
  ├─ Match score (%)
  ├─ Matched skills (chips)
  ├─ Missing skills (chips)
  ├─ Description
  └─ "Create Roadmap" button
  ↓
Student Chooses Career ◆
  ├─ Option 1: Click "Create Roadmap" ──────────────┐
  ├─ Option 2: View another career               │
  └─ Option 3: Logout/Exit                       │
                                                  │
If "Create Roadmap":                             │
  ├──────────────────────────────────────────────┘
  ↓
Roadmap Tab Activates (pre-filled with career name)
  ↓
Adjust Timeline & Current Status (if needed)
  ↓
Click "Generate Roadmap" Button
  ↓
Generate Learning Roadmap (5-10 second wait)
  ↓
Display Timeline with Phases & Tasks
  ├─ Phase header (In Progress, duration, etc.)
  ├─ Task list per phase
  ├─ Status chips
  └─ Vertical connectors between phases
  ↓
Display "What to do right now" (3 Quick Actions)
  ↓
Display Custom Checklist Input
  ↓
Student Tracks Progress ◆
  ├─ Check task checkbox ──► Task marked done ──► Strike-through
  ├─ Phase auto-completes when all tasks done
  └─ Progress % updates
  ↓
Student Can Add Custom Todos
  ├─ Type todo ──► Click "Add" ──► Todo added to list
  └─ Check off todo ──► Auto-strikes through
  ↓
END

```

### Key Decision Points

| Decision | If YES | If NO |
|----------|--------|-------|
| Form valid? | → Calculate scores | → Show errors, loop back |
| All fields filled? | → Proceed to API | → Show field error |
| User chooses career? | → Generate roadmap | → Show recommendations again |
| User marks task done? | → Update progress % | → Keep as pending |

---

## Summary: All 4 UML Diagrams

| Diagram | Purpose | Elements | File | Status |
|---------|---------|----------|------|--------|
| **1. Use Case** | Who does what | 1 actor, 6 use cases, 3 relationships | `use_case_diagram.png` | ✅ Done |
| **2. Class** | Data model | 6 classes, 30+ attributes, 7 relationships, M:M via junction | `class_diagram.png` | To Do |
| **3. Sequence** | Interaction flow | 5 lifelines, 15 messages, request-response pairs | `sequence_diagram.png` | To Do |
| **4. Activity** | User workflow | 7 main activities, 2 decision points, branches | `activity_diagram.png` | To Do |

---

## How to Build (Step-by-Step)

1. **Go to draw.io**: https://www.drawio.com/
2. **Create new diagram** → Select template:
   - Use Case template (for diagram 1)
   - Class diagram template (for diagram 2)
   - Sequence diagram template (for diagram 3)
   - Flowchart/Activity template (for diagram 4)
3. **Use details from this file** to populate each diagram
4. **Export as PNG**: File → Export → PNG format (300 DPI recommended)
5. **Save to repo**: `docs/uml/[diagram_name].png`

---

**Last Updated:** 2026-05-17  
**Status:** All 4 diagrams specified (1/4 complete: Use Case done). Ready for team to create remaining 3 in draw.io
