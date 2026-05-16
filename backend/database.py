from __future__ import annotations

import os
from collections.abc import Generator

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://counselor_app:counselor_pass@localhost/career_counselor",
)

try:
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import declarative_base, sessionmaker

    SQLALCHEMY_AVAILABLE = True
except ImportError:  # pragma: no cover - handled at runtime
    create_engine = None
    text = None
    sessionmaker = None
    declarative_base = None
    SQLALCHEMY_AVAILABLE = False


if SQLALCHEMY_AVAILABLE:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        future=True,
    )
    SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
        future=True,
    )
    Base = declarative_base()
else:  # pragma: no cover - used only when dependencies are missing
    engine = None
    SessionLocal = None
    Base = None


def get_db() -> Generator:
    if SessionLocal is None:
        raise RuntimeError("Install SQLAlchemy and pymysql before using the database.")

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_optional_db() -> Generator:
    if SessionLocal is None:
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def db_health() -> tuple[bool, str]:
    if engine is None or text is None:
        return False, "SQLAlchemy is not installed."

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True, "Database connection is healthy."
    except Exception as exc:  # pragma: no cover - depends on local MariaDB state
        return False, str(exc)


def init_db() -> None:
    if Base is None or engine is None:
        raise RuntimeError("Install SQLAlchemy and pymysql before initializing tables.")

    import models  # noqa: F401

    Base.metadata.create_all(bind=engine)

