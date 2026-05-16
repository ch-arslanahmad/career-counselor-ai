from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen

from database import SessionLocal, init_db
from fallback_data import fallback_catalog_path, load_fallback_catalog
from models import Career, CareerSkill, RoadmapStep, Skill


def load_remote_catalog(url: str) -> dict[str, Any]:
    headers = {"Accept": "application/json"}
    token = os.getenv("ONET_BEARER_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = Request(url, headers=headers)
    with urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def load_catalog(remote_url: str | None, use_fallback_on_error: bool) -> dict[str, Any]:
    if remote_url:
        try:
            return load_remote_catalog(remote_url)
        except (URLError, TimeoutError, json.JSONDecodeError, OSError):
            if not use_fallback_on_error:
                raise

    return load_fallback_catalog()


def get_or_create_skill(session, skill_payload: dict[str, Any]) -> Skill:
    skill = session.query(Skill).filter(Skill.name == skill_payload["name"]).one_or_none()
    if skill is not None:
        return skill

    skill = Skill(
        name=skill_payload["name"],
        category=skill_payload.get("category"),
        description=skill_payload.get("description"),
    )
    session.add(skill)
    session.flush()
    return skill


def get_or_create_career(session, career_payload: dict[str, Any]) -> Career:
    career = session.query(Career).filter(Career.name == career_payload["name"]).one_or_none()
    if career is not None:
        career.description = career_payload.get("description")
        career.category = career_payload.get("category")
        career.type = career_payload.get("type")
        career.growth_outlook = career_payload.get("growth_outlook")
        career.source = career_payload.get("source")
        career.education_requirement = career_payload.get("education_requirement")
        return career

    career = Career(
        name=career_payload["name"],
        description=career_payload.get("description"),
        category=career_payload.get("category"),
        type=career_payload.get("type"),
        growth_outlook=career_payload.get("growth_outlook"),
        source=career_payload.get("source"),
        education_requirement=career_payload.get("education_requirement"),
    )
    session.add(career)
    session.flush()
    return career


def upsert_catalog(session, catalog: dict[str, Any]) -> None:
    for career_payload in catalog.get("careers", []):
        career = get_or_create_career(session, career_payload)

        seen_skill_ids: set[int] = set()
        for skill_payload in career_payload.get("skills", []):
            skill = get_or_create_skill(session, skill_payload)
            if skill.id in seen_skill_ids:
                continue
            seen_skill_ids.add(skill.id)

            link = (
                session.query(CareerSkill)
                .filter(
                    CareerSkill.career_id == career.id,
                    CareerSkill.skill_id == skill.id,
                )
                .one_or_none()
            )
            if link is None:
                session.add(
                    CareerSkill(
                        career_id=career.id,
                        skill_id=skill.id,
                        proficiency_level=skill_payload.get("proficiency_level"),
                        is_required=skill_payload.get("is_required", True),
                    )
                )
            else:
                link.proficiency_level = skill_payload.get("proficiency_level")
                link.is_required = skill_payload.get("is_required", True)

        for step_payload in career_payload.get("roadmap_steps", []):
            step = (
                session.query(RoadmapStep)
                .filter(
                    RoadmapStep.career_id == career.id,
                    RoadmapStep.step_order == step_payload["step_order"],
                )
                .one_or_none()
            )
            if step is None:
                session.add(
                    RoadmapStep(
                        career_id=career.id,
                        step_order=step_payload["step_order"],
                        title=step_payload.get("title"),
                        description=step_payload.get("description"),
                        duration=step_payload.get("duration"),
                        resources=step_payload.get("resources"),
                        prerequisites=step_payload.get("prerequisites", []),
                    )
                )
            else:
                step.title = step_payload.get("title")
                step.description = step_payload.get("description")
                step.duration = step_payload.get("duration")
                step.resources = step_payload.get("resources")
                step.prerequisites = step_payload.get("prerequisites", [])


def seed_database(catalog: dict[str, Any]) -> None:
    init_db()
    if SessionLocal is None:
        raise RuntimeError("Install SQLAlchemy and pymysql before seeding the database.")

    session = SessionLocal()
    try:
        upsert_catalog(session, catalog)
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Seed the career counselor database.")
    parser.add_argument(
        "--remote-url",
        default=os.getenv("ONET_API_URL"),
        help="Optional remote JSON URL to fetch O*NET-style seed data from.",
    )
    parser.add_argument(
        "--use-fallback-if-api-fails",
        action="store_true",
        help="Fall back to local JSON if the remote fetch fails.",
    )
    parser.add_argument(
        "--fallback-path",
        default=str(fallback_catalog_path()),
        help="Override the fallback JSON path.",
    )
    return parser


def main() -> None:
    parser = build_arg_parser()
    args = parser.parse_args()

    if args.fallback_path:
        fallback_path = Path(args.fallback_path)
        if fallback_path != fallback_catalog_path():
            with fallback_path.open("r", encoding="utf-8") as handle:
                catalog = json.load(handle)
        else:
            catalog = load_catalog(args.remote_url, args.use_fallback_if_api_fails)
    else:
        catalog = load_catalog(args.remote_url, args.use_fallback_if_api_fails)

    seed_database(catalog)


if __name__ == "__main__":
    main()

