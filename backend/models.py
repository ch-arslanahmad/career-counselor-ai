from __future__ import annotations

from datetime import datetime

try:
    from sqlalchemy import (
        JSON,
        Boolean,
        DateTime,
        Enum,
        Float,
        ForeignKey,
        Integer,
        String,
        Text,
        UniqueConstraint,
    )
    from sqlalchemy.orm import Mapped, mapped_column, relationship
except ImportError:  # pragma: no cover - handled at runtime
    JSON = Boolean = DateTime = Enum = Float = ForeignKey = Integer = String = Text = None
    UniqueConstraint = None
    Mapped = mapped_column = relationship = None

from database import Base


def utcnow() -> datetime:
    return datetime.utcnow()


if Base is not None:
    class Career(Base):
        __tablename__ = "careers"

        id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
        name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
        description: Mapped[str | None] = mapped_column(Text, nullable=True)
        category: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
        type: Mapped[str | None] = mapped_column(
            Enum("open", "regulated", "degree_required", name="career_type"),
            nullable=True,
        )
        growth_outlook: Mapped[str | None] = mapped_column(String(100), nullable=True)
        source: Mapped[str | None] = mapped_column(
            Enum("onet", "manual_pakistan", "custom", name="career_source"),
            nullable=True,
        )
        education_requirement: Mapped[str | None] = mapped_column(String(200), nullable=True)
        created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
        updated_at: Mapped[datetime] = mapped_column(
            DateTime,
            default=utcnow,
            onupdate=utcnow,
            nullable=False,
        )

        skills = relationship(
            "CareerSkill",
            back_populates="career",
            cascade="all, delete-orphan",
        )
        roadmap_steps = relationship(
            "RoadmapStep",
            back_populates="career",
            cascade="all, delete-orphan",
        )
        career_fits = relationship(
            "CareerFit",
            back_populates="career",
            cascade="all, delete-orphan",
        )


    class Skill(Base):
        __tablename__ = "skills"

        id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
        name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
        category: Mapped[str | None] = mapped_column(
            Enum(
                "technical",
                "soft_skill",
                "language",
                "domain_knowledge",
                name="skill_category",
            ),
            nullable=True,
        )
        description: Mapped[str | None] = mapped_column(Text, nullable=True)
        created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

        careers = relationship(
            "CareerSkill",
            back_populates="skill",
            cascade="all, delete-orphan",
        )


    class CareerSkill(Base):
        __tablename__ = "career_skills"
        __table_args__ = (UniqueConstraint("career_id", "skill_id", name="uq_career_skill"),)

        id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
        career_id: Mapped[int] = mapped_column(
            ForeignKey("careers.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
        skill_id: Mapped[int] = mapped_column(
            ForeignKey("skills.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
        proficiency_level: Mapped[str | None] = mapped_column(
            Enum("beginner", "intermediate", "expert", name="proficiency_level"),
            nullable=True,
        )
        is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

        career = relationship("Career", back_populates="skills")
        skill = relationship("Skill", back_populates="careers")


    class RoadmapStep(Base):
        __tablename__ = "roadmap_steps"
        __table_args__ = (UniqueConstraint("career_id", "step_order", name="uq_roadmap_order"),)

        id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
        career_id: Mapped[int] = mapped_column(
            ForeignKey("careers.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
        step_order: Mapped[int] = mapped_column(Integer, nullable=False)
        title: Mapped[str | None] = mapped_column(String(255), nullable=True)
        description: Mapped[str | None] = mapped_column(Text, nullable=True)
        duration: Mapped[str | None] = mapped_column(String(100), nullable=True)
        resources: Mapped[list | None] = mapped_column(JSON, nullable=True)
        prerequisites: Mapped[list | None] = mapped_column(JSON, nullable=True)
        created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
        updated_at: Mapped[datetime] = mapped_column(
            DateTime,
            default=utcnow,
            onupdate=utcnow,
            nullable=False,
        )

        career = relationship("Career", back_populates="roadmap_steps")


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
        career_id: Mapped[int] = mapped_column(
            ForeignKey("careers.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
        fit_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
        skill_match: Mapped[float | None] = mapped_column(Float, nullable=True)
        reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
        created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

        assessment = relationship("StudentAssessment", back_populates="career_fits")
        career = relationship("Career", back_populates="career_fits")


    class TaskProgress(Base):
        __tablename__ = "task_progress"
        __table_args__ = (UniqueConstraint("session_id", "step_id", name="uq_progress_step"),)

        id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
        session_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
        step_id: Mapped[int] = mapped_column(
            ForeignKey("roadmap_steps.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
        completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
        created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


else:  # pragma: no cover - used only when dependencies are missing
    Career = None
    Skill = None
    CareerSkill = None
    RoadmapStep = None
    StudentAssessment = None
    CareerFit = None
    TaskProgress = None

