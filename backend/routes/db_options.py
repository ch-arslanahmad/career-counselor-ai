from fastapi import APIRouter

from repositories import get_form_options

router = APIRouter(tags=["options"])


@router.get("/options/skills")
def get_skills():
    return {"skills": get_form_options()["skills"]}


@router.get("/options/interests")
def get_interests():
    return {"interests": get_form_options()["interests"]}


@router.get("/options/industries")
def get_industries():
    return {"industries": get_form_options()["industries"]}


@router.get("/options/locations")
def get_locations():
    return {"locations": get_form_options()["locations"]}
