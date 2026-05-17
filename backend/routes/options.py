from fastapi import APIRouter


router = APIRouter()

# First we create options for the main form.

# it needs a list of
# skills, interests, industries, locations

@router.options("/options/test")
def options():
    return {"message": "This is an OPTIONS request."}


@router.