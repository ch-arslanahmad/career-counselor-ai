# Application Architecture

## Tech Stack

### MVP Phase (Static)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Python (FastAPI or Flask)
- **Database**: MySQL
- **AI**: LLM API (OpenAI, Anthropic, etc.)

### PoC/Production Phase (Dynamic)
- **Frontend**: React (JSX, Hooks), Plain CSS, JavaScript (ES6+)
- **Migration Path**: Static HTML forms → React components when chatbot/interactive features needed

---

## Logical Architecture

### A. Presentation Layer

**MVP (Static HTML)**
- HTML forms for career path recommendation
- HTML forms for roadmap generation
- HTML forms for interest finding
- Plain CSS styling
- Vanilla JS for form validation and API calls

**PoC/Production (React)**
- Interactive UI with enhanced form-based and query-based inputs
- Response cards: recommendation, subject list, roadmap steps, comparison output
- Component-based architecture for reusability
- Optional: Follow-up question support as enhancement

### B. Application Layer

- **Query Handler** (forms or query-based input)
- **AI Intent Detector**
- **AI Entity Extractor**
- **Recommendation Engine** (AI-powered)
- **Roadmap Generator** (AI-powered)
- **Response Composer** (AI-powered)
- **Skills Assessment service** (gap analysis, skill matching)
- **Optional: Follow-up Question Handler** (for deeper exploration)

#### LLM Integration

- **Provider**: Single API key configuration (supports both OpenAI and Anthropic APIs)
- **Authentication**: Copilot-style sign-in (GitHub OAuth) for API access
- **Abstraction**: Unified LLM client that routes to OpenAI or Anthropic based on config
- **Prompt Management**: Templates stored in database or config files
- **Fallback**: If LLM unavailable, system returns rule-based responses or cached recommendations

### C. Data Layer

- CareerPath data
- DegreeProgram data
- Subject/Course catalog
- AI prompt templates and system instructions

---

## Implementation Phases

### Phase 1: Static MVP
- HTML/CSS/JS frontend with forms
- Python backend API endpoints
- Dummy data (no database yet)
- Form submission → API → Response display

### Phase 2: Database Integration

- MySQL setup with schema (career_paths, degree_programs, subjects, roadmap_steps)
- Seed data population
- Backend ORM (SQLAlchemy)
- Connect static frontend to database-backed API

### Phase 3: React Migration (Optional, PoC)
- Convert HTML forms to React components
- Add state management with `useState`
- *Future: Optional follow-up question support may be added*
- Reuse response card components
- Keep plain CSS (no CSS Modules)

### Phase 4: AI Enhancement
- LLM integration for intent detection and entity extraction
- Dynamic recommendation engine
- Roadmap generation with AI reasoning
- Optional: Follow-up question support for deeper exploration

---

## Why Static HTML First (Not React)?

1. **Faster MVP delivery** - No build tools or component architecture overhead
2. **Simpler learning curve** - Your existing HTML/CSS/JS knowledge is sufficient
3. **Clear API contract** - Static forms define what data frontend sends/receives
4. **Gradual migration** - Can switch to React when needed
5. **No wasted work** - HTML form fields map directly to React state variables


## Why React Later (Not Static HTML)?

2. **State management for interactive features** - React's `useState`/`useReducer` handles complex UI state when needed
3. **Scales to future enhancements** - Optional follow-up question support can be added seamlessly without full rewrite
4. **Component reusability** - Response cards (recommendation, roadmap, subject list) can be reused across forms and enhanced interfaces
5. **Industry standard** - For interactive web apps with this complexity, React is the norm. Learning it adds to your skillset

---

## Why a Database?

Career paths evolve and new programs emerge. Since the system is AI-based, one might question why a database is needed at all - can't the LLM just answer everything? What happens if the DB doesn't have a new career path that exists?

The database stores verified structured data (degree programs, courses, roadmap steps). The LLM handles general conversational queries, but core structured outputs (recommendations, roadmaps, course lists) require database-backed data.

### Key Reasons:

1. **LLMs hallucinate structured data** - Degree programs, credit hours, semester structures, and course sequences are factual data LLMs often get wrong. The DB stores verified, accurate information.
2. **Easier updates than code** - When new career paths emerge or programs change, updating a DB record is faster and safer than modifying hardcoded data or retraining prompts.
3. **Structured outputs require structured storage** - "Show me the 4-year roadmap for Computer Science" needs relational data (programs → subjects → semesters). AI alone can't reliably generate consistent semester-wise course plans.
4. **Missing paths handled gracefully** - If a career path isn't in the DB, the LLM can still answer general questions about it conversationally, but can't provide the structured roadmap/degree program outputs. This is acceptable - the DB defines the scope of structured guidance.
