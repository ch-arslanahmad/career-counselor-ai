#!/usr/bin/env python3
"""Seed demo user and demo data into the database."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal

def seed_demo():
    db = SessionLocal()
    try:
        from models import User, AssessmentHistory, UserProgress
        from datetime import datetime

        existing_user = db.query(User).filter(User.username == "demo").first()
        if existing_user:
            print("Demo user already exists, skipping...")
            return

        demo_user = User(username="demo", password="demo123")
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        print(f"Created demo user with ID: {demo_user.id}")

        demo_assessment = AssessmentHistory(
            user_id=demo_user.id,
            name="Arslan Ahmad",
            interests=["technology", "AI automation"],
            skills=["javascript", "python", "Prompt engineering"],
            education_level="bachelors",
            career_goals=["job"],
            location="pakistan",
            notes="I enjoy problem solving and building web apps.",
            career_results=[
                {"career_name": "Backend Developer", "fit_score": 92},
                {"career_name": "Full Stack Developer", "fit_score": 88},
                {"career_name": "DevOps Engineer", "fit_score": 85},
            ],
        )
        db.add(demo_assessment)
        db.commit()
        print(f"Created demo assessment with ID: {demo_assessment.id}")

        roadmap_steps = [
            {"step_id": 1, "title": "Deepen Language Fundamentals"},
            {"step_id": 2, "title": "Learn API Development"},
            {"step_id": 3, "title": "Database Mastery"},
            {"step_id": 4, "title": "Version Control & Collaboration"},
            {"step_id": 5, "title": "Build Portfolio Projects"},
            {"step_id": 6, "title": "DevOps Basics"},
        ]

        for step in roadmap_steps[:3]:
            progress = UserProgress(
                user_id=demo_user.id,
                career_topic="Backend Developer",
                step_id=step["step_id"],
                step_title=step["title"],
                completed=True,
                completed_at=datetime.utcnow(),
            )
            db.add(progress)

        db.commit()
        print("Created demo progress data")
        print("\nDemo user created successfully!")
        print("  Username: demo")
        print("  Password: demo123")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo()