from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.ai_gateway import generate_json, get_ai_status

router = APIRouter(tags=["recommendations"])


class CareerAssessRequest(BaseModel):
    user_id: int | None = None
    name: str = ""
    interests: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    education_level: str = ""
    career_goals: list[str] = Field(default_factory=list)
    location: str = ""
    notes: str = ""


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
    "You are a career counselor AI. Analyze the student's profile and return JSON with:\n\n"
    "career_fits: array of careers, each MUST include:\n"
    "  - career_name: string (e.g., Software Engineer, Data Scientist)\n"
    "  - fit_score: integer 0-99 (realistic, not inflated)\n"
    "  - matched_skills: array of strings - skills from student's input that match this career\n"
    "  - missing_skills: array of strings - skills this career needs that student doesn't have\n"
    "  - reasoning: string explaining why this career matches\n"
    "  - growth_outlook: string (e.g., Very High, High, Moderate)\n"
    "  - type: string (open, regulated, or degree_required)\n"
    "  - category: string (Technology, Design, Healthcare, Business, etc.)\n"
    "  - education_requirement: string\n\n"
    "IMPORTANT: Always include matched_skills and missing_skills arrays for each career. "
    "If student has no matching skills, matched_skills = []. "
    "If no obvious missing skills, missing_skills = [].\n\n"
    "Also return:\n"
    "  - top_3_careers: array of the 3 highest-scoring careers\n"
    "  - immediate_next_steps: array of 3 string action items\n\n"
    "Score: base=15 + (skill_match * 70) + education_bonus(8). Generate 8-12 careers."
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

    session_id = str(uuid4())

    # Save to history if user_id provided
    if payload.user_id:
        from database import get_optional_db, SQLALCHEMY_AVAILABLE
        if SQLALCHEMY_AVAILABLE:
            db = next(get_optional_db())
            if db:
                from models import AssessmentHistory
                history = AssessmentHistory(
                    user_id=payload.user_id,
                    session_id=session_id,
                    name=payload.name,
                    interests=payload.interests,
                    skills=payload.skills,
                    education_level=payload.education_level,
                    career_goals=payload.career_goals,
                    location=payload.location,
                    notes=payload.notes,
                    career_results={"career_fits": career_fits, "top_3": top_3, "next_steps": next_steps},
                )
                db.add(history)
                db.commit()

    return {
        "session_id": session_id,
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
        "You are a career roadmap generator. Create a learning path for the given career. "
        "Return JSON with:\n"
        "  - career_name: the career role\n"
        "  - total_duration: string (e.g., '6 months', '1 year')\n"
        "  - what_to_do_right_now: array of 3 objects with {title, description}\n"
        "  - steps: array of learning phases, each with:\n"
        "      - step_id: integer\n"
        "      - order: integer (1,2,3...)\n"
        "      - title: string (e.g., 'Learn Python Basics')\n"
        "      - description: string (what to learn)\n"
        "      - duration: string (e.g., '2 weeks', '1 month')\n"
        "      - resources: array of strings (free online resources, courses, etc.)\n"
        "      - prerequisites: array of step numbers\n\n"
        "Adjust depth based on student's current_level (beginner/some_knowledge/intermediate/advanced) "
        "and weekly hours available. Make it practical and resource-rich."
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
