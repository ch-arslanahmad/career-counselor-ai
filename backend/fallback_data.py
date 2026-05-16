from __future__ import annotations

import json
from pathlib import Path

DEFAULT_LOCATIONS = [
    "Pakistan",
    "India",
    "USA",
    "Canada",
    "UK",
    "Germany",
    "Australia",
]


def fallback_catalog_path() -> Path:
    return Path(__file__).resolve().parent / "seeds" / "onet_fallback.json"


def load_fallback_catalog() -> dict:
    with fallback_catalog_path().open("r", encoding="utf-8") as handle:
        return json.load(handle)


def normalize_career_categories(catalog: dict) -> list[str]:
    categories = {
        career.get("category", "").strip()
        for career in catalog.get("careers", [])
        if career.get("category")
    }
    return sorted(categories)


def normalize_skill_names(catalog: dict) -> list[str]:
    skill_names = set()
    for career in catalog.get("careers", []):
        for skill in career.get("skills", []):
            name = skill.get("name", "").strip()
            if name:
                skill_names.add(name)
    return sorted(skill_names)


def get_fallback_options() -> dict[str, list[str]]:
    catalog = load_fallback_catalog()
    categories = normalize_career_categories(catalog)
    skills = normalize_skill_names(catalog)
    return {
        "skills": skills,
        "interests": categories,
        "industries": categories,
        "locations": DEFAULT_LOCATIONS,
    }

