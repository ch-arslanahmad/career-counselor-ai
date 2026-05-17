from fastapi import APIRouter, Depends

from database import get_optional_db
from repositories import get_form_options

router = APIRouter(tags=["options"])


@router.get("/options/skills")
def get_skills(db=Depends(get_optional_db)):
    return {"skills": get_form_options(db)["skills"]}


@router.get("/options/interests")
def get_interests(db=Depends(get_optional_db)):
    return {"interests": get_form_options(db)["interests"]}


@router.get("/options/industries")
def get_industries(db=Depends(get_optional_db)):
    return {"industries": get_form_options(db)["industries"]}


@router.get("/options/locations")
def get_locations(db=Depends(get_optional_db)):
    return {"locations": get_form_options(db)["locations"]}