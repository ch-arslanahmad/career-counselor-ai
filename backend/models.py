from __future__ import annotations

from datetime import datetime

try:
    from sqlalchemy import (
        JSON,
        Boolean,
        DateTime,
        Float,
        ForeignKey,
        Integer,
        String,
        Text,
        UniqueConstraint,
    )
    from sqlalchemy.orm import Mapped, mapped_column, relationship
except ImportError:
    JSON = Boolean = DateTime = Float = ForeignKey = Integer = String = Text = None
    UniqueConstraint = None
    Mapped = mapped_column = relationship = None

from database import Base


def utcnow() -> datetime:
    return datetime.utcnow()


if Base is not None:

    class User(Base):
        __tablename__ = "users"

        id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
        username: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
        password: Mapped[str] = mapped_column(String(255), nullable=False)
        created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    class AssessmentHistory(Base):
        __tablename__ = "assessment_history"

        id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
        user_id: Mapped[int] = mapped_column(Integer, nullable=True, index=True)
        session_id: Mapped[str] = mapped_column(String(36), nullable=True, index=True)
        name: Mapped[str | None] = mapped_column(String(100), nullable=True)
        interests: Mapped[list | None] = mapped_column(JSON, nullable=True)
        skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
        education_level: Mapped[str | None] = mapped_column(String(100), nullable=True)
        career_goals: Mapped[list | None] = mapped_column(JSON, nullable=True)
        location: Mapped[str | None] = mapped_column(String(100), nullable=True)
        notes: Mapped[str | None] = mapped_column(Text, nullable=True)
        career_results: Mapped[list | None] = mapped_column(JSON, nullable=True)
        created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    class UserProgress(Base):
        __tablename__ = "user_progress"

        id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
        user_id: Mapped[int] = mapped_column(Integer, nullable=True, index=True)
        session_id: Mapped[str] = mapped_column(String(36), nullable=True, index=True)
        career_topic: Mapped[str | None] = mapped_column(String(255), nullable=True)
        step_id: Mapped[int] = mapped_column(Integer, nullable=False)
        step_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
        completed: Mapped[bool] = mapped_column(Boolean, default=False)
        completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
        created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    class StudentAssessment(Base):
        __tablename__ = "student_assessments"

        id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
        session_id: Mapped[str] = mapped_column(String(36), nullable=False, unique=True, index=True)
        created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
        interests: Mapped[list | None] = mapped_column(JSON, nullable=True)
        current_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
        education_level: Mapped[str | None] = mapped_column(String(100), nullable=True)
        career_goals: Mapped[list | None] = mapped_column(JSON, nullable=True)
        location: Mapped[str | None] = mapped_column(String(100), nullable=True)
        notes: Mapped[str | None] = mapped_column(Text, nullable=True)
        updated_at: Mapped[datetime] = mapped_column(
            DateTime,
            default=utcnow,
            onupdate=utcnow,
            nullable=False,
        )

        career_fits = relationship(
            "CareerFit",
            back_populates="assessment",
            cascade="all, delete-orphan",
        )

    class CareerFit(Base):
        __tablename__ = "career_fits"

        id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
        assessment_id: Mapped[int] = mapped_column(
            ForeignKey("student_assessments.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
        career_id: Mapped[int] = mapped_column(Integer, nullable=True)
        career_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
        fit_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
        skill_match: Mapped[float | None] = mapped_column(Float, nullable=True)
        reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
        created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

        assessment = relationship("StudentAssessment", back_populates="career_fits")

    class TaskProgress(Base):
        __tablename__ = "task_progress"
        __table_args__ = (UniqueConstraint("session_id", "step_id", name="uq_progress_step"),)

        id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
        session_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
        step_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
        step_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
        completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
        created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

else:
    StudentAssessment = None
    CareerFit = None
    TaskProgress = None
