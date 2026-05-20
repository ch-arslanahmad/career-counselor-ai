from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from database import get_optional_db, SQLALCHEMY_AVAILABLE

router = APIRouter(tags=["tasks"])


class TaskUpdateRequest(BaseModel):
    user_id: int | None = None
    session_id: str
    career_topic: str = ""
    step_id: int
    step_title: str = ""
    mark_complete: bool = True


class TaskProgressResponse(BaseModel):
    step_id: int
    step_title: str
    completed: bool
    completed_at: str | None


class SessionProgressResponse(BaseModel):
    session_id: str
    steps: list[dict[str, Any]]
    completed_count: int
    total_steps: int
    completion_percentage: float


def _format_datetime(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    return dt.isoformat()


@router.post("/api/tasks")
def update_task(payload: TaskUpdateRequest, db=Depends(get_optional_db)):
    if not SQLALCHEMY_AVAILABLE or db is None:
        return {
            "step_id": payload.step_id,
            "completed": payload.mark_complete,
            "progress_percentage": 0.0,
            "note": "Database not available, progress not persisted",
        }

    try:
        from models import TaskProgress, UserProgress

        # Save to session-based table
        existing = (
            db.query(TaskProgress)
            .filter(
                TaskProgress.session_id == payload.session_id,
                TaskProgress.step_id == payload.step_id,
            )
            .first()
        )

        if payload.mark_complete:
            if existing is None:
                progress = TaskProgress(
                    session_id=payload.session_id,
                    step_id=payload.step_id,
                    step_title=payload.step_title,
                    completed_at=datetime.utcnow(),
                )
                db.add(progress)
            else:
                existing.completed_at = datetime.utcnow()
                existing.step_title = payload.step_title
        else:
            if existing is not None:
                db.delete(existing)

        # Save to user progress table if user_id provided
        if payload.user_id:
            user_existing = (
                db.query(UserProgress)
                .filter(
                    UserProgress.user_id == payload.user_id,
                    UserProgress.career_topic == payload.career_topic,
                    UserProgress.step_id == payload.step_id,
                )
                .first()
            )

            if payload.mark_complete:
                if user_existing is None:
                    user_progress = UserProgress(
                        user_id=payload.user_id,
                        session_id=payload.session_id,
                        career_topic=payload.career_topic,
                        step_id=payload.step_id,
                        step_title=payload.step_title,
                        completed=True,
                        completed_at=datetime.utcnow(),
                    )
                    db.add(user_progress)
                else:
                    user_existing.completed = True
                    user_existing.completed_at = datetime.utcnow()
                    user_existing.step_title = payload.step_title
            else:
                if user_existing:
                    user_existing.completed = False
                    user_existing.completed_at = None

        db.commit()

        total = db.query(TaskProgress).filter(TaskProgress.session_id == payload.session_id).count()
        completed_count = db.query(TaskProgress).filter(
            TaskProgress.session_id == payload.session_id,
            TaskProgress.completed_at.isnot(None),
        ).count()
        progress_percentage = (completed_count / total * 100) if total > 0 else 0.0

        return {
            "step_id": payload.step_id,
            "completed": payload.mark_complete,
            "progress_percentage": progress_percentage,
        }
    except Exception as exc:
        db.rollback()
        return {
            "step_id": payload.step_id,
            "completed": payload.mark_complete,
            "progress_percentage": 0.0,
            "note": f"Database write failed, progress kept locally only: {exc}",
        }


@router.get("/api/tasks/{session_id}")
def get_session_progress(session_id: str, db=Depends(get_optional_db)):
    if not SQLALCHEMY_AVAILABLE or db is None:
        return {
            "session_id": session_id,
            "steps": [],
            "completed_count": 0,
            "total_steps": 0,
            "completion_percentage": 0.0,
            "note": "Database not available",
        }

    from models import TaskProgress, AssessmentHistory

    # Get completed step IDs for this session
    completed_steps = (
        db.query(TaskProgress)
        .filter(TaskProgress.session_id == session_id)
        .all()
    )
    completed_step_ids = {step.step_id for step in completed_steps}

    # Try to get the full roadmap from AssessmentHistory
    assessment = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.session_id == session_id)
        .order_by(AssessmentHistory.created_at.desc())
        .first()
    )

    steps = []
    if assessment and assessment.career_results:
        try:
            results = assessment.career_results
            if isinstance(results, str):
                import json
                results = json.loads(results)
            roadmap_data = results.get("roadmap", {})
            roadmap_steps = roadmap_data.get("steps", []) if isinstance(roadmap_data, dict) else []
            
            for step in roadmap_steps:
                step_id = step.get("step_id") or step.get("order") or 0
                steps.append({
                    "step_id": step_id,
                    "step_title": step.get("title", f"Step {step_id}"),
                    "completed": step_id in completed_step_ids,
                })
        except Exception:
            pass

    # If no roadmap found, return just completed steps
    if not steps:
        steps = [
            {
                "step_id": step.step_id,
                "step_title": step.step_title or f"Step {step.step_id}",
                "completed": True,
                "completed_at": _format_datetime(step.completed_at),
            }
            for step in completed_steps
        ]

    completed_count = sum(1 for s in steps if s.get("completed"))
    total_steps = len(steps)
    completion_percentage = (completed_count / total_steps * 100) if total_steps > 0 else 0.0

    return {
        "session_id": session_id,
        "steps": steps,
        "completed_count": completed_count,
        "total_steps": total_steps,
        "completion_percentage": completion_percentage,
    }
