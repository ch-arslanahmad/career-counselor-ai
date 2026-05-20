from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from database import get_optional_db, SQLALCHEMY_AVAILABLE
import hashlib
import re

router = APIRouter(tags=["auth"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


def validate_password(password: str) -> str:
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters long")
    if len(password) > 100:
        raise ValueError("Password must be less than 100 characters")
    if not re.search(r"[a-zA-Z]", password):
        raise ValueError("Password must contain at least one letter")
    if not re.search(r"[0-9]", password):
        raise ValueError("Password must contain at least one number")
    return password


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v

    @field_validator("password")
    @classmethod
    def password_strong(cls, v: str) -> str:
        return validate_password(v)


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=100)


@router.post("/api/auth/register")
def register(payload: RegisterRequest, db=Depends(get_optional_db)):
    if not SQLALCHEMY_AVAILABLE or db is None:
        raise HTTPException(503, "Database not available")

    from models import User

    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(400, "Username already exists. Please choose a different username.")

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
    if not user:
        raise HTTPException(401, "User not found. Please check your username or register first.")
    if not verify_password(payload.password, user.password):
        raise HTTPException(401, "Incorrect password. Please try again.")

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


@router.get("/api/auth/users")
def list_users(db=Depends(get_optional_db)):
    if not SQLALCHEMY_AVAILABLE or db is None:
        return {"users": []}

    from models import User
    users = db.query(User).order_by(User.created_at.desc()).all()
    return {
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]
    }