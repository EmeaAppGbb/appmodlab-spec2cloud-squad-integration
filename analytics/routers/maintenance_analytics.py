"""Maintenance analytics endpoints for the UrbanNest Analytics Service.

Business rules (from specs/business-rules/maintenance-workflow.md)
------------------------------------------------------------------
- Statuses: open → assigned → in_progress → completed → closed
- Categories: plumbing, electrical, hvac, appliance, other
- Priorities: low, medium, high, emergency
- High-priority scope: priority IN ('high', 'emergency')
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from analytics.database import get_db
from analytics.models.schemas import (
    AverageResolutionTime,
    CategoryCount,
    MaintenanceAnalyticsSummary,
    OpenRequestStats,
    PriorityCount,
)

router = APIRouter(prefix="/analytics/maintenance", tags=["Maintenance Analytics"])


# ── helpers ──────────────────────────────────────────────────────────────────

async def _category_counts(db: AsyncSession, where: str = "1=1") -> list[CategoryCount]:
    query = text(f"""
        SELECT category,
               COUNT(*)::int AS count,
               ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100, 2) AS percentage
        FROM maintenance_requests
        WHERE {where}
        GROUP BY category
        ORDER BY count DESC
    """)
    rows = (await db.execute(query)).fetchall()
    return [CategoryCount(category=r.category, count=r.count, percentage=float(r.percentage or 0)) for r in rows]


async def _priority_counts(db: AsyncSession, where: str = "1=1") -> list[PriorityCount]:
    query = text(f"""
        SELECT priority,
               COUNT(*)::int AS count,
               ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100, 2) AS percentage
        FROM maintenance_requests
        WHERE {where}
        GROUP BY priority
        ORDER BY count DESC
    """)
    rows = (await db.execute(query)).fetchall()
    return [PriorityCount(priority=r.priority, count=r.count, percentage=float(r.percentage or 0)) for r in rows]


# ── endpoints ────────────────────────────────────────────────────────────────

@router.get(
    "/by-category",
    response_model=list[CategoryCount],
    summary="Requests by category",
    description=(
        "Returns maintenance request counts grouped by category "
        "(plumbing, electrical, hvac, appliance, other)."
    ),
)
async def requests_by_category(db: AsyncSession = Depends(get_db)):
    return await _category_counts(db)


@router.get(
    "/by-priority",
    response_model=list[PriorityCount],
    summary="Requests by priority",
    description=(
        "Returns maintenance request counts grouped by priority "
        "(low, medium, high, emergency)."
    ),
)
async def requests_by_priority(db: AsyncSession = Depends(get_db)):
    return await _priority_counts(db)


@router.get(
    "/resolution-time",
    response_model=AverageResolutionTime,
    summary="Average resolution time",
    description=(
        "Computes average resolution time in hours for completed and closed "
        "requests. Resolution time = updated_at − created_at for requests "
        "in completed or closed status. Broken down by priority and category."
    ),
)
async def resolution_time(db: AsyncSession = Depends(get_db)):
    overall_query = text("""
        SELECT ROUND(
            AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600)::numeric, 2
        ) AS avg_hours
        FROM maintenance_requests
        WHERE status IN ('completed', 'closed')
    """)
    overall = (await db.execute(overall_query)).scalar_one_or_none()

    by_priority_query = text("""
        SELECT priority,
               ROUND(
                   AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600)::numeric, 2
               ) AS avg_hours
        FROM maintenance_requests
        WHERE status IN ('completed', 'closed')
        GROUP BY priority
    """)
    priority_rows = (await db.execute(by_priority_query)).fetchall()

    by_category_query = text("""
        SELECT category,
               ROUND(
                   AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600)::numeric, 2
               ) AS avg_hours
        FROM maintenance_requests
        WHERE status IN ('completed', 'closed')
        GROUP BY category
    """)
    category_rows = (await db.execute(by_category_query)).fetchall()

    return AverageResolutionTime(
        overall_avg_hours=float(overall or 0),
        by_priority={r.priority: float(r.avg_hours) if r.avg_hours else None for r in priority_rows},
        by_category={r.category: float(r.avg_hours) if r.avg_hours else None for r in category_rows},
    )


@router.get(
    "/open-requests",
    response_model=OpenRequestStats,
    summary="Open request statistics",
    description=(
        "Statistics for maintenance requests currently in 'open' status, "
        "including high-priority count (priority = 'high' or 'emergency') "
        "and the age of the oldest open request."
    ),
)
async def open_request_stats(db: AsyncSession = Depends(get_db)):
    totals_query = text("""
        SELECT COUNT(*)::int AS total_open,
               COUNT(*) FILTER (WHERE priority IN ('high', 'emergency'))::int AS high_priority_open,
               ROUND(
                   EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) / 86400.0, 2
               ) AS oldest_open_days
        FROM maintenance_requests
        WHERE status = 'open'
    """)
    row = (await db.execute(totals_query)).fetchone()

    by_cat = await _category_counts(db, where="status = 'open'")
    by_pri = await _priority_counts(db, where="status = 'open'")

    return OpenRequestStats(
        total_open=row.total_open,
        high_priority_open=row.high_priority_open,
        by_category=by_cat,
        by_priority=by_pri,
        oldest_open_days=float(row.oldest_open_days) if row.oldest_open_days is not None else None,
    )


@router.get(
    "/summary",
    response_model=MaintenanceAnalyticsSummary,
    summary="Maintenance analytics overview",
    description="Aggregated maintenance analytics: categories, priorities, resolution times, and open requests.",
)
async def maintenance_summary(db: AsyncSession = Depends(get_db)):
    total_query = text("SELECT COUNT(*)::int AS total FROM maintenance_requests")
    total = (await db.execute(total_query)).scalar_one()

    by_cat = await _category_counts(db)
    by_pri = await _priority_counts(db)
    res_time = await resolution_time(db)
    open_stats = await open_request_stats(db)

    return MaintenanceAnalyticsSummary(
        total_requests=total,
        by_category=by_cat,
        by_priority=by_pri,
        resolution_time=res_time,
        open_requests=open_stats,
    )
