# Project Proposal

## Project Idea
Career Counselor AI is a web app that helps students identify suitable careers, generate a learning roadmap, and track progress over time. It combines a FastAPI backend, a MySQL database, and AI-generated guidance.

## Problem Statement
Many students do not know which careers fit their skills or how to move from their current level to job readiness. They need one place to assess their profile, compare career options, and get a practical roadmap.

## Stakeholders

| Stakeholder | Role | Interest | Impact |
|---|---|---|---|
| Student | Main user | Career guidance and progress tracking | High |
| Instructor | Reviewer | Evaluates completeness and design | High |
| Developer | Maintainer | Implements and updates the app | High |
| Future employer/mentor | Secondary reviewer | Sees output quality and usefulness | Medium |

## Scope

### In Scope
- Career assessment form
- Career recommendation output
- Roadmap generation
- Skill-gap analysis
- Task progress tracking
- Login and history sync
- Local browser storage for unsigned users
- Database storage for signed-in users

### Out of Scope
- Full production deployment
- Mobile app versions
- Advanced analytics dashboards
- Multi-language support
- Payment or subscription features

## Feasibility

### Technical Feasibility
The project is technically feasible because it uses standard web technology: HTML, CSS, vanilla JavaScript, FastAPI, SQLAlchemy, and MySQL. The AI layer is isolated behind API calls.

### Operational Feasibility
The workflow is practical for a student project because the main screens are simple and the app can function with either local storage or database persistence.

### Economic Feasibility
The stack uses free or low-cost tools for local development. No commercial infrastructure is required for the core demo.

