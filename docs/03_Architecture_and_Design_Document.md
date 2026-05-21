# Architecture and Design Document

## 1. System Architecture

Career Counselor AI uses a simple layered structure:

- Presentation layer: `frontend/index.html`, `frontend/js/main.js`, `frontend/css/style.css`
- Application layer: FastAPI routes and AI gateway logic
- Data layer: SQLAlchemy models and MySQL persistence

The frontend sends form data to the backend. The backend generates recommendations with AI and stores user state when appropriate.

## 2. Data Flow

1. User submits the assessment form.
2. Frontend sends data to `/api/assess`.
3. Backend generates career matches.
4. Frontend stores the session ID locally.
5. Roadmap generation uses the latest assessment context.
6. Signed-in users save data to the database.
7. Unsigned users keep data in local storage.

## 3. Key Modules

- `backend/routes/recommendations.py`
- `backend/routes/tasks.py`
- `backend/routes/history.py`
- `backend/routes/auth.py`
- `backend/database.py`
- `backend/models.py`

## 4. UML Summary

### Use Case
Student can assess skills, view recommendations, generate a roadmap, track progress, and view history.

### Sequence
Assessment submission goes from frontend to backend, then to AI, then back to the UI with results.

### Class
The main persistence classes are `User`, `AssessmentHistory`, `UserProgress`, `TaskProgress`, `StudentAssessment`, and `CareerFit`.

### Activity
The user flow is assessment -> recommendations -> roadmap -> progress tracking -> history.

## 5. Design Patterns

- Separation of concerns between routes, models, and UI rendering
- Session-based state for anonymous use
- Repository-style database access through helper functions

## 6. UI Design

The UI uses three tabs:
- Career Recommendation
- Roadmap Generation
- History

The roadmap view includes saved progress, skill-gap summary, custom checklist items, and step checkboxes.

