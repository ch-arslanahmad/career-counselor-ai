from fastapi import APIRouter, Depends, HTTPException

from database import get_optional_db
from repositories import get_career_skills, get_career_roadmap, list_careers

router = APIRouter(tags=["careers"])


@router.get("/api/careers")
def careers(db=Depends(get_optional_db)):
    return {"careers": list_careers(db)}


@router.get("/api/careers/{career_id}/skills")
def career_skills(career_id: int, db=Depends(get_optional_db)):
    payload = get_career_skills(db, career_id)
    if payload is None:
        raise HTTPException(status_code=404, detail="Career not found")
    return payload


@router.get("/api/careers/{career_id}/roadmap")
def career_roadmap(career_id: int, db=Depends(get_optional_db)):
    return {
        "career_id": career_id,
        "steps": get_career_roadmap(db, career_id),
    }
