# Software Requirements Specification

## 1. Introduction

### Purpose
This document describes the requirements for Career Counselor AI, a web-based career guidance system for students.

### Intended Audience
- Students
- Instructors
- Developers
- Project reviewers

## 2. Overall Description

### Product Perspective
The product is a browser-based frontend backed by a FastAPI application and a database. The UI stores unsigned-user data in local storage and syncs signed-in user data to the database.

### User Classes
- Anonymous student
- Signed-in student
- Instructor/reviewer

### Constraints
- Vanilla JavaScript in the frontend
- No user authentication required for basic use
- Database sync only when signed in
- AI service must be available for full recommendations

## 3. Functional Requirements

- FR-01: The system shall collect student interests, skills, education level, goals, location, and notes.
- FR-02: The system shall generate career recommendations with fit scores and reasoning.
- FR-03: The system shall generate a roadmap for a selected career and timeline.
- FR-04: The system shall show the skills the user still needs before roadmap generation.
- FR-05: The system shall allow users to mark roadmap steps as completed.
- FR-06: The system shall save assessment, roadmap, and skill-gap data locally when the user is not signed in.
- FR-07: The system shall save the same data in the database when the user is signed in.
- FR-08: The system shall show history for signed-in users.
- FR-09: The system shall allow users to view saved progress for the current session.
- FR-10: The system shall allow demo data to be loaded for presentation.

## 4. Non-Functional Requirements

- Usability: The interface must be understandable without training.
- Performance: Responses should render quickly enough for interactive use.
- Reliability: Data should persist either in the browser or database depending on sign-in state.
- Security: Passwords must be hashed and secrets must not be committed.
- Maintainability: The code should stay modular and easy to extend.

## 5. Prioritization

| Requirement | Priority |
|---|---|
| Career assessment | Must |
| Roadmap generation | Must |
| Skill-gap analysis | Must |
| Progress tracking | Must |
| Signed-in history | Should |
| Demo mode | Should |
| Extra polish features | Could |

## 6. Use Cases

- Submit career assessment
- View recommendations
- Generate roadmap
- Review skill gaps
- Track progress
- View history

