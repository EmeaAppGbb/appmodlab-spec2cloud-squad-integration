"""Lease analytics endpoints for the UrbanNest Analytics Service.

Business rules (from specs/business-rules/lease-calculations.md)
----------------------------------------------------------------
- Total cost:  ``ceil((end_date − start_date) / 30) × monthly_rent``
- Renewable:   ``end_date > now + 30 days  AND  status = 'active'``
- Expiring soon: ``end_date ≤ now + 60 days  AND  status = 'active'``
"""

from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from analytics.database import get_db
from analytics.models.schemas import (
    ExpiringLeasesReport,
    ExpiringLeaseSummary,
    LeaseAnalyticsSummary,
    MonthlyRevenueForecast,
    OccupancyRate,
    RevenueForecastReport,
)

router = APIRouter(prefix="/analytics/leases", tags=["Lease Analytics"])


@router.get(
    "/occupancy",
    response_model=OccupancyRate,
    summary="Occupancy rate",
    description=(
        "Returns the proportion of properties that have at least one active lease. "
        "A property is considered occupied if it has any lease with status = 'active'."
    ),
)
async def occupancy_rate(db: AsyncSession = Depends(get_db)):
    query = text("""
        WITH stats AS (
            SELECT
                (SELECT COUNT(*)::int FROM properties) AS total_properties,
                (SELECT COUNT(DISTINCT property_id)::int
                 FROM leases
                 WHERE status = 'active')              AS occupied_properties
        )
        SELECT total_properties,
               occupied_properties,
               ROUND(
                   occupied_properties::numeric / NULLIF(total_properties, 0),
                   4
               ) AS occupancy_rate
        FROM stats
    """)
    result = await db.execute(query)
    row = result.fetchone()
    return OccupancyRate(
        total_properties=row.total_properties,
        occupied_properties=row.occupied_properties,
        occupancy_rate=float(row.occupancy_rate or 0),
    )


@router.get(
    "/expiring",
    response_model=ExpiringLeasesReport,
    summary="Expiring leases summary",
    description=(
        "Lists active leases expiring within the next ``window_days`` days "
        "(default 60, per the legacy expiring_soon scope). Each lease indicates "
        "whether it is renewable (end_date > now + 30 days)."
    ),
)
async def expiring_leases(
    window_days: int = Query(default=60, ge=1, le=365, description="Look-ahead window in days"),
    db: AsyncSession = Depends(get_db),
):
    query = text("""
        SELECT l.id        AS lease_id,
               p.address   AS property_address,
               p.city,
               CONCAT(t.first_name, ' ', t.last_name) AS tenant_name,
               l.monthly_rent,
               l.start_date,
               l.end_date,
               (l.end_date > CURRENT_DATE + INTERVAL '30 days'
                AND l.status = 'active')               AS is_renewable
        FROM leases l
        JOIN properties p ON p.id = l.property_id
        JOIN tenants t    ON t.id = l.tenant_id
        WHERE l.status = 'active'
          AND l.end_date <= CURRENT_DATE + CAST(:window || ' days' AS INTERVAL)
        ORDER BY l.end_date ASC
    """)
    result = await db.execute(query, {"window": str(window_days)})
    rows = result.fetchall()

    leases = [
        ExpiringLeaseSummary(
            lease_id=r.lease_id,
            property_address=r.property_address,
            city=r.city,
            tenant_name=r.tenant_name,
            monthly_rent=float(r.monthly_rent),
            start_date=r.start_date,
            end_date=r.end_date,
            is_renewable=r.is_renewable,
        )
        for r in rows
    ]

    renewable = sum(1 for l in leases if l.is_renewable)
    return ExpiringLeasesReport(
        window_days=window_days,
        total_expiring=len(leases),
        renewable_count=renewable,
        non_renewable_count=len(leases) - renewable,
        leases=leases,
    )


@router.get(
    "/revenue-forecast",
    response_model=RevenueForecastReport,
    summary="Revenue forecast",
    description=(
        "Projects monthly rental revenue for the next ``months`` months based "
        "on currently active leases. A lease contributes its ``monthly_rent`` to "
        "every month whose first day falls before the lease's ``end_date``."
    ),
)
async def revenue_forecast(
    months: int = Query(default=6, ge=1, le=24, description="Forecast horizon in months"),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    forecasts: list[MonthlyRevenueForecast] = []

    for i in range(months):
        # First day of the target month
        year = today.year + (today.month + i - 1) // 12
        month = (today.month + i - 1) % 12 + 1
        month_start = date(year, month, 1)

        # Last day of the target month
        if month == 12:
            month_end = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            month_end = date(year, month + 1, 1) - timedelta(days=1)

        # A lease contributes revenue if it overlaps this month
        query = text("""
            SELECT COALESCE(SUM(monthly_rent), 0)::numeric AS projected_revenue,
                   COUNT(*)::int                           AS active_lease_count
            FROM leases
            WHERE status = 'active'
              AND start_date <= :month_end
              AND end_date   >= :month_start
        """)
        result = await db.execute(query, {"month_start": month_start, "month_end": month_end})
        row = result.fetchone()

        forecasts.append(
            MonthlyRevenueForecast(
                month=f"{year}-{month:02d}",
                projected_revenue=float(row.projected_revenue),
                active_lease_count=row.active_lease_count,
            )
        )

    total = sum(f.projected_revenue for f in forecasts)
    return RevenueForecastReport(
        forecast_months=months,
        total_projected_revenue=round(total, 2),
        monthly_forecasts=forecasts,
    )


@router.get(
    "/summary",
    response_model=LeaseAnalyticsSummary,
    summary="Lease analytics overview",
    description="Aggregated lease analytics: occupancy, expiring leases, and revenue forecast.",
)
async def lease_summary(db: AsyncSession = Depends(get_db)):
    occ = await occupancy_rate(db)
    exp = await expiring_leases(window_days=60, db=db)
    rev = await revenue_forecast(months=6, db=db)
    return LeaseAnalyticsSummary(
        occupancy=occ,
        expiring_leases=exp,
        revenue_forecast=rev,
    )
