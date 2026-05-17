"""Dummy data for Phase 1 MVP - Backend serves this instead of DB."""


## OUTPUT SCHEMA:

# Career Paths
CAREER_PATHS = [
    {
        "id": 1,
        "name": "Data Scientist",
        "description": "Analyzes complex data to help organizations make better decisions",
        "category": "Technology",
        "required_skills": ["Python", "SQL", "Statistics", "Machine Learning"],
        "salary_range": "$90,000 - $150,000",
        "growth_outlook": "High"
    },
    {
        "id": 2,
        "name": "Software Engineer",
        "description": "Designs, develops, and maintains software systems",
        "category": "Technology",
        "required_skills": ["Java", "Python", "System Design", "Algorithms"],
        "salary_range": "$80,000 - $160,000",
        "growth_outlook": "Very High"
    },
    {
        "id": 3,
        "name": "UX Designer",
        "description": "Creates user-friendly interfaces and experiences for digital products",
        "category": "Design",
        "required_skills": ["Figma", "User Research", "Prototyping", "UI Design"],
        "salary_range": "$70,000 - $120,000",
        "growth_outlook": "High"
    }
]

# Degree Programs
DEGREE_PROGRAMS = [
    {
        "id": 1,
        "name": "Bachelor of Science in Computer Science",
        "university": "Example State University",
        "duration_years": 4,
        "degree_level": "Bachelor's",
        "career_paths_id": [1, 2]
    },
    {
        "id": 2,
        "name": "Bachelor of Fine Arts in Interaction Design",
        "university": "Design Institute",
        "duration_years": 4,
        "degree_level": "Bachelor's",
        "career_paths_id": [3]
    }
]

# Subjects/Courses
SUBJECTS = [
    {"id": 1, "name": "Intro to Programming", "description": "Basic programming concepts", "credit_hours": 3, "semester": 1, "degree_program_id": 1},
    {"id": 2, "name": "Data Structures", "description": "Fundamental data structures", "credit_hours": 3, "semester": 2, "degree_program_id": 1},
    {"id": 3, "name": "Database Systems", "description": "SQL and database design", "credit_hours": 3, "semester": 3, "degree_program_id": 1},
    {"id": 4, "name": "Design Principles", "description": "Core design theory", "credit_hours": 3, "semester": 1, "degree_program_id": 2}
]

# Roadmap Steps
ROADMAP_STEPS = [
    {"id": 1, "career_path_id": 1, "step_order": 1, "title": "Learn Python Basics", "description": "Master Python fundamentals", "duration": "2 months", "resources": "Python.org tutorials"},
    {"id": 2, "career_path_id": 1, "step_order": 2, "title": "Study Statistics", "description": "Learn probability and statistics", "duration": "3 months", "resources": "Khan Academy, Coursera"},
    {"id": 3, "career_path_id": 2, "step_order": 1, "title": "Learn Programming", "description": "Start with Java or Python", "duration": "3 months", "resources": "CS50, Codecademy"}
]

# Prompt Templates
PROMPT_TEMPLATES = [
    {
        "id": 1,
        "template_name": "career_recommendation",
        "template_text": "Based on interests: {interests}, background: {background}, recommend career paths.",
        "use_case": "recommendation"
    }
]


CAREER_RECOMMENDATION_FIXTURES = [
    {
        "id": 101,
        "name": "Backend Developer",
        "description": "Builds APIs, services, and data-driven systems with strong attention to reliability.",
        "category": "Technology",
        "type": "open",
        "growth_outlook": "High",
        "education_requirement": "Bachelor's degree or equivalent portfolio",
        "required_skills": ["Python", "FastAPI", "SQL", "APIs"],
    },
    {
        "id": 102,
        "name": "Data Analyst",
        "description": "Turns raw data into practical decisions with dashboards, queries, and reporting.",
        "category": "Technology",
        "type": "open",
        "growth_outlook": "High",
        "education_requirement": "Bachelor's degree",
        "required_skills": ["SQL", "Excel", "Statistics", "Data Visualization"],
    },
    {
        "id": 103,
        "name": "Product Manager",
        "description": "Coordinates product strategy, requirements, and cross-functional execution.",
        "category": "Business",
        "type": "degree_required",
        "growth_outlook": "Moderate",
        "education_requirement": "Bachelor's degree",
        "required_skills": ["Communication", "Prioritization", "Roadmapping", "User Research"],
    },
    {
        "id": 104,
        "name": "UX Designer",
        "description": "Designs user-friendly experiences through research, prototyping, and iteration.",
        "category": "Design",
        "type": "open",
        "growth_outlook": "High",
        "education_requirement": "Portfolio-focused",
        "required_skills": ["Figma", "User Research", "Prototyping", "UI Design"],
    },
]


ROADMAP_FIXTURES = {
    "Backend Developer": {
        "career_name": "Backend Developer",
        "total_duration": "12 months",
        "what_to_do_right_now": [
            {
                "title": "API Fundamentals Sprint",
                "description": "Practice REST design, HTTP status codes, and request validation.",
            },
            {
                "title": "Database Query Practice",
                "description": "Write joins, aggregates, and indexing exercises on real datasets.",
            },
            {
                "title": "Mini Portfolio Backend",
                "description": "Ship one CRUD API project with auth and clean documentation.",
            },
        ],
        "steps": [
            {
                "step_id": 1,
                "order": 1,
                "title": "Backend Foundations",
                "description": "Set up Python, FastAPI, and clean project structure.",
                "duration": "2 months",
                "resources": ["FastAPI docs", "Python tutorials", "Project scaffolding guide"],
                "prerequisites": [],
            },
            {
                "step_id": 2,
                "order": 2,
                "title": "Data & Service Integration",
                "description": "Connect ORM models, queries, and validation to your routes.",
                "duration": "3 months",
                "resources": ["SQLAlchemy docs", "Database design notes", "API testing checklist"],
                "prerequisites": [1],
            },
            {
                "step_id": 3,
                "order": 3,
                "title": "Advanced API Patterns",
                "description": "Add pagination, authentication, and background processing.",
                "duration": "3 months",
                "resources": ["Auth guides", "Async Python notes", "Pagination examples"],
                "prerequisites": [1, 2],
            },
            {
                "step_id": 4,
                "order": 4,
                "title": "Production Projects & Deployment",
                "description": "Ship one deployable project and document the architecture decisions.",
                "duration": "4 months",
                "resources": ["Deployment guide", "README template", "Demo checklist"],
                "prerequisites": [2, 3],
            },
        ],
    },
    "Data Scientist": {
        "career_name": "Data Scientist",
        "total_duration": "14 months",
        "what_to_do_right_now": [
            {
                "title": "Statistics Refresh",
                "description": "Review probability, distributions, and hypothesis testing.",
            },
            {
                "title": "Python Analysis Practice",
                "description": "Use pandas and notebooks to analyze a public dataset.",
            },
            {
                "title": "Mini Data Story",
                "description": "Build one short report that explains an insight clearly.",
            },
        ],
        "steps": [
            {
                "step_id": 11,
                "order": 1,
                "title": "Python and Data Handling",
                "description": "Learn pandas, notebooks, and clean data exploration workflows.",
                "duration": "3 months",
                "resources": ["Pandas docs", "Notebook tutorials", "Data cleaning checklist"],
                "prerequisites": [],
            },
            {
                "step_id": 12,
                "order": 2,
                "title": "Statistics and Modeling",
                "description": "Build the math and model intuition needed for data science work.",
                "duration": "4 months",
                "resources": ["Statistics course", "Model evaluation guide", "Python notebooks"],
                "prerequisites": [11],
            },
            {
                "step_id": 13,
                "order": 3,
                "title": "Machine Learning Projects",
                "description": "Create portfolio projects that demonstrate real end-to-end analysis.",
                "duration": "4 months",
                "resources": ["Scikit-learn docs", "Project templates", "Kaggle datasets"],
                "prerequisites": [11, 12],
            },
            {
                "step_id": 14,
                "order": 4,
                "title": "Deployment and Communication",
                "description": "Package your work, deploy it, and explain the results clearly.",
                "duration": "3 months",
                "resources": ["Streamlit docs", "Portfolio guide", "Storytelling notes"],
                "prerequisites": [12, 13],
            },
        ],
    },
}
