from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any

from database import get_optional_db, SQLALCHEMY_AVAILABLE
from models import StudentAssessment, CareerFit, Career, CareerSkill, RoadmapStep, Skill
from sqlalchemy import func

router = APIRouter(tags=["recommendations"])


class RecommendRequest(BaseModel):
    session_id: str
    interests: list[str] = []
    current_skills: list[str] = []
    education_level: str | None = None
    career_goals: list[str] = []
    location: str | None = None
    notes: str | None = None


class RoadmapRequest(BaseModel):
    session_id: str
    career_id: int


def _session_ready(db: Any | None) -> bool:
    return bool(SQLALCHEMY_AVAILABLE and db is not None)


@router.post("/recommend")
def recommend(req: RecommendRequest, db=Depends(get_optional_db)):
    if not _session_ready(db):
        return {"recommendations": [], "message": "Database unavailable"}

    assessment = db.query(StudentAssessment).filter(
        StudentAssessment.session_id == req.session_id
    ).first()

    if not assessment:
        assessment = StudentAssessment(
            session_id=req.session_id,
            interests=req.interests,
            current_skills=req.current_skills,
            education_level=req.education_level,
            career_goals=req.career_goals,
            location=req.location,
            notes=req.notes,
        )
        db.add(assessment)
        db.flush()

    user_skills_set = set(s.lower() for s in req.current_skills)
    interests_set = set(i.lower() for i in req.interests)

    all_careers = db.query(Career).all()
    recommendations = []

    for career in all_careers:
        career_skills = db.query(CareerSkill).filter(
            CareerSkill.career_id == career.id
        ).all()

        skill_names = [cs.skill.name.lower() for cs in career_skills if cs.skill]
        required_skills = [cs for cs in career_skills if cs.is_required]
        matched_skills = [s for s in skill_names if s in user_skills_set]

        skill_match = 0.0
        if skill_names:
            skill_match = len(matched_skills) / len(skill_names)

        interest_match = 0.0
        if career.category:
            if career.category.lower() in interests_set:
                interest_match = 1.0

        fit_score = int((skill_match * 50) + (interest_match * 30) + (20 if req.education_level else 0))
        fit_score = min(100, fit_score)

        if fit_score > 20:
            career_fit = CareerFit(
                assessment_id=assessment.id,
                career_id=career.id,
                fit_score=fit_score,
                skill_match=skill_match,
                reasoning=f"Matched {len(matched_skills)} of {len(skill_names)} skills. Interest match: {interest_match:.0%}",
            )
            db.add(career_fit)
            recommendations.append({
                "career_id": career.id,
                "career_name": career.name,
                "category": career.category,
                "fit_score": fit_score,
                "skill_match": round(skill_match, 2),
                "matched_skills": matched_skills,
                "growth_outlook": career.growth_outlook,
                "education_requirement": career.education_requirement,
            })

    db.commit()

    recommendations.sort(key=lambda x: x["fit_score"], reverse=True)
    top_recommendations = recommendations[:5]

    return {"recommendations": top_recommendations}


@router.post("/roadmap")
def generate_roadmap(req: RoadmapRequest, db=Depends(get_optional_db)):
    if not _session_ready(db):
        return {"career_id": req.career_id, "steps": [], "message": "Database unavailable"}

    career = db.get(Career, req.career_id)
    if not career:
        return {"career_id": req.career_id, "steps": [], "error": "Career not found"}

    steps = db.query(RoadmapStep).filter(
        RoadmapStep.career_id == req.career_id
    ).order_by(RoadmapStep.step_order).all()

    step_data = [
        {
            "step_order": step.step_order,
            "title": step.title,
            "description": step.description,
            "duration": step.duration,
            "resources": step.resources or [],
            "prerequisites": step.prerequisites or [],
        }
        for step in steps
    ]

    return {
        "career_id": req.career_id,
        "career_name": career.name,
        "steps": step_data,
    }