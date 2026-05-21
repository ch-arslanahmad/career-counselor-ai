# UML Diagrams and Implementation Notes

This document describes the UML diagrams for the current Career Counselor AI codebase.
It intentionally documents what the app does today, not the older planning notes.

Last checked: 2026-05-17

---

## Current Architecture

```text
Student Browser
  -> frontend/index.html
  -> frontend/js/main.js
  -> FastAPI backend/main.py
  -> route modules in backend/routes/
  -> AI gateway in backend/services/ai_gateway.py
  -> optional SQLAlchemy database models in backend/models.py
```

The frontend is a vanilla HTML/CSS/JS single page app. It has three tabs:

- Career Recommendation
- Roadmap Generation
- History

The backend is FastAPI. `backend/main.py` only creates the app, configures CORS, and mounts
these routers:

- `routes/db_options.py`
- `routes/recommendations.py`
- `routes/tasks.py`
- `routes/auth.py`
- `routes/history.py`

The recommendation and roadmap logic is AI-first. The backend calls `generate_json()` from
`services/ai_gateway.py`. If AI is unavailable, `/api/assess`, `/api/roadmap`, and
`/api/skill-gap-analysis` return HTTP 503 instead of silently creating fake results.

---

## 1. Use Case Diagram

### Actor

- Student

### System Boundary

- Career Counselor AI

### Use Cases

1. Register account
2. Login
3. Demo login
4. Submit career assessment
5. View career recommendations
6. Generate roadmap
7. View skill gap summary in roadmap
8. Open detailed skill gap analysis modal
9. Track roadmap task progress
10. View session progress
11. View account history
12. Delete a history item
13. Try demo data

### Relationships

- View career recommendations `<<includes>>` Submit career assessment
- View career recommendations `<<includes>>` AI career analysis
- Generate roadmap `<<includes>>` AI roadmap generation
- Generate roadmap `<<includes>>` skill gap context when a previous assessment exists
- Open detailed skill gap analysis modal `<<extends>>` View career recommendations
- Track roadmap task progress `<<extends>>` View roadmap
- View account history `<<requires>>` Login
- Demo login `<<extends>>` Login
- Try demo data `<<extends>>` Career Recommendation or Roadmap Generation

### Important Accuracy Notes

- Skill gap analysis is not only a separate feature. It appears in two ways:
  - `/api/assess` asks AI to include `matched_skills` and `missing_skills` per career.
  - `/api/roadmap` accepts `missing_skills` and `current_skills` from the latest assessment and asks AI to prioritize missing skills.
- The History tab can show signed-in DB history or browser-local history, depending on whether the user is authenticated.
- The "Try Demo" buttons are frontend-only demos. They fill the form and render static dummy output; they do not save history.

---

## 2. Class Diagram

### Backend ORM Classes

#### User

```text
User
- id: int
- username: string
- password: string
- created_at: datetime
```

Used by auth routes. Passwords are stored as hashes from `routes/auth.py`.

#### AssessmentHistory

```text
AssessmentHistory
- id: int
- user_id: int | null
- session_id: string | null
- name: string | null
- interests: JSON | null
- skills: JSON | null
- education_level: string | null
- career_goals: JSON | null
- location: string | null
- notes: text | null
- career_results: JSON | null
- created_at: datetime
```

This is what the History tab reads for past career assessments. `/api/assess` stores assessment
history when the request includes `user_id`, and the frontend also keeps a local copy for
anonymous users.

#### UserProgress

```text
UserProgress
- id: int
- user_id: int | null
- session_id: string | null
- career_topic: string | null
- step_id: int
- step_title: string | null
- completed: boolean
- completed_at: datetime | null
- created_at: datetime
```

This is what the History tab reads for completed steps. `/api/tasks` writes here when the request
includes `user_id`, and the frontend mirrors progress locally for anonymous users.

#### TaskProgress

```text
TaskProgress
- id: int
- session_id: string
- step_id: int
- step_title: string | null
- completed_at: datetime | null
- created_at: datetime
- unique(session_id, step_id)
```

This stores session-based progress for the current browser session. It is used by
`GET /api/tasks/{session_id}` and the "View Saved Progress" button.

#### StudentAssessment

```text
StudentAssessment
- id: int
- session_id: string
- created_at: datetime
- interests: JSON | null
- current_skills: JSON | null
- education_level: string | null
- career_goals: JSON | null
- location: string | null
- notes: text | null
- updated_at: datetime
```

This model exists in the code, but the current `/api/assess` endpoint does not write to it.
Treat it as planned or partially wired infrastructure.

#### CareerFit

```text
CareerFit
- id: int
- assessment_id: int
- career_id: int | null
- career_name: string | null
- fit_score: int | null
- skill_match: float | null
- reasoning: text | null
- created_at: datetime
```

This model exists and relates to `StudentAssessment`, but the current `/api/assess` endpoint
does not write career fits here. Also note that this table does not currently have
`matched_skills` or `missing_skills` columns; those live in the JSON API response and
`AssessmentHistory.career_results`.

### Frontend Data Classes

#### CareerFormOptions

```text
CareerFormOptions
- interests: string[]
- skills: string[]
- industries: string[]
- locations: string[]
```

Loaded from:

- `GET /options/interests`
- `GET /options/skills`
- `GET /options/industries`
- `GET /options/locations`

#### CareerRecommendationFormData

```text
CareerRecommendationFormData
- name: string
- education_level: string
- career_goals: string
- country: string
- additional_info: string
- interests: string[]
- skills: string[]
- industries: string[]
- locations: string[]
```

Built from the career form before POSTing to `/api/assess`.

#### RoadmapFormData

```text
RoadmapFormData
- career_topic: string
- timeline: string
- current_status: string
- additional_info: string
```

Built from the roadmap form before POSTing to `/api/roadmap`.

### Main Class Relationships

```text
User 1 -> many AssessmentHistory
User 1 -> many UserProgress
StudentAssessment 1 -> many CareerFit
TaskProgress is linked by session_id, not an ORM relationship
UserProgress is linked by user_id and optionally session_id
AssessmentHistory stores AI career results as JSON
```

---

## 3. Sequence Diagram

### Career Assessment Flow

```text
Student
  -> Frontend: fills career form
  -> Frontend: clicks "Get Recommendations"
  -> Frontend: buildCareerFormData()
  -> Backend: POST /api/assess
  -> AI Gateway: generate_json(system prompt, student_profile)
  -> Backend: validate AI response
  -> Database: save AssessmentHistory only if user_id exists
  -> Frontend: return session_id, career_fits, top_3_careers, immediate_next_steps
  -> Frontend: save session_id to localStorage
  -> Frontend: render recommendation cards
```

Data saved:

- Logged-in user: assessment input and career result JSON are saved in `AssessmentHistory`.
- Logged-out user: no account history is saved, but `session_id` is stored in browser localStorage.

### Roadmap Generation Flow

```text
Student
  -> Frontend: fills roadmap form or clicks "Create Roadmap" on a career card
  -> Frontend: buildRoadmapFormData()
  -> Frontend: reads latestCareerAssessment
  -> Frontend: extracts missing_skills and current_skills from the first career fit
  -> Backend: POST /api/roadmap
  -> AI Gateway: generate_json(system prompt, roadmap_request)
  -> Frontend: return roadmap steps, skill_gap_summary, what_to_do_right_now
  -> Frontend: render roadmap timeline and skill gap insight
```

Skill gap analysis in roadmap generation works like this:

1. `/api/assess` returns careers with `matched_skills` and `missing_skills`.
2. The frontend stores the full response in `latestCareerAssessment`.
3. When roadmap generation runs, the frontend takes the first career from
   `latestCareerAssessment.career_fits`.
4. It sends:
   - `missing_skills: targetCareer.missing_skills`
   - `current_skills: targetCareer.matched_skills`
5. `/api/roadmap` includes those arrays in the AI prompt.
6. The AI is instructed to prioritize missing skills first.
7. The UI displays `skill_gap_summary` in the roadmap output.

If the user opens the Roadmap tab directly without first running career assessment, these arrays
are empty. The roadmap can still generate, but the skill-gap section should be omitted instead of
inventing analysis from missing input.

### Skill Gap Modal Flow

```text
Student
  -> Frontend: opens skill analysis modal
  -> Frontend: chooses first career from latestCareerAssessment
  -> Backend: POST /api/skill-gap-analysis
  -> AI Gateway: generate_json(system prompt, skill_gap_request)
  -> Frontend: render missing skills and recommendations in modal
```

This modal is separate from roadmap generation. It does not save history by itself.

### Task Progress Flow

```text
Student
  -> Frontend: checks roadmap step checkbox
  -> Frontend: ensures session_id exists in localStorage
  -> Backend: POST /api/tasks
  -> Database: upsert/delete TaskProgress by (session_id, step_id)
  -> Database: if user_id exists, also upsert UserProgress
  -> Frontend: checkbox stays visually checked
```

When the user clicks "View Saved Progress":

```text
Frontend
  -> Backend: GET /api/tasks/{session_id}
  -> Database: query TaskProgress for that session
  -> Frontend: render completed steps
```

Current limitation: `GET /api/tasks/{session_id}` only knows completed rows because pending
steps are not stored. Therefore `total_steps` equals completed steps, not the full roadmap size.

### History Flow

```text
Student
  -> Frontend: logs in
  -> Frontend: stores { user_id, username } in localStorage
  -> Frontend: shows History tab
  -> Student: opens History tab
  -> Backend: GET /api/history?user_id={id}
  -> Database: query AssessmentHistory by user_id
  -> Database: query completed UserProgress by user_id
  -> Frontend: render Past Assessments, Saved Roadmaps, and Completed Steps
```

What History shows:

- Past assessments:
  - assessment name
  - date
  - top career names from saved `career_results`
  - skills submitted in the assessment
- Completed steps:
  - career topic
  - completed step title
  - completion date

What History does not show yet:

- Full roadmap result JSON
- Full task list including pending tasks
- Logged-out session history
- Roadmap input payload
- A saved copy of every generated roadmap

---

## 4. Activity Diagram

```text
Start
  -> Optional login/register
  -> Career Recommendation tab
  -> Fill assessment form
  -> Submit
  -> AI available?
      -> No: show inline error
      -> Yes: render career cards
  -> User chooses:
      -> open skill analysis modal
      -> create roadmap
      -> try another assessment
  -> Roadmap tab
  -> Fill or accept selected career
  -> Submit roadmap
  -> AI available?
      -> No: show inline error
      -> Yes: render quick actions, skill gap summary, roadmap phases
  -> Optional: enable progress tracking
  -> Check completed steps
  -> Save progress through /api/tasks
  -> Optional: view progress panel
  -> Optional: login and view History tab
End
```

---

## API Mapping

| Feature | Frontend Function | Backend Endpoint | Persistence |
|---|---|---|---|
| Register | login form in register mode | `POST /api/auth/register` | `User` |
| Login | login form | `POST /api/auth/login` | localStorage user |
| Demo login | demo login button | `POST /api/auth/login` with demo credentials | localStorage user |
| Load chips/options | `populateForm()` | `/options/*` | none |
| Career assessment | career form submit | `POST /api/assess` | `AssessmentHistory` only if logged in; local cache otherwise |
| Roadmap generation | roadmap form submit | `POST /api/roadmap` | `AssessmentHistory` when logged in; local cache otherwise |
| Skill gap modal | `openSkillsModal()` | `POST /api/skill-gap-analysis` | `AssessmentHistory` when logged in; local cache otherwise |
| Mark step complete | roadmap checkbox change | `POST /api/tasks` | `TaskProgress`; also `UserProgress` if logged in |
| View progress | `fetchAndShowProgress()` | `GET /api/tasks/{session_id}` | reads `TaskProgress` |
| View history | `loadHistory()` | `GET /api/history?user_id={id}` | reads `AssessmentHistory`, `UserProgress` |
| Delete history | not currently wired in UI | `DELETE /api/history/{assessment_id}` | deletes `AssessmentHistory` |

---

## Answers to Current Architecture Questions

### How Does View History Work?

History is account-based when the user is signed in. The frontend stores the returned `user_id` in
`localStorage` under `career-counselor-user`. When the History tab opens, `loadHistory()` calls:

```text
GET http://localhost:8001/api/history?user_id={user_id}
```

The backend returns two arrays:

- `assessments`: rows from `AssessmentHistory`
- `progress`: completed rows from `UserProgress`

It shows past recommendation assessments, saved roadmap outputs, and completed roadmap steps.
When the user is logged out, the same screen falls back to browser-local history.

### Is Every Recommendation or Roadmap Saved?

No.

- Recommendation results are saved when `/api/assess` receives a `user_id`, and also cached locally in the browser.
- Roadmap results are saved when `/api/roadmap` receives a `user_id`, and also cached locally in the browser.
- Skill-gap analysis results are saved when `/api/skill-gap-analysis` receives a `user_id`, and also cached locally in the browser.
- Completed roadmap steps are saved when the user checks a step.
- If logged in, checked steps are also saved to `UserProgress`, which makes them visible in History.
- If logged out, checked steps are saved only by `session_id` in `TaskProgress`, visible through "View Saved Progress" in the same browser session.

### How Is Skill Gap Analysis Used In Roadmap Generation?

The roadmap does not recalculate skill gaps from the database. The frontend passes skill-gap
context from the latest career assessment into `/api/roadmap`.

The data path is:

```text
/api/assess response
  -> latestCareerAssessment
  -> first career's missing_skills and matched_skills
  -> /api/roadmap request
  -> AI prompt
  -> roadmap skill_gap_summary and prioritized steps
```

### How Is Task Manager Handled?

Roadmap steps are rendered as checkboxes. When a checkbox changes, the frontend sends:

```json
{
  "user_id": 1,
  "session_id": "uuid-or-demo-session",
  "career_topic": "Backend Developer",
  "step_id": 1,
  "step_title": "Learn API Development",
  "mark_complete": true
}
```

Backend behavior:

- If `mark_complete` is true, it creates or updates `TaskProgress`.
- If `mark_complete` is false, it deletes the `TaskProgress` row.
- If `user_id` exists, it also creates or updates `UserProgress`.
- `GET /api/tasks/{session_id}` returns completed session steps.
- `GET /api/history?user_id={id}` returns completed user progress for the History tab.

Custom checklist items in the roadmap UI are local UI only. They are not sent to the backend.

---

## Diagram Build Checklist

Create these visuals in draw.io:

1. Use Case Diagram:
   - Student actor
   - Career Counselor AI system boundary
   - Use cases listed above
   - Include/extend/require relationships

2. Class Diagram:
   - ORM classes: User, AssessmentHistory, UserProgress, TaskProgress, StudentAssessment, CareerFit
   - Frontend data classes: CareerFormOptions, CareerRecommendationFormData, RoadmapFormData
   - Mark StudentAssessment/CareerFit as present but not currently used by `/api/assess`

3. Sequence Diagram:
   - Career assessment
   - Roadmap generation with skill-gap context
   - Task progress
   - History loading

4. Activity Diagram:
   - Optional login
   - Assessment
   - Recommendation display
   - Roadmap generation
   - Progress tracking
   - History
