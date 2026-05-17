from __future__ import annotations

from collections.abc import Sequence
from uuid import uuid4

from fastapi import APIRouter
from pydantic import BaseModel, Field

from dummy_data import CAREER_RECOMMENDATION_FIXTURES, ROADMAP_FIXTURES

router = APIRouter(tags=["recommendations"])


class CareerAssessRequest(BaseModel):
    interests: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    education_level: str = ""
    career_goals: list[str] = Field(default_factory=list)
    location: str = ""


class RoadmapRequest(BaseModel):
    session_id: str | None = None
    career_id: int | None = None
    career_topic: str = Field(default="")
    timeline_hours_per_week: int = Field(default=10, ge=1)
    current_level: str = Field(default="beginner")


class SkillGapAnalysisRequest(BaseModel):
    session_id: str | None = None
    target_role: str = ""
    skills_data: list[str] = Field(default_factory=list)
    experience: str = ""
    education: str = ""


def _normalize(values: Sequence[str] | None) -> set[str]:
    return {value.strip().lower() for value in values or [] if value and value.strip()}


def _score_career(fixture: dict, request: CareerAssessRequest) -> dict:
    required_skills = fixture.get("required_skills", [])
    request_skills = _normalize(request.skills) | _normalize(request.interests) | _normalize(request.career_goals)
    required_normalized = [skill.lower() for skill in required_skills]

    matches = [skill for skill in required_normalized if skill in request_skills]
    skill_match = round(len(matches) / len(required_normalized), 2) if required_normalized else 0.0
    fit_score = min(98, int(55 + (skill_match * 35) + (10 if request.education_level else 0)))

    missing = [skill for skill in required_skills if skill.lower() not in request_skills]
    reasoning = (
        f"You match {len(matches)} of {len(required_skills)} required skills. "
        f"Missing focus areas: {', '.join(missing) if missing else 'none'}. "
        f"This role fits your interest in {request.education_level or 'practical learning'}."
    )

    return {
        "career_id": fixture["id"],
        "career_name": fixture["name"],
        "fit_score": fit_score,
        "skill_match": skill_match,
        "missing_skills": missing,
        "reasoning": reasoning,
        "growth_outlook": fixture["growth_outlook"],
        "type": fixture["type"],
        "category": fixture["category"],
        "education_requirement": fixture["education_requirement"],
    }


@router.post("/api/assess")
def assess_careers(payload: CareerAssessRequest):
    career_fits = sorted(
        (_score_career(fixture, payload) for fixture in CAREER_RECOMMENDATION_FIXTURES),
        key=lambda item: item["fit_score"],
        reverse=True,
    )
    top_3 = career_fits[:3]

    immediate_next_steps = [
        f"Study {top_3[0]['career_name']} basics and build one small project.",
        "Strengthen the weakest required skill from the top recommendation.",
        "Use the roadmap tab to turn the highest-fit role into a weekly plan.",
    ]

    return {
        "session_id": str(uuid4()),
        "assessment_id": 1,
        "career_fits": career_fits,
        "top_3_careers": top_3,
        "immediate_next_steps": immediate_next_steps,
    }


def _resolve_roadmap_key(career_topic: str) -> str:
    normalized = career_topic.strip().lower()
    for key in ROADMAP_FIXTURES:
        if normalized == key.lower():
            return key
    return "Backend Developer"


def _resolve_career_fixture(role_name: str) -> dict:
    normalized = role_name.strip().lower()
    for fixture in CAREER_RECOMMENDATION_FIXTURES:
        if fixture["name"].lower() == normalized:
            return fixture
    return CAREER_RECOMMENDATION_FIXTURES[0]


@router.post("/api/roadmap")
def build_roadmap(payload: RoadmapRequest):
    key = _resolve_roadmap_key(payload.career_topic)
    fixture = ROADMAP_FIXTURES[key]
    session_id = payload.session_id or str(uuid4())

    return {
        "session_id": session_id,
        "career_id": payload.career_id or 101,
        "career_name": fixture["career_name"],
        "timeline_hours_per_week": payload.timeline_hours_per_week,
        "current_level": payload.current_level,
        "total_duration": fixture["total_duration"],
        "what_to_do_right_now": fixture["what_to_do_right_now"],
        "steps": fixture["steps"],
    }


@router.post("/api/skill-gap-analysis")
def analyze_skill_gap(payload: SkillGapAnalysisRequest):
    target_role = payload.target_role.strip() or "Backend Developer"
    target_key = _resolve_roadmap_key(target_role)
    fixture = ROADMAP_FIXTURES[target_key]
    career_fixture = _resolve_career_fixture(target_role)

    required_skills = {skill.strip().lower() for skill in career_fixture.get("required_skills", []) if skill}
    provided_skills = _normalize(payload.skills_data)

    if not required_skills:
        required_skills = {"python", "sql", "fastapi"}

    matched = sorted(required_skills & provided_skills)
    missing = sorted(required_skills - provided_skills)

    readiness = 0.5 if not required_skills else round(len(matched) / len(required_skills), 2)
    if payload.education:
        readiness = min(1.0, readiness + 0.1)

    recommendations = [
        f"Focus on {missing[0]} first." if missing else "You already cover the core gap areas.",
        f"Build a project that proves your fit for {target_key}.",
        "Repeat the analysis after one new project or certification.",
    ]

    return {
        "session_id": payload.session_id or str(uuid4()),
        "target_role": target_key,
        "gap_analysis": {
            "matched_skills": matched,
            "missing_skills": missing,
            "summary": (
                f"You match {len(matched)} of {len(required_skills)} core skills for {target_key}."
                if required_skills
                else f"No target-specific skills configured for {target_key}."
            ),
        },
        "recommendations": recommendations,
        "internship_readiness": readiness,
        "target_roles": [target_key],
        "career_name": career_fixture["name"],
    }
