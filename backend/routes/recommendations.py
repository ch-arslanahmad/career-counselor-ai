from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

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


def _model_data(model: BaseModel) -> dict:
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


_ASSESS_SYSTEM_PROMPT = (
    "You are a career assessment AI. Given a student's skills, interests, education, and goals, "
    "return a JSON object with:\n"
    "- career_fits: array of career objects, each with:\n"
    "    career_id (integer, sequential), career_name, fit_score (0-99 integer, based on skill match),\n"
    "    skill_match (0.0-1.0 float), matched_skills (array of strings the student has),\n"
    "    missing_skills (array of strings the student needs), reasoning (string),\n"
    "    growth_outlook, type (open/regulated/degree_required), category, education_requirement\n"
    "- top_3_careers: the 3 highest-scoring careers from career_fits\n"
    "- immediate_next_steps: array of 3 string action items\n\n"
    "Score formula: base=15, +skill_match_weight(up to 70), +education_bonus(8).\n"
    "Be realistic. Don't inflate scores. Generate 8-12 careers."
)


@router.post("/api/assess")
def assess_careers(payload: CareerAssessRequest):
    ai_payload = generate_json(
        _ASSESS_SYSTEM_PROMPT,
        {"student_profile": _model_data(payload)},
        {},
    )

    if not ai_payload.get("ai_used"):
        error_detail = ai_payload.get("ai_error", "AI generation failed with no error details.")
        raise HTTPException(
            status_code=503,
            detail={
                "error": "Career assessment requires AI, which is currently unavailable.",
                "reason": error_detail,
            },
        )

    career_fits = ai_payload.get("career_fits", [])
    top_3 = ai_payload.get("top_3_careers", career_fits[:3])
    next_steps = ai_payload.get("immediate_next_steps", [])

    return {
        "session_id": str(uuid4()),
        "assessment_id": 1,
        "career_fits": career_fits,
        "top_3_careers": top_3[:3],
        "immediate_next_steps": next_steps[:3],
        "ai_used": True,
        "ai_provider": ai_payload.get("ai_provider", "unknown"),
    }


@router.post("/api/roadmap")
def build_roadmap(payload: RoadmapRequest):
    session_id = payload.session_id or str(uuid4())
    topic = payload.career_topic.strip() or "the selected career"

    skeleton = {
        "session_id": session_id,
        "career_id": payload.career_id,
        "career_name": topic,
        "timeline_hours_per_week": payload.timeline_hours_per_week,
        "current_level": payload.current_level,
    }

    system_prompt = (
        "You are an AI career roadmap generator. "
        "Generate a complete learning roadmap from scratch for the given career topic, student level, and weekly hours. "
        "Return JSON with: career_name, total_duration, what_to_do_right_now (array of {title, description}), "
        "and steps (array of {step_id, order, title, description, duration, resources, prerequisites}). "
        "Make steps detailed, realistic, and ordered. Use the student's current_level and timeline_hours_per_week to adjust depth and pace."
    )
    ai_payload = generate_json(
        system_prompt,
        {"roadmap_request": _model_data(payload)},
        skeleton,
    )

    if not ai_payload.get("ai_used"):
        error_detail = ai_payload.get("ai_error", "AI generation failed with no error details.")
        raise HTTPException(
            status_code=503,
            detail={
                "error": "Roadmap generation requires AI, which is currently unavailable.",
                "reason": error_detail,
                "session_id": session_id,
            },
        )

    result = {**skeleton}
    if isinstance(ai_payload.get("what_to_do_right_now"), list) and ai_payload["what_to_do_right_now"]:
        result["what_to_do_right_now"] = ai_payload["what_to_do_right_now"]
    if isinstance(ai_payload.get("steps"), list) and ai_payload["steps"]:
        result["steps"] = ai_payload["steps"]
    if ai_payload.get("total_duration"):
        result["total_duration"] = str(ai_payload["total_duration"])
    if ai_payload.get("career_name"):
        result["career_name"] = str(ai_payload["career_name"])
    result["ai_used"] = True
    result["ai_provider"] = ai_payload.get("ai_provider", "unknown")
    return result


@router.post("/api/skill-gap-analysis")
def analyze_skill_gap(payload: SkillGapAnalysisRequest):
    target_role = payload.target_role.strip() or "Backend Developer"

    system_prompt = (
        "You are a skill-gap analysis AI. Given a student's skills and a target role, "
        "return JSON with:\n"
        "- career_name: the target role name\n"
        "- gap_analysis: { matched_skills: [str], missing_skills: [str], summary: str }\n"
        "- recommendations: [str] — 3 actionable next steps\n"
        "- internship_readiness: float 0.0-1.0\n"
        "- target_roles: [str]\n\n"
        "Be realistic and specific. List real skills required for the role."
    )
    ai_payload = generate_json(
        system_prompt,
        {"skill_gap_request": _model_data(payload), "target_role": target_role},
        {},
    )

    if not ai_payload.get("ai_used"):
        error_detail = ai_payload.get("ai_error", "AI generation failed with no error details.")
        raise HTTPException(
            status_code=503,
            detail={
                "error": "Skill-gap analysis requires AI, which is currently unavailable.",
                "reason": error_detail,
            },
        )

    gap_analysis = ai_payload.get("gap_analysis", {})
    if not isinstance(gap_analysis, dict):
        gap_analysis = {}

    return {
        "session_id": payload.session_id or str(uuid4()),
        "target_role": target_role,
        "career_name": ai_payload.get("career_name", target_role),
        "gap_analysis": {
            "matched_skills": gap_analysis.get("matched_skills", []),
            "missing_skills": gap_analysis.get("missing_skills", []),
            "summary": gap_analysis.get("summary", f"Analysis for {target_role}."),
        },
        "recommendations": ai_payload.get("recommendations", []),
        "internship_readiness": max(0.0, min(1.0, float(ai_payload.get("internship_readiness", 0.5)))),
        "target_roles": ai_payload.get("target_roles", [target_role]),
        "ai_used": True,
        "ai_provider": ai_payload.get("ai_provider", "unknown"),
    }


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
