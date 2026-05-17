from __future__ import annotations

from typing import Any

from database import SQLALCHEMY_AVAILABLE
from models import Career, CareerSkill, Skill, RoadmapStep


def _session_ready(db: Any | None) -> bool:
    return bool(SQLALCHEMY_AVAILABLE and db is not None)


_FALLBACK_OPTIONS: dict[str, list[str]] = {
    "skills": [
        "Python", "JavaScript", "TypeScript", "Java", "C++", "SQL",
        "React", "Node.js", "FastAPI", "Django", "HTML/CSS", "Git",
        "Docker", "AWS", "Linux", "Data Analysis", "Machine Learning",
        "Excel", "Figma", "UI Design", "User Research", "Prototyping",
        "Project Management", "Communication", "Public Speaking",
        "Leadership", "Critical Thinking", "Problem Solving",
    ],
    "interests": [
        "Technology", "Design", "Business", "Healthcare", "Education",
        "Finance", "Data Science", "AI/ML", "Web Development",
        "Mobile Apps", "Cloud Computing", "Cybersecurity",
        "UI/UX Design", "Product Management", "Entrepreneurship",
    ],
    "industries": [
        "Information Technology", "Healthcare", "Education",
        "Finance/Banking", "E-commerce", "Telecommunications",
        "Government", "Consulting", "Manufacturing", "Media",
    ],
    "locations": [
        "Pakistan", "USA", "UK", "Canada", "Australia", "Germany",
        "UAE", "Saudi Arabia", "Remote", "Other",
    ],
}


def get_form_options(db: Any | None = None) -> dict[str, list[str]]:
    if not _session_ready(db):
        return _FALLBACK_OPTIONS

    try:
        skills = [skill.name for skill in db.query(Skill).order_by(Skill.name).all() if skill.name]
        categories = [
            row[0]
            for row in db.query(Career.category)
            .filter(Career.category.isnot(None))
            .distinct()
            .order_by(Career.category)
            .all()
            if row[0]
        ]
    except Exception:
        return _FALLBACK_OPTIONS

    return {
        "skills": skills or _FALLBACK_OPTIONS["skills"],
        "interests": categories or _FALLBACK_OPTIONS["interests"],
        "industries": categories or _FALLBACK_OPTIONS["industries"],
        "locations": _FALLBACK_OPTIONS["locations"],
    }


def list_careers(db: Any | None = None) -> list[dict]:
    if not _session_ready(db):
        return []

    rows = db.query(Career).order_by(Career.name).all()
    return [
        {
            "id": career.id,
            "name": career.name,
            "description": career.description,
            "category": career.category,
            "type": career.type,
            "growth_outlook": career.growth_outlook,
            "source": career.source,
            "education_requirement": career.education_requirement,
        }
        for career in rows
    ]


def get_career_skills(db: Any | None, career_id: int) -> dict | None:
    if not _session_ready(db):
        return None

    career = db.get(Career, career_id)
    if career is None:
        return None

    required_skills = []
    optional_skills = []

    links = db.query(CareerSkill).filter(CareerSkill.career_id == career_id).order_by(CareerSkill.id).all()
    for link in links:
        payload = {
            "skill_id": link.skill.id,
            "name": link.skill.name,
            "proficiency": link.proficiency_level,
        }
        if link.is_required:
            required_skills.append(payload)
        else:
            optional_skills.append(payload)

    return {
        "career_name": career.name,
        "required_skills": required_skills,
        "optional_skills": optional_skills,
    }


def get_career_roadmap(db: Any | None, career_id: int) -> list[dict]:
    if not _session_ready(db):
        return []

    rows = db.query(RoadmapStep).filter(RoadmapStep.career_id == career_id).order_by(RoadmapStep.step_order).all()
    return [
        {
            "id": step.id,
            "career_id": step.career_id,
            "step_order": step.step_order,
            "title": step.title,
            "description": step.description,
            "duration": step.duration,
            "resources": step.resources,
            "prerequisites": step.prerequisites,
        }
        for step in rows
    ]
