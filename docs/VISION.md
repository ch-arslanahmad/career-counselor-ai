# Vision & Goals

Build a focused, student-centered counselor system that helps learners decide:

- what career path fits them,
- what degree/courses/subjects to follow,
- and what roadmap to use from beginner to job-ready.

## Final Product Direction

Create an AI-assisted career counseling web application with:
- clear recommendation reasoning,
- course/subject guidance,
- learning roadmaps,
- and optional follow-up question support.

Initial data scope remains intentionally constrained, then expands gradually.

## Request Flow

1. Student submits input (form-based or query-based).
2. AI detects intent (recommend, compare, roadmap, subject-info, etc.).
3. AI extracts entities (interests, weaknesses, degree names, career goals).
4. Recommendation engine ranks best-fit options with reasoning.
5. Roadmap generator creates step-by-step learning path.
6. Response composer generates clear, conversational output.
7. Return recommendation + explanation + roadmap to student.

> [!note]
> Follow-up questions may be supported as an optional enhancement in future phases.*


## Success Metrics

### Student Value Metrics
- Students receive at least one actionable recommendation per session
- Recommendations include clear reasoning and next learning steps
- Roadmap output is understandable and ordered

### Product Quality Metrics

- Typical query response is fast
- Stable behavior for common intents (recommend, compare, roadmap, subject)
- Consistent outputs for similar inputs in rule-based mode

### Demonstrate Readiness Metrics

- Demonstrable three-level architecture (MVP → PoC → Production)
- Justified design decisions via ADRs
- Clear progression path from deterministic to AI-enhanced logic

Current Planning details are in [plan.md](plan.md).

