"""Async SQLAlchemy engine and session factory.

The database URL is read from the DATABASE_URL environment variable and
defaults to a local PostgreSQL instance matching the legacy docker-compose
configuration (urbannest_dev on localhost:5432).
"""

from __future__ import annotations

import os

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/urbannest_dev",
)

engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

async_session_factory = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False,
)


async def get_db() -> AsyncSession:  # type: ignore[misc]
    """FastAPI dependency that yields an async database session."""
    async with async_session_factory() as session:
        yield session
