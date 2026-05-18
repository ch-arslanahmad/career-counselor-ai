from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from database import get_optional_db, SQLALCHEMY_AVAILABLE
import hashlib

router = APIRouter(tags=["auth"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=2, max_length=100)


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/api/auth/register")
def register(payload: RegisterRequest, db=Depends(get_optional_db)):
    if not SQLALCHEMY_AVAILABLE or db is None:
        raise HTTPException(503, "Database not available")

    from models import User

    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(400, "Username already exists")

    user = User(username=payload.username, password=hash_password(payload.password))
    db.add(user)
    db.commit()
    return {"message": "Registered successfully", "user_id": user.id, "username": user.username}


@router.post("/api/auth/login")
def login(payload: LoginRequest, db=Depends(get_optional_db)):
    if not SQLALCHEMY_AVAILABLE or db is None:
        raise HTTPException(503, "Database not available")

    from models import User

    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(401, "Invalid username or password")

    return {"message": "Login successful", "user_id": user.id, "username": user.username}


@router.get("/api/auth/me")
def get_current_user(user_id: int, db=Depends(get_optional_db)):
    if not SQLALCHEMY_AVAILABLE or db is None:
        return {"logged_in": False}

    from models import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"logged_in": False}

    return {"logged_in": True, "user_id": user.id, "username": user.username}