from fastapi import APIRouter, Depends, HTTPException
from database import get_optional_db, SQLALCHEMY_AVAILABLE
from pydantic import BaseModel

router = APIRouter(tags=["history"])


@router.get("/api/history")
def get_history(user_id: int, db=Depends(get_optional_db)):
    if not SQLALCHEMY_AVAILABLE or db is None:
        return {"assessments": [], "progress": []}

    from models import AssessmentHistory, UserProgress

    # Get assessment history
    assessments = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.user_id == user_id)
        .order_by(AssessmentHistory.created_at.desc())
        .all()
    )

    assessment_list = []
    for a in assessments:
        results = a.career_results or {}
        careers = results.get("career_fits", [])[:3]
        assessment_list.append({
            "id": a.id,
            "name": a.name,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "top_careers": [c.get("career_name", "Unknown") for c in careers],
            "interests": a.interests or [],
            "skills": a.skills or [],
        })

    # Get user progress
    progress = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == user_id, UserProgress.completed == True)
        .order_by(UserProgress.completed_at.desc())
        .all()
    )

    progress_list = []
    for p in progress:
        progress_list.append({
            "career_topic": p.career_topic,
            "step_title": p.step_title,
            "completed_at": p.completed_at.isoformat() if p.completed_at else None,
        })

    return {
        "assessments": assessment_list,
        "progress": progress_list,
    }


@router.delete("/api/history/{assessment_id}")
def delete_history(assessment_id: int, user_id: int, db=Depends(get_optional_db)):
    if not SQLALCHEMY_AVAILABLE or db is None:
        raise HTTPException(503, "Database not available")

    from models import AssessmentHistory

    record = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.id == assessment_id, AssessmentHistory.user_id == user_id)
        .first()
    )

    if not record:
        raise HTTPException(404, "Assessment not found")

    db.delete(record)
    db.commit()
    return {"message": "Deleted"}