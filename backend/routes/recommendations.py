from __future__ import annotations

import os
from collections.abc import Sequence
from uuid import uuid4

from fastapi import APIRouter
from pydantic import BaseModel, Field

from dummy_data import CAREER_RECOMMENDATION_FIXTURES, ROADMAP_FIXTURES
from services.ai_gateway import generate_json, get_ai_status

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


class AITestRequest(BaseModel):
    question: str = "hello world"
    context: str = "lorem ipsum"


def _normalize(values: Sequence[str] | None) -> set[str]:
    return {value.strip().lower() for value in values or [] if value and value.strip()}


def _score_career(fixture: dict, request: CareerAssessRequest) -> dict:
    required_skills = fixture.get("required_skills", [])
    request_skills = _normalize(request.skills) | _normalize(request.interests) | _normalize(request.career_goals)
    required_normalized = [skill.lower() for skill in required_skills]

    matches = [skill for skill in required_normalized if skill in request_skills]
    match_count = len(matches)
    total = len(required_normalized)
    skill_match = round(match_count / total, 2) if total else 0.0

    base = 15
    skill_weight = int(skill_match * 70)
    education_bonus = 8 if request.education_level else 0
    fit_score = min(99, base + skill_weight + education_bonus)

    matched_skills_display = [
        required_skills[i] for i, s in enumerate(required_normalized) if s in request_skills
    ]
    missing = [
        required_skills[i] for i, s in enumerate(required_normalized) if s not in request_skills
    ]

    if match_count == total:
        reasoning = (
            f"You already have all {total} core skills for this role. "
            f"Your background in {request.education_level or 'this area'} aligns well. "
            f"Focus on building real projects to strengthen your application."
        )
    elif match_count >= total / 2:
        reasoning = (
            f"Strong foundation — you match {match_count} of {total} required skills. "
            f"Closing the remaining gaps ({', '.join(missing[:3])}) "
            f"will make you a competitive candidate."
        )
    else:
        reasoning = (
            f"You match {match_count} of {total} key skills for this path. "
            f"Start with: {', '.join(missing[:3])}. "
            f"These are the highest-impact areas to learn first."
        )

    return {
        "career_id": fixture["id"],
        "career_name": fixture["name"],
        "fit_score": fit_score,
        "skill_match": skill_match,
        "matched_skills": matched_skills_display,
        "missing_skills": missing,
        "reasoning": reasoning,
        "growth_outlook": fixture["growth_outlook"],
        "type": fixture["type"],
        "category": fixture["category"],
        "education_requirement": fixture["education_requirement"],
    }


def _coerce_string_list(value, fallback: list[str]) -> list[str]:
    if not isinstance(value, list):
        return fallback
    return [str(item) for item in value if str(item).strip()] or fallback


def _model_data(model: BaseModel) -> dict:
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


def _apply_ai_assessment(base_payload: dict, request: CareerAssessRequest) -> dict:
    if os.getenv("AI_ASSESSMENT_ENABLED", "false").strip().lower() not in {"1", "true", "yes"}:
        base_payload["ai_used"] = False
        base_payload["ai_provider"] = "disabled_for_assessment"
        return base_payload

    system_prompt = (
        "You are the AI reasoning layer for a student career counselor app. "
        "Improve the explanation text for already-scored career matches without changing IDs or scores. "
        "Return JSON with career_fits, top_3_careers, and immediate_next_steps."
    )
    ai_payload = generate_json(
        system_prompt,
        {
            "student_profile": _model_data(request),
            "scored_result": base_payload,
            "rules": [
                "Do not invent new career IDs.",
                "Keep fit_score and skill_match unchanged.",
                "Make reasoning concise and useful for a student.",
            ],
        },
        base_payload,
    )

    career_fits = ai_payload.get("career_fits")
    if isinstance(career_fits, list) and career_fits:
        base_by_id = {item["career_id"]: item for item in base_payload["career_fits"]}
        merged = []
        for item in career_fits:
            career_id = item.get("career_id")
            if career_id not in base_by_id:
                continue
            merged_item = {**base_by_id[career_id]}
            if item.get("reasoning"):
                merged_item["reasoning"] = str(item["reasoning"])
            merged.append(merged_item)
        if merged:
            base_payload["career_fits"] = merged + [
                item for item in base_payload["career_fits"] if item["career_id"] not in {entry["career_id"] for entry in merged}
            ]
            base_payload["top_3_careers"] = base_payload["career_fits"][:3]

    base_payload["immediate_next_steps"] = _coerce_string_list(
        ai_payload.get("immediate_next_steps"),
        base_payload["immediate_next_steps"],
    )[:3]
    base_payload["ai_used"] = bool(ai_payload.get("ai_used"))
    base_payload["ai_provider"] = ai_payload.get("ai_provider", "fallback")
    if ai_payload.get("ai_error"):
        base_payload["ai_error"] = ai_payload["ai_error"]
    return base_payload


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

    base_payload = {
        "session_id": str(uuid4()),
        "assessment_id": 1,
        "career_fits": career_fits,
        "top_3_careers": top_3,
        "immediate_next_steps": immediate_next_steps,
    }
    return _apply_ai_assessment(base_payload, payload)


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

    base_payload = {
        "session_id": session_id,
        "career_id": payload.career_id or 101,
        "career_name": fixture["career_name"],
        "timeline_hours_per_week": payload.timeline_hours_per_week,
        "current_level": payload.current_level,
        "total_duration": fixture["total_duration"],
        "what_to_do_right_now": fixture["what_to_do_right_now"],
        "steps": fixture["steps"],
    }
    system_prompt = (
        "You are the AI roadmap layer for a career counselor app. "
        "Personalize the supplied roadmap for the student's current level and weekly time. "
        "Return JSON with career_name, total_duration, what_to_do_right_now, and steps. "
        "Each step must include step_id, order, title, description, duration, resources, prerequisites."
    )
    ai_payload = generate_json(
        system_prompt,
        {"roadmap_request": _model_data(payload), "base_roadmap": base_payload},
        base_payload,
    )

    if isinstance(ai_payload.get("what_to_do_right_now"), list):
        base_payload["what_to_do_right_now"] = ai_payload["what_to_do_right_now"]
    if isinstance(ai_payload.get("steps"), list) and ai_payload["steps"]:
        base_payload["steps"] = ai_payload["steps"]
    if ai_payload.get("total_duration"):
        base_payload["total_duration"] = str(ai_payload["total_duration"])
    base_payload["ai_used"] = bool(ai_payload.get("ai_used"))
    base_payload["ai_provider"] = ai_payload.get("ai_provider", "fallback")
    if ai_payload.get("ai_error"):
        base_payload["ai_error"] = ai_payload["ai_error"]
    return base_payload


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

    base_payload = {
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

    system_prompt = (
        "You are the skill-gap analysis layer for a student career counselor app. "
        "Use the provided target role, required skills, and student profile. "
        "Return JSON with gap_analysis, recommendations, internship_readiness, target_roles, and career_name."
    )
    ai_payload = generate_json(
        system_prompt,
        {
            "skill_gap_request": _model_data(payload),
            "required_skills": sorted(required_skills),
            "base_analysis": base_payload,
        },
        base_payload,
    )

    if isinstance(ai_payload.get("gap_analysis"), dict):
        base_payload["gap_analysis"] = {
            **base_payload["gap_analysis"],
            **ai_payload["gap_analysis"],
        }
    base_payload["recommendations"] = _coerce_string_list(
        ai_payload.get("recommendations"),
        base_payload["recommendations"],
    )
    if isinstance(ai_payload.get("internship_readiness"), (int, float)):
        base_payload["internship_readiness"] = max(0.0, min(1.0, float(ai_payload["internship_readiness"])))
    base_payload["target_roles"] = _coerce_string_list(ai_payload.get("target_roles"), base_payload["target_roles"])
    if ai_payload.get("career_name"):
        base_payload["career_name"] = str(ai_payload["career_name"])
    base_payload["ai_used"] = bool(ai_payload.get("ai_used"))
    base_payload["ai_provider"] = ai_payload.get("ai_provider", "fallback")
    if ai_payload.get("ai_error"):
        base_payload["ai_error"] = ai_payload["ai_error"]
    return base_payload


@router.get("/api/ai/status")
def ai_status():
    return get_ai_status()


@router.post("/api/ai/test")
def test_ai_gateway(payload: AITestRequest):
    fallback = {
        "answer": f"Received question: {payload.question}",
        "summary": payload.context[:120],
        "next_steps": ["AI fallback is working.", "Configure a provider key to enable model output."],
    }
    return generate_json(
        (
            "You are a JSON-only test assistant. "
            "Return exactly one JSON object with string field answer, string field summary, "
            "and array field next_steps. Do not include markdown or prose outside JSON."
        ),
        _model_data(payload),
        fallback,
    )
