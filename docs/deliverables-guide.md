# Deliverables Explanation

This is an interpretive guide based on `se-deliverables.md` milestones. It adds practical structure (document naming, section breakdowns) not in the original.*

---

## Original Milestones → Final Deliverable Documents

| # | Original Milestone | Final Deliverable |
|---|---|---|
| 1 | Project idea, problem statement, stakeholders, scope, feasibility | `01_Project_Proposal` |
| 2 | Requirements elicitation (SRS, prioritization) | `02_Software_Requirements_Specification` |
| 3 | Architectural Design (flow chart, ER diagram) | `03_Architecture_and_Design_Document` |
| 4 | UML Models (Use Case, Sequence, Class, Activity) | *Consolidated into #3* |
| 5 | Design Patterns, UI Design | *Consolidated into #3* |
| 6 | Agile Development (prototype, sprint report) | `04_Agile_Development_Report` |
| 7 | Agile Techniques (advanced features, version control) | *Consolidated into #4* |
| 8 | Testing (unit, integration, system, test cases) | `05_Test_Report` |
| 9 | Software Licensing and contract | `06_Licensing_and_Contract` |
| 10 | Project Management (Gantt, staff allocation, final report, slides, source code) | `07_Project_Management_Plan` + `08_Final_Presentation` + `Source_Code/` |

---

### File 1: `01_Project_Proposal` (Milestone #1)

| Section | What to Include |
|---|---|
| **Project Idea** | Short description (2-3 sentences). What is the software? |
| **Problem Statement** | What specific problem does it solve? For whom? |
| **Stakeholder Analysis** | Table: Stakeholder (e.g., Admin, User), Role, Interest, Impact level. |
| **Scope** | List of Core Features (IN) and explicitly what is OUT OF SCOPE. |
| **Feasibility Study** | Short paragraphs on Technical, Economic, Operational feasibility. |

---

### File 2: `02_Software_Requirements_Specification` (Milestone #2)

| Section | What to Include |
|---|---|
| **Introduction** | Purpose, Document Conventions, Intended Audience. |
| **Overall Description** | Product Perspective, User Classes, Constraints. |
| **Functional Requirements** | Numbered list (e.g., FR-01: System shall allow user to register...). |
| **Non-Functional Requirements** | Usability, Performance, Security, Reliability statements. |
| **Requirement Prioritization** | MoSCoW table (Must have, Should have, etc.). |
| **Use Case Diagram** | Visual UML Use Case diagram. |

---

### File 3: `03_Architecture_and_Design_Document` (Milestones #3, #4, #5)

| Section | What to Include |
|---|---|
| **System Architecture** | High-level diagram (Layered, MVC, Client-Server). Text explaining the tiers. |
| **Architectural Diagrams** | **Flow Chart:** For a key process. **ER Diagram:** Database tables, columns, relationships. |
| **UML Structural Model** | **Class Diagram:** Classes, attributes, methods, relationships. |
| **UML Behavioral Models** | **Sequence Diagram(s):** For major flows. **Activity Diagram(s):** For workflow logic. |
| **Design Patterns** | List 2-3 patterns used (e.g., Singleton, MVC). Name, Intent, brief explanation. |
| **User Interface Design** | Wireframes/Mockups for all key screens. Navigation flow description. |

---

### File 4: `04_Agile_Development_Report` (Milestones #6, #7)

| Section | What to Include |
|---|---|
| **Sprint 1 Report (Core Prototype)** | Goal, User Stories completed, Screenshots of prototype. |
| **Sprint 2 Report (Advanced Features)** | Goal, User Stories completed, Screenshots of new features. |
| **Version Control Records** | Git commit history, branch graph screenshot. Branching strategy summary. |

---

### File 5: `05_Test_Report` (Milestone #8)

| Section | What to Include |
|---|---|
| **Test Plan Summary** | Types of testing (Unit, Integration, System). Tools used. |
| **Test Cases** | Table: Test ID, Scenario, Steps, Expected Result, Actual Result, Status (Pass/Fail). |
| **Bugs Found** | List of defects, severity, fix status. |
| **Overall Pass/Fail Summary** | Paragraph declaring whether system meets exit criteria. |

---

### File 6: `06_Licensing_and_Contract` (Milestone #9)

| Section | What to Include |
|---|---|
| **Chosen License** | State the license (e.g., MIT, GPL). Justification for project domain. |
| **Software Contract** | Brief "End-User License Agreement" template: Grant of License, Restrictions, Termination, Liability. |

We already have a `LICENSE` file for the actual license text, so this document focuses on the rationale and contract template, OR add a section to any existing doc.

---

### File 7: `07_Project_Management_Plan` (Milestone #10 - Management)

| Section | What to Include |
|---|---|
| **Gantt Chart (Activity Bar Chart)** | Full timeline of all project phases, dependencies. |
| **Staff Allocation Chart** | Table: Task Name, Effort Hours, Deliverable Output. |

---

### File 8: `08_Final_Presentation` (Milestone #10 - Presentation)

| Section | What to Include |
|---|---|
| Title Slide, Problem, Solution Demo (screenshots), Architecture (key diagram), Agile highlights, Testing Summary, Key Learning, Q&A. Max 10-12 slides. |

---

### Folder: `Source_Code/` (Milestone #10 - Code)

| Content | Details |
|---|---|
| Full project directory | Code, config files, build scripts. Clean and well-commented. |
| **README.md** | Project title, description, prerequisites, install dependencies, how to run. |

---

**Note:** This guide consolidates 10 milestones into 8 PDFs + 1 folder for practical submission. Original milestone structure preserved in the mapping table above.
