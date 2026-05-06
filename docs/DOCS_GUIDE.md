# Documentation Guide

Quick reference for all project documentation files.

---

## Files Overview

| File/Directory | Purpose | Key Audience |
|------|---------|--------------|
| VISION.md | Goals, roadmap, success metrics | PMs, team leads |
| REQUIREMENTS.md | SRS & functional requirements | Developers, QA |
| ARCHITECTURE.md | Tech stack, system design | Developers, DevOps |
| plan.md | Current progress & milestones | Everyone |
| todo.md | Task tracking with claim workflow | Everyone |
| se-deliverables.md | Semester project milestones | Students, Instructors |
| deliverables-guide.md | Interpretive guide for semester deliverables | Students, Instructors |
| adr/ | Architecture decision records | Tech leads |

---

## What Each File Contains

**VISION.md** - Vision statement, project evolution, scope boundaries, success metrics

**REQUIREMENTS.md** - SRS, scope, functional/non-functional requirements, use case diagram

**ARCHITECTURE.md** - Tech stack (static → React), logical architecture, implementation phases

**plan.md** - Phase-by-phase implementation plan (static MVP → React PoC → AI production)

**todo.md** - Task tracking with custom claim workflow ([-]/[x] with assignee names/dates)

**se-deliverables.md** - Semester project milestones (PDF converted to markdown)

**deliverables-guide.md** - Interpretive guide for semester deliverables with document structure

**adr/** - Architecture decision records (individual ADR files for major design choices)

---

## How to Use (By Role)

- **New Developer:** README → REQUIREMENTS → ARCHITECTURE → plan

- **Project Manager:** VISION → plan → REQUIREMENTS

- **Architect/Tech Lead:** VISION → ARCHITECTURE → adr/

- **AI Assistant:** REQUIREMENTS + ARCHITECTURE + plan + adr/

---

## Update Frequency

- VISION.md: When roadmap changes
- plan.md: Weekly or bi-weekly
- REQUIREMENTS.md: When scope changes
- adr/: When making major decisions (add new ADR files)
- README.md: Monthly review
- se-delivables.md: When project milestones change