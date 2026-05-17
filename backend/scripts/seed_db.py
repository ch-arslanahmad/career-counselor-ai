from __future__ import annotations

import json
from pathlib import Path

from database import SessionLocal, engine, SQLALCHEMY_AVAILABLE, Base
from models import Career, Skill, CareerSkill, RoadmapStep


def load_seed_data() -> dict:
    seeds_path = Path(__file__).parent.parent / "seeds" / "careers.json"
    with open(seeds_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_or_create_skill(db, name: str, category: str = "technical") -> Skill:
    skill = db.query(Skill).filter(Skill.name == name).first()
    if skill is None:
        skill = Skill(name=name, category=category)
        db.add(skill)
        db.flush()
    return skill


def seed_database() -> None:
    if not SQLALCHEMY_AVAILABLE:
        raise RuntimeError("Install SQLAlchemy and pymysql before seeding the DB.")

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        data = load_seed_data()

        for career_data in data["careers"]:
            existing = db.query(Career).filter(Career.name == career_data["name"]).first()
            if existing:
                career = existing
            else:
                career = Career(
                    name=career_data["name"],
                    description=career_data.get("description"),
                    category=career_data.get("category"),
                    type=career_data.get("type", "open"),
                    growth_outlook=career_data.get("growth_outlook"),
                    education_requirement=career_data.get("education_requirement"),
                )
                db.add(career)
                db.flush()

            for skill_data in career_data.get("skills", []):
                skill = get_or_create_skill(db, skill_data["name"])

                link = db.query(CareerSkill).filter(
                    CareerSkill.career_id == career.id,
                    CareerSkill.skill_id == skill.id
                ).first()

                if link is None:
                    link = CareerSkill(
                        career_id=career.id,
                        skill_id=skill.id,
                        proficiency_level=skill_data.get("proficiency", "intermediate"),
                        is_required=skill_data.get("required", True),
                    )
                    db.add(link)

            for step_data in career_data.get("roadmap", []):
                existing_step = db.query(RoadmapStep).filter(
                    RoadmapStep.career_id == career.id,
                    RoadmapStep.step_order == step_data["step_order"]
                ).first()

                if existing_step is None:
                    step = RoadmapStep(
                        career_id=career.id,
                        step_order=step_data["step_order"],
                        title=step_data.get("title"),
                        description=step_data.get("description"),
                        duration=step_data.get("duration"),
                        resources=step_data.get("resources"),
                        prerequisites=step_data.get("prerequisites"),
                    )
                    db.add(step)

        db.commit()
        print(f"Seeded {len(data['careers'])} careers with skills and roadmap steps.")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    from database import db_health
    healthy, message = db_health()
    print(message)
    if not healthy:
        raise SystemExit(1)

    seed_database()
    print("Database seeding complete.")