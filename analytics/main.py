"""UrbanNest Analytics Service — FastAPI application entry-point.

Run with:
    uvicorn analytics.main:app --reload --port 8000
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from analytics.models.schemas import HealthResponse
from analytics.routers import (
    lease_analytics,
    maintenance_analytics,
    properties_analytics,
)

app = FastAPI(
    title="UrbanNest Analytics Service",
    description=(
        "Analytics microservice for the UrbanNest property management platform. "
        "Provides aggregated insights on properties, leases, and maintenance requests."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS – allow all origins in development; tighten for production.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(properties_analytics.router)
app.include_router(lease_analytics.router)
app.include_router(maintenance_analytics.router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Service health check",
)
async def health():
    return HealthResponse(timestamp=datetime.now(timezone.utc))
