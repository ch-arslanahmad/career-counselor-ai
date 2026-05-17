# UI Component Checklist

> Reference for what's built vs what needs to be built in the frontend.

## BUILT (Done)

### HTML
- Career form with all fields (name, interests chips, skills chips, education, goals, industry chips, location, notes)
- Roadmap form (career_topic, timeline, current_status, notes)
- Tab structure (#career, #roadmap)
- Output sections (hidden by default)

### CSS
- Base reset + box-sizing
- Font setup (JetBrains Mono body, Times New Roman headings)
- Body background (#efe3ca beige)
- Tab navigation bar styling (blue pills)
- Logo sizing
- Basic fieldset/legend/label layout
- Chip container flex layout
- Active tab styling

### JS
- `CareerFormData` class
- `getEndpointData()`, `getDataFromEndpoint()` API fetch
- `loadChips()` - renders buttons into container
- `loadOptions()` - populates select dropdowns
- `populateForm()` - fetches from API and populates all fields
- `generateMockRecommendations()` - returns 3 career objects
- `createRecommendationCard()` - returns card HTML string
- `testEndpoint()` - console debug helper

### Backend Endpoints
- `GET /options/interests`
- `GET /options/skills`
- `GET /options/industries`
- `GET /options/locations`

---

## NOT BUILT (Need to build)

### Priority Order

| # | Component | What it does | Effort |
|---|-----------|-------------|--------|
| 1 | **Tab switching logic** | Hash-based toggle `#career` / `#roadmap`. Show active, hide others. | 15 lines JS |
| 2 | **Career form submit** | `addEventListener`. Collect data → validate → show spinner → call mock API → render cards → hide spinner | 50 lines JS |
| 3 | **Roadmap mock data + submit** | Same pattern. `generateMockRoadmap()` returns 4-5 steps. `createRoadmapStepCard()` renders them. | 60 lines JS |
| 4 | **Form validation** | Check required fields before submit, show inline errors | 30 lines JS |
| 5 | **Loading spinner** | Show/hide spinner element during processing (CSS only) | 10 lines CSS + toggles |
| 6 | **Error/empty states** | Show error message on failure, "no results" when appropriate | Toggle classes |
| 7 | **"Generate Roadmap" button** | On each career card, clicking opens roadmap tab pre-filled | 10 lines JS |

### CSS Classes Referenced But Not Defined

| Class | Purpose |
|-------|---------|
| `.field` | Form field wrapper spacing |
| `.required` | Red asterisk for required fields |
| `.help` | Helper text under fields |
| `.output-section` | Container for results (hidden by default) |
| `.card` | Result card styling |
| `.match-score` | Green percentage badge |
| `.spinner` | Loading animation |
| `.error` | Error message styling |
| `.empty-state` | No results placeholder |

---

## Notes
- Phase 1 is vanilla HTML/CSS/JS - no build tools, no npm
- All components are plain JS + CSS, no third-party libraries
- Font: JetBrains Mono (body) + Times New Roman (headings)
- Colors: beige (#efe3ca) bg, blue (#006aff) tabs, navy (#170c79) headings
