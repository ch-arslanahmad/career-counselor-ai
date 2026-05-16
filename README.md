# career-counselor-ai

A web-based AI career counseling system that recommends university degree programs based on user interests and background, with semester-wise course details and roadmap guidance.

## Project structure

```
career-counselor-ai/
├── docs/                    
│   ├── REQUIREMENTS.md     # SRS, functional/non-functional requirements
│   ├── ARCHITECTURE.md
│   ├── plan.md
│   ├── todo.md
│   ├── se-deliverables.md
│   ├── deliverables-guide.md
│   └── adr/               
├── tasks.csv               # Sprint tracking (Sprints 1-5)
│
├── frontend/               # Frontend
├── backend/                # Python FastAPI/Flask backend
└── README.md
```

## Problem Statement

Students face three big questions when planning their future:

1. Which career path fits their interests, background, and goals
2. What degree programs, courses, and subjects should they take
3. How do they get from beginner to job-ready with a step-by-step roadmap

This project follow iterative development in terms of sprints.

## Tech stack (Current)

This project follows the iterative scrum framework in sprints.

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Python (FastAPI or Flask)
- Database: MySQL
- AI: LLM API (OpenAI/Anthropic compatible)

## O*NET Web Services

This project uses O*NET data for career information.

- O*NET Web Services access is free, but registration is required.
- The API uses `X-API-Key` authentication after your organization and project are approved.
- All applications using O*NET data must credit and link to O*NET Web Services and follow the O*NET terms of service and data license.
- The service is best-effort and rate-limited, so caching or a local database copy is recommended for repeated queries.
- If your account is still under review, the live API is not available yet.

Project note:
- The seed pipeline is O*NET-only now.
- Local fallback seed data was removed from the DB flow.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details (to be added in Phase 5).
